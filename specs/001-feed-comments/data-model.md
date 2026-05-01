# Data Model: Comentários no Feed

**Purpose**: Define entities, relationships, and validation rules for comment feature
**Created**: 2026-05-01

## Entities

### Comment
Representa uma mensagem individual vinculada a um feed item. Mapeia para schema da API.

```typescript
// Schema na API (comment_id, item_id, user_id, content, created_at)
// Mapeamento: comment_id → id, item_id → postId, user_id → authorId, content → text

interface Comment {
  // Chaves primárias e referências (do banco)
  id: string;                    // comment_id (UUID da API)
  postId: string;               // item_id (FK para feed item)
  authorId: string;             // user_id (FK para usuário autor)
  createdAt: number;            // created_at (timestamp milisegundos, calculado client-side)
  
  // Conteúdo
  text: string;                 // content (1–500 chars, TEXT na API)
  
  // Snapshots do perfil do autor (desnormalizados para exibição offline)
  authorName: string;           // Nome do autor no momento da criação (snapshot, imutável)
  authorAvatar: string;         // Avatar URI do autor no momento da criação (snapshot, imutável)
  
  // Transformações client-side (não vêm da API)
  publishedLabel: string;       // "agora", "5 min atrás", etc. (calculado a partir de createdAt)
  isAuthor?: boolean;           // Flag local: é o comentário do usuário autenticado (comparar com auth context)
}
```

**Validation Rules**:
- `id`: required, non-empty, UUID format
- `postId`: required, must link to valid Post (item_id)
- `authorId`: required, UUID format (user_id)
- `text`: required, 1–500 chars, trimmed, no empty spaces only
- `createdAt`: required, valid timestamp (ms)
- `authorName`, `authorAvatar`: required, snapshots (imutável, nunca atualizar)
- `publishedLabel`: derived client-side from createdAt (não validar contra API)

---

### PostCommentMeta
Metadados associados a um feed item para exibição de teaser e contagem.

```typescript
interface PostCommentMeta {
  postId: string;               // Referência ao Post
  totalCount: number;           // Total de comentários reais
  teaserComment?: Comment;      // Primeiro ou comentário destacado para preview
  isExpanded?: boolean;         // Estado local: thread aberta ou fechada
}
```

**Validation Rules**:
- `postId`: required, non-empty
- `totalCount`: number ≥ 0
- `teaserComment`: optional, se presente deve ser Comment válido
- `isExpanded`: optional, default false

---

### CommentThreadState
Estado local para a visualização de comentários de um item específico.

```typescript
interface CommentThreadState {
  postId: string;               // Qual item está sendo visualizado
  comments: Comment[];          // Lista completa de comentários
  isLoading: boolean;           // Carregando comentários
  error?: string;               // Mensagem de erro (se houver)
  inputText: string;            // Rascunho do novo comentário
  isSubmitting: boolean;        // Enviando novo comentário
}
```

**Validation Rules**:
- `postId`: required
- `comments`: array, pode estar vazio
- `inputText`: string, pode estar vazio (rascunho)
- `isSubmitting`: false durante sucesso para clearar input

---

## Relationships

```
Post (1) ──────── (M) Comment
  |
  └── teaserComment: Comment (0..1)  [primeira ou mais relevante]

User ──────── Comment
  └── author [snapshot no Comment]
```

---

## State Flows

### Opening Comment Thread
```
User taps comment button on Post
  ↓
CommentThreadState.isLoading = true
  ↓
Fetch/load MOCK_COMMENTS for postId
  ↓
CommentThreadState.comments = [...]
CommentThreadState.isLoading = false
  ↓
Render CommentThread component
```

### Creating Comment
```
User types in CommentInput
  ↓
CommentThreadState.inputText = trimmed text
  ↓
User presses send button
  ↓
Validate: inputText.trim().length > 0
  ↓
If invalid: show warning, return
If valid:
  CommentThreadState.isSubmitting = true
  Create new Comment object
  Add to CommentThreadState.comments
  Reset CommentThreadState.inputText = ""
  CommentThreadState.isSubmitting = false
```

---

## API Response Format (Futuro)

```typescript
// Quando API estiver pronta, POST /api/comments retornará:
interface CreateCommentResponse {
  comment_id: string;           // UUID
  item_id: string;              // FK para post
  user_id: string;              // FK para user
  content: string;              // Texto do comentário
  created_at: string;           // ISO 8601 timestamp (API)
}

// Client map para Comment interface:
const apiToComment = (dto: any, authorName: string, authorAvatar: string): Comment => ({
  id: dto.comment_id,
  postId: dto.item_id,
  authorId: dto.user_id,
  text: dto.content,
  createdAt: new Date(dto.created_at).getTime(),
  authorName,    // Snapshot do user profile
  authorAvatar,  // Snapshot do user profile
  publishedLabel: getRelativeTime(dto.created_at),
  isAuthor: dto.user_id === currentUserId,
});
```

## Mock Data Structure (src/mocks/comments.ts)

```typescript
export const MOCK_COMMENTS: Record<string, Comment[]> = {
  "post-1": [
    {
      id: "c1",
      postId: "post-1",
      authorId: "u1",
      text: "Adorei essa edição!",
      createdAt: Date.now() - 5 * 60 * 1000,  // 5 min atrás
      authorName: "Yosag Marques",
      authorAvatar: "https://...",
      publishedLabel: "5 min atrás",
      isAuthor: false,
    },
    {
      id: "c2",
      postId: "post-1",
      authorId: "u2",
      text: "Qual é a origem desse item?",
      createdAt: Date.now() - 2 * 60 * 1000,
      authorName: "Marina Silva",
      authorAvatar: "https://...",
      publishedLabel: "2 min atrás",
      isAuthor: false,
    },
  ],
  "post-2": [
    {
      id: "c3",
      postId: "post-2",
      authorId: "u1",
      text: "Excelente achado!",
      createdAt: Date.now() - 30 * 60 * 1000,
      authorName: "Yosag Marques",
      authorAvatar: "https://...",
      publishedLabel: "30 min atrás",
      isAuthor: true,
    },
  ],
};

export const buildTeaser = (postId: string): Comment | undefined => {
  return MOCK_COMMENTS[postId]?.[0];
};

export const getCommentsByPostId = (postId: string): Comment[] => {
  return MOCK_COMMENTS[postId] ?? [];
};
```

---

## Constraints & Notes

- **Imutabilidade de snapshots**: authorName, authorAvatar armazenados no Comment no momento da criação, nunca atualizados (desnormalização intencional)
- **Schema API**: comment_id (PK UUID), item_id (FK), user_id (FK), content (TEXT), created_at (TIMESTAMP)
- **Mapeamento client**: Renomear fields da API para nomes compatíveis com UI (id, postId, authorId, text, createdAt)
- **Sem edição de comentário**: v1 apenas cria; edição/delete fora de escopo
- **Offline mock**: dados mock locais (nenhuma rede); API real diferida para v1.1+
- **Teaser visual**: sempre mostra primeiro comentário; se vazio, mostra placeholder
- **Timestamp client-side**: publishedLabel calculado a partir de createdAt (não persiste na API)
