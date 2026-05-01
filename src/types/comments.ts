/**
 * Types for comment feature
 * Aligns with API schema: comment_id→id, item_id→postId, user_id→authorId, content→text, created_at→createdAt
 */

/**
 * Represents a single comment on a feed item
 * Maps directly from API schema with snapshots for offline display
 */
export interface Comment {
  // Primary keys and references
  id: string; // comment_id (UUID from API)
  postId: string; // item_id (FK to feed item)
  authorId: string; // user_id (FK to author user)
  createdAt: number; // created_at (timestamp in milliseconds)

  // Content
  text: string; // content (1–500 chars, TEXT in API)

  // Author profile snapshots (denormalized for offline display)
  authorName: string; // Author name at creation time (snapshot, immutable)
  authorAvatar: string; // Author avatar URI at creation time (snapshot, immutable)

  // Client-side transformations (not from API)
  publishedLabel: string; // "agora", "5 min atrás", etc. (calculated from createdAt)
  isAuthor?: boolean; // Local flag: is this comment from authenticated user (compare with auth context)
}

/**
 * Metadata for comment thread on a specific feed item
 * Tracks teaser preview, total count, and expansion state
 */
export interface PostCommentMeta {
  postId: string; // Reference to Post
  totalCount: number; // Total number of real comments
  teaserComment?: Comment; // First or featured comment for preview
  isExpanded?: boolean; // Local state: thread open or closed (default: false)
}

/**
 * Local state for comment thread visualization of a specific feed item
 * Manages comments list, loading state, input state, and form submission
 */
export interface CommentThreadState {
  postId: string; // Which item is being viewed
  comments: Comment[]; // Full list of comments
  isLoading: boolean; // Fetching comments
  error?: string; // Error message if any
  inputText: string; // Draft of new comment
  isSubmitting: boolean; // Submitting new comment
}
