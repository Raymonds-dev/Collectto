import api, { getAuthenticatedUser, getUserById } from '@/services/api/api';
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '@/services/storage/authSession';
import { AuthUser, Credentials, RegisterData } from '@/types/auth';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import {
  clearDebugSession,
  isDebugModeEnabled,
  mockAuthService,
  startDebugSession,
} from '@/services/debug';
import { resolveUserPhotoUrl } from '@/utils/profilePhoto';

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

const resolveProfileAssetUrl = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (/^(file|content|asset|data):/i.test(value)) {
    return value;
  }

  if (/^\/(data|var|storage|private)\//i.test(value)) {
    return `file://${value}`;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const baseUrl = api.defaults.baseURL;
  if (!baseUrl) {
    return value;
  }

  return `${baseUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
};

const isLocalAssetUrl = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  return (
    /^(file|content|asset|data):/i.test(value) || /^\/(data|var|storage|private)\//i.test(value)
  );
};

const resolveRawProfilePictureUrl = (source: Record<string, unknown>): string | undefined => {
  const candidateKeys = [
    'profilePictureUrl',
    'photoUrl',
    'avatarUrl',
    'pictureUrl',
    'imageUrl',
    'profileImage',
  ] as const;

  for (const key of candidateKeys) {
    const candidate = source[key];

    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return undefined;
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

  const rawProfilePictureUrl = resolveRawProfilePictureUrl(source);
  const profilePictureUrl = resolveProfileAssetUrl(rawProfilePictureUrl);
  const profileBackgroundUrl =
    typeof source.profileBackgroundUrl === 'string' ? source.profileBackgroundUrl : undefined;
  const username =
    typeof source.username === 'string' && source.username.length > 0
      ? source.username
      : name.toLowerCase();
  const bio = typeof source.bio === 'string' ? source.bio : undefined;
  const birthdayDate = typeof source.birthdayDate === 'string' ? source.birthdayDate : undefined;
  const followersCount =
    typeof source.followersCount === 'number' ? source.followersCount : undefined;
  const followingCount =
    typeof source.followingCount === 'number' ? source.followingCount : undefined;
  const isActive = typeof source.isActive === 'boolean' ? source.isActive : undefined;

  return {
    id: typeof source.id === 'string' && source.id.length > 0 ? source.id : 'local-user',
    email,
    name,
    username,
    bio,
    profilePictureUrl,
    profileBackgroundUrl,
    photoUrl: profilePictureUrl,
    followersCount,
    followingCount,
    isActive,
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

const resolveUserIdFromToken = (token: string): string | null => {
  const claims = decodeJwtPayload(token);

  if (!claims) {
    return null;
  }

  if (typeof claims.userId === 'string' && claims.userId.length > 0) {
    return claims.userId;
  }

  if (typeof claims.uid === 'string' && claims.uid.length > 0) {
    return claims.uid;
  }

  if (typeof claims.id === 'string' && claims.id.length > 0) {
    return claims.id;
  }

  if (typeof claims.sub === 'string' && claims.sub.length > 0) {
    return claims.sub;
  }

  return null;
};

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
    typeof claims?.email === 'string' && claims.email.length > 0 ? claims.email : fallbackEmail;
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

const hydrateAuthenticatedProfile = async (
  authorization: string,
  fallbackEmail: string,
  fallbackUserId?: string
): Promise<AuthUser | null> => {
  const profile = await getAuthenticatedUser(authorization);
  const hydratedProfile = resolveAuthUserFromProfile(profile, fallbackEmail);

  if (hydratedProfile.profilePictureUrl) {
    return hydratedProfile;
  }

  if (hydratedProfile.id && hydratedProfile.id !== 'local-user') {
    try {
      const profileById = await getUserById(hydratedProfile.id);
      const hydratedById = resolveAuthUserFromProfile(profileById, fallbackEmail);

      if (hydratedById.profilePictureUrl) {
        return hydratedById;
      }

      return hydratedById;
    } catch {
      // Ignore and return the profile payload we already have.
    }
  }

  if (fallbackUserId && fallbackUserId !== 'local-user' && fallbackUserId !== hydratedProfile.id) {
    try {
      const profileById = await getUserById(fallbackUserId);
      const hydratedById = resolveAuthUserFromProfile(profileById, fallbackEmail);

      if (hydratedById.profilePictureUrl) {
        return hydratedById;
      }

      return hydratedById;
    } catch {
      // Ignore and return the profile payload we already have.
    }
  }

  return hydratedProfile;
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
const shouldRestorePersistentSession = false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const isRefreshingProfileRef = useRef(false);
  const currentUserId = user?.id;
  const currentUserEmail = user?.email;
  const currentUserPhotoUrl = resolveUserPhotoUrl(user);

  useEffect(() => {
    async function bootstrapSession() {
      try {
        if (isDebugModeEnabled()) {
          startDebugSession();
        }

        if (shouldRestorePersistentSession) {
          const token = await getSessionToken();

          if (token) {
            const cleanToken = token.replace(/^"|"$/g, '');
            api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;

            const resolvedUserId = resolveUserIdFromToken(cleanToken);

            if (resolvedUserId) {
              try {
                const profile = await getUserById(resolvedUserId);
                setUser(resolveAuthUserFromProfile(profile, profile.email));
                return;
              } catch {
                // Ignore profile hydration failures here and fall back to token claims.
              }
            }

            setUser(resolveAuthUserFromToken(cleanToken, 'user@example.com'));
            return;
          }
        }

        await clearSessionToken();
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapSession();
  }, []);

  useEffect(() => {
    if (!currentUserId || currentUserPhotoUrl) {
      isRefreshingProfileRef.current = false;
      return;
    }

    if (isRefreshingProfileRef.current) {
      return;
    }

    const authorization = api.defaults.headers.common.Authorization;

    if (typeof authorization !== 'string' || authorization.trim().length === 0) {
      return;
    }

    let isCancelled = false;
    isRefreshingProfileRef.current = true;

    void (async () => {
      try {
        const refreshedProfile = await hydrateAuthenticatedProfile(
          authorization,
          currentUserEmail ?? 'user@example.com'
        );

        if (!isCancelled && refreshedProfile) {
          setUser((currentUser) => {
            if (!currentUser || currentUser.id !== refreshedProfile.id) {
              return currentUser;
            }

            return {
              ...currentUser,
              ...refreshedProfile,
              profilePictureUrl: refreshedProfile.profilePictureUrl,
              photoUrl: refreshedProfile.photoUrl ?? refreshedProfile.profilePictureUrl,
            };
          });
        }
      } catch {
        // Keep the current user state if the refresh fails.
      } finally {
        if (!isCancelled) {
          isRefreshingProfileRef.current = false;
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [currentUserEmail, currentUserId, currentUserPhotoUrl]);

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
            throw new Error(
              typeof responseData === 'string' && responseData.trim()
                ? responseData
                : 'Falha ao realizar o login'
            );
          }

          const accessToken =
            responseData &&
            typeof responseData === 'object' &&
            typeof (responseData as { accessToken?: unknown }).accessToken === 'string' &&
            (responseData as { accessToken: string }).accessToken.length > 0
              ? (responseData as { accessToken: string }).accessToken
              : null;

          if (!accessToken) {
            throw new Error('Token de acesso não retornado pelo backend.');
          }

          const cleanToken = accessToken.replace(/^"|"$/g, '');
          const resolvedUserId = resolveUserIdFromToken(cleanToken);
          if (shouldRestorePersistentSession) {
            await setSessionToken(cleanToken);
          }

          // Keep the axios instance authenticated for the current app session.
          api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
          try {
            const hydratedProfile = await hydrateAuthenticatedProfile(
              `Bearer ${cleanToken}`,
              normalizedEmail,
              resolvedUserId ?? undefined
            );
            setUser(hydratedProfile ?? resolveAuthUserFromToken(cleanToken, normalizedEmail));
            return;
          } catch {
            // Ignore profile hydration failures here and fall back to token claims.
          }

          if (resolvedUserId) {
            try {
              const profile = await getUserById(resolvedUserId);
              const hydratedProfile = resolveAuthUserFromProfile(profile, normalizedEmail);
              setUser(hydratedProfile);
              return;
            } catch {
              // Ignore profile hydration failures here and fall back to token claims.
            }
          }

          setUser(resolveAuthUserFromToken(cleanToken, normalizedEmail));
          return;
        } catch (error: unknown) {
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
            throw new Error(
              'Nome de usuário inválido. Use apenas letras minúsculas, números e underscore (_).'
            );
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
        console.log('[auth] updateUserProfile called with:', data);
        setUser((currentUser) => {
          if (!currentUser) {
            return null;
          }
          const currentPhotoUrl = resolveUserPhotoUrl(currentUser);
          const nextProfileCandidate =
            typeof data.profilePictureUrl === 'string' && data.profilePictureUrl.length > 0
              ? data.profilePictureUrl
              : undefined;
          const nextPhotoCandidate =
            typeof data.photoUrl === 'string' && data.photoUrl.length > 0
              ? data.photoUrl
              : undefined;
          const nextRawProfilePictureUrl =
            (nextProfileCandidate && !isLocalAssetUrl(nextProfileCandidate)
              ? nextProfileCandidate
              : undefined) ??
            (nextPhotoCandidate && !isLocalAssetUrl(nextPhotoCandidate)
              ? nextPhotoCandidate
              : undefined) ??
            currentPhotoUrl;
          const nextProfilePictureUrl = resolveProfileAssetUrl(nextRawProfilePictureUrl);
          const nextPhotoUrl =
            typeof data.photoUrl === 'string' && data.photoUrl.length > 0
              ? data.photoUrl
              : nextProfilePictureUrl;
          const nextUsername =
            typeof data.username === 'string' && data.username.length > 0
              ? data.username
              : currentUser.username;

          const next = {
            ...currentUser,
            ...data,
            username: nextUsername,
            profilePictureUrl: nextProfilePictureUrl,
            photoUrl: nextPhotoUrl,
          };
          console.log('[auth] updateUserProfile result:', next);
          return next;
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
