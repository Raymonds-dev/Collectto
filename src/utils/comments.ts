/**
 * Utilitários relacionados a comentários reutilizáveis pelo app
 */
import type { Comment } from '@/types/comments';

/**
 * Helper to format relative timestamps
 * @param minutesAgo Number of minutes in the past
 * @returns Formatted label like "5 min atrás"
 */
export const formatPublishedLabel = (minutesAgo: number): string => {
  if (minutesAgo === 0) return 'agora';
  if (minutesAgo < 60) return `${minutesAgo} min atrás`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo}h atrás`;
  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo}d atrás`;
};

/**
 * Helper to create Comment objects with timestamps
 * @param overrides Partial Comment object with required fields
 * @returns Complete Comment object
 */
export const buildComment = (
  overrides: Partial<Comment> & Required<Pick<Comment, 'id' | 'postId' | 'authorId' | 'text'>>
): Comment => {
  const now = Date.now();
  const minutesAgo = Math.floor((overrides.createdAt ? now - overrides.createdAt : 0) / 1000 / 60);

  return {
    id: overrides.id,
    postId: overrides.postId,
    authorId: overrides.authorId,
    text: overrides.text,
    createdAt: overrides.createdAt ?? now,
    authorName: overrides.authorName ?? 'Usuário Mock',
    authorAvatar: overrides.authorAvatar ?? 'https://via.placeholder.com/44',
    publishedLabel: overrides.publishedLabel ?? formatPublishedLabel(minutesAgo),
    isAuthor: overrides.isAuthor,
  } as Comment;
};
