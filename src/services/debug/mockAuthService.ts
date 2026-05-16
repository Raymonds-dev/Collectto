import {
  CreateUserRequest,
  CreateUserResponse,
  Credentials,
  LoginResponse,
  UpdateUserRequest,
  UserResponse,
} from '@/types/auth';
import { debugSession } from './debugSession';

export const mockAuthService = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    console.log('[DEBUG] mockAuthService.login called', credentials.email);
    debugSession.initialize();
    return {
      accessToken: 'debug-token-123',
      tokenType: 'Bearer',
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

      // Type assertion since we deleted the nulls
      debugSession.currentUser = updated as UserResponse;
    }
    return debugSession.currentUser!;
  },

  logout: async (): Promise<void> => {
    console.log('[DEBUG] mockAuthService.logout called');
    debugSession.clear();
  },
};
