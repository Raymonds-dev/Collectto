# Plano de Implementação: Integração do Feed Social e Interações (Baseado na API)

**Branch**: `feature/017-integrate-social-feed` | **Date**: 2026-06-11 | **Spec**: [spec.md](file:///C:/Users/garam/.projetos/Collectto/frontend/specs/017-integrate-social-feed/spec.md)
**Input**: Especificação da funcionalidade de `/specs/017-integrate-social-feed/spec.md`

---

## Summary

Esta funcionalidade realiza a integração da tela de Feed/Home do aplicativo Collectto com os endpoints mapeados no `collecto-api-docs.json` sob as tags "item-controller" e "social-controller". O plano de implementação abrange:
1. Mapeamento e consumo da API real para as rotas:
   - `GET /social/feed` (buscar feed social paginado)
   - `POST /items/like/{itemId}` e `DELETE /items/like/{itemId}` (curtir e descurtir itens)
   - `POST /items/comment/{itemId}` (comentar em itens)
   - `DELETE /items/comment/{commentId}` (excluir comentário próprio)
   - `GET /items/comments/{itemId}` (buscar comentários paginados de um item)
2. Adaptação do componente `KeyboardAvoidingView` no modal de comentários para que no iOS e Android a tela suba de forma fluida quando o teclado for exibido.
3. Exibição de botão de exclusão de comentário condicionado à autoria do comentário (`comment.isAuthor === true`) e fluxo de exclusão segura.
4. Certificação da baseURL padrão como `'https://api.collectto.app'`.

---

## Technical Context

**Language/Version**: TypeScript ~5.9.2, Node 20+  
**Primary Dependencies**: React Native 0.81.5, Expo 54.0.34, Axios 1.16.1, NativeWind, Expo Router, Ionicons  
**Storage**: Cache local para imagens do feed e integração direta de API  
**Testing**: Jest, jest-expo  
**Target Platform**: iOS, Android  
**Project Type**: mobile-app  
**Performance Goals**: Tempo de renderização inicial do feed < 1,5 segundos; animações de teclado e modais rodando a 60fps.  
**Constraints**: 
  - BaseURL configurada como `'https://api.collectto.app'`.
  - Tratamento de teclado agnóstico que funcione em iOS e Android.
  - Reutilização dos componentes existentes na estrutura do projeto.

---

## Constitution Check

_GATE: Passou antes da fase 0 de pesquisa. Re-verificado após design._

- [x] **Arrow Functions**: Declaração de funções auxiliares e callbacks utilizando atribuições de arrow functions para constantes.
- [x] **Tipagem Estrita**: Nenhuma utilização de `any` para novas props (ex: prop de callback de exclusão e tipos de resposta da API).
- [x] **Microinterações e Motion**: Utilização de componentes animados existentes (como `AnimatedPressable`) para feedback visual no clique da exclusão de comentário.
- [x] **Acessibilidade Mínima**: O botão de lixeira para excluir comentário deve ter `accessibilityRole="button"`, `accessibilityLabel="Excluir comentário"` e `hitSlop` adequado.
- [x] **Segurança e Validação**: Confirmação visual (`Alert.alert`) antes da exclusão definitiva de comentários.

---

## Project Structure

A estrutura segue rigorosamente a arquitetura existente no projeto, alterando apenas os arquivos estritamente necessários:

```text
src/
├── app/
│   └── (tabs)/
│       └── index.tsx                         # Integrar consumo da API de feed, likes e comentários
├── components/
│   └── comments/
│       ├── Comment.tsx                       # Adicionar botão de exclusão condicionado a isAuthor
│       └── CommentThread.tsx                 # Envolver flatlist/input em KeyboardAvoidingView e controlar requisições de comentários/delete
├── mocks/
│   └── comments.ts                           # Adicionar a função deleteCommentFromPost para simulação local/testes
```

**Structure Decision**: Toda a implementação se apoia nos arquivos de componentes existentes do diretório `src/components/comments/` e nas rotas existentes em `src/app/`, evitando arquivos redundantes ou estruturas extras.

---

## Complexity Tracking

_Não há violações identificadas. Toda a implementação se apoia nas convenções oficiais da Constituição e reutiliza componentes e padrões já presentes no repositório._
