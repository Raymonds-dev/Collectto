/**
 * Comments API Contract
 *
 * Defines public interfaces for comment feature.
 * MOCK: Implemented via src/mocks/comments.ts
 * TODO(api): Replace with actual backend endpoint when ready
 * 
 * Schema da API (banco de dados):
 * - PK: comment_id UUID
 * - FK: item_id UUID (referência ao feed item)
 * - FK: user_id UUID (referência ao usuário autor)
 * - content: TEXT (1-500 chars)
 * - created_at: TIMESTAMP (ISO 8601)
 */

/**
 * Represents a single comment on a feed item
 * Client-side name mapping: comment_id → id, item_id → postId, user_id → authorId, content → text
 */
export interface CommentDto {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  publishedLabel: string;
  createdAt: number;
  isAuthor?: boolean;
}

/**
 * Request to create a new comment
 */
export interface CreateCommentRequest {
  postId: string;
  text: string;
  authorId: string;
}

/**
 * Response when creating a comment (mapped from API schema)
 * API returns: comment_id, item_id, user_id, content, created_at
 */
export interface CreateCommentResponse {
  success: boolean;
  comment?: CommentDto;
  error?: string;
}

/**
 * Get all comments for a specific post
 *
 * MOCK: src/mocks/comments.ts → getCommentsByPostId(postId)
 * TODO(api): GET /api/items/{item_id}/comments
 */
export interface GetCommentsRequest {
  postId: string;
}

export interface GetCommentsResponse {
  postId: string;
  comments: CommentDto[];
  totalCount: number;
}

/**
 * Get teaser comment for a post (first visible comment)
 *
 * MOCK: src/mocks/comments.ts → buildTeaser(postId)
 * TODO(api): GET /api/items/{item_id}/comments/teaser
 */
export interface GetTeaserCommentRequest {
  postId: string;
}

export interface GetTeaserCommentResponse {
  postId: string;
  teaserComment: CommentDto | null;
}
