import api, { getMe, getUserById } from '@/services/api/api';
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '@/services/storage/authSession';
import { AuthUser, Credentials, RegisterData } from '@/types/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import {
  clearDebugSession,
  isDebugModeEnabled,
  mockAuthService,
  startDebugSession,
} from '@/services/debug';

const resolveErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof AxiosError && error.response) {
    const responseData = error.response.data as { message?: string } | undefined;
    return responseData?.message || fallbackMessage;
  }

  return fallbackMessage;
};

const resolveAuthUserFromLogin = (payload: unknown, fallbackEmail: string): AuthUser => {
  if (!payload || typeof payload !== 'object') {
    return {
      id: 'local-user',
      email: fallbackEmail,
      name: fallbackEmail.split('@')[0] || 'User',
      username: fallbackEmail.split('@')[0] || 'user',
      createdAt: new Date().toISOString(),
    } as AuthUser;
  }

  const rawPayload = payload as Record<string, unknown>;
  const source =
    rawPayload.user && typeof rawPayload.user === 'object'
      ? (rawPayload.user as Record<string, unknown>)
      : rawPayload;

  const email =
    typeof source.email === 'string' && source.email.length > 0 ? source.email : fallbackEmail;
  const name =
    typeof source.name === 'string' && source.name.length > 0
      ? source.name
      : email.split('@')[0] || 'User';
  const photoUrl = typeof source.photoUrl === 'string' ? source.photoUrl : undefined;
  const birthdayDate = typeof source.birthdayDate === 'string' ? source.birthdayDate : undefined;

  return {
    id: typeof source.id === 'string' && source.id.length > 0 ? source.id : 'local-user',
    email,
    name,
    username:
      typeof source.username === 'string' && source.username.length > 0
        ? (source.username as string)
        : name.toLowerCase(),
    photoUrl,
    birthdayDate,
    createdAt: new Date().toISOString(),
  };
};

const resolveAuthUserFromProfile = (payload: unknown, fallbackEmail: string): AuthUser => {
  if (!payload || typeof payload !== 'object') {
    return buildMockAuthUser(fallbackEmail);
  }

  const source = payload as Record<string, unknown>;

  const email =
    typeof source.email === 'string' && source.email.length > 0 ? source.email : fallbackEmail;
  const name =
    typeof source.name === 'string' && source.name.length > 0
      ? source.name
      : email.split('@')[0] || 'User';

  const photoUrl =
    typeof source.profilePictureUrl === 'string' ? source.profilePictureUrl : undefined;
  const birthdayDate = typeof source.birthdayDate === 'string' ? source.birthdayDate : undefined;

  return {
    id: typeof source.id === 'string' && source.id.length > 0 ? source.id : 'local-user',
    email,
    name,
    username: name.toLowerCase(),
    photoUrl,
    birthdayDate,
    createdAt: new Date().toISOString(),
  };
};

interface AuthContextType {
  isLoading: boolean;
  user: AuthUser | null;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  updateUserPhoto: (photoUrl: string) => void;
  updateUserProfile: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function bootstrapSession() {
      try {
        if (isDebugModeEnabled()) {
          startDebugSession();
          const debugUser = await mockAuthService.getCurrentUser();
          setUser(debugUser);
          return;
        }

        const token = await getSessionToken();

        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // NOTE: the original code had USEMOCK fallback here, now removed. We would ideally fetch user from API here.
          // Since the original code used MOCK_AUTH_BOOTSTRAP_EMAIL if USEMOCK was true, we will just leave it empty for real API unless we have a real /me endpoint.
        }
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapSession();
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      user,
      signIn: async (credentials: Credentials) => {
        if (!credentials.email || !credentials.password) {
          throw new Error('Preencha email e senha.');
        }

        if (isDebugModeEnabled()) {
          await mockAuthService.login(credentials);
          const debugUser = await mockAuthService.getCurrentUser();
          setUser(debugUser);
          return;
        }

        try {
          const { data } = await api.post('auth/login', credentials);
          const accessToken =
            typeof data?.accessToken === 'string' && data.accessToken.length > 0
              ? data.accessToken
              : null;

          if (!accessToken) {
            throw new Error('Token de acesso não retornado pelo backend.');
          }

          await setSessionToken(accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          const maybeUser = resolveAuthUserFromLogin(data, credentials.email);

          if (maybeUser && maybeUser.birthdayDate) {
            setUser(maybeUser);
          } else {
            try {
              const profile = await getMe();
              setUser(resolveAuthUserFromProfile(profile, credentials.email));
            } catch {
              if (maybeUser && maybeUser.id && maybeUser.id !== 'local-user') {
                try {
                  const profile = await getUserById(maybeUser.id);
                  setUser(resolveAuthUserFromProfile(profile, credentials.email));
                } catch {
                  setUser(maybeUser);
                }
              } else {
                setUser(maybeUser);
              }
            }
          }
        } catch (error: unknown) {
          throw new Error(resolveErrorMessage(error, '*Falha no login'));
        }
      },

      signUp: async (registerData: RegisterData) => {
        try {
          if (
            !registerData.email ||
            !registerData.password ||
            !registerData.name ||
            !registerData.username
          ) {
            throw new Error('Preencha todos os campos');
          }

          if (isDebugModeEnabled()) {
            await mockAuthService.register(registerData);
            return;
          }

          await api.post('users/create', registerData);
        } catch (error: unknown) {
          throw new Error(resolveErrorMessage(error, 'Falha ao realizar o cadastro'));
        }
      },

      signOut: async () => {
        if (isDebugModeEnabled()) {
          await mockAuthService.logout();
          clearDebugSession();
          setUser(null);
          return;
        }
        await clearSessionToken();
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      },
      updateUserPhoto: (photoUrl: string) => {
        setUser((currentUser) => {
          if (!currentUser) {
            return null;
          }
          return { ...currentUser, photoUrl };
        });
      },
      updateUserProfile: (data: Partial<AuthUser>) => {
        setUser((currentUser) => {
          if (!currentUser) {
            return null;
          }
          return { ...currentUser, ...data };
        });
      },
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
  }

  return context;
}
function buildMockAuthUser(fallbackEmail: string): AuthUser {
  const email = fallbackEmail || 'user@example.com';
  const name = email.split('@')[0] || 'User';

  return {
    id: 'local-user',
    email,
    name,
    username: name.toLowerCase(),
    createdAt: new Date().toISOString(),
  } as AuthUser;
}
