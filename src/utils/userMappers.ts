import api from '@/services/api/api';
import type { AuthUser } from '@/types/auth';
import { decodeJwtPayload } from './jwt';

export const resolveProfileAssetUrl = (value?: string | null): string | undefined => {
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

export const isLocalAssetUrl = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  return (
    /^(file|content|asset|data):/i.test(value) || /^\/(data|var|storage|private)\//i.test(value)
  );
};

export const resolveRawProfilePictureUrl = (
  source: Record<string, unknown>
): string | undefined => {
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

export const buildMockAuthUser = (fallbackEmail: string): AuthUser => {
  const email = fallbackEmail || 'user@example.com';
  const name = email.split('@')[0] || 'User';

  return {
    id: 'local-user',
    email,
    name,
    username: name.toLowerCase(),
    createdAt: new Date().toISOString(),
  } as AuthUser;
};

export const resolveAuthUserFromProfile = (payload: unknown, fallbackEmail: string): AuthUser => {
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

export const resolveAuthUserFromToken = (token: string, fallbackEmail: string): AuthUser => {
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
