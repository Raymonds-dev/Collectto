# Implementation Plan: Adaptadores e Compatibilidade WEB

**Branch**: `feature/020-web-adapters-compatibility` | **Date**: 2026-09-26 | **Spec**: [spec.md](file:///C:/Users/garam/.projetos/Collectto/frontend/specs/020-web-adapters-compatibility/spec.md)

**Input**: Feature specification from `specs/020-web-adapters-compatibility/spec.md`

## Summary

O objetivo desta implementação é viabilizar o funcionamento completo da aplicação Collectto na **WEB** (`npm run web`), isolando dependências exclusivas de dispositivos móveis através de **adaptadores com extensões de plataforma do Metro bundler (`.web.ts` e `.native.ts`)**. A solução resolve o armazenamento de sessão (`authSession` via `localStorage` com fallback em memória), o envio de imagens (`uploadService` via `fetch` HTTP `PUT` com `Blob`) e o recorte de fotos de perfil e capa (`ProfilePhotoCropModal` e `ProfileBackgroundCropModal` via HTML5 Canvas), preservando a integridade das telas em arquivos únicos sem duplicação de JSX.

---

## Technical Context

**Language/Version**: TypeScript 5.9.2, Node 20+  
**Primary Dependencies**: React 19.1.0, React Native 0.81.5, Expo ~54.0.37, NativeWind, Expo Router ~6.0.24  
**Storage**:
- Web: `window.localStorage` (com fallback transparente em memória `in-memory Map`)
- Native (iOS/Android): `expo-secure-store`  
**Testing & Validation**: Jest, TypeScript Compiler (`tsc --noEmit`), ESLint 9 (`eslint --max-warnings=0`), Prettier  
**Target Platform**: Web (Desktop/Mobile Browsers) + iOS & Android Nativo  
**Project Type**: Mobile App / Web App cross-platform (React Native Web / Expo)  
**Performance Goals**: Tempo de inicialização na Web < 2s; processamento de crop via Canvas em < 100ms; zero vazamento de dependências nativas no bundle Web  
**Constraints**: Zero duplicação de telas; isolamento estrito de infraestrutura; `npm run validate` 100% limpo sem warnings  
**Scale/Scope**: 4 adaptadores de plataforma (`storageAdapter`, `uploadAdapter`, `ProfilePhotoCropModal`, `ProfileBackgroundCropModal`), preservando as 10+ telas e fluxos existentes  

---

## Constitution Check

*GATE: Alinhamento obrigatório com a Constituição v1.3.0 e AGENTS.md*

- [x] **Visual First**: Todas as interfaces preservam elementos visuais e fluidez de apresentação de itens e coleções.
- [x] **Fluidez Acima de Complexidade**: Transições diretas com modais locais e controles de zoom acessíveis via mouse/scroll wheel no desktop.
- [x] **Consistência > Criatividade Isolada**: Reuso dos tokens e componentes de UI existentes (`Button`, `Modal`, tokens do Design System).
- [x] **Arquitetura Multiplataforma (Web & Native)**:
  - *Isolamento de Infraestrutura por Adaptadores*: `storageAdapter.web.ts` / `storageAdapter.native.ts` e `uploadAdapter.web.ts` / `uploadAdapter.native.ts`.
  - *Componente Único de UI*: Nenhuma tela duplicada; preservação total de arquivos únicos de tela.
  - *Fallbacks Nativos*: Uso de HTML5 Canvas em `ProfilePhotoCropModal.web.tsx` para substituir `react-native-view-shot` sem poluir a lógica mobile.
- [x] **Padrões de Código Escrito**: Uso exclusivo de arrow functions atribuídas a constantes para helpers e métodos de serviço; tipagem estrita sem `any`.
- [x] **Gates de Qualidade**: Validação estrita via `npm run validate`.

---

## Project Structure

### Documentation (this feature)

```text
specs/020-web-adapters-compatibility/
├── spec.md              # Especificação de requisitos e cenários
├── plan.md              # Este plano de implementação técnica
├── research.md          # Decisões de arquitetura e tecnologia (Fase 0)
├── data-model.md        # Modelos e contratos de dados (Fase 1)
├── quickstart.md        # Roteiro de validação end-to-end (Fase 1)
├── contracts/           # Interfaces formais dos adaptadores (Fase 1)
│   ├── storage-adapter.contract.ts
│   └── upload-adapter.contract.ts
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code Impact

```text
src/
├── services/
│   ├── storage/
│   │   ├── authSession.ts                       # [MODIFY] Consome storageAdapter unificado
│   │   └── adapters/
│   │       ├── storageAdapter.types.ts          # [NEW] Interface comum StorageAdapter
│   │       ├── storageAdapter.native.ts         # [NEW] Implementação SecureStore (iOS/Android)
│   │       └── storageAdapter.web.ts            # [NEW] Implementação localStorage + in-memory Map
│   │
│   ├── api/
│   │   ├── uploadService.ts                     # [MODIFY] Consome uploadAdapter para envio e validação
│   │   └── adapters/
│   │       ├── uploadAdapter.types.ts           # [NEW] Interface HttpUploadAdapter
│   │       ├── uploadAdapter.native.ts          # [NEW] Implementação FileSystem.uploadAsync
│   │       └── uploadAdapter.web.ts             # [NEW] Implementação fetch/Blob + validação de tamanho
│   │
│   └── photo-storage/
│       └── local-provider.ts                    # [MODIFY] Adiciona guardas de segurança para Platform.OS === 'web'
│
└── components/
    └── settings/
        ├── ProfilePhotoCropModal.tsx            # [RENAME -> .native.tsx]
        ├── ProfilePhotoCropModal.native.tsx     # [NEW/RENAME] Implementação nativa com ViewShot
        ├── ProfilePhotoCropModal.web.tsx        # [NEW] Implementação Web com HTML5 Canvas + botões de zoom
        ├── ProfileBackgroundCropModal.tsx       # [RENAME -> .native.tsx]
        ├── ProfileBackgroundCropModal.native.tsx# [NEW/RENAME] Implementação nativa com ViewShot
        └── ProfileBackgroundCropModal.web.tsx   # [NEW] Implementação Web com HTML5 Canvas
```

**Decisão Estrutural**:
Adotar a convenção oficial do Metro Bundler onde o código consumidor realiza o import direto do módulo (`import { storageAdapter } from './adapters/storageAdapter'`) e o empacotador resolve automaticamente a extensão `.web.ts` ou `.native.ts` correspondente.

---

## Plano de Execução Detalhado

### Etapa 1: Adaptador de Armazenamento (`storageAdapter`)
1. Criar `src/services/storage/adapters/storageAdapter.types.ts` com a interface `StorageAdapter`.
2. Criar `src/services/storage/adapters/storageAdapter.native.ts` utilizando `expo-secure-store`.
3. Criar `src/services/storage/adapters/storageAdapter.web.ts` utilizando `window.localStorage` com fallback para `in-memory Map` caso ocorra `SecurityError` ou bloqueio de cookies.
4. Refatorar `src/services/storage/authSession.ts` para consumir `storageAdapter` ao invés de importar `expo-secure-store` diretamente.

### Etapa 2: Adaptador de Upload e Mídia (`uploadAdapter`)
1. Criar `src/services/api/adapters/uploadAdapter.types.ts` com a interface `HttpUploadAdapter`.
2. Criar `src/services/api/adapters/uploadAdapter.native.ts` encapsulando `FileSystem.uploadAsync` e `FileSystem.getInfoAsync`.
3. Criar `src/services/api/adapters/uploadAdapter.web.ts` utilizando `fetch(uploadUrl, { method: 'PUT', body: blob })` e cálculo de tamanho via `blob.size`.
4. Refatorar `src/services/api/uploadService.ts` para delegar o envio binário e a validação de arquivo para o `uploadAdapter`.
5. Em `src/services/photo-storage/local-provider.ts`, adicionar guardas para que na Web as operações de sistema de arquivos não disparem erros e `cleanupLocal` execute no-op seguro.

### Etapa 3: Modais de Recorte Multiplataforma (`ProfilePhotoCropModal` & `ProfileBackgroundCropModal`)
1. Renomear `ProfilePhotoCropModal.tsx` para `ProfilePhotoCropModal.native.tsx`.
2. Criar `ProfilePhotoCropModal.web.tsx` utilizando HTML5 Canvas para renderizar a imagem com `scale`, `translateX` e `translateY`, exportando a imagem via `toDataURL('image/png')`, incluindo controles acessíveis de zoom (+ / -) e roda do mouse.
3. Renomear `ProfileBackgroundCropModal.tsx` para `ProfileBackgroundCropModal.native.tsx`.
4. Criar `ProfileBackgroundCropModal.web.tsx` aplicando o mesmo algoritmo de Canvas adaptado para o aspect ratio horizontal de capa de perfil.

### Etapa 4: Validação e Conformidade
1. Executar `npm run type-check` garantindo que o compilador de TypeScript reconheça os contratos em todas as plataformas.
2. Executar `npm run lint` e `npm run format`.
3. Executar o gate oficial `npm run validate`.
4. Testar a inicialização Web com `npm run web`.

---

## Complexity Tracking

*Nenhuma violação aos princípios da Constituição v1.3.0 foi introduzida.*
