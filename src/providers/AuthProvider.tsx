import api from '@/services/api';
import { clearSessionToken, getSessionToken, setSessionToken } from '@/services/authSession';
import { AuthUser, Credentials } from '@/types/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';

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
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
        try {
          if (!credentials.email || !credentials.password) {
            throw new Error('Preencha email e senha.');
          }

          //Requisição
          const { data } = await api.post('auth/login', credentials);
          const { accessToken } = data.data;

          await setSessionToken(accessToken); //Token Armazenado

          //Coloca o token para outras requisições
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          //Usuario
          setUser(buildUser(credentials.email));
        } catch (error: any) {
          if (error instanceof AxiosError && error.response) {
            throw new Error(error.response.data.message || 'Credenciais inválidas.');
          }
          throw new Error('Falha no login')
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
