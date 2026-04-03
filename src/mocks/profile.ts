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
    id: 'default',
    name: 'Colecao Principal',
    images: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'collection-2',
    name: 'Pecas Raras',
    images: [
      'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'collection-3',
    name: 'Uso Diario',
    images: [
      'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'collection-4',
    name: 'Eventos',
    images: [
      'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'collection-5',
    name: 'Sem Nome',
    images: [],
  },
  {
    id: 'collection-6',
    name: 'Esportivos',
    images: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80',
    ],
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
