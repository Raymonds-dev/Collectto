import { clearSessionToken, getSessionToken, setSessionToken } from '@/services/authSession';
import { AuthUser, Credentials } from '@/types/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextType {
  isLoading: boolean;
  user: AuthUser | null;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function buildUser(email: string): AuthUser {
  return {
    id: 'local-user',
    email,
    name: email.split('@')[0] || 'User',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const token = await getSessionToken();

        if (token) {
          setUser(buildUser('user@collectto.app'));
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

        await setSessionToken('mock-session-token');
        setUser(buildUser(credentials.email));
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
