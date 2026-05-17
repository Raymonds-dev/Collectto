# Quickstart: Debug Mode

**Feature**: [specs/003-debug-mode/spec.md](spec.md)  
**Type**: Developer guide for enabling and using DEBUG mode  
**Date**: 2026-05-12

---

## Quick Enable DEBUG Mode

### 1. Set Environment Variable

Create or edit `.env.debug`:

```bash
DEBUG=true
```

### 2. Build and Run

```bash
# iOS
DEBUG=true npm run ios

# Android
DEBUG=true npm run android

# Web
DEBUG=true npm run web
```

Or using EAS:

```bash
eas build --platform ios --env=debug
eas build --platform android --env=debug
```

### 3. Verify DEBUG Mode Active

When the app starts with `DEBUG=true`:

1. AuthProvider detects the DEBUG flag in boot (`src/app/_layout.tsx`)
2. Automatically logs in with seed credentials, without showing the login screen
3. Session initializes with API-shaped seed data: 1 user, 3 collections, 4 items
4. Feed displays posts derived from items using `PostProjection`
5. All data is ephemeral and is lost when the app closes

---

## Seed Credentials (DEBUG Mode Only)

```
Email: tester@collectto.dev
Password: debug
```

These credentials are valid only in DEBUG mode. In non-DEBUG API mode, use real credentials.

---

## Available Seed Data

### User Profile

- **ID**: `550e8400-e29b-41d4-a716-446655440000` (UUID v4)
- **Name**: `Test User`
- **Username**: `testuser`
- **Email**: `tester@collectto.dev`
- **Avatar**: None (default fallback)

### Collections (Pre-Loaded)

| Collection ID | Name             | Items   | Visibility |
| ------------- | ---------------- | ------- | ---------- |
| `coll-001`    | Carros Clássicos | 1 item  | PRIVATE    |
| `coll-002`    | Sneakers         | 2 items | PRIVATE    |
| `coll-003`    | Relógios Suíços  | 1 item  | PRIVATE    |

### Items (Pre-Loaded)

| Item ID    | Collection       | Name              | Media        |
| ---------- | ---------------- | ----------------- | ------------ |
| `item-001` | Carros Clássicos | Ford Mustang 1967 | 0 local URIs |
| `item-002` | Sneakers         | Air Jordan 1      | 0 local URIs |
| `item-003` | Sneakers         | Nike Air Max 90   | 0 local URIs |
| `item-004` | Relógios Suíços  | Rolex Submariner  | 0 local URIs |

**Note**: Seed items do not ship with local media URIs; image fields are represented through API-shaped DTOs during the session.

---

## Session Lifecycle

### Boot

1. `DEBUG=true` is detected in the environment
2. AuthProvider initializes the seed session
3. Debug session state is created in memory using API-shaped DTOs
4. AuthGate allows access to the `(tabs)` routes
5. Feed loads and displays posts derived from the current session items

### During Session

- Create new collections and they appear immediately in profile views
- Create new items and they appear in the target collection and feed
- Update profile picture and the profile header updates immediately
- Modify item details and the derived post snapshot updates
- Delete collection or item and the session reflects the soft-delete state

### Teardown (App Close)

- All ephemeral data is discarded
- Session state is cleared
- Cache files are cleaned by the OS

---

## How to Test Key Flows

### Test 1: Login & Auto-Authentication

1. Launch the app with `DEBUG=true`
2. Expected: the app skips the login screen and goes directly to the home/feed
3. Verify: the profile shows `Test User` and there are no external API calls

### Test 2: Create Collection

1. Go to Profile or the collection creation flow
2. Tap `New Collection`
3. Enter name, description, and optional cover image
4. Expected: the collection appears immediately in the profile grid
5. Verify: there is no network latency and the state updates instantly

### Test 3: Create Item

1. Go to a collection detail or create-item screen
2. Tap `Add Item`
3. Enter name, description, and select media
4. Choose or create a collection
5. Expected: the item appears in the collection and a new post appears in the feed
6. Verify: the feed sorts by `createdAt` descending

### Test 4: Update Profile Picture

1. Go to Profile -> Edit
2. Change the profile picture using camera or gallery
3. Expected: the new picture appears immediately in the profile header
4. Verify: the updated profile snapshot is used in new post projections

### Test 5: State Consistency Between Screens

1. Create collection A
2. Add item B to collection A
3. Navigate: Profile -> Collections -> Collection A -> Items
4. Expected: item B is visible in all places
5. Verify: there is no duplication or inconsistency

### Test 6: Feed Post Ordering

1. Have at least 3 items in collections
2. Open the feed
3. Expected: posts are ordered by `createdAt` descending
4. Verify: manually check post timestamps

### Test 7: Offline Operation

1. Launch the app with `DEBUG=true` on a device with no internet
2. Expected: the app remains fully functional with no connectivity errors
3. Verify: login, create, and navigation flows all work without a network connection

