/**
 * API-shaped DEBUG seed data
 * Used to initialize the ephemeral debug session
 */

export const SEED_PROFILE = {
  id: '00000000-0000-4000-8000-000000000000',
  name: 'Lucas Ramos',
  username: 'lucasramos',
  email: 'lucas@collectto.app',
  bio: 'Entusiasta de fotografia analógica, teclados mecânicos e carros clássicos. Colecionando histórias e objetos raros.',
  profilePictureUrl: 'https://i.pravatar.cc/150?img=53',
  profileBackgroundUrl:
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=820&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  followersCount: 42,
  followingCount: 12,
  isActive: true,
  createdAt: new Date().toISOString(),
};

export const SEED_UNCATEGORIZED_COLLECTION = {
  id: 'uncategorized-0000-4000-8000-000000000000',
  userId: SEED_PROFILE.id,
  name: 'Sem categoria',
  description: 'Itens sem coleção definida.',
  visibility: 'PRIVATE',
  followersCount: 0,
  tags: [],
  isActive: true,
  isSystem: true,
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const SEED_COLLECTIONS = [
  {
    id: '11111111-0000-4000-8000-000000000000',
    userId: SEED_PROFILE.id,
    name: 'Vintage Cameras',
    description: 'My collection of old cameras and lenses from the 60s and 70s.',
    coverImageURL:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    coverImageUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526178611986-6d5b023b8a5f?auto=format&fit=crop&w=1200&q=80',
    ],
    visibility: 'PUBLIC',
    followersCount: 124,
    tags: ['photography', 'vintage', 'analog'],
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '22222222-0000-4000-8000-000000000000',
    userId: SEED_PROFILE.id,
    name: 'Mechanical Keyboards',
    description: 'Custom builds and rare keycap sets.',
    coverImageURL:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80',
    coverImageUrls: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    visibility: 'PUBLIC',
    followersCount: 86,
    tags: ['tech', 'keyboards', 'workspace'],
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'col-cars-001',
    userId: SEED_PROFILE.id,
    name: 'Classic Muscle Cars',
    description: 'The golden era of American automotive design.',
    coverImageURL:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    coverImageUrls: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518459031867-a89b944bffe0?auto=format&fit=crop&w=1200&q=80',
    ],
    visibility: 'PUBLIC',
    followersCount: 245,
    tags: ['cars', 'classic', 'muscle'],
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  SEED_UNCATEGORIZED_COLLECTION,
];

export const SEED_ITEMS = [
  {
    id: '33333333-0000-4000-8000-000000000000',
    collectionId: SEED_COLLECTIONS[0].id,
    userId: SEED_PROFILE.id,
    name: 'Leica M3',
    description: 'Classic rangefinder in pristine condition.',
    imageFilesUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1526178611986-6d5b023b8a5f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      brand: 'Leica',
      model: 'M3',
      year: '1954',
      serial: 'M3-48291',
      condition: 'Excellent',
      lensMount: 'M-mount',
      countryOfOrigin: 'Germany',
    },
    tags: ['camera', 'rangefinder', 'film'],
    acquisitionDate: '2023-06-15',
    lastUsedDate: '2025-12-01',
    likesCount: 15,
    commentsCount: 2,
    isActive: true,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '44444444-0000-4000-8000-000000000000',
    collectionId: SEED_COLLECTIONS[1].id,
    userId: SEED_PROFILE.id,
    name: 'Keychron Q1',
    description: '75% layout with Gateron Oil Kings.',
    imageFilesUrls: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      layout: '75%',
      switches: 'Gateron Oil King',
      material: 'Aluminum',
      pcb: 'QMK hot-swap',
      stabilizers: 'Durock V2',
      keycapProfile: 'SA R3',
    },
    tags: ['keyboard', 'custom', 'mechanical'],
    acquisitionDate: '2024-11-20',
    lastUsedDate: '2026-05-10',
    likesCount: 24,
    commentsCount: 3,
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-car-001',
    collectionId: 'col-cars-001',
    userId: SEED_PROFILE.id,
    name: '1969 Dodge Charger',
    description: 'Black R/T edition with HEMI engine.',
    imageFilesUrls: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      engine: '426 HEMI',
      horsepower: '425',
      transmission: '4-speed manual',
      color: 'Pitch Black',
      mileage: '72,000 km',
      bodyStyle: 'Coupe',
      restoration: 'Frame-off 2018',
    },
    tags: ['muscle', 'mopar', 'classic'],
    acquisitionDate: '2021-03-10',
    likesCount: 156,
    commentsCount: 12,
    isActive: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-car-002',
    collectionId: 'col-cars-001',
    userId: SEED_PROFILE.id,
    name: '1967 Ford Mustang Shelby GT500',
    description: 'Eleanor inspired grey with black stripes.',
    imageFilesUrls: [
      'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1473256599806-7f22e4a5f9d3?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      engine: '428 Police Interceptor',
      horsepower: '355',
      color: 'Grey with black stripes',
      vin: '7R02C123456',
      interior: 'Black leather',
      productionYear: '1967',
      previousOwners: 3,
    },
    tags: ['mustang', 'shelby', 'classic'],
    acquisitionDate: '2020-08-22',
    likesCount: 210,
    commentsCount: 15,
    isActive: true,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_OTHER_PROFILE = {
  id: 'ana-silva-uuid-9999',
  name: 'Ana Silva',
  username: 'anasilva',
  email: 'ana@collectto.app',
  bio: 'Curadora de arte, colecionadora de plantas raras e discos de vinil.',
  profilePictureUrl: 'https://i.pravatar.cc/150?img=48',
  profileBackgroundUrl:
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  followersCount: 154,
  followingCount: 88,
  isActive: true,
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
};

