# Data Model Modifications: Auth, Items, and Collections Enhancements

Este documento detalha as alterações feitas nos modelos de dados e tipos do TypeScript para dar suporte às melhorias de Autenticação, Itens e Coleções.

## 1. Modificações nos Tipos de Itens (`src/types/items.ts`)

O tipo `UpdateItemRequest` foi estendido para aceitar o campo opcional `collectionId`, permitindo a movimentação lógica de um item ao atualizar suas informações.

### Atualização da Interface `UpdateItemRequest`
```typescript
export interface UpdateItemRequest {
  id: string;
  name?: string;
  description?: string;
  acquisitionDate?: string;
  imageFilesUrls?: string[] | null;
  attributes?: Record<string, unknown>;
  tags?: string[];
  collectionId?: string; // Novo campo adicionado para permitir a movimentação do item
}
```

---

## 2. Modificações nos Tipos de Coleções (`src/types/collections.ts`)

A interface `CreateCollectionRequest` foi modificada para conter a visibilidade opcional no payload de envio ao criar uma coleção.

### Atualização da Interface `CreateCollectionRequest`
```typescript
export type CollectionVisibility = 'PRIVATE' | 'PUBLIC' | 'FRIENDS';

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  visibility?: CollectionVisibility; // Novo campo adicionado para definir a visibilidade no cadastro
}
```

### Atualização da Interface `CollectionResponse` e `Collection`
A visibilidade passa a ser uma propriedade obrigatória/padrão retornada pela API.
```typescript
export interface CollectionResponse {
  id: string;
  name: string;
  description?: string;
  visibility: CollectionVisibility;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Modificações nos Tipos de Autenticação (`src/types/auth.ts` / `src/types/auth-refresh.d.ts`)

No login ou no refresh de sessão, a API retorna o par de tokens JWT. O tipo `LoginResponse` e as respostas de refresh de token devem modelar essa estrutura.

### Schema do LoginResponse
```typescript
export interface LoginResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}
```

### Schema de TokenRefreshResponse
```typescript
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}
```
