# Data Model: Comentários no Feed

**Purpose**: Define entities, relationships, and validation rules for comment feature
**Created**: 2026-05-01

## Entities

### Comment
Representa uma mensagem individual vinculada a um feed item.

```typescript
interface Comment {
  id: string;                    // UUID ou sequencial
  postId: string;               // Referência ao item do feed
  authorId: string;             // Quem escreveu
  authorName: string;           // Nome do autor (snapshot)
  authorAvatar: string;         // Avatar URI (snapshot)
  text: string;                 // Conteúdo do comentário (1-500 chars)
  publishedLabel: string;       // "agora", "5 min atrás", etc.
  timestamp: number;            // ISO string ou milisegundos (para ordenação)
  isAuthor?: boolean;           // Flag local: é o comentário do usuário autenticado
}
```

**Validation Rules**:
- `id`: required, non-empty
- `postId`: required, must link to valid Post
- `text`: required, 1–500 chars, trimmed, no empty spaces only
- `authorId`, `authorName`, `authorAvatar`: required, snapshots (imutável)
- `publishedLabel`: relative time format (Collectto pattern)

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

## Mock Data Structure (src/mocks/comments.ts)

```typescript
export const MOCK_COMMENTS: Record<string, Comment[]> = {
  "post-1": [
    { id: "c1", postId: "post-1", authorId: "u1", ... },
    { id: "c2", postId: "post-1", authorId: "u2", ... },
  ],
  "post-2": [
    { id: "c3", postId: "post-2", authorId: "u1", ... },
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

- **Imutabilidade de snapshots**: authorName, authorAvatar armazenados no Comment, nunca atualizados
- **Sem edição de comentário**: v1 apenas cria; edição/delete fora de escopo
- **Offline mock**: dados mock locais (nenhuma rede); API real diferida para v1.5+
- **Teaser visual**: sempre mostra primeiro comentário; se vazio, mostra placeholder
