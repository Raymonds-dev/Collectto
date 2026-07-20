# Contract: Centralized API Interceptors

This document defines the contract for the API client (Axios) configuration and the centralized error handling interceptor.

## 1. Network Client Configuration

The Axios client instance defined in `src/services/api/api.ts` will be configured with a response interceptor to handle unauthorized access and automatically inject Authorization headers.

```typescript
import axios from 'axios';
import { sessionRefreshManager } from '../auth/sessionRefreshManager';

const api = axios.create({
  baseURL: 'http://89.167.89.185:8080',
  timeout: 10000, // 10 seconds timeout (FR-002 / FR-007)
});

// Response Interceptor for Centralized 401 Catching
api.interceptors.response.use(
  (response) => {
    // Check if a new token was returned in the headers (silent refresh)
    const newToken = response.headers['authorization'] || response.headers['new-token'];
    if (newToken && typeof newToken === 'string') {
      const cleanToken = newToken.replace(/^Bearer\s+/i, '');
      void sessionRefreshManager.startSession(cleanToken);
    }
    return response;
  },
  async (error) => {
    if (axios.isAxiosError(error)) {
      // Zentral 401 Catching (FR-004)
      if (error.response?.status === 401) {
        await sessionRefreshManager.handleUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 2. API Contract with /users/me for Refreshing

When calling `/users/me` (or any endpoint) to validate the session, the client sends:

```http
GET /users/me HTTP/1.1
Host: 89.167.89.185:8080
Authorization: Bearer <current_jwt_token>
Accept: application/json
```

The response from a server supporting silent refresh will include the new token in the headers:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Authorization: Bearer <new_refreshed_jwt_token>

{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Maria Silva",
  "username": "maria_silva",
  "email": "maria@email.com",
  ...
}
```

If the session has expired, the response is:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "message": "Token has expired"
}
```

---

## 3. Mock Auth Service Extension

To support silent refresh during development and testing without a real backend supporting token updates, the `mockAuthService` in `src/services/debug/mockAuthService.ts` will be extended to return mock tokens with customizable expirations.

```typescript
export const mockAuthService = {
  // ...
  refreshSession: async (currentToken: string): Promise<string> => {
    console.log('[DEBUG] mockAuthService.refreshSession called');
    // Generate a new mock token extending the expiration time by 1 hour (or 4 hours)
    const newMockToken = `debug-token-${Date.now()}`;
    return newMockToken;
  }
};
```
