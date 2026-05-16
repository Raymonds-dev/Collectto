import { type CollectionGridEntry } from '@/components/collections-grid/CollectionsGrid';
import { Image } from 'react-native';

export type ProfileHashtag = {
  label: string;
  count: number;
};

// TODO(api): substituir hashtags mock por dados reais da API de tags/colecoes do perfil.
export const MOCK_PROFILE_HASHTAGS: ProfileHashtag[] = [
  { label: '#cars', count: 24 },
  { label: '#design', count: 18 },
  { label: '#collection', count: 12 },
  { label: '#garage', count: 9 },
  { label: '#vintage', count: 7 },
];

// TODO(api): substituir colecoes mock pela resposta da API de colecoes do usuario.
export const MOCK_PROFILE_COLLECTIONS: CollectionGridEntry[] = [
  {
    id: 'classicos-garagem',
    name: 'Classicos da Garagem',
    images: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'track-performance',
    name: 'Track Performance',
    images: [
      'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'wishlist-2026',
    name: 'Wishlist 2026',
    images: [],
  },
];

// TODO(api): substituir assets locais por URLs vindas da API de perfil do usuario.
export const MOCK_PROFILE_BANNER_URI = Image.resolveAssetSource(
  require('@/assets/example/banner.png')
).uri;
export const MOCK_PROFILE_IMAGE_URI = Image.resolveAssetSource(
  require('@/assets/example/profile.png')
).uri;

// TODO(api): substituir bio e contadores fixos por dados reais da API de perfil.
export const MOCK_PROFILE_BIO =
  'Organizando minhas ideias, projetos e conexoes em um so lugar no Collectto.';
export const MOCK_PROFILE_FOLLOWERS_COUNT = 1287;
export const MOCK_PROFILE_FOLLOWING_COUNT = 342;

// Placeholders para grids e detalhes
export const MOCK_ITEMS_PLACEHOLDER_IMAGE = MOCK_PROFILE_BANNER_URI;
export const MOCK_ITEM_DETAIL_PLACEHOLDER_IMAGE = MOCK_PROFILE_BANNER_URI;

// Mock profile para visualizacao de colecoes (fallback)
export const MOCK_COLLECTION_PROFILE = {
  name: 'Debug User',
  username: 'debugtester',
  bio: 'Testing ephemeral debug mode',
  profileImage: MOCK_PROFILE_IMAGE_URI,
};
