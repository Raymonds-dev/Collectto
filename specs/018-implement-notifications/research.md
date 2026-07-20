# Research & Technical Decisions: Implement Notifications

## Technical Decisions

### 1. In-App Notification Polling & Synchronization
- **Decision**: Fetch notifications from `GET /notifications` when the app launches and when the feed is refreshed (pull-to-refresh). 
- **Rationale**: Keeps the implementation simple, performant, and aligned with the user clarification. Avoids setting up heavy polling loops or web sockets.
- **Alternatives Considered**: 
  - *Short Polling (every 60s)*: Rejected to preserve battery and reduce server load, since real-time updates were not deemed critical by the user.

### 2. Notification Read Status Management
- **Decision**: Since the backend `notification-controller` does not expose an endpoint to mark notifications as read, we will mark them as read in the local state when the dropdown modal is opened, and persist this session state in memory. If the backend automatically marks them as read upon retrieval, the UI will reflect this based on the `read` property in `NotificationSummary`.
- **Rationale**: Adheres to the OpenAPI spec constraints while satisfying the requirement of marking notifications as read when the dropdown is opened.

### 3. Navigation Destination Mapping
- **Decision**:
  - `USER_FOLLOW_REQUESTED` and `USER_ACCEPTED_FOLLOW_REQUEST`: Redirect to the new screen `src/app/users/[userId].tsx` to view that user's profile.
  - `COLLECTION_FOLLOWED`: Redirect to `src/app/collections/[collectionId].tsx`.
  - `ITEM_COMMENTED` and `ITEM_LIKED`: Redirect to `src/app/collections/[collectionId].tsx` passing the `itemId` as a parameter to trigger the detail modal directly.
- **Rationale**: Reuses existing screens and layouts. Navigating to the collection screen with an `itemId` parameter allows the collection screen to automatically display the item detail modal, avoiding the need to duplicate complex item view logic in a new root screen.

### 4. UI / Dropdown Implementation
- **Decision**: Implement the notifications list as a dropdown modal inside the Feed Header using a `Modal` component from `react-native`, styled with NativeWind, and utilizing official Reanimated motion presets (`SlideUp` / `FadeIn` / `ScalePress`) for smooth entry/exit.
- **Rationale**: Aligns with the *Fluidez Acima de Complexidade* and *Microinterações, Performance e Motion Oficial* principles of the Collectto Constitution.
