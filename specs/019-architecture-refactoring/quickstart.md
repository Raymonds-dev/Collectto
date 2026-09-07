# Developer Quickstart Guide: Architecture Refactoring

## 1. Overview of Strategy Pattern in Collectto

Collectto uses the **Strategy Pattern** for all core services to seamlessly toggle between **Debug/Mock Mode** (in-memory test data) and **Live API Mode** (production backend endpoints).

```text
               ┌───────────────────────────┐
               │ isDebugModeEnabled() ?    │
               └─────────────┬─────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
   ┌────────────────────┐        ┌────────────────────┐
   │ mockPostService    │        │ apiPostService     │
   │ mockNotifService   │        │ apiNotifService    │
   │ (In-memory debug)  │        │ (Live Axios HTTP)  │
   └────────────────────┘        └────────────────────┘
```

---

## 2. Using Modular Services

### Social Feed & Posts (`src/services/api/postService.ts` and `src/services/debug/mockPostService.ts`)

```typescript
import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockPostService } from '@/services/debug/mockPostService';
import { apiPostService } from '@/services/api/postService';

// Resolve service strategy
export const getPostService = () => 
  isDebugModeEnabled() ? mockPostService : apiPostService;
```

---

### Notifications (`src/services/api/notificationService.ts` and `src/services/debug/mockNotificationService.ts`)

```typescript
import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockNotificationService } from '@/services/debug/mockNotificationService';
import { apiNotificationService } from '@/services/api/notificationService';

// In NotificationProvider:
const notificationService = useMemo(
  () => (isDebugModeEnabled() ? mockNotificationService : apiNotificationService),
  []
);
```

---

## 3. Auth Utilities Locations

Non-React logic originally embedded in `AuthProvider.tsx` has been moved to clean utility modules:

- **JWT Operations**: Import from `@/utils/jwt` (`isValidJwtFormat`, `isTokenExpired`, `decodeJwtPayload`, `resolveUserIdFromToken`).
- **User Mappings**: Import from `@/utils/userMappers` (`resolveAuthUserFromProfile`, `resolveProfileAssetUrl`).
- **Validation**: Import from `@/utils/validation` (`validateRegisterData`).

---

## 4. Verification & Quality Gate

Before submitting changes, run the quality gate command:

```bash
npm run validate
```

This verifies TypeScript types, ESLint rules, and Prettier code formatting across the entire codebase.
