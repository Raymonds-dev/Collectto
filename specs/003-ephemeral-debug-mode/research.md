# Research Phase 0: Ephemeral Debug Mode

**Date**: 2026-05-12 | **Spec**: [specs/003-ephemeral-debug-mode/spec.md](spec.md)  
**Research Output**: Decisions and findings for Phase 1 (Design) and Phase 2 (Tasks)

---

## Research Summary

Collectto está implementando um modo DEBUG para testes offline e demonstrações. O projeto já possui infraestrutura parcial (AuthProvider com USEMOCK, mock factories, Context providers), facilitando a implementação. Esta pesquisa resolve clarificações técnicas e confirma padrões reutilizáveis.

---

## 1. Session State Management

### NEEDS CLARIFICATION → RESOLVED ✅

**Decision**: Usar Context Provider + em-memória simples para ephemeral session, sem AsyncStorage.

**Rationale**:

- AuthProvider já usa padrão `USEMOCK = true` (linha 11 de src/app/\_layout.tsx)
- CollectionContextProvider e ItemContextProvider (src/providers/) já criaminstâncias de mock services
- Dados efêmeros não persistem entre sessões por design; não há necessidade de AsyncStorage
- Pattern em memória puro = mais simples, mais rápido no modo DEBUG

**Implementation Pattern**:

```typescript
// Reutilizar existing pattern: factory + context
const DebugSessionContext = createContext<DebugSession | undefined>(undefined);

export const createDebugSession = (seed: SeedData): DebugSession => {
  return {
    user: seed.user,
    collections: [...seed.collections], // mutable array
    items: [...seed.items],
    posts: derivePostsFromItems(seed.items, seed.user),
    addCollection: (input) => {
      /* mutate collections */
    },
    addItem: (input) => {
      /* mutate items, re-derive posts */
    },
    updateProfile: (input) => {
      /* mutate user */
    },
  };
};
```

**Alternatives Considered**:

- AsyncStorage com flag DEBUG: rejected (overkill para dados efêmeros; confundiria persistência)
- Redux: rejected (projeto não usa Redux; mantém simplicidade com Context)

---

## 2. Photo Storage & Caching

### NEEDS CLARIFICATION → RESOLVED ✅

**Decision**: Integrar expo-file-system com cache do SO via factory pattern existente em src/services/photo-storage/.

**Rationale**:

- Projeto já tem PhotoStorageProvider factory (src/services/photo-storage/factory.ts)
- expo-file-system 19.0.22 já instalado e suporta cache directory
- Padrão local-provider existente pode ser estendido para suportar DEBUG cache

**Implementation Pattern**:

```typescript
// Estender src/services/photo-storage/local-provider.ts
export const createDebugPhotoCache = (): PhotoStorageProvider => {
  const cacheDir = FileSystem.cacheDirectory; // iOS Caches, Android getCacheDir()

  return {
    savePhoto: async (photo: PhotoData) => {
      const filename = `debug-${Date.now()}-${randomId()}.jpg`;
      const uri = `${cacheDir}${filename}`;
      await FileSystem.copyAsync({ from: photo.uri, to: uri });
      return { uri, type: 'local-cache' };
    },
    getPhoto: async (ref) => ref, // URIs são válidas durante sessão
    cleanup: async () => {
      // Limpeza automática ao término da app (plataforma cuida disso)
    },
  };
};
```

**Platform-specific Paths**:

- iOS: `FileSystem.cacheDirectory` → `/var/mobile/Containers/Data/Library/Caches/`
- Android: `FileSystem.cacheDirectory` → `/data/data/com.collectto/cache/`
- Web: fallback em-memória (Blob URIs)

**Alternatives Considered**:

- Armazenar em DocumentsDirectory: rejected (documentos não devem ser limpos automaticamente)
- In-memory Blob URIs: rejected (não funciona para reinicializações de componente em RN)

---

## 3. API Contract Reference & Schemas

### NEEDS CLARIFICATION → RESOLVED ✅

**Decision**: Usar os contratos e modelos API-first como fonte canônica; o DEBUG apenas emula esses formatos em memória.

**Rationale**:

- A API já define as formas canônicas em camelCase:
  - CollectionResponse (`id`, `userId`, `name`, `description`, `coverImageURL`, `visibility`, `followersCount`, `createdAt`, `updatedAt`)
  - ItemResponse (`id`, `collectionId`, `userId`, `name`, `description`, `imageFilesUrls`, `likesCount`, `commentsCount`, `createdAt`, `updatedAt`)
  - UserResponse (`id`, `name`, `username`, `email`, `bio`, `profilePictureUrl`, `profileBackgroundUrl`, `createdAt`)
