import type { ImageSourcePropType } from 'react-native';

export type ExploreCategory = {
  id: string;
  label: string;
};

export type ExploreSpotlight = {
  id: string;
  title: string;
  subtitle: string;
  caption: string;
  postedBy: string;
  postedAt: string;
  images: ImageSourcePropType[];
  tags: string[];
  categoryId: string;
  collectionId: string;
  height: number;
};

export const MOCK_EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: 'all', label: 'Todos' },
  { id: 'collections', label: 'Coleções' },
  { id: 'items', label: 'Itens' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'recent', label: 'Recentes' },
];

export const MOCK_EXPLORE_SPOTLIGHTS: ExploreSpotlight[] = [
  {
    id: 'muscle-cars',
    title: 'American Muscle',
    subtitle: 'Coleção com foco em clássicos de alto impacto visual e história forte.',
    caption: 'Peças com estética de garagem clássica e alto valor histórico para colecionadores.',
    postedBy: 'colecao_do_lucas',
    postedAt: 'há 2h',
    images: [
      require('../assets/example/imagens_tela_explorar/carro_1.jpeg'),
      require('../assets/example/imagens_tela_explorar/carro_2.jpeg'),
      require('../assets/example/imagens_tela_explorar/carro_3.jpeg'),
    ],
    tags: ['#colecao', '#classicos', '#garagem'],
    categoryId: 'collections',
    collectionId: 'classicos-garagem',
    height: 248,
  },
  {
    id: 'trading-cards',
    title: 'Cards Raros',
    subtitle: 'Cartas colecionáveis com destaque para peças premium e acabamento especial.',
    caption: 'Coleção com curadoria visual forte e cards em estado premium para exposição.',
    postedBy: 'raridades_br',
    postedAt: 'há 5h',
    images: [
      require('../assets/example/imagens_tela_explorar/pokemon_1.jpg'),
      require('../assets/example/imagens_tela_explorar/pokemon_2.jpeg'),
      require('../assets/example/imagens_tela_explorar/pokemon_3.jpeg'),
    ],
    tags: ['#raridade', '#itens', '#colecao'],
    categoryId: 'items',
    collectionId: 'track-performance',
    height: 188,
  },
  {
    id: 'sneakers-wall',
    title: 'Sneakers em destaque',
    subtitle: 'Uma seleção visual de pares que merecem espaço em qualquer coleção.',
    caption: 'Linha de pares icônicos organizados por edição e estado de conservação.',
    postedBy: 'sneaker.vault',
    postedAt: 'há 1d',
    images: [
      require('../assets/example/imagens_tela_explorar/tenis_1.jpeg'),
      require('../assets/example/imagens_tela_explorar/tenis_2.jpg'),
      require('../assets/example/imagens_tela_explorar/tenis_3.jpeg'),
    ],
    tags: ['#streetwear', '#itens', '#vintage'],
    categoryId: 'recent',
    collectionId: 'wishlist-2026',
    height: 222,
  },
  {
    id: 'vinyl-corner',
    title: 'Discos e capas',
    subtitle: 'Referências com identidade forte, textura e composição fotográfica marcante.',
    caption: 'Catálogo de vinis com foco em edições especiais e capas de alto impacto visual.',
    postedBy: 'vinyl.lounge',
    postedAt: 'há 2d',
    images: [
      require('../assets/example/imagens_tela_explorar/livro_1.jpg'),
      require('../assets/example/imagens_tela_explorar/livro_2.jpg'),
      require('../assets/example/imagens_tela_explorar/livro_3.jpeg'),
    ],
    tags: ['#vinyl', '#colecao', '#vintage'],
    categoryId: 'vintage',
    collectionId: 'classicos-garagem',
    height: 190,
  },
  {
    id: 'camera-archive',
    title: 'Arquivos analógicos',
    subtitle: 'Objetos com estética de arquivo, nostalgia e presença forte no grid.',
    caption: 'Seleção com câmeras e acessórios em composição de arquivo e nostalgia.',
    postedBy: 'retro.archive',
    postedAt: 'há 3d',
    images: [
      require('../assets/example/imagens_tela_explorar/moeda_1.jpeg'),
      require('../assets/example/imagens_tela_explorar/moeda_2.jpeg'),
      require('../assets/example/imagens_tela_explorar/moeda_3.jpeg'),
    ],
    tags: ['#fotografia', '#recentes', '#itens'],
    categoryId: 'items',
    collectionId: 'track-performance',
    height: 242,
  },
  {
    id: 'garage-icons',
    title: 'Garagem icônica',
    subtitle: 'Seleção pensada para reforçar o lado visual e curado do Collectto.',
    caption: 'Conjunto de modelos com protagonismo visual e narrativa de coleção pessoal.',
    postedBy: 'motors.circle',
    postedAt: 'há 6h',
    images: [
      require('../assets/example/imagens_tela_explorar/hotweels_1.jpeg'),
      require('../assets/example/imagens_tela_explorar/hotweels_2.jpeg'),
      require('../assets/example/imagens_tela_explorar/hotweels_3.jpeg'),
    ],
    tags: ['#colecao', '#classicos', '#recentes'],
    categoryId: 'collections',
    collectionId: 'wishlist-2026',
    height: 214,
  },
];
