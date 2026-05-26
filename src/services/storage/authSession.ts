import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'collectto.session.token';

export async function getSessionToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  } catch (error) {
    console.warn('[authSession] Failed to retrieve session token from SecureStore:', error);
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  } catch (error) {
    console.warn('[authSession] Failed to save session token to SecureStore:', error);
  }
}

export async function clearSessionToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  } catch (error) {
    console.warn('[authSession] Failed to delete session token from SecureStore:', error);
  }
}
