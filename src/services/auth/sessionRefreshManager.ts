import { AppState, AppStateStatus } from 'react-native';
import { RefreshAttempt } from '@/types/auth-refresh';
import { authLogger } from '@/utils/authLogging';
import { refreshSession } from '@/services/api/api';
import { getSessionRefreshToken, setSessionRefreshToken } from '@/services/storage/authSession';

const decodeBase64Url = (value: string): string | null => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(paddingLength);

    if (typeof globalThis.atob !== 'function') {
      return null;
    }
    return globalThis.atob(padded);
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token: string): { exp?: number; iat?: number } | null => {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const decodedPayload = decodeBase64Url(parts[1]);
  if (!decodedPayload) return null;
  try {
    const claims = JSON.parse(decodedPayload);
    if (!claims || typeof claims !== 'object' || typeof claims.exp !== 'number') {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
};

export class SessionRefreshManager {
  private static instance: SessionRefreshManager | null = null;

  private onUnauthorizedCallback: (() => Promise<void>) | null = null;
  private onTokenRefreshedCallback: ((newToken: string) => Promise<void>) | null = null;

  private activeToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private attemptsLog: RefreshAttempt[] = [];
  private isRefreshing = false;
  private isHandlingUnauthorized = false;
  private appStateSubscription: any = null;

  private constructor() {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );
  }

  public static getInstance(): SessionRefreshManager {
    if (!SessionRefreshManager.instance) {
      SessionRefreshManager.instance = new SessionRefreshManager();
    }
    return SessionRefreshManager.instance;
  }

  public initialize(
    onUnauthorized: () => Promise<void>,
    onTokenRefreshed: (newToken: string) => Promise<void>
  ): void {
    this.onUnauthorizedCallback = onUnauthorized;
    this.onTokenRefreshedCallback = onTokenRefreshed;
  }

  public startSession(token: string): void {
    this.activeToken = token;
    this.scheduleRefresh();
  }

  public clearSession(): void {
    this.activeToken = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.isRefreshing = false;
    this.isHandlingUnauthorized = false;
  }

  public recordUserActivity(): void {
    // Proactive token refresh is temporarily disabled until implemented on backend
    return;
  }

  private logAttempt(attempt: Omit<RefreshAttempt, 'timestamp'>): void {
    const newAttempt: RefreshAttempt = {
      ...attempt,
      timestamp: new Date().toISOString(),
    };
    this.attemptsLog.push(newAttempt);
    if (this.attemptsLog.length > 50) {
      this.attemptsLog.shift();
    }
  }

  public getRefreshAttempts(): RefreshAttempt[] {
    return [...this.attemptsLog];
  }

  private scheduleRefresh(): void {
    // Proactive token refresh is temporarily disabled until implemented on backend
    return;
  }

  public async performRefresh(): Promise<string | null> {
    if (this.isRefreshing) return null;
    this.isRefreshing = true;

    this.logAttempt({
      status: 'failed',
      nextExpirationTime: null,
      errorReason: 'Iniciando refresh silencioso...',
    });

    try {
      const refreshToken = await getSessionRefreshToken();
      if (!refreshToken) {
        throw new Error('Nenhum refresh token disponível no SecureStore.');
      }

      const response = await refreshSession({ refreshToken });

      if (!response || !response.accessToken) {
        throw new Error('Resposta do refresh inválida.');
      }

      this.activeToken = response.accessToken;

      // Update session callbacks
      if (this.onTokenRefreshedCallback) {
        await this.onTokenRefreshedCallback(response.accessToken);
      }

      // Save new rotated refresh token
      await setSessionRefreshToken(response.refreshToken);

      const claims = decodeJwtPayload(response.accessToken);
      const exp = claims && claims.exp ? claims.exp : null;

      this.logAttempt({
        status: 'success',
        nextExpirationTime: exp,
        errorReason: null,
      });

      this.isRefreshing = false;
      return response.accessToken;
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logAttempt({
        status: 'failed',
        nextExpirationTime: null,
        errorReason: errorMsg,
      });
      this.isRefreshing = false;
      await this.handleUnauthorized();
      return null;
    }
  }

  public async handleUnauthorized(): Promise<void> {
    if (this.isHandlingUnauthorized) return;
    this.isHandlingUnauthorized = true;

    await authLogger
      .track({ module: 'SessionRefreshManager', action: 'silentLogout' }, async () => {
        console.warn('[SessionRefreshManager] Unauthorized detected. Logging out silently.');
        this.clearSession();

        if (this.onUnauthorizedCallback) {
          await this.onUnauthorizedCallback();
        }
      })
      .catch(() => {});
  }

  public async reconcileSessionState(): Promise<void> {
    if (!this.activeToken) return;

    await authLogger
      .track({ module: 'SessionRefreshManager', action: 'sessionCheck' }, async () => {
        const claims = decodeJwtPayload(this.activeToken!);
        if (!claims || !claims.exp) {
          throw new Error('Invalid token session: exp claim missing');
        }

        const expTimeMs = claims.exp * 1000;
        const now = Date.now();

        if (now >= expTimeMs) {
          console.log('[SessionRefreshManager] Session has expired. Invalidation required.');
          await this.handleUnauthorized();
        }
      })
      .catch(() => {});
  }

  private handleAppStateChange(status: AppStateStatus): void {
    if (status === 'active') {
      void this.reconcileSessionState();
    }
  }

  public destroy(): void {
    this.clearSession();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

export const sessionRefreshManager = SessionRefreshManager.getInstance();
