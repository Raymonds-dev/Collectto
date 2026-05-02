# Quickstart: Item and Collection Creation Implementation

**Feature**: Item and Collection Creation Flow  
**Target**: React Native with Expo  
**Status**: Development Ready

---

## Project Structure

```
src/
├── app/(tabs)/
│   ├── _layout.tsx                    # Tab navigation with + button
│   └── [collection]/
│       └── create-item.tsx            # Item creation screen
├── components/
│   ├── ui/                            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── TextField.tsx
│   │   └── PhotoGallery.tsx
│   └── create-item/
│       ├── ItemForm.tsx               # Item metadata form
│       ├── PhotoPicker.tsx            # Camera/gallery access
│       ├── CollectionSelector.tsx     # Select or create collection
│       └── CollectionCreator.tsx      # Inline collection form
├── services/
│   ├── item-service.ts                # ItemService implementation
│   ├── collection-service.ts          # CollectionService implementation
│   └── photo-storage/
│       ├── types.ts                   # PhotoStorageProvider interface
│       ├── local-provider.ts          # LocalStorageProvider
│       └── factory.ts                 # Provider factory
├── mocks/
│   ├── items/
│   │   ├── index.ts                   # Mock ItemService
│   │   └── fixtures.ts                # Test data
│   └── collections/
│       ├── index.ts                   # Mock CollectionService
│       └── fixtures.ts                # Test data
└── hooks/
    └── useItemCreation.ts             # Custom hook for creation flow
```

---

## Service Implementation Pattern

### 1. Define Interface (Contract)

```typescript
// contracts/ItemService.ts
export interface ItemService {
  create(input: CreateItemInput): Promise<Item>;
  getById(itemId: string): Promise<Item | null>;
  // ... other methods
}
```

### 2. Implement Mock Service

```typescript
// src/mocks/items/index.ts
import type { ItemService, CreateItemInput, Item } from '@/contracts/ItemService';

export class MockItemService implements ItemService {
  private items: Map<string, Item> = new Map();

  async create(input: CreateItemInput): Promise<Item> {
    const item: Item = {
      item_id: generateUUID(),
      collection_id: input.collection_id ?? null,
      name: input.name,
      description: input.description ?? '',
      acquisition_date: input.acquisition_date ?? null,
      last_used_date: null,
      media_urls: input.media_urls,
      attributes: input.attributes ?? {},
      likes_count: 0,
      comments_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    this.items.set(item.item_id, item);
    return item;
  }

  async getById(itemId: string): Promise<Item | null> {
    return this.items.get(itemId) ?? null;
  }

  // ... implement other methods
}
```

### 3. Provide Service via Context

```typescript
// src/providers/ItemContextProvider.tsx
import { createContext, useContext } from 'react';
import { MockItemService } from '@/mocks/items';

const ItemContext = createContext<ItemService>(new MockItemService());

export const useItemService = () => useContext(ItemContext);
```

### 4. Use in Component

```typescript
// src/components/create-item/ItemForm.tsx
export const ItemForm: React.FC = () => {
  const itemService = useItemService();

  const handleSave = async (data: CreateItemInput) => {
    const item = await itemService.create(data);
    // Navigate to success screen
  };

  return (
    <TextInput
      placeholder="Item name"
      onChangeText={(name) => setFormData({ ...formData, name })}
    />
  );
};
```

---

## Photo Storage Pattern

### 1. Initialize Provider

```typescript
// src/services/photo-storage/factory.ts
import type { PhotoStorageProvider } from '@/contracts/PhotoStorageProvider';
import { LocalStorageProvider } from './local-provider';

export function createPhotoStorageProvider(): PhotoStorageProvider {
  // Swap provider here based on environment/config
  return new LocalStorageProvider();
}
```

### 2. Use in Photo Picker

