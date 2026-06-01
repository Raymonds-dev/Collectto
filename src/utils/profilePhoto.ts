import type { AuthUser } from '@/types/auth';

type UserPhotoSource = Pick<AuthUser, 'photoUrl' | 'profilePictureUrl'> | null | undefined;

export const resolveUserPhotoUrl = (user: UserPhotoSource): string | null => {
  if (!user) {
    return null;
  }

  const rawPhotoUrl =
    typeof user.photoUrl === 'string' && user.photoUrl.trim().length > 0 ? user.photoUrl : null;
  const rawProfilePictureUrl =
    typeof user.profilePictureUrl === 'string' && user.profilePictureUrl.trim().length > 0
      ? user.profilePictureUrl
      : null;

  const candidatePhotoUrl = rawPhotoUrl ?? rawProfilePictureUrl ?? null;

  return candidatePhotoUrl;
};
