/**
 * Mock comments data for feed items
 * Centralized mock data following mock-centralization skill pattern
 * Used until API integration is available (TODO(api): v1.1+)
 */

import type { Comment } from '@/types/comments';
import { buildComment } from '@/utils/comments';

/**
 * Mock comments organized by post ID
 * Each post has 2-3 comments to simulate activity
 */
export const MOCK_COMMENTS_BY_POST: Record<string, Comment[]> = {
  'post-1': [
    buildComment({
      id: 'comment-001-1',
      postId: 'post-1',
      authorId: 'user-002',
      text: 'Adorei essa coleção! Que itens incríveis! 🤩',
      createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      authorName: 'Marina Silva',
      authorAvatar: 'https://via.placeholder.com/44?text=MS',
    }),
    buildComment({
      id: 'comment-001-2',
      postId: 'post-001',
      authorId: 'user-003',
      text: 'Onde você encontrou isso? Procuro essa peça faz tempo!',
      createdAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      authorName: 'João Oliveira',
      authorAvatar: 'https://via.placeholder.com/44?text=JO',
    }),
    buildComment({
      id: 'comment-001-3',
      postId: 'post-001',
      authorId: 'user-004',
      text: 'Complementa perfeito com a outra coleção que você mostrou antes!',
      createdAt: Date.now() - 2 * 60 * 1000, // 2 minutes ago
      authorName: 'Ana Costa',
      authorAvatar: 'https://via.placeholder.com/44?text=AC',
    }),
  ],
  'post-2': [
    buildComment({
      id: 'comment-002-1',
      postId: 'post-2',
      authorId: 'user-005',
      text: 'Que raro! Tenho um parecido mas em excelente estado.',
      createdAt: Date.now() - 45 * 60 * 1000, // 45 minutes ago
      authorName: 'Pedro Mendes',
      authorAvatar: 'https://via.placeholder.com/44?text=PM',
    }),
    buildComment({
      id: 'comment-002-2',
      postId: 'post-002',
      authorId: 'user-006',
      text: 'Quantos itens você tem no total? Sua coleção é gigante!',
      createdAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
      authorName: 'Carla Souza',
      authorAvatar: 'https://via.placeholder.com/44?text=CS',
    }),
  ],
  'post-3': [
    buildComment({
      id: 'comment-003-1',
      postId: 'post-3',
      authorId: 'user-007',
      text: 'Primeira vez que vejo um assim! É autêntico?',
      createdAt: Date.now() - 20 * 60 * 1000, // 20 minutes ago
      authorName: 'Lucia Ferreira',
      authorAvatar: 'https://via.placeholder.com/44?text=LF',
    }),
  ],
  'post-4': [
    buildComment({
      id: 'comment-004-1',
      postId: 'post-4',
      authorId: 'user-008',
      text: 'Combinação perfeita de cores! Muito bom gosto!',
      createdAt: Date.now() - 15 * 60 * 1000, // 15 minutes ago
      authorName: 'Roberto Santos',
      authorAvatar: 'https://via.placeholder.com/44?text=RS',
    }),
    buildComment({
      id: 'comment-004-2',
      postId: 'post-004',
      authorId: 'user-009',
      text: 'Você está sempre descobrindo peças novas! De onde vem a inspiração?',
      createdAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      authorName: 'Beatriz Lima',
      authorAvatar: 'https://via.placeholder.com/44?text=BL',
    }),
  ],
};

/**
 * Get teaser comment for a post (first comment or undefined if none)
 * @param postId Post identifier
 * @returns First comment for post, or undefined
 */
export const buildTeaser = (postId: string): Comment | undefined => {
  const comments = MOCK_COMMENTS_BY_POST[postId];
  return comments?.[0];
};

/**
 * Get all comments for a post
 * @param postId Post identifier
 * @returns Array of comments, or empty array if post not found
 */
export const getCommentsByPostId = (postId: string): Comment[] => {
  return MOCK_COMMENTS_BY_POST[postId] ?? [];
};

/**
 * Add a new comment to a post (mock mutation)
 * Used for testing creation flow
 * @param postId Post identifier
 * @param comment New comment to add
 */
export const addCommentToPost = (postId: string, comment: Comment): void => {
  if (!MOCK_COMMENTS_BY_POST[postId]) {
    MOCK_COMMENTS_BY_POST[postId] = [];
  }
  MOCK_COMMENTS_BY_POST[postId].push(comment);
};

/**
 * Delete a comment from a post (mock mutation)
 * @param postId Post identifier
 * @param commentId Comment identifier
 */
export const deleteCommentFromPost = (postId: string, commentId: string): void => {
  if (MOCK_COMMENTS_BY_POST[postId]) {
    MOCK_COMMENTS_BY_POST[postId] = MOCK_COMMENTS_BY_POST[postId].filter((c) => c.id !== commentId);
  }
};
