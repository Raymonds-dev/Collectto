import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AuthErrorBoundary } from '../AuthErrorBoundary';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => {
  let listener: ((state: any) => void) | null = null;
  return {
    addEventListener: jest.fn((cb) => {
      listener = cb;
      return () => {
        listener = null;
      };
    }),
    __triggerReconnect: () => {
      if (listener) {
        listener({ isConnected: true });
      }
    },
  };
});

jest.mock('@/services/api/api', () => ({
  defaults: {
    headers: {
      common: {},
    },
  },
}));

const ThrowingComponent = ({ errorMsg }: { errorMsg: string }) => {
  throw new Error(errorMsg);
};

describe('AuthErrorBoundary Unit and Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should render children normally if no error is thrown', () => {
    const { getByText } = render(
      <AuthErrorBoundary>
        <Text>Safe Content</Text>
      </AuthErrorBoundary>
    );

    expect(getByText('Safe Content')).toBeTruthy();
  });

  it('should catch SecureStore errors and render the fallback UI', () => {
    const errorMsg = 'SecureStore error: OS keychain is locked.';
    const { getByText } = render(
      <AuthErrorBoundary>
        <ThrowingComponent errorMsg={errorMsg} />
      </AuthErrorBoundary>
    );

    expect(getByText('Erro de armazenamento')).toBeTruthy();
    expect(getByText('Tentar Novamente')).toBeTruthy();
    expect(getByText('Limpar Dados & Sair')).toBeTruthy();
  });

  it('should catch Token Parsing errors and render the fallback UI', () => {
    const errorMsg = 'Token parsing failed: invalid payload format';
    const { getByText } = render(
      <AuthErrorBoundary>
        <ThrowingComponent errorMsg={errorMsg} />
      </AuthErrorBoundary>
    );

    expect(getByText('Dados corrompidos')).toBeTruthy();
  });

  it('should catch Network errors and render the fallback UI', () => {
    const errorMsg = 'Network Error';
    const { getByText } = render(
      <AuthErrorBoundary>
        <ThrowingComponent errorMsg={errorMsg} />
      </AuthErrorBoundary>
    );

    expect(getByText('Sem conexão com a internet')).toBeTruthy();
  });

  it('should handle retry attempts with exponential backoff', async () => {
    jest.useFakeTimers();

    const { getByText, queryByText } = render(
      <AuthErrorBoundary>
        <ThrowingComponent errorMsg="Network Error" />
      </AuthErrorBoundary>
    );

    // Attempt 1: 1s delay
    fireEvent.press(getByText('Tentar Novamente'));
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await act(async () => {});

    // Attempt 2: 2s delay
    fireEvent.press(getByText('Tentar Novamente'));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await act(async () => {});

    // Attempt 3: 4s delay
    fireEvent.press(getByText('Tentar Novamente'));
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    await act(async () => {});

    // Now attemptCount is 3, "Tentar Novamente" should be replaced by "Contatar Suporte"
    expect(queryByText('Tentar Novamente')).toBeNull();
    expect(getByText('Contatar Suporte')).toBeTruthy();
  });

  it('should auto-retry when network error is detected and network reconnects', async () => {
    jest.useFakeTimers();

    const { getByText } = render(
      <AuthErrorBoundary>
        <ThrowingComponent errorMsg="Network Error" />
      </AuthErrorBoundary>
    );

    // Simulate network reconnection
    await act(async () => {
      (NetInfo as any).__triggerReconnect();
      jest.advanceTimersByTime(1000); // 1st retry is 1s delay
    });

    // Verify it attempted a retry (the component should try to remount and throw again)
    // If it threw again, it stays in error state but attemptCount should be 1
    // We can show details to check the attempt count
    const detailsButton = getByText('Mostrar Detalhes Técnicos');
    fireEvent.press(detailsButton);

    expect(getByText(/Tentativas: 1\/3/)).toBeTruthy();
  });

  it('should reset retry counter and clear storage when Clear Auth Data is pressed', async () => {
    const { getByText } = render(
      <AuthErrorBoundary>
        <ThrowingComponent errorMsg="SecureStore error: corrupted" />
      </AuthErrorBoundary>
    );

    const clearButton = getByText('Limpar Dados & Sair');
    await act(async () => {
      fireEvent.press(clearButton);
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('collectto.session.token');
  });
});
