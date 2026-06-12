# API Contracts: Notifications & Follow Actions

## 1. Fetch Notifications
Retrieves a paginated list of notifications for the authenticated user.

- **Endpoint**: `GET /notifications`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters**:
  - `page` (integer, default `0`): Page index.
  - `size` (integer, default `10`): Number of items per page.
  - `sortBy` (string, default `CREATED_AT_DESC`): Sorting order. Enum: `[NAME_ASC, NAME_DESC, CREATED_AT_ASC, CREATED_AT_DESC, UPDATED_AT_ASC, UPDATED_AT_DESC]`
- **Response** (`200 OK`):
  ```json
  {
    "notifications": [
      {
        "notificationId": "123e4567-e89b-12d3-a456-426614174000",
        "recipientId": "123e4567-e89b-12d3-a456-426614174001",
        "actor": {
          "id": "123e4567-e89b-12d3-a456-426614174002",
          "username": "lucas_silva",
          "profilePictureUrl": "https://api.collectto.app/profiles/lucas.jpg"
        },
        "context": "USER_FOLLOW_REQUESTED",
        "reference": {
          "id": "123e4567-e89b-12d3-a456-426614174002",
          "parentId": null,
          "referenceImageUrl": null
        },
        "read": false,
        "createdAt": "2026-06-12T01:00:00Z"
      }
    ],
    "totalPages": 1,
    "totalElements": 1,
    "currentPage": 0
  }
  ```

---

## 2. Accept Follow Request
Accepts a pending follow request from a specific user.

- **Endpoint**: `PATCH /users/follow/{followerId}/accept`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `followerId` (string, UUID): The unique identifier of the user requesting to follow.
- **Response** (`200 OK`):
  ```json
  {
    "followerId": "123e4567-e89b-12d3-a456-426614174002",
    "followedId": "123e4567-e89b-12d3-a456-426614174001",
    "status": "ACCEPTED",
    "createdAt": "2026-06-12T01:00:00Z"
  }
  ```

---

## 3. Decline Follow Request
Declines a pending follow request from a specific user.

- **Endpoint**: `PATCH /users/follow/{followerId}/decline`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `followerId` (string, UUID): The unique identifier of the user requesting to follow.
- **Response** (`200 OK`):
  ```json
  {
    "followerId": "123e4567-e89b-12d3-a456-426614174002",
    "followedId": "123e4567-e89b-12d3-a456-426614174001",
    "status": "DECLINED",
    "createdAt": "2026-06-12T01:00:00Z"
  }
  ```
