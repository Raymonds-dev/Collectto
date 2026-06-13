import { type CollectionGridEntry } from '@/components/collections-grid/CollectionsGrid';
import { Asset } from 'expo-asset';

export type ProfileHashtag = {
  label: string;
  count: number;
};

// ... (keep hashtags)
export const MOCK_PROFILE_HASHTAGS: ProfileHashtag[] = [
  { label: '#cars', count: 24 },
  { label: '#design', count: 18 },
  { label: '#collection', count: 12 },
  { label: '#garage', count: 9 },
  { label: '#vintage', count: 7 },
];

// ... (keep entries)
export const MOCK_PROFILE_COLLECTIONS: CollectionGridEntry[] = [
  {
    id: 'mustang-project',
    name: 'Mustang Project',
    images: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1473256599806-7f22e4a5f9d3?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'garage-finds',
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

// Substituir assets locais por URLs vindas da API de perfil do usuario.
export const MOCK_PROFILE_BANNER_URI = Asset.fromModule(require('@/assets/example/banner.png')).uri;
export const MOCK_PROFILE_IMAGE_URI = Asset.fromModule(require('@/assets/example/profile.png')).uri;

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
  name: 'Lucas Ramos',
  username: 'lucasramos',
  bio: 'Entusiasta de fotografia analógica, teclados mecânicos e carros clássicos. Colecionando histórias e objetos raros.',
  profileImage: MOCK_PROFILE_IMAGE_URI,
};
