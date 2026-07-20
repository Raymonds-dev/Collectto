import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'collectto.session.token';
const SESSION_REFRESH_TOKEN_KEY = 'collectto.session.refresh_token';

export function validateTokenPayload(token: string): boolean {
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
}

export async function getSessionToken(): Promise<string | null> {
  // Let SecureStore getItemAsync errors bubble up so that they trigger the boundary
  const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  return token;
}

export async function setSessionToken(token: string): Promise<void> {
  // Propagate storage save errors
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function getSessionRefreshToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(SESSION_REFRESH_TOKEN_KEY);
  if (token) {
    return token.replace(/^"|"$/g, '');
  }
  return null;
}

export async function setSessionRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_REFRESH_TOKEN_KEY, token);
}

export async function clearSessionRefreshToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('[authSession] Failed to delete session refresh token from SecureStore:', error);
  }
}

export async function clearSessionToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('[authSession] Failed to delete session tokens from SecureStore:', error);
  }
}
