import { type CollectionGridItem } from '@/components/collection-items-grid/CollectionItemsGrid';
import { MOCK_PROFILE_IMAGE_URI } from '@/mocks/profile';

// TODO(api): substituir este mock por resposta da API de colecao por collectionId.
export const MOCK_COLLECTION_ITEMS: CollectionGridItem[] = [
  {
    id: 'item-1',
    title: 'Ford Mustang 1967',
    images: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    ],
    acquiredDate: '02/04/2023',
    lastUsedDate: '15/03/2026',
    description:
      'Modelo icone da garagem, com acabamento restaurado e uso em encontros de colecionadores.',
    characteristics: [
      { label: 'Combustivel', value: 'Gasolina' },
      { label: 'Cambio', value: 'Manual' },
      { label: 'Cor', value: 'Vermelho' },
    ],
  },
  {
    id: 'item-2',
    title: 'Porsche 911 Turbo',
    images: [
      'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1000&q=80',
    ],
    acquiredDate: '11/09/2024',
    lastUsedDate: '08/03/2026',
    description: 'Peca de performance da colecao, com setup focado em dirigibilidade e resposta.',
    characteristics: [
      { label: 'Combustivel', value: 'Gasolina' },
      { label: 'Cambio', value: 'PDK' },
      { label: 'Cor', value: 'Cinza Grafite' },
    ],
  },
  {
    id: 'item-3',
    title: 'BMW M3 E46',
    images: [
      'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1000&q=80',
    ],
    acquiredDate: '23/01/2022',
    lastUsedDate: '27/03/2026',
    description: 'Classico moderno para uso urbano e track days leves.',
    characteristics: [
      { label: 'Combustivel', value: 'Gasolina' },
      { label: 'Cambio', value: 'Manual' },
      { label: 'Cor', value: 'Azul' },
    ],
  },
  {
    id: 'item-4',
    title: 'Mercedes 300SL',
    images: [
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
    ],
    acquiredDate: '05/12/2021',
    lastUsedDate: '09/02/2026',
    description: 'Colecionavel historico preservado para eventos especiais.',
    characteristics: [
      { label: 'Combustivel', value: 'Gasolina' },
      { label: 'Cambio', value: 'Manual' },
      { label: 'Cor', value: 'Prata' },
    ],
  },
];

export type MockCollectionViewProfile = {
  name: string;
  username: string;
  bio: string;
  profileImage: string | null;
};

// TODO(api): remover fallback local e buscar dados reais da colecao e do perfil no backend.
export const MOCK_COLLECTION_PROFILE: MockCollectionViewProfile = {
  name: 'Yosag Margues',
  username: 'yosag_marg',
  bio: 'Colecionador de carros classicos e esportivos. Registro cada item com contexto e historia.',
  profileImage: MOCK_PROFILE_IMAGE_URI,
};

export const MOCK_COLLECTION_IS_FOLLOWING = false;

// TODO(api): remover placeholder remoto quando API garantir imagem principal para todos os itens.
export const MOCK_ITEMS_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';

// TODO(api): remover fallback de imagem quando backend garantir imagens validas por item.
export const MOCK_ITEM_DETAIL_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80';

export const getMockCollectionItemById = (itemId: string): CollectionGridItem | undefined => {
  return MOCK_COLLECTION_ITEMS.find((item) => item.id === itemId);
};
