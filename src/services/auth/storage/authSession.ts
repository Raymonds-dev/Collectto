import { storageAdapter } from './adapters/storageAdapter';

const SESSION_TOKEN_KEY = 'collectto.session.token';
const SESSION_REFRESH_TOKEN_KEY = 'collectto.session.refresh_token';

export const validateTokenPayload = (token: string): boolean => {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const payload = parts[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(paddingLength);

    const decoded =
      typeof globalThis.atob === 'function'
        ? globalThis.atob(padded)
        : Buffer.from(padded, 'base64').toString('binary');

    const claims = JSON.parse(decoded);
    if (!claims || typeof claims !== 'object') return false;

    const hasIdentifier = claims.userId || claims.sub || claims.id || claims.uid || claims.email;

    return !!hasIdentifier;
  } catch {
    return false;
  }
};

export const getSessionToken = async (): Promise<string | null> => {
  return await storageAdapter.getItem(SESSION_TOKEN_KEY);
};

export const setSessionToken = async (token: string): Promise<void> => {
  await storageAdapter.setItem(SESSION_TOKEN_KEY, token);
};

export const getSessionRefreshToken = async (): Promise<string | null> => {
  const token = await storageAdapter.getItem(SESSION_REFRESH_TOKEN_KEY);
  if (token) {
    return token.replace(/^"|"$/g, '');
  }
  return null;
};

export const setSessionRefreshToken = async (token: string): Promise<void> => {
  await storageAdapter.setItem(SESSION_REFRESH_TOKEN_KEY, token);
};

export const clearSessionRefreshToken = async (): Promise<void> => {
  try {
    await storageAdapter.removeItem(SESSION_REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('[authSession] Failed to delete session refresh token:', error);
  }
};

export const clearSessionToken = async (): Promise<void> => {
  try {
    await storageAdapter.removeItem(SESSION_TOKEN_KEY);
    await storageAdapter.removeItem(SESSION_REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('[authSession] Failed to delete session tokens:', error);
  }
};
