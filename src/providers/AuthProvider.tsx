import api, { getAuthenticatedUser, getUserById } from '@/services/api/api';
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '@/services/storage/authSession';
import { AuthUser, Credentials, RegisterData } from '@/types/auth';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  clearDebugSession,
  isDebugModeEnabled,
  mockAuthService,
  startDebugSession,
} from '@/services/debug';
import { resolveUserPhotoUrl } from '@/utils/profilePhoto';
import { sessionRefreshManager } from '@/services/auth/sessionRefreshManager';
import { authLogger } from '@/utils/authLogging';
import { mapErrorToMessage } from '@/utils/errorMapping';

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
  const rawProfileBackgroundUrl =
    typeof source.profileBackgroundUrl === 'string' ? source.profileBackgroundUrl : undefined;
  const profileBackgroundUrl = resolveProfileAssetUrl(rawProfileBackgroundUrl);
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

export interface DecodedJwtClaims {
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
  exp: number;
}

export const isValidJwtFormat = (token: string): boolean => {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.trim().length > 0);
};

export const isTokenExpired = (exp: number): boolean => {
  return Date.now() >= exp * 1000;
};

const resolveUserIdFromToken = (token: string): string | null => {
  const claims = decodeJwtPayload(token);

  if (!claims) {
    return null;
  }

  const isUuid = (val: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

  if (typeof claims.userId === 'string' && claims.userId.length > 0 && isUuid(claims.userId)) {
    return claims.userId;
  }

  if (typeof claims.uid === 'string' && claims.uid.length > 0 && isUuid(claims.uid)) {
    return claims.uid;
  }

  if (typeof claims.id === 'string' && claims.id.length > 0 && isUuid(claims.id)) {
    return claims.id;
  }

  if (typeof claims.sub === 'string' && claims.sub.length > 0 && isUuid(claims.sub)) {
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

export const decodeJwtPayload = (token: string): DecodedJwtClaims | null => {
  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  const decodedPayload = decodeBase64Url(parts[1]);

  if (!decodedPayload) {
    return null;
  }

  try {
    const claims = JSON.parse(decodedPayload);
    if (!claims || typeof claims !== 'object' || typeof claims.exp !== 'number') {
      return null;
    }
    return claims as DecodedJwtClaims;
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
const shouldRestorePersistentSession = true;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);
  const isRefreshingProfileRef = useRef(false);
  const currentUserId = user?.id;
  const currentUserEmail = user?.email;
  const currentUserPhotoUrl = resolveUserPhotoUrl(user);

  if (bootstrapError) {
    throw bootstrapError;
  }

  const signOut = async () => {
    return authLogger.track({ module: 'AuthProvider', action: 'signOut' }, async () => {
      try {
        if (isDebugModeEnabled()) {
          await mockAuthService.logout();
          clearDebugSession();
        }
        sessionRefreshManager.clearSession();
        await clearSessionToken();
        delete api.defaults.headers.common['Authorization'];
      } catch (error) {
        console.warn('[auth] Error during signOut storage operation:', error);
        throw error;
      } finally {
        setUser(null);
      }
    });
  };

  useEffect(() => {
    sessionRefreshManager.initialize(
      async () => {
        await signOut();
      },
      async (newToken) => {
        try {
          await setSessionToken(newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (error) {
          console.warn('[auth] Failed to persist refreshed token:', error);
        }
      }
    );

    return () => {
      sessionRefreshManager.clearSession();
    };
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      return authLogger.track({ module: 'AuthProvider', action: 'bootstrapSession' }, async () => {
        try {
          if (isDebugModeEnabled()) {
            startDebugSession();
          }

          if (shouldRestorePersistentSession) {
            const token = await getSessionToken();

            if (token) {
              const cleanToken = token.replace(/^"|"$/g, '');

              // Log explicit token validation
              let validationError: Error | null = null;
              const claims = decodeJwtPayload(cleanToken);

              await authLogger
                .track({ module: 'AuthProvider', action: 'tokenValidation' }, async () => {
                  if (!isValidJwtFormat(cleanToken)) {
                    validationError = new Error('Persisted token has invalid JWT format.');
                    throw validationError;
                  }
                  if (claims && claims.exp && isTokenExpired(claims.exp)) {
                    validationError = new Error('Persisted token has expired.');
                    throw validationError;
                  }
                })
                .catch(() => {});

              if (validationError) {
                console.warn(`[auth] ${(validationError as Error).message} Clearing.`);
                await clearSessionToken();
                setUser(null);
                return;
              }

              // 3. Header setup
              api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
              sessionRefreshManager.startSession(cleanToken);

              // 4. Debug vs Production Hydration
              if (isDebugModeEnabled()) {
                const debugUser = await mockAuthService.getCurrentUser();
                if (debugUser) {
                  setUser(debugUser);
                  return;
                }
              } else {
                let profile: AuthUser | null = null;
                const resolvedUserId = resolveUserIdFromToken(cleanToken);

                if (resolvedUserId) {
                  try {
                    profile = await getUserById(resolvedUserId);
                  } catch (error) {
                    // If it's a 401 or 403, clear session and return (don't throw)
                    const status = (error as any)?.status || (error as any)?.response?.status;
                    if (status === 401 || status === 403) {
                      console.warn('[auth] Token invalid/unauthorized on bootstrap. Clearing.');
                      await clearSessionToken();
                      setUser(null);
                      return;
                    }
                    throw error;
                  }
                }

                // If resolvedUserId was not a UUID, or getUserById failed, fetch from users/me
                if (!profile) {
                  try {
                    profile = await getAuthenticatedUser();
                  } catch (error) {
                    const status = (error as any)?.status || (error as any)?.response?.status;
                    if (status === 401 || status === 403) {
                      console.warn(
                        '[auth] Token invalid/unauthorized on bootstrap fallback. Clearing.'
                      );
                      await clearSessionToken();
                      setUser(null);
                      return;
                    }
                    throw error;
                  }
                }

                if (profile) {
                  setUser(resolveAuthUserFromProfile(profile, profile.email));
                  return;
                }
              }

              // Fallback decode token claims directly
              setUser(resolveAuthUserFromToken(cleanToken, 'user@example.com'));
              return;
            }
          }

          // Default: no token saved or persistent session not enabled
          await clearSessionToken();
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        } catch (error) {
          console.error('[auth] Bootstrap failed:', error);
          setBootstrapError(error instanceof Error ? error : new Error(String(error)));
          throw error;
        } finally {
          setIsLoading(false);
        }
      });
    };

    bootstrapSession().catch(() => {});
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
        return authLogger.track({ module: 'AuthProvider', action: 'signIn' }, async () => {
          const normalizedEmail = credentials.email.trim().toLowerCase();

          if (!normalizedEmail || !credentials.password) {
            throw new Error('Preencha email e senha.');
          }

          if (isDebugModeEnabled()) {
            const response = await mockAuthService.login(credentials);
            const cleanToken = response.accessToken.replace(/^"|"$/g, '');
            try {
              if (shouldRestorePersistentSession) {
                await setSessionToken(cleanToken);
              }
            } catch (error) {
              console.warn('[auth] Failed to persist session token in debug mode:', error);
            }
            api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
            sessionRefreshManager.startSession(cleanToken);
            const debugUser = await mockAuthService.getCurrentUser();
            setUser(debugUser);
            return;
          }

          try {
            const responseData = await api.post<any>(
              'auth/login',
              {
                email: normalizedEmail,
                password: credentials.password,
              },
              {
                headers: {
                  Authorization: '',
                },
              }
            );

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
            try {
              if (shouldRestorePersistentSession) {
                await setSessionToken(cleanToken);
              }
            } catch (error) {
              console.warn('[auth] Failed to persist session token:', error);
            }

            // Keep the axios instance authenticated for the current app session.
            api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
            sessionRefreshManager.startSession(cleanToken);
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
            throw mapErrorToMessage(error, 'login');
          }
        });
      },

      signUp: async (registerData: RegisterData) => {
        return authLogger.track({ module: 'AuthProvider', action: 'signUp' }, async () => {
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

            // Use the centralized api client with explicit empty Authorization to bypass token injection.
            await api.post('users/create', normalizedPayload, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: '',
              },
            });
          } catch (error: unknown) {
            throw mapErrorToMessage(error, 'signup');
          }
        });
      },

      signOut,
      updateUserPhoto: (photoUrl: string) => {
        sessionRefreshManager.recordUserActivity();
        setUser((currentUser) => {
          if (!currentUser) {
            return null;
          }
          return { ...currentUser, profilePictureUrl: photoUrl, photoUrl };
        });
      },
      updateUserProfile: (data: Partial<AuthUser>) => {
        sessionRefreshManager.recordUserActivity();
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
