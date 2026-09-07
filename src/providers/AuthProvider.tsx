import api, { getAuthenticatedUser, getUserById, refreshSession } from '@/services/api/api';
import {
  clearSessionToken,
  getSessionRefreshToken,
  getSessionToken,
  setSessionRefreshToken,
  setSessionToken,
} from '@/services/storage/authSession';
import { AuthUser, Credentials, RegisterData } from '@/types/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { Alert } from 'react-native';
import {
  decodeJwtPayload,
  isTokenExpired,
  isValidJwtFormat,
  resolveUserIdFromToken,
} from '@/utils/jwt';
import { resolveAuthUserFromProfile, resolveAuthUserFromToken } from '@/utils/userMappers';
import { validateRegisterPayload } from '@/utils/validation';

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
      // Ignore and return profile payload
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
      // Ignore and return profile payload
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

  const signOut = useCallback(async () => {
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
  }, []);

  const signIn = useCallback(async (credentials: Credentials) => {
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

        const refreshToken =
          responseData &&
          typeof responseData === 'object' &&
          typeof (responseData as { refreshToken?: unknown }).refreshToken === 'string' &&
          (responseData as { refreshToken: string }).refreshToken.length > 0
            ? (responseData as { refreshToken: string }).refreshToken
            : null;

        if (!accessToken) {
          throw new Error('Token de acesso não retornado pelo backend.');
        }

        const cleanToken = accessToken.replace(/^"|"$/g, '');
        const resolvedUserId = resolveUserIdFromToken(cleanToken);
        try {
          if (shouldRestorePersistentSession) {
            await setSessionToken(cleanToken);
            if (refreshToken) {
              await setSessionRefreshToken(refreshToken);
            }
          }
        } catch (error) {
          console.warn('[auth] Failed to persist session token:', error);
        }

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
          // Fall back to token claims on failure
        }

        if (resolvedUserId) {
          try {
            const profile = await getUserById(resolvedUserId);
            const hydratedProfile = resolveAuthUserFromProfile(profile, normalizedEmail);
            setUser(hydratedProfile);
            return;
          } catch {
            // Fall back to token claims on failure
          }
        }

        setUser(resolveAuthUserFromToken(cleanToken, normalizedEmail));
        return;
      } catch (error: unknown) {
        throw mapErrorToMessage(error, 'login');
      }
    });
  }, []);

  const signUp = useCallback(async (registerData: RegisterData) => {
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

        validateRegisterPayload(normalizedPayload);

        if (isDebugModeEnabled()) {
          await mockAuthService.register(normalizedPayload);
          return;
        }

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
  }, []);

  const updateUserProfile = useCallback((data: Partial<AuthUser>) => {
    sessionRefreshManager.recordUserActivity();
    setUser((currentUser) => {
      if (!currentUser) return null;
      const photo = data.profilePictureUrl ?? data.photoUrl ?? currentUser.profilePictureUrl;
      return {
        ...currentUser,
        ...data,
        profilePictureUrl: photo,
        photoUrl: photo ?? currentUser.photoUrl,
      };
    });
  }, []);

  useEffect(() => {
    sessionRefreshManager.initialize(
      async () => {
        await signOut();
        Alert.alert('Sessão Expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
      },
      async (newToken) => {
        try {
          await setSessionToken(newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (error) {
          console.warn('[auth] Failed to persist refreshed token:', error);
        }
      },
      async (refreshToken) => {
        return refreshSession({ refreshToken });
      }
    );

    return () => {
      sessionRefreshManager.clearSession();
    };
  }, [signOut]);

  useEffect(() => {
    const bootstrapSession = async () => {
      return authLogger.track({ module: 'AuthProvider', action: 'bootstrapSession' }, async () => {
        try {
          if (isDebugModeEnabled()) {
            startDebugSession();
          }

          if (shouldRestorePersistentSession) {
            const token = await getSessionToken();
            const refreshToken = await getSessionRefreshToken();

            if (refreshToken) {
              const newAccessToken = await sessionRefreshManager.performRefresh();
              if (newAccessToken) {
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                sessionRefreshManager.startSession(newAccessToken);

                if (isDebugModeEnabled()) {
                  const debugUser = await mockAuthService.getCurrentUser();
                  if (debugUser) {
                    setUser(debugUser);
                    return;
                  }
                } else {
                  try {
                    const profile = await getAuthenticatedUser();
                    setUser(resolveAuthUserFromProfile(profile, profile.email));
                    return;
                  } catch (error) {
                    console.warn(
                      '[auth] Failed to hydrate user after refresh. Falling back.',
                      error
                    );
                  }
                }
              }
            }

            if (token) {
              let cleanToken = token.replace(/^"|"$/g, '');

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
                console.warn(`[auth] ${(validationError as Error).message} Attempting refresh.`);
                const newAccessToken = await sessionRefreshManager.performRefresh();
                if (newAccessToken) {
                  cleanToken = newAccessToken;
                } else {
                  console.warn('[auth] Token refresh failed on expired token bootstrap. Clearing.');
                  await clearSessionToken();
                  setUser(null);
                  return;
                }
              }

              api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
              sessionRefreshManager.startSession(cleanToken);

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
                    const status = (error as any)?.status || (error as any)?.response?.status;
                    const message = (error as any)?.message;
                    const isAuthError =
                      status === 401 ||
                      status === 403 ||
                      message?.includes('Refresh failed') ||
                      (error as any)?.code === 'UNAUTHORIZED';

                    if (isAuthError) {
                      console.warn(
                        '[auth] Token invalid/unauthorized or refresh failed on bootstrap. Clearing.'
                      );
                      await signOut();
                      return;
                    }
                    throw error;
                  }
                }

                if (!profile) {
                  try {
                    profile = await getAuthenticatedUser();
                  } catch (error) {
                    const status = (error as any)?.status || (error as any)?.response?.status;
                    const message = (error as any)?.message;
                    const isAuthError =
                      status === 401 ||
                      status === 403 ||
                      message?.includes('Refresh failed') ||
                      (error as any)?.code === 'UNAUTHORIZED';

                    if (isAuthError) {
                      console.warn(
                        '[auth] Token invalid/unauthorized or refresh failed on bootstrap fallback. Clearing.'
                      );
                      await signOut();
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

              setUser(resolveAuthUserFromToken(cleanToken, 'user@example.com'));
              return;
            }
          }

          await clearSessionToken();
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        } catch (error) {
          const status = (error as any)?.status || (error as any)?.response?.status;
          const message = (error as any)?.message;
          const isAuthError =
            status === 401 ||
            status === 403 ||
            message?.includes('Refresh failed') ||
            (error as any)?.code === 'UNAUTHORIZED';

          if (isAuthError) {
            console.warn('[auth] Auth-related error caught on bootstrap. Handling gracefully.');
            try {
              await signOut();
            } catch (signOutError) {
              console.warn(
                '[auth] Failed to sign out during bootstrap auth error recovery:',
                signOutError
              );
            }
            return;
          }

          console.error('[auth] Bootstrap failed:', error);
          setBootstrapError(error instanceof Error ? error : new Error(String(error)));
          throw error;
        } finally {
          setIsLoading(false);
        }
      });
    };

    bootstrapSession().catch(() => {});
  }, [signOut]);

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
        // Keep current user state
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
      signIn,
      signOut,
      signUp,
      updateUserProfile,
    }),
    [isLoading, user, signIn, signOut, signUp, updateUserProfile]
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