- O contrato do swagger em http://89.167.89.185:8080/swagger-ui/ continua sendo a referência para qualquer futura implementação real
- O modo DEBUG deve respeitar os mesmos nomes de campo e enums para reduzir retrabalho na migração

**Mapping Existing Entities**:

| Entity     | Canonical API Type       | Fields                                                                                                             | DEBUG Inheritance             |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| Profile    | UserResponse             | id, name, username, email, bio, profilePictureUrl, profileBackgroundUrl, followersCount, followingCount, createdAt | Seed user + session mutations |
| Collection | CollectionResponse       | id, userId, name, description, coverImageURL, visibility, followersCount, tags, isActive, createdAt, updatedAt     | Seed data + create mutations  |
| Item       | ItemResponse             | id, collectionId, userId, name, description, imageFilesUrls, likesCount, commentsCount, tags, isActive, createdAt  | Created in session            |
| Post       | PostProjection (derived) | id, author, item, likesCount, commentsCount, isLiked, createdAt                                                    | Derived from items            |

**Alternatives Considered**:

- Criar novos tipos separados para DEBUG: rejected (duplicação; melhor estender existentes)
- Esperar API swagger deploy: rejected (task é urgente; swagger é referência, não bloqueador)

---

## 4. UUID & ID Generation

### NEEDS CLARIFICATION → RESOLVED ✅

**Decision**: Usar `uuid` v4 package (14.0.0) com formato string padrão (36 chars, ex.: `550e8400-e29b-41d4-a716-446655440000`).

**Rationale**:

- Projeto já tem `uuid@^14.0.0` no package.json
- Gerador existente `generateRandomId` (src/utils/generateRandomId.ts) pode ser estendido
- UUID v4 é padrão universal; alinha com API futura

**Implementation Pattern**:

```typescript
import { v4 as uuidv4 } from 'uuid';

export const generateDebugId = (): string => uuidv4(); // ex.: "550e8400-e29b-41d4-a716-446655440000"
```

**Validation**:

- Formato: `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$` (v4)
- Sempre usar lowercase para consistência

**Alternatives Considered**:

- Nanoid: rejected (uuid v4 já instalado; projeto não precisa minimizar IDs)
- Sequencial inteiros: rejected (não alinha com API; confundiria com padrão de produção)

---

## 5. Logging Strategy

### NEEDS CLARIFICATION → RESOLVED ✅

**Decision**: Usar `console.log/info/debug` nativo com flag DEBUG simples; sem winston/bunyan em DEBUG.

**Rationale**:

- Projeto é React Native (móvel); console é disponível via dev tools / logcat / Xcode
- No modo DEBUG, logs servem principalmente para troubleshooting local em desenvolvimento
- Sem arquivo persistente reduz complexidade e I/O desnecessário
- Padrão simples console.\* é suficiente para MVP

**Implementation Pattern**:

```typescript
// src/services/debug/logger.ts
export const debugLog = (
  level: 'info' | 'debug' | 'warn' | 'error',
  message: string,
  data?: unknown
) => {
  if (process.env.DEBUG !== 'true') return;

  const timestamp = new Date().toISOString();
  const prefix = `[DEBUG ${timestamp}]`;

  switch (level) {
    case 'info':
      console.log(`${prefix} [INFO]`, message, data);
    case 'debug':
      console.debug(`${prefix} [DEBUG]`, message, data);
    case 'warn':
      console.warn(`${prefix} [WARN]`, message, data);
    case 'error':
      console.error(`${prefix} [ERROR]`, message, data);
  }
};

// Uso:
debugLog('info', 'Session initialized', { userId: 'seed-user' });
```

**Avaliação de Ferramentas**:

- console nativo: ✅ Suficiente; sem overhead
- winston: rejected (pesado para mobile; não há arquivo persistente necessário)
- bunyan: rejected (mesmo motivo)

---

## 6. Motion & Feedback UX

### NEEDS CLARIFICATION → RESOLVED ✅

**Decision**: Usar presets oficiais em src/hooks/useAnimation/ para state sync feedback; FadeIn para entrada, sem loader bloqueante.

**Rationale**:

- Projeto já tem motion system em src/hooks/useAnimation/ e src/components/ui/animated/ (MVP completo)
- Constitution Collectto enforce "Motion Oficial": presets ScalePress, FadeIn, SlideUp, Stagger, sem ad-hoc animations
- State sync em DEBUG é local/instantâneo (<1s); não requer skeleton loader
- FadeIn simples suficiente para visual feedback de item/coleção criada

**Available Presets** (verificar em src/hooks/useAnimation/):

