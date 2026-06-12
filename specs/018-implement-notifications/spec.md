# Feature Specification: Implement Notifications

**Feature Branch**: `feature/018-implement-notifications`  
**Created**: 2026-06-12  
**Status**: Ready  
**Input**: User description: "Quero implementar as notificações do aplicativo. Basicamente no header do feed vai ter um icone de notificações no lugar do de configurações. Aí ao clicar ele vai abrir um modal dropdown para ver a notificação. São 4 tipos de notificações no momento: - Solicitação para seguir - Solicitação aceita - Coleção foi seguida - Item comentado - Item curtido. Sendo que caso a notificação seja do tipo de Solicitação para seguir, deve ter um botão de aceitar e recusar, além de permitir ir ao pefil da pessoa que solicitou. Para o restante deve-se pegar o ID e redirecionar para o objeto do contexto da notificação."

## Clarifications

### Session 2026-06-12

- Q: As notificações push externas (notificações nativas do sistema operacional móvel fora do aplicativo) estão fora de escopo para esta funcionalidade? → A: Apenas notificações internas (in-app) estão no escopo; push notifications externas estão fora de escopo.
- Q: A ação de Aceitar/Recusar solicitação para seguir deve ser exclusiva do dropdown ou também deve estar disponível na tela de perfil? → A: Exclusiva do dropdown (a tela de perfil mostra apenas que há uma solicitação pendente, sem botões de ação direta).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Viewing Notifications in Dropdown (Priority: P1)

As a user, I want to click a notifications icon in the feed header to open a dropdown modal containing my list of notifications so that I can see recent social updates.

**Why this priority**: Core entry point. Without this, users cannot see or interact with any notifications.

**Independent Test**: Can be fully tested by logging in, looking at the feed header, clicking the notifications icon, and verifying the dropdown opens showing a list of notifications (or an empty state).

**Acceptance Scenarios**:

1. **Given** the user is on the feed screen, **When** they look at the header, **Then** they see a notifications icon instead of the settings icon.
2. **Given** the user is on the feed screen, **When** they click the notifications icon, **Then** a dropdown modal opens displaying a list of recent notifications.
3. **Given** the notifications dropdown is open and the user has no notifications, **When** the list is displayed, **Then** they see an empty state message: "You have no notifications".

---

### User Story 2 - Handling Follow Requests (Priority: P1)

As a user, I want to see follow requests in my notifications list, click on the requester's avatar or name to view their profile, and accept or decline their request directly from the notification card.

**Why this priority**: Crucial social interaction flow. Requires interactive elements (buttons) in the notifications list.

**Independent Test**: Can be fully tested by receiving a follow request, opening the dropdown, clicking "Accept" or "Decline", and verifying the state updates correctly.

**Acceptance Scenarios**:

1. **Given** the user has a pending follow request, **When** they open the notifications dropdown, **Then** they see a follow request card with the requester's name, avatar, and two action buttons: "Accept" and "Decline".
2. **Given** a follow request card is visible, **When** the user clicks the requester's avatar or name, **Then** the dropdown closes, and the user is redirected to that requester's profile.
3. **Given** the user is viewing a follow request card, **When** they click "Accept", **Then** the request is approved, and the card updates to display "Request accepted" (disabling/removing the buttons).
4. **Given** the user is viewing a follow request card, **When** they click "Decline", **Then** the request is rejected, and the card updates to display "Request declined".

---

### User Story 3 - Navigating to Context Objects (Priority: P2)

As a user, I want to click on standard notifications (Request Accepted, Collection Followed, Item Commented, Item Liked) and be redirected to the relevant object in the app so that I can easily engage with the activity.

**Why this priority**: Enhances navigation and user engagement, but can be built after the basic notification viewing is in place.

**Independent Test**: Can be fully tested by clicking a non-follow-request notification and verifying redirection to the correct screen.

**Acceptance Scenarios**:

1. **Given** the user has a "Request Accepted" notification, **When** they click it, **Then** they are redirected to the sender's user profile.
2. **Given** the user has a "Collection followed" notification, **When** they click it, **Then** they are redirected to that collection's detail view.
3. **Given** the user has an "Item commented" or "Item liked" notification, **When** they click it, **Then** they are redirected to that item's detail view.

---

### Edge Cases

- **Deleted Context Object**: A user receives a notification for a comment or collection, but the comment/collection is deleted before the user clicks it. The system should display a friendly alert: "This content is no longer available" rather than crashing or showing a blank page.
- **Network Failure on Actions**: The user clicks "Accept" or "Decline" on a follow request, but the network request fails. The UI should show an error message and restore the buttons to their active state.
- **Rapid Double Clicks**: A user rapidly clicks "Accept" multiple times. The system should disable the buttons immediately upon the first click to prevent duplicate api calls.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST replace the settings icon in the Feed Header with a Notifications icon.
- **FR-002**: The system MUST open a scrollable dropdown modal when the Notifications icon is clicked, displaying a list of the 20 most recent notifications.
- **FR-003**: The system MUST support five distinct notification types: Follow Request, Request Accepted, Collection Followed, Item Commented, and Item Liked.
- **FR-004**: For Follow Request notifications, the system MUST display the requester's avatar/name, an "Accept" button, a "Decline" button, and navigate to the requester's profile on clicking the name/avatar.
- **FR-005**: For Follow Request notifications, clicking "Accept" or "Decline" MUST disable the buttons, trigger the corresponding action, and display the updated status.
- **FR-006**: For Request Accepted notifications, clicking the notification MUST redirect the user to the profile of the user who accepted.
- **FR-007**: For Collection Followed notifications, clicking the notification MUST redirect the user to the followed collection.
- **FR-008**: For Item Commented and Item Liked notifications, clicking the notification MUST redirect the user to the item's detail page.
- **FR-009**: The system MUST display a badge indicating the number of unread notifications on the header icon. The badge count is fetched and updated when the app launches and when the feed is refreshed.
- **FR-010**: The system MUST mark all visible notifications as read automatically when the dropdown modal is opened.
- **FR-011**: The actions to accept or decline a follow request MUST be exclusive to the notifications dropdown. The target user profile screen will show the connection status as pending, but will not provide action buttons to accept/decline.

### Key Entities _(include if feature involves data)_

- **Notification**: Represents a notification entry. Attributes include:
  - `id`: Unique identifier
  - `type`: Type of notification (`FollowRequest`, `RequestAccepted`, `CollectionFollowed`, `ItemCommented`, `ItemLiked`)
  - `sender`: The user who triggered the notification (avatar, username, id)
  - `contextId`: The ID of the related entity (user profile, collection, or item)
  - `status`: Unread or Read
  - `createdAt`: Timestamp
- **Follow Request**: Represents the relationship state of a pending request to follow a private profile. Attributes include requester, requestee, and status.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view their notifications dropdown in under 0.5 seconds after clicking the icon.
- **SC-002**: Users can successfully accept or decline a follow request in under 2 seconds.
- **SC-003**: 100% of clicks on standard notifications redirect to the correct context object screen.
- **SC-004**: System supports displaying up to 50 notifications in the scrollable modal without sluggish scrolling.

## Assumptions

- Standard authentication system already manages user sessions and permissions.
- The backend API supports endpoints to fetch notifications, mark them as read, and accept/decline follow requests.
- The Feed Header component is structured such that replacing the settings icon does not break layout responsiveness.
- Navigating to profiles, collections, and items is supported by the existing navigation framework.
- Notificações push externas (notificações nativas do sistema operacional móvel fora do aplicativo) estão fora de escopo para esta versão; apenas notificações internas (in-app) no dropdown serão implementadas.
