import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '@/services/storage/authSession';
import { buildMockAuthUser, MOCK_AUTH_BOOTSTRAP_EMAIL, MOCK_AUTH_SESSION_TOKEN } from '@/mocks';
import { AuthUser, Credentials } from '@/types/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextType {
  isLoading: boolean;
  user: AuthUser | null;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
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
          // TODO(api): validar token com backend e buscar perfil real do usuario autenticado.
          setUser(buildMockAuthUser(MOCK_AUTH_BOOTSTRAP_EMAIL));
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

        // TODO(api): substituir token mock por chamada real de login e armazenamento do access token.
        await setSessionToken(MOCK_AUTH_SESSION_TOKEN);
        setUser(buildMockAuthUser(credentials.email));
      },
      signOut: async () => {
        await clearSessionToken();
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