- `ScalePress`: para feedback de toque (criar coleção button)
- `FadeIn`: para entrada de novo item na grid
- `SlideUp`: para expansão de detail sheets (comentários, etc)
- `Stagger`: para listas (collections grid, items grid)

**Implementation Pattern**:

```typescript
// Quando item é adicionado:
const handleAddItem = async (input: CreateItemInput) => {
  const item = await debugSession.addItem(input);

  // Trigger animation feedback (não há loader; data é local)
  animateNewItem(item.item_id); // FadeIn preset via useAnimation

  // UI reflete instantaneamente; sem delay
  setItems([...items, item]);
};
```

**Alternatives Considered**:

- Spinner bloqueante: rejected (state é local; esperar é UX ruim)
- Sem feedback: rejected (usuário não sabe que ação funcionou)

---

## 7. Post Feed Derivation Logic

### NEEDS CLARIFICATION → RESOLVED ✅

**Decision**: Transformar Item em PostProjection via mapeamento direto; derivação acontece ao criar item; ordering DESC por createdAt.

**Rationale**:

- Especificação requer: "posts derivados de itens da pessoa de teste; ordenação mais recente primeiro"
- Item já possui createdAt; mapeamento é 1:1 (um item = um post)
- PostProjection é view-only; não precisa de ID separado (pode reutilizar id do item com prefixo interno)

**Data Model Mapping**:

```typescript
// src/types/debug.ts - nova interface
export interface PostProjection {
  id: string; // UUID ou item_id
  author: {
    id: string;
    name: string;
    username: string;
    profilePictureUrl?: string;
  };
  item: {
    id: string;
    collectionId: string;
    name: string;
    description: string;
    imageFilesUrls: string[];
  };
  createdAt: string; // ISO 8601, from item.createdAt
  likesCount: number; // default 0
  commentsCount: number; // default 0
}

// Derivação:
const derivePostsFromItems = (
  items: ItemResponse[],
  user: UserResponse,
  collections: CollectionResponse[]
): PostProjection[] => {
  return items
    .filter((item) => item.isActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((item) => {
      const collection = collections.find((c) => c.id === item.collectionId);
      return {
        id: `post-${item.id}`,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          profilePictureUrl: user.profilePictureUrl,
        },
        item: {
          id: item.id,
          collectionId: item.collectionId,
          name: item.name,
          description: item.description,
          imageFilesUrls: item.imageFilesUrls,
        },
        createdAt: item.createdAt,
        likesCount: 0,
        commentsCount: 0,
      };
    });
};
```

**Ordenação**:

- Field: `createdAt` (ISO 8601 string from item)
- Direction: DESC (mais recente primeiro)
- Re-derivação: Sempre que item é criado ou deletado na sessão

**Alternatives Considered**:

- Post como tabela separada: rejected (derivação é suficiente; sem necessidade de armazenamento duplo)
- Lazy derivation na UI: rejected (melhor re-derivar ao mutar items; garantir consistência)

---

## 8. Validation Reuse

### NEEDS CLARIFICATION → RESOLVED ✅

**Decision**: Reutilizar validações existentes de UI/UX; aplicar mesmas regras entre DEBUG e não-DEBUG.

**Rationale**:

- Especificação requer: "validações e comportamentos de fluxo equivalentes entre DEBUG e não-DEBUG"
- Projeto já valida inputs em forms (ex.: src/app/(auth)/login.tsx)
- Extrair validações para utility functions para reusar entre mock e API mode

**Validation Areas**:

1. **Auth (login)**: email + password; reutilizar `validateLoginRequest`
2. **Collection (create/update)**: name obrigatório, description obrigatório no create; reutilizar `validateCollectionRequest`
3. **Item (create/update)**: name obrigatório, imageFilesUrls obrigatório; reutilizar `validateItemRequest`
4. **Profile (update)**: name, username, bio, profilePictureUrl; reutilizar `validateUpdateUserRequest`

**Implementation Pattern**:

```typescript
// src/validators/collection.ts (novo)
export const validateCollectionInput = (input: CreateCollectionInput): string[] => {
  const errors: string[] = [];
  if (!input.name || input.name.trim().length === 0) {
    errors.push('Collection name is required');
  }
  if (input.description && input.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }
  return errors;
};

// Usar em ambos: API mode + DEBUG mode
const handleCreateCollection = async (input: CreateCollectionInput) => {
  const errors = validateCollectionInput(input);
  if (errors.length > 0) {
    setErrors(errors);
    return;
  }
  // ... create collection (API ou DEBUG)
};
```

**Alternatives Considered**:

- ZOD schema (type-safe, mas não usado atualmente no projeto): rejected (melhor ser pragmático; validações simples em funções puras)

---

## 9. Testing Strategy

