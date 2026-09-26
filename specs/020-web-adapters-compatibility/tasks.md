# Tasks: Adaptadores e Compatibilidade WEB

**Input**: Design documents from `specs/020-web-adapters-compatibility/`  
**Prerequisites**: [plan.md](specs/020-web-adapters-compatibility/plan.md), [spec.md](specs/020-web-adapters-compatibility/spec.md), [research.md](specs/020-web-adapters-compatibility/research.md), [data-model.md](specs/020-web-adapters-compatibility/data-model.md), [contracts/](specs/020-web-adapters-compatibility/contracts/)

## Format: `- [ ] [ID] [P?] [Story] Description with file path`

- **[P]**: Tarefa executável em paralelo (arquivos distintos, sem dependência bloqueante)
- **[Story]**: Rastreabilidade com a história de usuário ([US1], [US2], [US3])
- Caminhos absolutos e relativos explícitos para cada ação

---

## Phase 1: Setup (Infraestrutura de Pastas e Adaptadores)

**Purpose**: Criação da estrutura de diretórios para os adaptadores de plataforma

- [X] T001 Criar diretório de adaptadores de armazenamento em `src/services/storage/adapters/`
- [X] T002 [P] Criar diretório de adaptadores de upload em `src/services/api/adapters/`

---

## Phase 2: Foundational (Contratos e Tipagens Base)

**Purpose**: Definição dos contratos de interface que unificam as plataformas antes da implementação

- [X] T003 Criar tipagem e contrato `StorageAdapter` em `src/services/storage/adapters/storageAdapter.types.ts`
- [X] T004 [P] Criar tipagem e contrato `HttpUploadAdapter` em `src/services/api/adapters/uploadAdapter.types.ts`

**Checkpoint**: Contratos e tipos estabelecidos. As histórias de usuário podem ser implementadas.

---

## Phase 3: User Story 1 - Persistência e Acesso de Sessão na WEB (Priority: P1) 🎯 MVP

**Goal**: Permitir login, logout e persistência segura de tokens na Web via `localStorage` com fallback em memória, e via `SecureStore` no Nativo.

**Independent Test**: Realizar login na Web (`npm run web`), recarregar a página (F5) e confirmar que o usuário permanece autenticado lendo os tokens no `localStorage`.

### Implementation for User Story 1

- [X] T005 [P] [US1] Implementar `src/services/storage/adapters/storageAdapter.native.ts` utilizando `expo-secure-store`
- [X] T006 [P] [US1] Implementar `src/services/storage/adapters/storageAdapter.web.ts` utilizando `window.localStorage` com fallback transparente em memória (`in-memory Map`) para modo anônimo
- [X] T007 [US1] Criar ponto de entrada TypeScript `src/services/storage/adapters/storageAdapter.ts` exportando `storageAdapter` com tipagem estrita
- [X] T008 [US1] Refatorar `src/services/storage/authSession.ts` para consumir `storageAdapter` eliminando o import direto de `expo-secure-store`

**Checkpoint**: MVP concluído! A sessão e login funcionam 100% no navegador sem erros do `expo-secure-store`.

---

## Phase 4: User Story 2 - Upload e Manipulação de Imagens na WEB (Priority: P2)

**Goal**: Permitir envio de fotos de coleções, capas e itens na Web via `fetch` HTTP `PUT` com validação de limite de 10MB via `blob.size`.

**Independent Test**: Criar ou editar um item/coleção na Web enviando uma foto local (< 10MB) e verificar que o upload é concluído no S3 sem erros do `FileSystem`.

### Implementation for User Story 2

- [X] T009 [P] [US2] Implementar `src/services/api/adapters/uploadAdapter.native.ts` utilizando `FileSystem.uploadAsync` e `FileSystem.getInfoAsync`
- [X] T010 [P] [US2] Implementar `src/services/api/adapters/uploadAdapter.web.ts` utilizando `fetch` HTTP `PUT` com `Blob` e validação prévia de tamanho via `blob.size`
- [X] T011 [US2] Criar ponto de entrada TypeScript `src/services/api/adapters/uploadAdapter.ts` exportando `uploadAdapter` com tipagem estrita
- [X] T012 [US2] Refatorar `src/services/api/uploadService.ts` para delegar o envio binário e a validação de tamanho de arquivo ao `uploadAdapter`
- [X] T013 [US2] Adicionar guardas de segurança em `src/services/photo-storage/local-provider.ts` para no-op gracioso no navegador em `cleanupLocal` e manipulações de arquivo

**Checkpoint**: Upload de fotos e manipulação de arquivos operando perfeitamente na Web e no Nativo.

---

## Phase 5: User Story 3 - Recorte de Fotos com Canvas na WEB (Priority: P3)

**Goal**: Disponibilizar o ajuste e recorte de foto de perfil e capa na Web utilizando Canvas HTML5, com controle de zoom por botões e scroll wheel.

**Independent Test**: Abrir edição de perfil na Web, escolher foto, ajustar enquadramento/zoom no modal e confirmar, verificando a geração da imagem recortada.

### Implementation for User Story 3

- [X] T014 [US3] Renomear `src/components/settings/ProfilePhotoCropModal.tsx` para `src/components/settings/ProfilePhotoCropModal.native.tsx` preservando a implementação com `ViewShot`
- [X] T015 [P] [US3] Criar `src/components/settings/ProfilePhotoCropModal.web.tsx` com processamento de recorte via HTML5 Canvas, controles de zoom (+ / -) e roda do mouse
- [X] T016 [US3] Renomear `src/components/settings/ProfileBackgroundCropModal.tsx` para `src/components/settings/ProfileBackgroundCropModal.native.tsx` preservando a implementação com `ViewShot`
- [X] T017 [P] [US3] Criar `src/components/settings/ProfileBackgroundCropModal.web.tsx` com processamento de recorte via HTML5 Canvas para a proporção horizontal de capa

**Checkpoint**: Modais de recorte totalmente operacionais no navegador e no celular sem conflitos de `ViewShot`.

---

## Phase 6: Polish & Quality Validation

**Purpose**: Verificação rigorosa de integridade, compilação e formatação

- [X] T018 Executar verificação de tipos com `npm run type-check`
- [X] T019 Executar linter sem warnings com `npm run lint`
- [X] T020 Executar validação de formatação com `npm run format:check`
- [X] T021 [P] Executar o gate completo de validação do projeto com `npm run validate`
- [X] T022 Executar o roteiro de testes do `quickstart.md` na Web com `npm run web`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sem dependências (Início imediato).
- **Phase 2 (Foundational)**: Depende da Phase 1. Bloqueia as fases seguintes.
- **Phase 3 (US1 - Storage)**: Depende da Phase 2. Entrega o MVP funcional.
- **Phase 4 (US2 - Uploads)**: Depende da Phase 2 (pode rodar em paralelo ou sequencialmente após US1).
- **Phase 5 (US3 - Crop Modals)**: Depende da Phase 2 (independente de US1 e US2).
- **Phase 6 (Polish & Quality)**: Depende da conclusão de todas as fases implementadas.

---

## Implementation Strategy

### MVP First (User Story 1 - Storage)

1. Concluir Phase 1 e 2 (Setup e Contratos).
2. Concluir Phase 3 (Storage Adapter).
3. **Validação**: Testar login e refresh no navegador (`npm run web`).

### Incremental Delivery

1. Adicionar Phase 4 (Uploads Web) → Testar envio de imagens.
2. Adicionar Phase 5 (Crop Canvas Web) → Testar recorte de perfil.
3. Executar Phase 6 (Validação unificada via `npm run validate`).
