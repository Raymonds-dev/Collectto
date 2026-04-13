import { type PostProps } from '@/components/post';
import { MOCK_COLLECTION_ITEMS } from '@/mocks/collections';
import { MOCK_PROFILE_IMAGE_URI } from '@/mocks/profile';

export type MockFeedPost = Pick<
  PostProps,
  | 'id'
  | 'author'
  | 'content'
  | 'publishedLabel'
  | 'item'
  | 'isLiked'
  | 'likesCount'
  | 'commentsCount'
  | 'savesCount'
  | 'sharesCount'
>;

const buildPostItemPreview = (itemId: string, collectionId: string) => {
  const item = MOCK_COLLECTION_ITEMS.find((collectionItem) => collectionItem.id === itemId);

  return {
    id: itemId,
    collectionId,
    title: item?.title ?? 'Item da colecao',
    imageUri: item?.images[0] ?? '',
  };
};

export const MOCK_FEED_POSTS: MockFeedPost[] = [
  {
    id: 'post-1',
    author: {
      name: 'Yosag Margues',
      username: 'yosag_margs',
      avatarUri: MOCK_PROFILE_IMAGE_URI,
    },
    content:
      'Borem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Curabitur tempus urna at turpis.',
    publishedLabel: '5h',
    item: buildPostItemPreview('item-1', 'classicos-garagem'),
    isLiked: false,
    likesCount: 104,
    commentsCount: 24,
    savesCount: 6,
    sharesCount: 3,
  },
  {
    id: 'post-2',
    author: {
      name: 'Yosag Margues',
      username: 'yosag_margs',
      avatarUri: MOCK_PROFILE_IMAGE_URI,
    },
    content:
      'Mais um registro da colecao para o feed. O item ficou com acabamento premium para exposicao desta semana.',
    publishedLabel: '1d',
    item: buildPostItemPreview('item-2', 'classicos-garagem'),
    isLiked: true,
    likesCount: 79,
    commentsCount: 12,
    savesCount: 10,
    sharesCount: 5,
  },
];

export const getMockFeedPostById = (postId: string): MockFeedPost | undefined => {
  return MOCK_FEED_POSTS.find((post) => post.id === postId);
};
