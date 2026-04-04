import api from '@/services/api';
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '@/services/storage/authSession';
import { buildMockAuthUser, MOCK_AUTH_BOOTSTRAP_EMAIL, MOCK_AUTH_SESSION_TOKEN } from '@/mocks';
import { AuthUser, Credentials, RegisterData } from '@/types/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';

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
          // TODO: Conflito de merge - revisar lógica duplicada
          // --- Lógica da sua branch ---
          // ao encontrar token, reaplica o header Authorization para chamadas protegidas.
          // --- Lógica da branch develop ---
          // usa usuário mock no bootstrap enquanto a API de perfil não está integrada.
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
        try {
          if (!credentials.email || !credentials.password) {
            throw new Error('Preencha email e senha.');
          }

          try {
            const { data } = await api.post('auth/login', credentials);
            const { accessToken } = data;

            await setSessionToken(accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setUser(buildMockAuthUser(credentials.email));
          } catch (error: any) {
            // TODO: Conflito de merge - revisar lógica duplicada
            // --- Lógica da sua branch ---
            // tentativa de autenticação real via backend.
            // --- Lógica da branch develop ---
            // fallback para sessão mock enquanto integração de API estiver em evolução.
            await setSessionToken(MOCK_AUTH_SESSION_TOKEN);
            setUser(buildMockAuthUser(credentials.email));

            if (error instanceof AxiosError && error.response) {
              throw new Error(error.response.data.message || 'Credenciais inválidas.');
            }
            throw error;
          }
        } catch (error: any) {
          if (error instanceof AxiosError && error.response) {
            throw new Error(error.response.data.message || 'Credenciais inválidas.');
          }
          throw new Error('Falha no login');
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

          await api.post('users/create', registerData);
        } catch (error: any) {
          if (error instanceof AxiosError && error.response) {
            throw new Error(error.response.data.message || 'Falha ao realizar cadastro');
          }
          throw new Error('Falha ao realizar o cadastro');
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
