import {
  CreateUserRequest,
  CreateUserResponse,
  Credentials,
  LoginResponse,
  UpdateUserRequest,
  UserResponse,
} from '@/types/auth';
import { debugSession } from './debugSession';

const encodeBase64Url = (str: string): string => {
  let base64 = '';
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(str).toString('base64');
  } else if (typeof globalThis.btoa === 'function') {
    base64 = globalThis.btoa(str);
  } else if (typeof btoa === 'function') {
    base64 = btoa(str);
  }
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const generateMockToken = (expirationSeconds: number): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId: 'local-user',
    email: 'user@example.com',
    name: 'User',
    exp: expirationSeconds,
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  return `${encodedHeader}.${encodedPayload}.mocksignature`;
};

export const mockAuthService = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    console.log('[DEBUG] mockAuthService.login called', credentials.email);
    debugSession.initialize();

    // Set expiration to 24 hours from now by default
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const exp = nowInSeconds + 24 * 60 * 60;

    return {
      accessToken: generateMockToken(exp),
      tokenType: 'Bearer',
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  },

  register: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    console.log('[DEBUG] mockAuthService.register called', data.email);
    debugSession.initialize();
    return {
      id: debugSession.currentUser!.id,
      name: data.name,
      username: data.username,
      email: data.email,
      createdAt: new Date().toISOString(),
    };
  },

  getCurrentUser: async (): Promise<UserResponse | null> => {
    console.log('[DEBUG] mockAuthService.getCurrentUser called');
    if (!debugSession.isInitialized) {
      debugSession.initialize();
    }
    return debugSession.currentUser;
  },

  updateProfile: async (data: UpdateUserRequest): Promise<UserResponse> => {
    console.log('[DEBUG] mockAuthService.updateProfile called');
    if (debugSession.currentUser) {
      const updated = { ...debugSession.currentUser, ...data };
      if (data.profilePictureUrl === null) delete updated.profilePictureUrl;
      if (data.profileBackgroundUrl === null) delete updated.profileBackgroundUrl;

      debugSession.currentUser = updated as UserResponse;
    }
    return debugSession.currentUser!;
  },

  logout: async (): Promise<void> => {
    console.log('[DEBUG] mockAuthService.logout called');
    debugSession.clear();
  },

  refreshSession: async (currentToken: string): Promise<string> => {
    console.log('[DEBUG] mockAuthService.refreshSession called');
    const nowInSeconds = Math.floor(Date.now() / 1000);
    // Extend the expiration time by 1 hour (3600 seconds)
    return generateMockToken(nowInSeconds + 3600);
  },
};