### NEEDS CLARIFICATION → RESOLVED ✅

**Decision**: Usar Jest + React Native Testing Library para testar ephemeral session; mock services já testáveis.

**Rationale**:

- Projeto usa Jest (vem com Expo / create-expo-app)
- React Native Testing Library é padrão; já familiarizado
- Mock services retornam Promises; fácil testar em isolamento
- DEBUG session é lógica pura (in-memory); determinística, testável

**Testing Coverage Plan**:

1. **Unit**: DebugSession service (create, add, update, delete)
2. **Integration**: AuthProvider + CollectionContextProvider + ItemContextProvider em DEBUG
3. **E2E**: Fluxo login → create collection → add item → feed reflete (se houver Detox)

**Example Test**:

```typescript
describe('DebugSession', () => {
  let session: DebugSession;

  beforeEach(() => {
    session = createDebugSession(SEED_DATA);
  });

  test('addItem should update collections immediately', async () => {
    const item = await session.addItem({
      collectionId: SEED_DATA.collections[0].id,
      name: 'Test Item',
      description: 'Test',
      imageFilesUrls: ['file://test.jpg'],
    });

    expect(item.id).toBeDefined();
    expect(session.posts.length).toBeGreaterThan(0);
  });

  test('posts should be ordered DESC by createdAt', () => {
    expect(session.posts[0].createdAt).toBeGreaterThanOrEqual(session.posts[1].createdAt);
  });
});
```

**CI Integration**:

- Run: `npm test -- --testPathPattern=debug` (antes de `npm run validate`)
- Cobertura: mín. 80% para debug services

**Alternatives Considered**:

- Cypress: rejected (RN, não web)
- Detox: optional (E2E; vale agregar depois se houver capacity)

---

## 10. Immutability & Mode Locking

### NOTES (não foi NEEDS CLARIFICATION, mas importante resolver)

**Decision**: DEBUG mode é imutável em runtime; definido em build/env; requer restart para mudar.

**Rationale**:

- Especificação requer: "Modo DEBUG é imutável em runtime; definido em build/env; requer restart"
- Simplifica design: sem mistura de lógica entre DEBUG e API mode dentro da app
- Alinha com desenvolvimento móvel: build e run = ciclo integral

**Implementation**:

```typescript
// src/env.ts (novo)
export const DEBUG_MODE = process.env.DEBUG === 'true';

// src/app/_layout.tsx - AuthProvider boot
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (DEBUG_MODE) {
      // Carregar seed em boot
      const seedUser = buildDebugSeedUser();
      setUser(seedUser);
    } else {
      // Fluxo normal: check token
      validateExistingSession().then(setUser);
    }
  }, []); // [] = executar uma vez, nunca mudar modo
};
```

**Build Configuration**:

- `.env.debug`: `DEBUG=true` (para builds locais de teste)
- `.env.production`: `DEBUG=false` (padrão)
- App.json / eas.json: configurar env vars por build profile

---

## Summary of Decisions

| Topic           | Decision                      | Rationale                            | Confidence |
| --------------- | ----------------------------- | ------------------------------------ | ---------- |
| Session State   | Context in-memory             | Padrão projeto; sem persistência     | 🟢 High    |
| Photo Cache     | expo-file-system + factory    | Integração simples; já instalado     | 🟢 High    |
| Schemas         | Tipos locais + referência API | Alinhado com interface existente     | 🟢 High    |
| IDs             | UUID v4 strings               | Package instalado; alinhado com API  | 🟢 High    |
| Logging         | console.\* nativo             | Mobile-first; suficiente para DEBUG  | 🟡 Medium  |
| Motion          | Presets oficiais FadeIn       | Constitution enforce; padrão projeto | 🟢 High    |
| Post Derivation | Item → Post via mapeamento    | Transformação simples; 1:1 mapping   | 🟢 High    |
| Validation      | Reutilizar lógica existente   | DRY; UX parity                       | 🟢 High    |
| Testing         | Jest + RTL                    | Padrão projeto                       | 🟢 High    |
| Mode Locking    | Imutável em runtime           | Simplifica design; requer restart    | 🟢 High    |

---

## Next Steps (Phase 1: Design)

1. ✅ research.md completo
2. → **data-model.md**: Definir DebugSession, SeedData, PostProjection com schemas completos
3. → **contracts/**: AuthService, ProfileService, CollectionService, ItemService, PostService contracts
4. → **quickstart.md**: Como ativar DEBUG, fluxo de seed, estrutura de callbacks
5. → **Plan update**: Re-validate Constitution Check após design

**Gate for Phase 1**: Nenhuma violação de Constitution; todas clarificações resolvidas ✅
