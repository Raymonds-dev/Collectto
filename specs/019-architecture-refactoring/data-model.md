# Data Model & Service Contracts

## Feature: 019-architecture-refactoring

### 1. Service Contracts

#### PostService Contract (`src/types/posts.ts` / `src/services/debug/mockPostService.ts`)

```typescript
export interface PostService {
  getFeed: (page?: number, size?: number) => Promise<PostProjection[]>;
  getFeedSync?: () => PostProjection[];
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  getComments: (postId: string) => Promise<Comment[]>;
  createComment: (postId: string, text: string) => Promise<Comment>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
}
```

- **Implementations**:
  - `apiPostService` (`src/services/api/postService.ts`): Performs HTTP API requests to `social/feed`, `items/like/{itemId}`, `items/comments/{itemId}`, `items/comment/{itemId}`.
  - `mockPostService` (`src/services/debug/mockPostService.ts`): Performs in-memory operations on `debugSession`.

---

#### NotificationService Contract (`src/types/notifications.ts`)

```typescript
export interface NotificationService {
  getNotifications: (page?: number, size?: number) => Promise<NotificationPageResponse>;
  markAllAsRead: () => Promise<void>;
  acceptFollowRequest: (followerId: string) => Promise<void>;
  declineFollowRequest: (followerId: string) => Promise<void>;
}
```

- **Implementations**:
  - `apiNotificationService` (`src/services/api/notificationService.ts`): Encapsulates HTTP calls to `notifications`, `users/follow/accept`, `users/follow/decline`.
  - `mockNotificationService` (`src/services/debug/mockNotificationService.ts`): Updates `debugSession.notifications` in memory.

---

### 2. JWT & Auth Entities (`src/utils/jwt.ts` and `src/utils/userMappers.ts`)

#### DecodedJwtClaims

```typescript
export interface DecodedJwtClaims {
  sub?: string;
  userId?: string;
  uid?: string;
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  username?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  iat?: number;
  exp: number;
}
```

#### AuthUser (Domain Entity)

```typescript
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  bio?: string;
  profilePictureUrl?: string;
  profileBackgroundUrl?: string;
  photoUrl?: string; // Legacy alias for profilePictureUrl
  followersCount?: number;
  followingCount?: number;
  isActive?: boolean;
  birthdayDate?: string;
  createdAt: string;
}
```

---

### 3. Utility Mappings & Validations

- **`jwtUtils`**:
  - `isValidJwtFormat(token: string): boolean`
  - `isTokenExpired(exp: number): boolean`
  - `decodeJwtPayload(token: string): DecodedJwtClaims | null`
  - `resolveUserIdFromToken(token: string): string | null`

- **`userMappers`**:
  - `resolveProfileAssetUrl(value?: string | null): string | undefined`
  - `isLocalAssetUrl(value?: string): boolean`
  - `resolveAuthUserFromProfile(payload: unknown, fallbackEmail: string): AuthUser`
  - `resolveAuthUserFromToken(token: string, fallbackEmail: string): AuthUser`
  - `buildMockAuthUser(fallbackEmail: string): AuthUser`

- **`validationUtils`**:
  - `validateRegisterData(data: RegisterData): void` (throws localized Error if invalid)
