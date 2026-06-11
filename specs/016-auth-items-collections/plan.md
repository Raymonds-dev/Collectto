# Plan de Implementação: Melhorias em Autenticação, Itens e Coleções

**Branch**: `016-auth-items-collections` | **Data**: 2026-06-09 | **Spec**: [spec.md](file:///C:/Users/garam/.projetos/Collectto/frontend/specs/016-auth-items-collections/spec.md)
**Input**: Especificação de funcionalidade de `/specs/016-auth-items-collections/spec.md`

## Summary

Esta funcionalidade adiciona suporte ao fluxo de rotação de refresh tokens no frontend (integração do `/auth/refresh` com interceptador de chamadas 401 e enfileiramento de requisições pendentes), possibilita mover itens para outras coleções através do endpoint PATCH `/items/{itemId}` enviando `collectionId` (utilizando a interface existente de edição de item) e possibilita definir a visibilidade ao criar coleções (valores suportados: `PUBLIC`, `PRIVATE` e `FRIENDS`), tudo de forma segura e sem criar arquivos desnecessários.

## Technical Context

**Language/Version**: TypeScript ~5.9.2, Node 20+  
**Primary Dependencies**: React Native 0.81.5, Expo 54.0.34, axios 1.16.1, expo-secure-store, nativewind, react-native-reanimated  
**Storage**: expo-secure-store (para persistência de `accessToken` e `refreshToken` de forma criptografada)  
**Testing**: Jest, jest-expo, @testing-library/react-native  
**Target Platform**: iOS, Android, Web  
**Project Type**: mobile-app  
**Performance Goals**: Silenciosamente atualizar token expirado em < 300ms, retentar requisições sem travamento ou loops infinitos.  
**Constraints**: Apenas online para ações de escrita (verificar NetInfo), rotação rígida de refresh token, sem criação de arquivos redundantes ou componentes isolados ad-hoc.  
**Scale/Scope**: Adaptações focadas no fluxo de autenticação e na tela de edição de item.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Arrow Functions**: Auxiliares, helpers, utilitários, hooks e callbacks devem usar arrow functions atribuídas a constantes.
- [x] **Tipagem Estrita**: Evitar o tipo `any` em todos os novos contratos ou tipos alterados (ex: `UpdateItemRequest`).
- [x] **Fila e Resiliência**: Enfileiramento de requisições interceptadas em fila de espera para evitar refreshes redundantes.
- [x] **Sanitização de Logs**: Não exibir tokens, JWTs ou senhas nos logs do console durante o processo de refresh ou login.
- [x] **Reutilização**: Uso dos componentes e hooks existentes (`ItemForm`, `CollectionCreationForm`, `useItemEdit`) para adicionar o seletor de coleção e controle de visibilidade.

## Project Structure

### Documentation (this feature)

```text
specs/016-auth-items-collections/
├── plan.md              # Este arquivo (Implementation Plan)
├── research.md          # Fase 0 - Pesquisa e Resoluções das Dúvidas Técnicas
├── data-model.md        # Fase 1 - Modificações nos Contratos de Dados e Tipos
└── quickstart.md        # Fase 1 - Guia rápido de execução e testes
```

### Source Code (repository root)

Modificações direcionadas nos seguintes caminhos existentes (sem criar arquivos adicionais):

```text
src/
├── app/
│   └── collections/
│       └── edit-item/
│           └── [itemId].tsx                  # Ajustar UI do formulário de edição para mover itens
├── components/
│   └── create-item/
│       └── CollectionCreationForm.tsx        # Adicionar seletor de visibilidade (dropdown/picker)
├── hooks/
│   └── useItemEdit.ts                        # Incluir gerenciamento de coleção e visibilidade no estado do formulário
├── providers/
│   └── AuthProvider.tsx                      # Salvar e gerenciar o refreshToken no login e limpar no logout
├── services/
│   ├── api/
│   │   ├── api.ts                            # Expor o endpoint /auth/refresh via cliente http
│   │   ├── crudServices.ts                   # Implementar moveItem chamando a api PATCH de item com collectionId
│   │   └── interceptors.ts                   # Modificar o interceptador 401 para fazer o refresh silencioso e gerenciar a fila
│   ├── auth/
│   │   └── sessionRefreshManager.ts          # Integrar chamadas de refresh e temporizadores de sessão
│   └── storage/
│       └── authSession.ts                    # Criar funções auxiliares para salvar/ler o refreshToken usando expo-secure-store
└── types/
    ├── collections.ts                        # Adicionar o campo `visibility` opcional para criação de coleções
    └── items.ts                              # Adicionar o campo `collectionId` em UpdateItemRequest
```

**Structure Decision**: A estrutura segue rigorosamente a arquitetura existente no projeto, alterando apenas os arquivos estritamente necessários para manter a coesão do código e a separação de responsabilidades (services para chamadas de rede/armazenamento, providers para estado global, screens/components para UI).

## Complexity Tracking

_Não há violações identificadas. Toda a implementação se apoia nas convenções oficiais de arquitetura e reutiliza componentes já presentes na aplicação._
