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
  'post-33333333-0000-4000-8000-000000000000': [
    buildComment({
      id: 'comment-001-1',
      postId: 'post-33333333-0000-4000-8000-000000000000',
      authorId: 'user-002',
      text: 'Adorei essa Leica! O estado de conservação dela parece impecável. O telêmetro está calibrado? 🤩',
      createdAt: Date.now() - 30 * 60 * 1000,
      authorName: 'Marina Silva',
      authorAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
    }),
    buildComment({
      id: 'comment-001-2',
      postId: 'post-33333333-0000-4000-8000-000000000000',
      authorId: 'user-003',
      text: 'Essa lente de 50mm f/2 é lendária. Procuro uma M3 nesse estado de conservação há anos!',
      createdAt: Date.now() - 5 * 60 * 1000,
      authorName: 'João Oliveira',
      authorAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80',
    }),
  ],
  'post-44444444-0000-4000-8000-000000000000': [
    buildComment({
      id: 'comment-002-1',
      postId: 'post-44444444-0000-4000-8000-000000000000',
      authorId: 'user-005',
      text: 'Que build limpa! Esse som dos Gateron Oil Kings é sensacional. Usou case foam?',
      createdAt: Date.now() - 45 * 60 * 1000,
      authorName: 'Pedro Mendes',
      authorAvatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80',
    }),
    buildComment({
      id: 'comment-002-2',
      postId: 'post-44444444-0000-4000-8000-000000000000',
      authorId: 'user-006',
      text: 'Ficou lindo demais no setup! Parabéns pela montagem e escolha das keycaps.',
      createdAt: Date.now() - 10 * 60 * 1000,
      authorName: 'Carla Souza',
      authorAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
    }),
  ],
  'post-item-car-001': [
    buildComment({
      id: 'comment-003-1',
      postId: 'post-item-car-001',
      authorId: 'user-007',
      text: 'Um verdadeiro monstro clássico! Esse motor HEMI 426 é simplesmente lendário.',
      createdAt: Date.now() - 20 * 60 * 1000,
      authorName: 'Lucia Ferreira',
      authorAvatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80',
    }),
    buildComment({
      id: 'comment-003-2',
      postId: 'post-item-car-001',
      authorId: 'user-008',
      text: 'Restauração impecável. O ronco desse V8 deve ser música para os ouvidos.',
      createdAt: Date.now() - 15 * 60 * 1000,
      authorName: 'Roberto Santos',
      authorAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80',
    }),
  ],
  'post-item-car-002': [
    buildComment({
      id: 'comment-004-1',
      postId: 'post-item-car-002',
      authorId: 'user-009',
      text: 'Essa pintura Eleanor-style cinza com listras pretas é sacanagem de linda. Sonho de consumo!',
      createdAt: Date.now() - 15 * 60 * 1000,
      authorName: 'Beatriz Lima',
      authorAvatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80',
    }),
  ],
  'post-ana-item-vinyl-001': [
    buildComment({
      id: 'comment-ana-vinyl-1',
      postId: 'post-ana-item-vinyl-001',
      authorId: '00000000-0000-4000-8000-000000000000', // Lucas Ramos
      text: 'Esse disco é uma das maiores obras de arte da música brasileira! A capa dupla da Odeon Mono é histórica. Parabéns pela cópia conservada!',
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      authorName: 'Lucas Ramos',
      authorAvatar: 'https://i.pravatar.cc/150?img=53',
    }),
    buildComment({
      id: 'comment-ana-vinyl-2',
      postId: 'post-ana-item-vinyl-001',
      authorId: 'user-003',
      text: 'Ouvir Clube da Esquina no vinil, com esse som analógico quente, é incomparável. Clássico demais!',
      createdAt: Date.now() - 30 * 60 * 1000,
      authorName: 'João Oliveira',
      authorAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80',
    }),
  ],
  'post-ana-item-vinyl-002': [
    buildComment({
      id: 'comment-ana-vinyl-3',
      postId: 'post-ana-item-vinyl-002',
      authorId: 'user-008',
      text: 'A prensagem japonesa com o OBI original é o santo graal dos audiófilos. A masterização é absurda!',
      createdAt: Date.now() - 1 * 60 * 60 * 1000,
      authorName: 'Roberto Santos',
      authorAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80',
    }),
  ],
  'post-ana-item-plant-001': [
    buildComment({
      id: 'comment-ana-plant-1',
      postId: 'post-ana-item-plant-001',
      authorId: 'user-006',
      text: 'Essa variegação Albo está super equilibrada e saudável! Qual o segredo do substrato?',
      createdAt: Date.now() - 25 * 60 * 1000,
      authorName: 'Carla Souza',
      authorAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
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