export const SEED_OTHER_COLLECTIONS = [
  {
    id: 'ana-col-vinyl-001',
    userId: 'ana-silva-uuid-9999',
    name: 'Discos de Vinil Raros',
    description: 'Minha paixão por clássicos da MPB e rock progressivo em formato analógico.',
    coverImageURL:
      'https://images.unsplash.com/photo-1539628399213-d6aa89c93074?auto=format&fit=crop&w=900&q=80',
    coverImageUrls: [
      'https://images.unsplash.com/photo-1539628399213-d6aa89c93074?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=1200&q=80',
    ],
    visibility: 'PUBLIC',
    followersCount: 45,
    tags: ['music', 'vinyl', 'classics'],
    isActive: true,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ana-col-plants-002',
    userId: 'ana-silva-uuid-9999',
    name: 'Plantas Raras',
    description: 'Minha pequena floresta urbana com monstera variegata e filodendros.',
    coverImageURL:
      'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=900&q=80',
    coverImageUrls: [
      'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80',
    ],
    visibility: 'PUBLIC',
    followersCount: 32,
    tags: ['plants', 'nature', 'rare'],
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_OTHER_ITEMS = [
  {
    id: 'ana-item-vinyl-001',
    collectionId: 'ana-col-vinyl-001',
    userId: 'ana-silva-uuid-9999',
    name: 'Clube da Esquina - 1972',
    description: 'Primeira prensagem em excelente estado de conservação.',
    imageFilesUrls: [
      'https://images.unsplash.com/photo-1539628399213-d6aa89c93074?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      artist: 'Milton Nascimento & Lô Borges',
      year: '1972',
      condition: 'VG+',
      pressing: 'Odeon Mono',
    },
    tags: ['mpb', 'vinyl', 'clube-da-esquina'],
    acquisitionDate: '2022-05-10',
    likesCount: 28,
    commentsCount: 4,
    isActive: true,
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ana-item-vinyl-002',
    collectionId: 'ana-col-vinyl-001',
    userId: 'ana-silva-uuid-9999',
    name: 'The Dark Side of the Moon - Pink Floyd',
    description: 'Edição japonesa com obi completo e encarte original.',
    imageFilesUrls: [
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      artist: 'Pink Floyd',
      year: '1973',
      condition: 'Mint',
      country: 'Japan',
    },
    tags: ['rock', 'vinyl', 'pink-floyd'],
    acquisitionDate: '2023-11-12',
    likesCount: 42,
    commentsCount: 5,
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ana-item-plant-001',
    collectionId: 'ana-col-plants-002',
    userId: 'ana-silva-uuid-9999',
    name: 'Monstera Deliciosa Albo Variegata',
    description: 'Muda com alta taxa de variegação branca e saudável.',
    imageFilesUrls: [
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      species: 'Monstera deliciosa',
      variegation: 'High',
      soil: 'Aroid Mix',
      pot: 'Terracotta',
    },
    tags: ['plants', 'monstera', 'variegated'],
    acquisitionDate: '2025-01-15',
    likesCount: 19,
    commentsCount: 2,
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_NOTIFICATIONS = [
  {
    notificationId: 'mock-notif-1',
    recipientId: 'current-user',
    actor: {
      id: 'mock-user-1',
      username: 'joao_silva',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80',
    },
    context: 'USER_FOLLOW_REQUESTED',
    reference: {
      id: 'mock-user-1',
      parentId: null,
      referenceImageUrl: null,
    },
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: 'mock-notif-5',
    recipientId: 'current-user',
    actor: {
      id: 'ana-silva-uuid-9999',
      username: 'anasilva',
      profilePictureUrl: 'https://i.pravatar.cc/150?img=48',
    },
    context: 'USER_FOLLOW_REQUESTED',
    reference: {
      id: 'ana-silva-uuid-9999',
      parentId: null,
      referenceImageUrl: null,
    },
    read: false,
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    notificationId: 'mock-notif-2',
    recipientId: 'current-user',
    actor: {
      id: 'mock-user-2',
      username: 'maria_oliveira',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
    },
    context: 'USER_ACCEPTED_FOLLOW_REQUEST',
    reference: {
      id: 'mock-user-2',
      parentId: null,
      referenceImageUrl: null,
    },
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    notificationId: 'mock-notif-3',
    recipientId: 'current-user',
    actor: {
      id: 'mock-user-3',
      username: 'carlos_souza',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80',
    },
    context: 'COLLECTION_FOLLOWED',
    reference: {
      id: 'collection-1',
      parentId: null,
      referenceImageUrl:
        'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=150&h=150&q=80',
    },
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    notificationId: 'mock-notif-4',
    recipientId: 'current-user',
    actor: {
      id: 'mock-user-4',
      username: 'ana_clara',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80',
    },
    context: 'ITEM_COMMENTED',
    reference: {
      id: 'item-1',
      parentId: 'collection-1',
      referenceImageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&h=150&q=80',
    },
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