---

## Environment Configuration

### `.env.debug`

```bash
DEBUG=true
```

### `app.json` (Expo config)

```json
{
  "expo": {
    "extra": {
      "eas": {
        "debug": {
          "env": "DEBUG=true"
        }
      }
    }
  }
}
```

### `eas.json` (Build config)

```json
{
  "build": {
    "debug": {
      "env": {
        "DEBUG": "true"
      }
    }
  }
}
```

---

## Debugging & Troubleshooting

### App enters login screen instead of auto-authenticating

- Cause: `DEBUG=true` is not set or is not propagated to the build
- Fix: check the environment variable, rebuild the app, and clear Expo cache with `npm run cache:clear`

### Posts do not appear in feed

- Cause: items were not created or seed data did not load
- Fix: check that the debug session was initialized; create a test item manually

### App crashes on navigation

- Cause: a context provider was not initialized or route protection is broken
- Fix: ensure the auth and debug session layers wrap the route tree correctly

### Photos from cache do not show

- Cause: cache URI expired or was not saved correctly
- Fix: re-upload the photo through profile or item edit; check the expo-file-system cache path

### State does not sync between screens

- Cause: the provider is not wrapping all screens or mutations are not notifying subscribers
- Fix: ensure state mutations trigger setter updates and context rerenders

---

## Debug Logs

When DEBUG mode is active, detailed logs appear in:

- iOS: Xcode console
- Android: Android Studio logcat or `adb logcat`
- Web: Browser developer tools

Example logs:

```text
[DEBUG 2026-05-12T14:30:00.123Z] [INFO] Session initialized { userId: 'seed-user' }
[DEBUG 2026-05-12T14:30:05.456Z] [INFO] Collection created { collectionId: 'coll-new-001', name: 'My Collection' }
[DEBUG 2026-05-12T14:30:10.789Z] [DEBUG] Posts re-derived { count: 4, updatedAt: '2026-05-12T14:30:10.789Z' }
```

---

## Accessing Debug Session Programmatically

### From Context Provider

```typescript
import { useDebugSession } from '@/providers/DebugSessionProvider';

export const MyComponent = () => {
  const { session, isDebugMode } = useDebugSession();

  if (isDebugMode) {
    console.log('Current session:', session);
    console.log('Collections:', session.collections);
    console.log('Items:', session.items);
    console.log('Posts:', session.posts);
  }
};
```

### Create Collection

```typescript
const newCollection = await session.createCollection({
  name: 'New Collection',
  description: 'Test collection',
  coverImageUrl: null,
  tags: [],
});
```

### Create Item

```typescript
const newItem = await session.createItem({
  collectionId: collection.id,
  name: 'New Item',
  description: 'Test item',
  imageFilesUrls: ['file://cache/photo.jpg'],
  attributes: {},
});
```

### Update Profile

```typescript
await session.updateProfile({
  name: 'Updated Name',
  profilePictureUrl: 'file://cache/avatar.jpg',
});
```

---

## Migration to API Mode

To switch from DEBUG to API mode:

1. Remove the DEBUG flag: delete `.env.debug` or set `DEBUG=false`
2. Verify API endpoints: ensure the backend is running and accessible
3. Rebuild: `npm run cache:clear && npm run android/ios`
4. Expected behavior:
   - Login screen appears
   - Credentials prompt is shown
   - All service calls go to the API
   - Data persists server-side

The UI and service contracts remain identical; only the data source changes.

---

## Next Steps (Implementation Phase 2)

After this Phase 1 planning completes, Phase 2 (`tasks.md`) will detail:

1. Create `src/services/debug/` module with:
   - `debugSession.ts` — debug session singleton
   - `seedData.ts` — seed data constants
   - `logger.ts` — logging utility

2. Create `src/types/debug.ts` with:
   - `DebugSession` interface
   - `SeedData` interface
   - `PostProjection` interface

3. Update `src/app/_layout.tsx`:
   - detect DEBUG flag
   - initialize debug session state
   - skip API auth if DEBUG is active

4. Update context providers:
   - `CollectionContextProvider` — use debug session if DEBUG
   - `ItemContextProvider` — use debug session if DEBUG

5. Create service implementations:
   - `createDebugAuthService()`
   - `createDebugProfileService()`
   - `createDebugCollectionService()`
   - `createDebugItemService()`
   - `createDebugPostService()`

6. Add tests:
   - unit tests for debug services
   - integration tests for session flows
   - e2e tests for key user journeys

---

## Useful Commands

```bash
npm run cache:clear
DEBUG=true npm run start
```

---

## References

- Feature Spec: [specs/003-debug-mode/spec.md](spec.md)
- Data Model: [data-model.md](data-model.md)
- Research Findings: [research.md](research.md)
- Service Contracts: [contracts/](contracts/)
- Implementation Plan: [plan.md](plan.md)
