import { AppState, AppStateStatus } from 'react-native';
import { RefreshAttempt } from '@/types/auth-refresh';
import { api } from '../api/client';
import { authLogger } from '@/utils/authLogging';

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
    if (!this.activeToken) return;
    const claims = decodeJwtPayload(this.activeToken);
    if (!claims || !claims.exp) return;

    const expTimeMs = claims.exp * 1000;
    const now = Date.now();
    const remainingTimeMs = expTimeMs - now;

    // Proactively refresh early (e.g. if token expires in less than 30 minutes)
    if (remainingTimeMs < 30 * 60 * 1000 && !this.isRefreshing) {
      console.log(
        '[SessionRefreshManager] User activity recorded near expiration, triggering early refresh.'
      );
      void this.performRefresh();
    } else {
      // Just reschedule based on current time
      this.scheduleRefresh();
    }
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
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (!this.activeToken) return;

    const claims = decodeJwtPayload(this.activeToken);
    if (!claims || !claims.exp) {
      this.logAttempt({
        status: 'failed',
        nextExpirationTime: null,
        errorReason: 'Invalid token: exp claim missing or malformed',
      });
      return;
    }

    const expTimeMs = claims.exp * 1000;
    // Clock skew cushion of 10 seconds
    const safetyCushionMs = 10000;
    const now = Date.now();

    // Trigger refresh 5 minutes before expiration
    const refreshThresholdMs = 5 * 60 * 1000;
    let delay = expTimeMs - now - refreshThresholdMs - safetyCushionMs;

    if (delay <= 0) {
      // If token expiration is <= 5 minutes at startup, trigger validation immediately
      delay = 0;
    }

    console.log(`[SessionRefreshManager] Scheduling token refresh in ${delay}ms`);

    this.refreshTimer = setTimeout(() => {
      void this.performRefresh();
    }, delay);
  }

  private async performRefresh(): Promise<void> {
    if (this.isRefreshing || !this.activeToken) return;

    this.isRefreshing = true;

    await authLogger
      .track({ module: 'SessionRefreshManager', action: 'tokenRefresh' }, async () => {
        try {
          console.log('[SessionRefreshManager] Proactively refreshing token...');

          const response = await api.axios.get('/users/me');
          const headers = response.headers;
          const newTokenHeader = headers?.['authorization'] || headers?.['new-token'];
          let newToken: string | null = null;

          if (newTokenHeader && typeof newTokenHeader === 'string') {
            newToken = newTokenHeader.replace(/^Bearer\s+/i, '');
          }

          if (newToken) {
            const newClaims = decodeJwtPayload(newToken);
            const nextExpirationTime = newClaims?.exp ?? null;

            this.logAttempt({
              status: 'success',
              nextExpirationTime,
              errorReason: null,
            });

            if (this.onTokenRefreshedCallback) {
              await this.onTokenRefreshedCallback(newToken);
            }
          } else {
            const errMsg = 'Response headers did not contain a new authorization token';
            this.logAttempt({
              status: 'failed',
              nextExpirationTime: null,
              errorReason: errMsg,
            });
            throw new Error(errMsg);
          }
        } catch (error: any) {
          console.warn('[SessionRefreshManager] Proactive refresh request failed:', error);

          const isUnauthorized = error?.status === 401 || error?.code === 'UNAUTHORIZED';

          this.logAttempt({
            status: 'failed',
            nextExpirationTime: null,
            errorReason: error?.message || 'Network or Server Error',
          });

          if (isUnauthorized) {
            await this.handleUnauthorized();
          }
          throw error;
        } finally {
          this.isRefreshing = false;
        }
      })
      .catch(() => {
        // Catch to prevent error propagation from performRefresh
      });
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
        } else {
          this.scheduleRefresh();
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
