# Data Model & State Mappings: Implement Notifications

## API Entity Models

### 1. NotificationSummary (from `/notifications`)
Represents the notification object returned by the backend api:
- `notificationId` (string, UUID): Unique notification identifier.
- `recipientId` (string, UUID): Recipient user identifier.
- `read` (boolean): Unread or read status.
- `context` (enum): Type of notification:
  - `USER_FOLLOW_REQUESTED`
  - `USER_ACCEPTED_FOLLOW_REQUEST`
  - `COLLECTION_FOLLOWED`
  - `ITEM_COMMENTED`
  - `ITEM_LIKED`
- `actor` (ActorSummary): Information about the user who triggered the action:
  - `id` (string, UUID)
  - `username` (string)
  - `profilePictureUrl` (string, nullable)
- `reference` (ReferenceSummary): Contextual entity details:
  - `id` (string, UUID): Reference target ID (e.g. collectionId, itemId, or requester's userId).
  - `parentId` (string, UUID, nullable): Parent target ID (e.g. collectionId for an item).
  - `referenceImageUrl` (string, nullable): Image preview.
- `createdAt` (string, Date-Time ISO-8601): Timestamp.

## Frontend Local State

### NotificationState Store / Provider
A state context to manage:
- `notifications` (Array<NotificationSummary>): List of loaded notifications.
- `unreadCount` (number): Number of unread notifications, derived or stored.
- `loading` (boolean): Loading spinner state during fetch.
- `refreshing` (boolean): Refresh control state.

### Actions
- `fetchNotifications()`: Triggers API call, updates local array, and recalculates unreadCount.
- `markAllAsRead()`: Automatically sets the `read` flag of all loaded notifications to `true` locally and resets the `unreadCount` badge to `0`.
- `acceptFollowRequest(followerId: string)`: Calls `PATCH /users/follow/{followerId}/accept`, updates the notification local state to show "Request accepted", and increments/decrements counts appropriately.
- `declineFollowRequest(followerId: string)`: Calls `PATCH /users/follow/{followerId}/decline`, updates the notification local state to show "Request declined".
