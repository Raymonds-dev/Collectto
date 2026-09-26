import React, { Component, ReactNode } from 'react';
import { View } from 'react-native';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { AuthFallbackUI } from './AuthFallbackUI';
import { AuthErrorInfo, RetryState } from '@/types/authError';
import { clearSessionToken } from '@/services/storage/authSession';
import api from '@/services/api/api';
import { AxiosError } from 'axios';

export interface AuthErrorBoundaryProps {
  children: ReactNode;
  testID?: string;
}

export interface AuthErrorBoundaryState {
  error: AuthErrorInfo | null;
  retry: RetryState;
  remountKey: number;
}

export function classifyError(error: unknown): AuthErrorInfo {
  const technicalMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const timestamp = new Date().toISOString();

  let type: 'NETWORK' | 'TIMEOUT' | 'STORAGE' | 'PARSING' | 'UNKNOWN' = 'UNKNOWN';
  let message = 'Ocorreu um erro inesperado. Tente novamente.';

  const isStorageError =
    technicalMessage.includes('SecureStore') ||
    technicalMessage.includes('keychain') ||
    technicalMessage.includes('storage') ||
    technicalMessage.includes('storage failure');

  const isParsingError =
    technicalMessage.includes('Token parsing') ||
    technicalMessage.includes('JSON.parse') ||
    technicalMessage.includes('base64') ||
    technicalMessage.includes('CORRUPTED_TOKEN');

  if (isStorageError) {
    type = 'STORAGE';
    message = 'Falha ao acessar o armazenamento seguro do dispositivo.';
  } else if (isParsingError) {
    type = 'PARSING';
    message = 'Dados de autenticação corrompidos. É necessário refazer o login.';
  } else if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED' || technicalMessage.includes('timeout')) {
      type = 'TIMEOUT';
      message = 'O servidor demorou muito para responder. Tente novamente.';
    } else if (error.message === 'Network Error' || !error.response) {
      type = 'NETWORK';
      message = 'Sem conexão com a internet. Verifique sua rede.';
    }
  } else if (technicalMessage === 'Network Error') {
    type = 'NETWORK';
    message = 'Sem conexão com a internet. Verifique sua rede.';
  }

  return {
    type,
    message,
    technicalMessage,
    stack,
    timestamp,
  };
}

export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  private netInfoUnsubscribe: NetInfoSubscription | null = null;

  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      retry: {
        attemptCount: 0,
        isRetrying: false,
      },
      remountKey: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    const classified = classifyError(error);
    return {
      error: classified,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const classified = classifyError(error);
    console.error('[AuthErrorBoundary] Captured bootstrap error:', {
      type: classified.type,
      message: classified.message,
      technicalMessage: classified.technicalMessage,
      timestamp: classified.timestamp,
    });
  }

  componentDidMount() {
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      // FR-007: Auto-retry on network reconnection
      if (
        state.isConnected &&
        this.state.error?.type === 'NETWORK' &&
        this.state.retry.attemptCount < 3 &&
        !this.state.retry.isRetrying
      ) {
        console.log('[AuthErrorBoundary] Connection restored. Triggering auto-retry.');
        this.handleRetry();
      }
    });
  }

  componentWillUnmount() {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
  }

  handleRetry = async () => {
    const { attemptCount, isRetrying } = this.state.retry;
    if (attemptCount >= 3 || isRetrying) {
      return;
    }

    const nextAttempt = attemptCount + 1;
    this.setState((prevState) => ({
      retry: {
        ...prevState.retry,
        attemptCount: nextAttempt,
        isRetrying: true,
        lastAttemptTime: new Date().toISOString(),
      },
    }));

    // FR-009: Exponential backoff (1s, 2s, 4s)
    const delayMs = Math.pow(2, nextAttempt - 1) * 1000;
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    this.setState((prevState) => ({
      error: null,
      retry: {
        ...prevState.retry,
        isRetrying: false,
      },
      remountKey: prevState.remountKey + 1,
    }));
  };

  handleClearData = async () => {
    try {
      await clearSessionToken();
      delete api.defaults.headers.common['Authorization'];
    } catch (err) {
      console.warn('[AuthErrorBoundary] Failed to clear token:', err);
    } finally {
      this.setState((prevState) => ({
        error: null,
        retry: {
          attemptCount: 0,
          isRetrying: false,
          lastAttemptTime: undefined,
        },
        remountKey: prevState.remountKey + 1,
      }));
    }
  };

  render() {
    const { error, retry, remountKey } = this.state;
    const { children, testID } = this.props;

    if (error) {
      return (
        <AuthFallbackUI
          error={error}
          retry={retry}
          onRetry={this.handleRetry}
          onClearData={this.handleClearData}
          testID={testID}
        />
      );
    }

    return (
      <View style={{ flex: 1 }} key={remountKey}>
        {children}
      </View>
    );
  }
}
