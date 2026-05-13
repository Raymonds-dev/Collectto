/**
 * API-shaped DEBUG seed data
 * Used to initialize the ephemeral debug session
 */

export const SEED_PROFILE = {
  id: '00000000-0000-4000-8000-000000000000',
  name: 'Debug User',
  username: 'debugtester',
  email: 'debug@collectto.app',
  bio: 'Testing ephemeral debug mode',
  profilePictureUrl: 'https://i.pravatar.cc/150?u=debug',
  followersCount: 42,
  followingCount: 12,
  isActive: true,
  createdAt: new Date().toISOString(),
};

export const SEED_COLLECTIONS = [
  {
    id: '11111111-0000-4000-8000-000000000000',
    userId: SEED_PROFILE.id,
    name: 'Vintage Cameras',
    description: 'My collection of old cameras and lenses from the 60s and 70s.',
    coverImageURL:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
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
    visibility: 'PUBLIC',
    followersCount: 245,
    tags: ['cars', 'classic', 'muscle'],
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
    ],
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
    ],
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
    ],
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
    ],
    likesCount: 210,
    commentsCount: 15,
    isActive: true,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
