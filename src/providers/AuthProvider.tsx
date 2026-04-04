import api from '@/services/api/api';
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '@/services/storage/authSession';
import { buildMockAuthUser, MOCK_AUTH_BOOTSTRAP_EMAIL, MOCK_AUTH_SESSION_TOKEN } from '@/mocks';
import { AuthUser, Credentials, RegisterData } from '@/types/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';

const USEMOCK = false;

const resolveErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof AxiosError && error.response) {
    const responseData = error.response.data as { message?: string } | undefined;
    return responseData?.message || fallbackMessage;
  }

  return fallbackMessage;
};

const resolveAuthUserFromLogin = (payload: unknown, fallbackEmail: string): AuthUser => {
  if (!payload || typeof payload !== 'object') {
    return buildMockAuthUser(fallbackEmail);
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

  return {
    id: typeof source.id === 'string' && source.id.length > 0 ? source.id : 'local-user',
    email,
    name,
  };
};

interface AuthContextType {
  isLoading: boolean;
  user: AuthUser | null;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const token = await getSessionToken();

        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          if (USEMOCK) {
            setUser(buildMockAuthUser(MOCK_AUTH_BOOTSTRAP_EMAIL));
          }
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

        if (USEMOCK) {
          await setSessionToken(MOCK_AUTH_SESSION_TOKEN);
          api.defaults.headers.common['Authorization'] = `Bearer ${MOCK_AUTH_SESSION_TOKEN}`;
          setUser(buildMockAuthUser(credentials.email));
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
          setUser(resolveAuthUserFromLogin(data, credentials.email));
        } catch (error: unknown) {
          throw new Error(resolveErrorMessage(error, 'Falha no login'));
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

          if (USEMOCK) {
            return;
          }

          await api.post('users/create', registerData);
        } catch (error: unknown) {
          throw new Error(resolveErrorMessage(error, 'Falha ao realizar o cadastro'));
        }
      },

      signOut: async () => {
        await clearSessionToken();
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
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
