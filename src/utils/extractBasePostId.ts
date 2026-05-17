/**
 * Extract the base post ID from a transformed feed post ID
 * Feed posts have IDs like: 'post-1-page-1-item-0'
 * This extracts 'post-1' to match mock data keys
 * @param feedPostId Transformed post ID from feed
 * @returns Base post ID for mock lookups
 */
export const extractBasePostId = (feedPostId: string): string => {
  const match = feedPostId.match(/^(post-\d+)/);
  return match?.[1] ?? feedPostId;
};
