import { useCallback, useEffect, useState } from 'react';
import { profileService } from '@/services/api/profileService';
import { UserResponse } from '@/types/auth';
import { cacheManager } from '@/services/cache/cacheManager';
import { useRetry } from './useRetry';
import NetInfo from '@react-native-community/netinfo';

export const useProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const { retry } = useRetry();

  const fetchProfile = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return;

      const netState = await NetInfo.fetch();
      const online = netState.isConnected ?? false;
      setIsOffline(!online);

      const cacheKey = `profile_${userId}`;
      const cachedEntry = await cacheManager.getEntry<UserResponse>(cacheKey);
      let hasValidCache = false;

      if (cachedEntry) {
        setProfile(cachedEntry.data);
        const isExpired = Date.now() - cachedEntry.timestamp > cachedEntry.ttl;
        if (!isExpired && !forceRefresh) {
          hasValidCache = true;
          setIsLoading(false);
        }
      }

      if (hasValidCache) {
        return;
      }

      if (!online) {
        setIsLoading(false);
        if (!cachedEntry) {
          setError('Sem conexão');
        }
        return;
      }

      try {
        if (!cachedEntry) {
          setIsLoading(true);
        }
        setError(null);

        const freshData = await retry(() => profileService.getProfile(userId));

        setProfile(freshData);
        await cacheManager.set(cacheKey, freshData);
      } catch (err: any) {
        console.error('[useProfile] Error fetching profile:', err);
        if (!cachedEntry) {
          setError(err.message || 'Erro ao carregar o perfil');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userId, retry]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refresh = useCallback(async () => {
    await fetchProfile(true);
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refresh,
    isOffline,
  };
};
