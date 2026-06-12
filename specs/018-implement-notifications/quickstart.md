# Quickstart & Verification: Implement Notifications

## Running the Application Locally

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Verify current type checks, lint rules, and code formatting**:
   ```bash
   npm run validate
   ```

3. **Start the Expo development server**:
   ```bash
   npm run start
   ```
   *Note: Press `a` to run in an Android emulator, `i` to run in an iOS simulator, or `w` to run on the web.*

## Verification Plan

### Manual Verification
1. **Notifications Icon Visibility**:
   - Log in to the application.
   - Verify the Feed header displays a bell-shaped Notifications icon where the Settings gear icon used to be.
   - Verify that settings are still accessible (e.g. by navigating through profile or a dedicated tab/link if applicable, or that the settings entry point is verified).
2. **Opening Dropdown**:
   - Tap the Notifications icon in the header.
   - Verify a dropdown modal animations smoothly (`SlideUp` / `FadeIn`).
   - If there are notifications, check that the list is scrollable and displays up to 20 recent notifications.
   - If there are no notifications, verify the empty state message: "You have no notifications".
3. **Accepting/Declining Follow Requests**:
   - Trigger a follow request to the logged-in user.
   - Open the dropdown. Tap the requester avatar or name and verify redirection to the user's profile.
   - Tap "Accept" in the follow request card. Verify the buttons disable instantly, and then show "Request accepted".
   - Tap "Decline" in a different follow request card. Verify the card updates to "Request declined".
4. **Standard Notification Redirections**:
   - Tap an "Item Liked" or "Item Commented" notification. Verify redirection to the parent collection details screen with the item details modal active.
   - Tap a "Collection Followed" notification. Verify redirection to that collection's details screen.
   - Tap a "Request Accepted" notification. Verify redirection to that user's profile.

### Automated Tests
Execute the test suite to ensure no regressions:
```bash
npm run test
```
To run tests with coverage:
```bash
npm run test:coverage
```
