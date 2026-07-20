# Data Model: integrate-social-feed (Baseado na API)

**Feature**: integrate-social-feed  
**Date**: 2026-06-11  

---

## 1. Mapeamento de Entidades da API

Abaixo está a correspondência entre os modelos retornados pela documentação oficial da API (`collecto-api-docs.json`) e os tipos do aplicativo no frontend.

### FeedPost (Mapeado a partir de `FeedSummary`)
Cada item retornado por `GET /social/feed` possui o formato `FeedSummary`:
```json
{
  "source": {
    "id": "UUID (userId ou collectionId)",
    "username": "string (null se for coleção)",
    "collectionName": "string (null se for usuário)",
    "avatarUrl": "string (avatar do usuário ou capa da coleção)",
    "context": "USER | COLLECTION | ITEM"
  },
  "item": {
    "id": "UUID",
    "collectionId": "UUID",
    "userId": "UUID",
    "name": "string",
    "description": "string",
    "imageFilesUrls": ["string"],
    "likesCount": "integer",
    "commentsCount": "integer",
    "isActive": "boolean",
    "createdAt": "date-time"
  }
}
```
**Mapeamento para o estado do Feed no Frontend (`MockFeedPost`)**:
- `id` ➔ `item.id`
- `author.name` ➔ `source.username` (se `source.context === 'USER'`) ou "Coleção" (se `source.context === 'COLLECTION'`)
- `author.username` ➔ `source.username`
- `author.avatarUri` ➔ `source.avatarUrl`
- `content` ➔ `item.description`
- `item.id` ➔ `item.id`
- `item.collectionId` ➔ `item.collectionId`
- `item.title` ➔ `item.name`
- `item.imageUri` ➔ `item.imageFilesUrls[0]`
- `likesCount` ➔ `item.likesCount`
- `commentsCount` ➔ `item.commentsCount`
- `isLiked` ➔ Determinado de forma local/otimista (ou comparando o ID do usuário autenticado na lista retornada por `/items/likes/{itemId}`)

### Comment (Mapeado a partir de `CommenterSummaryResponse`)
A lista de comentários retornada por `GET /items/comments/{itemId}` possui itens do tipo `CommenterSummaryResponse`:
```json
{
  "commentId": "UUID",
  "userId": "UUID",
  "username": "string",
  "profilePictureURL": "string",
  "content": "string",
  "createdAt": "date-time"
}
```
**Mapeamento para o tipo `Comment` no Frontend**:
- `id` ➔ `commentId`
- `postId` ➔ `itemId` (passado no escopo da busca)
- `authorId` ➔ `userId`
- `text` ➔ `content`
- `createdAt` ➔ Convertido de `date-time` string para `number` (timestamp em milissegundos)
- `authorName` ➔ `username`
- `authorAvatar` ➔ `profilePictureURL`
- `isAuthor` ➔ `userId === currentUser.id` (verificação local no frontend)

---

## 2. Contratos de Endpoints da API

### Feed Principal
- **Endpoint**: `GET /social/feed`
- **Parâmetros**: `page` (query, integer), `size` (query, integer)
- **Resposta (200 OK)**: `FeedResponse`
  ```json
  {
    "content": [ FeedSummary ],
    "size": "integer",
    "currentPage": "integer",
    "hasNext": "boolean"
  }
  ```

### Curtir Item
- **Endpoint**: `POST /items/like/{itemId}`
- **Parâmetros**: `itemId` (path, string)
- **Resposta (200 OK)**: `ItemLikeResponse` contendo `itemId`, `likerId`, `createdAt`

### Descurtir Item
- **Endpoint**: `DELETE /items/like/{itemId}`
- **Parâmetros**: `itemId` (path, string)
- **Resposta (200 OK)**: Sem corpo (`200 OK`)

### Adicionar Comentário
- **Endpoint**: `POST /items/comment/{itemId}`
- **Parâmetros**: `itemId` (path, string)
- **Request Body**: `CreateCommentRequest`
  ```json
  {
    "content": "string"
  }
  ```
- **Resposta (200 OK)**: `CreateCommentResponse` contendo `commentId`, `itemId`, `authorId`, `content`, `createdAt`

### Excluir Comentário
- **Endpoint**: `DELETE /items/comment/{commentId}`
- **Parâmetros**: `commentId` (path, string)
- **Resposta (200 OK)**: Sem corpo (`200 OK`)

### Buscar Comentários de um Item
- **Endpoint**: `GET /items/comments/{itemId}`
- **Parâmetros**: `itemId` (path, string), `page` (query, integer), `size` (query, integer), `sortBy` (query, string)
- **Resposta (200 OK)**: `ItemCommentPageResponse` contendo `commenterSummaries` (Array de `CommenterSummaryResponse`), `totalPages`, `totalElements`, `currentPage`.