```typescript
// src/components/create-item/PhotoPicker.tsx
import { createPhotoStorageProvider } from '@/services/photo-storage/factory';

export const PhotoPicker: React.FC = () => {
  const storageProvider = createPhotoStorageProvider();

  const handlePhotoSelect = async (photoUri: string) => {
    const photoData = await getPhotoMetadata(photoUri);
    const localRef = await storageProvider.saveToLocal(photoData);

    setPhotos([...photos, localRef]);
  };

  return (
    <Button title="Add Photo" onPress={handleCameraOrGallery} />
  );
};
```

### 3. Migrate on Save

```typescript
// src/components/create-item/ItemForm.tsx
const handleSave = async () => {
  const storageProvider = createPhotoStorageProvider();

  // Migrate local photos to permanent storage
  const permanentUris = await Promise.all(
    localPhotos.map((photo) => storageProvider.moveToPermament(photo.localUri, 'items'))
  );

  // Create item with permanent URIs
  const item = await itemService.create({
    ...formData,
    media_urls: permanentUris.map((ref) => ref.permanentUri),
  });
};
```

---

## Mock Service Usage

### During Development

```typescript
// Use MockItemService and MockCollectionService
// Data persists in memory during app session
// No network calls or backend API needed
```

### Testing

```typescript
// src/services/__tests__/item-service.test.ts
import { MockItemService } from '@/mocks/items';

describe('ItemService', () => {
  it('should create item with photos', async () => {
    const service = new MockItemService();
    const item = await service.create({
      name: 'Test Item',
      media_urls: ['file:///local/path'],
    });
    expect(item.name).toBe('Test Item');
  });
});
```

### Migrate to Real API

```typescript
// When backend is ready, implement ApiItemService
export class ApiItemService implements ItemService {
  async create(input: CreateItemInput): Promise<Item> {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return response.json();
  }
  // ... other methods
}

// Update factory to use ApiItemService
export function createItemService(): ItemService {
  return process.env.USE_MOCK ? new MockItemService() : new ApiItemService();
}
```

---

## Permission Handling

### Request Permissions

```typescript
// src/hooks/usePhotoPermissions.ts
export const usePhotoPermissions = () => {
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermissions = async () => {
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();

    const granted = cameraStatus.granted && mediaLibraryStatus.granted;

    setHasPermission(granted);
    return granted;
  };

  return { hasPermission, requestPermissions };
};
```

### Handle Permission Denial

```typescript
// src/components/create-item/PhotoPicker.tsx
const handlePhotoPress = async () => {
  const { hasPermission, requestPermissions } = usePhotoPermissions();

  if (!hasPermission) {
    const granted = await requestPermissions();
    if (!granted) {
      showAlert('Camera and gallery permissions required', 'Go to Settings');
      return;
    }
  }

  // Proceed with camera/gallery
};
```

---

## Key Implementation Notes

### Simplicity First

- Keep components focused on UI rendering
- Move logic to hooks and services
- Reuse existing UI components from `src/components/ui/`

### Documentation

- Add JSDoc comments to all public functions
- Document expected data shapes in interfaces
- Include examples in complex functions

### Testing

- Mock services enable unit tests without network
- Test permission flows separately from UI
- Use fixtures for consistent test data

### Future Integration

- Services already implement API contracts
- Photo storage provider is swappable
- No UI changes needed for backend migration
- Mock service remains useful for development/testing

---

## Validation Checklist

- [ ] PhotoStorageProvider abstraction in place
- [ ] Mock services implement contracts
- [ ] Permission requests work on iOS and Android
- [ ] Photo preview displays without lag
- [ ] Item save migrates photos from local to permanent
- [ ] Collection creation inline during item flow works
- [ ] Form validation displays errors clearly
- [ ] Loading states show during save
- [ ] Success feedback confirms completion
- [ ] Navigation returns to appropriate context

---

## References

- **Data Model**: `data-model.md`
- **Service Contracts**: `contracts/`
- **Mock Centralization Skill**: `.github/skills/mock-centralization/SKILL.md`
- **Motion System**: `src/hooks/useAnimation/README.md`
- **UI Tokens**: `src/styles/tailwind/tokens.js`
