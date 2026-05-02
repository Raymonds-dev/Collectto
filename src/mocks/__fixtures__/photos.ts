/**
 * Mock photo fixtures for testing and development
 * Provides sample photo URIs and metadata
 */

export const mockPhotoFixtures = {
  samplePhotos: [
    {
      uri: 'file:///mock-photos/item-1.jpg',
      name: 'item-1.jpg',
      type: 'image/jpeg',
      size: 2048576, // 2MB
      width: 1280,
      height: 960,
      duration: 0,
    },
    {
      uri: 'file:///mock-photos/item-2.jpg',
      name: 'item-2.jpg',
      type: 'image/jpeg',
      size: 3145728, // 3MB
      width: 1920,
      height: 1440,
      duration: 0,
    },
    {
      uri: 'file:///mock-photos/collection-cover.jpg',
      name: 'collection-cover.jpg',
      type: 'image/jpeg',
      size: 1572864, // 1.5MB
      width: 1024,
      height: 768,
      duration: 0,
    },
  ] as const,

  // Common MIME types for photos
  mimeTypes: {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  },

  // Typical file sizes by resolution
  typicalSizes: {
    mobile: { width: 1080, height: 1440, bytes: 1048576 }, // 1MB
    tablet: { width: 1920, height: 1440, bytes: 2097152 }, // 2MB
    hd: { width: 1280, height: 960, bytes: 1572864 }, // 1.5MB
  },
};

/**
 * Create mock photo data for testing
 * @param overrides Partial overrides for any field
 */
export const createMockPhoto = (
  overrides?: Partial<(typeof mockPhotoFixtures.samplePhotos)[0]>
) => {
  const base = mockPhotoFixtures.samplePhotos[0];
  return {
    ...base,
    ...overrides,
  };
};
