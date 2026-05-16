import { ItemResponse } from '@/types/items';
import { UserResponse } from '@/types/auth';
import { PostProjection } from '@/types/debug';

export const derivePostFromItem = (item: ItemResponse, author: UserResponse): PostProjection => {
  return {
    id: `post-${item.id}`,
    author: {
      id: author.id,
      name: author.name,
      username: author.username,
      profilePictureUrl: author.profilePictureUrl || undefined,
    },
    item: item,
    likesCount: item.likesCount || 0,
    commentsCount: item.commentsCount || 0,
    isLiked: false,
    createdAt: item.createdAt,
  };
};

export const deriveFeedPosts = (items: ItemResponse[], author: UserResponse): PostProjection[] => {
  return items
    .map((item) => derivePostFromItem(item, author))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
