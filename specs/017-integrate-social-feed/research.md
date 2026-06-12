# Research: integrate-social-feed

**Feature**: integrate-social-feed  
**Date**: 2026-06-11  

---

## 1. Evitar Obstrução do Teclado no iOS e Android

### Decision
Utilizar o componente nativo `KeyboardAvoidingView` do React Native para envolver a visualização da tela de comentários (`CommentThread.tsx`).
- No **iOS**, o `behavior` será definido como `"padding"`.
- No **Android**, o `behavior` será definido como `"height"` ou `undefined` (deixando o sistema gerenciar baseado no `windowSoftInputMode`).
- Um ajuste dinâmico do `keyboardVerticalOffset` será aplicado considerando a barra de navegação/insets.

### Rationale
O `KeyboardAvoidingView` é a solução padrão do React Native, eliminando a necessidade de instalar bibliotecas de terceiros como `react-native-keyboard-aware-scroll-view`. Ele lida perfeitamente com a subida do input dentro de Modals do Expo Router.

### Alternatives considered
- **react-native-keyboard-aware-scroll-view**: Rejeitado para evitar novas dependências de pacotes não triviais no projeto, preservando a simplicidade e a estabilidade.
- **Funções nativas exclusivas do Android**: Rejeitado conforme requisitos do usuário de ter suporte multiplataforma idêntico.

---

## 2. UI de Exclusão de Comentários

### Decision
Exibir um botão com ícone de lixeira (Ionicons `trash-outline` na cor de feedback de erro) à direita do comentário caso `comment.isAuthor` seja verdadeiro.
Ao clicar, será exibido um alerta de confirmação nativo (`Alert.alert`) com os botões "Cancelar" e "Excluir". Se confirmado, chama-se o método de exclusão.

### Rationale
Oferece uma UI limpa, acessível e intuitiva para o usuário, ao mesmo tempo que previne exclusões acidentais através do alerta de confirmação.

### Alternatives considered
- **Swipe-to-delete (Deslizar para excluir)**: Rejeitado por aumentar a complexidade visual e de gestos desnecessariamente para a primeira versão (MVP).

---

## 3. Alteração da BaseURL da API

### Decision
Confirmar que o arquivo `src/services/api/config.ts` possui a constante `DEFAULT_BASE_URL` apontando para `'https://api.collectto.app'`.

### Rationale
A baseURL já foi atualizada na constante centralizada, o que propaga as chamadas automaticamente para todas as requisições que consomem a instância do Axios ou fetch configurados com ela.

### Alternatives considered
Nenhuma alternativa considerada, pois centralizar em `config.ts` é a boa prática estabelecida no projeto.
