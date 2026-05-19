import api from '@/services/api/api';
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '@/services/storage/authSession';
import { AuthUser, Credentials, RegisterData } from '@/types/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios, { AxiosError } from 'axios';
import {
  clearDebugSession,
  isDebugModeEnabled,
  mockAuthService,
  startDebugSession,
} from '@/services/debug';

const resolveErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error instanceof AxiosError && error.response) {
    const responseData = error.response.data as
      | { message?: string; error?: string }
      | string
      | undefined;

    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }

    if (responseData && typeof responseData === 'object') {
      return responseData.message || responseData.error || fallbackMessage;
    }

    if (error.response.status === 403) {
      return 'A requisição foi recusada pelo servidor';
    }

    return fallbackMessage;
  }

  return fallbackMessage;
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

interface JwtPayloadClaims {
  sub?: string;
  userId?: string;
  uid?: string;
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  username?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  iat?: number;
}

const decodeBase64Url = (value: string): string | null => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(paddingLength);

    if (typeof globalThis.atob !== 'function') {
      return null;
    }

    return globalThis.atob(padded);
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token: string): JwtPayloadClaims | null => {
  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  const decodedPayload = decodeBase64Url(parts[1]);

  if (!decodedPayload) {
    return null;
  }

  try {
    return JSON.parse(decodedPayload) as JwtPayloadClaims;
  } catch {
    return null;
  }
};

const resolveAuthUserFromToken = (token: string, fallbackEmail: string): AuthUser => {
  const claims = decodeJwtPayload(token);
  const email =
    typeof claims?.email === 'string' && claims.email.length > 0
      ? claims.email
      : fallbackEmail;
  const nameSource =
    typeof claims?.name === 'string' && claims.name.length > 0
      ? claims.name
      : typeof claims?.fullName === 'string' && claims.fullName.length > 0
        ? claims.fullName
        : typeof claims?.username === 'string' && claims.username.length > 0
          ? claims.username
          : email.split('@')[0] || 'User';

  const idSource =
    typeof claims?.userId === 'string' && claims.userId.length > 0
      ? claims.userId
      : typeof claims?.uid === 'string' && claims.uid.length > 0
        ? claims.uid
        : typeof claims?.id === 'string' && claims.id.length > 0
          ? claims.id
          : typeof claims?.sub === 'string' && claims.sub.length > 0
            ? claims.sub
            : email;

  return {
    id: idSource,
    email,
    name: nameSource,
    username:
      typeof claims?.username === 'string' && claims.username.length > 0
        ? claims.username
        : nameSource.toLowerCase(),
    createdAt: new Date().toISOString(),
  } as AuthUser;
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
          setUser(resolveAuthUserFromToken(token, 'user@example.com'));
          return;
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
        const normalizedEmail = credentials.email.trim().toLowerCase();

        if (!normalizedEmail || !credentials.password) {
          throw new Error('Preencha email e senha.');
        }

        if (isDebugModeEnabled()) {
          await mockAuthService.login(credentials);
          const debugUser = await mockAuthService.getCurrentUser();
          setUser(debugUser);
          return;
        }

        try {
          const baseUrl = api.defaults.baseURL;

          if (!baseUrl) {
            throw new Error('Base URL da API não configurada.');
          }

          const loginResponse = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              email: normalizedEmail,
              password: credentials.password,
            }),
          });

          const responseText = await loginResponse.text();
          let responseData: unknown = null;

          if (responseText) {
            try {
              responseData = JSON.parse(responseText) as unknown;
            } catch {
              responseData = responseText;
            }
          }

          if (!loginResponse.ok) {
            // eslint-disable-next-line no-console
            console.log('[SIGNIN ERROR] fetch login failed', {
              status: loginResponse.status,
              data: responseData,
            });

            throw new Error(
              typeof responseData === 'string' && responseData.trim()
                ? responseData
                : 'Falha ao realizar o login'
            );
          }

          const accessToken =
            responseData && typeof responseData === 'object' &&
            typeof (responseData as { accessToken?: unknown }).accessToken === 'string' &&
            (responseData as { accessToken: string }).accessToken.length > 0
              ? (responseData as { accessToken: string }).accessToken
              : null;

          if (!accessToken) {
            throw new Error('Token de acesso não retornado pelo backend.');
          }

          // Persist token immediately so the session survives even if profile hydration fails.
          await setSessionToken(accessToken);

          // Keep the axios instance authenticated for the next request.
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          setUser(resolveAuthUserFromToken(accessToken, normalizedEmail));
          return;
        } catch (error: unknown) {
          // Log the error details for debugging (dev only)
          try {
            // eslint-disable-next-line no-console
            if (error instanceof AxiosError) {
              console.log('[SIGNIN ERROR] status=', error.response?.status, 'data=', error.response?.data);
            } else {
              // eslint-disable-next-line no-console
              console.log('[SIGNIN ERROR]', error);
            }
          } catch (e) {
            // ignore logging errors
          }

          throw new Error(resolveErrorMessage(error, '*Falha no login'));
        }
      },

      signUp: async (registerData: RegisterData) => {
        try {
          const normalizedBirthdayDate = registerData.birthdayDate.trim().split('T')[0];
          const normalizedPayload: RegisterData = {
            name: registerData.name.trim(),
            username: registerData.username.trim().toLowerCase(),
            email: registerData.email.trim().toLowerCase(),
            password: registerData.password,
            birthdayDate: normalizedBirthdayDate,
          };

          const usernameIsValid = /^[a-z0-9_]+$/.test(normalizedPayload.username);
          const birthdayDateIsValid = /^\d{4}-\d{2}-\d{2}$/.test(normalizedPayload.birthdayDate);

          if (
            !normalizedPayload.email ||
            !normalizedPayload.password ||
            !normalizedPayload.name ||
            !normalizedPayload.username ||
            !normalizedPayload.birthdayDate
          ) {
            throw new Error('Preencha todos os campos');
          }

          if (!usernameIsValid) {
            throw new Error('Nome de usuário inválido. Use apenas letras minúsculas, números e underscore (_).');
          }

          if (!birthdayDateIsValid) {
            throw new Error('Data de nascimento inválida. Use o formato yyyy-MM-dd.');
          }

          if (isDebugModeEnabled()) {
            await mockAuthService.register(normalizedPayload);
            return;
          }

          const publicBaseUrl = api.defaults.baseURL;
          if (!publicBaseUrl) {
            throw new Error('Base URL da API não configurada.');
          }

          // Use a public request that does not inherit Authorization from authenticated instance.
          await axios.post(`${publicBaseUrl}/users/create`, normalizedPayload, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
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
          return { ...currentUser, profilePictureUrl: photoUrl, photoUrl };
        });
      },
      updateUserProfile: (data: Partial<AuthUser>) => {
        setUser((currentUser) => {
          if (!currentUser) {
            return null;
          }
          const nextProfilePictureUrl =
            typeof data.profilePictureUrl === 'string'
              ? data.profilePictureUrl
              : currentUser.profilePictureUrl;
          const nextPhotoUrl =
            typeof data.photoUrl === 'string' ? data.photoUrl : nextProfilePictureUrl;

          return {
            ...currentUser,
            ...data,
            profilePictureUrl: nextProfilePictureUrl,
            photoUrl: nextPhotoUrl,
          };
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
