# Research Notes: Auth, Items, and Collections Enhancements

Este documento resume a investigação técnica e as decisões tomadas para a implementação de autenticação com refresh token, movimentação de itens via PATCH, e visibilidade na criação de coleções.

## 1. Contratos da API de Autenticação (de `collecto-api-docs.json`)

Com base na tag `auth-controller` do arquivo `collecto-api-docs.json`, os endpoints de autenticação e seus esquemas de dados são:

### POST `/auth/login`
* **Descrição**: Valida as credenciais do usuário e retorna o token de acesso (accessToken) e o token de atualização (refreshToken).
* **Payload de Retorno (`LoginResponse`)**:
  ```json
  {
    "userId": "uuid",
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer"
  }
  ```

### POST `/auth/refresh`
* **Descrição**: Valida o refresh token ativo e retorna um novo par de tokens.
* **Payload de Envio (`RefreshTokenRequest`)**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
* **Payload de Retorno (`TokenRefreshResponse`)**:
  ```json
  {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer"
  }
  ```

---

## 2. Estratégia de Refresh Interceptor e Fila de Requisições (Queue)

### Desafio Técnico
Se o token de acesso expirar e múltiplas requisições assíncronas falharem ao mesmo tempo (com status 401), todas tentariam fazer a chamada ao endpoint `/auth/refresh` individualmente. Com a rotação de token habilitada (Token Rotation), o primeiro refresh bem-sucedido invalidará o token de refresh original, fazendo com que as chamadas subsequentes de refresh falhem e o usuário seja desconectado.

### Solução
Implementar uma fila de pendências no arquivo `src/services/api/interceptors.ts` usando um padrão clássico de interceptor do Axios:

1. **Estado do Refresh**:
   * Uma flag booleana `isRefreshing` para saber se a chamada de `/auth/refresh` já está ativa.
   * Uma fila de callbacks `failedRequestsQueue` que enfileira as requisições 401 pendentes: `Array<{ resolve: (token: string) => void; reject: (error: any) => void }>`
2. **Fluxo de Intercepção**:
   * Ao detectar um erro 401 em uma chamada de API (que não seja de login ou refresh):
     * Se `isRefreshing === true`, cria uma nova Promise que resolve com o token retornado pelo refresh ativo, e adiciona seu callback de resolução na fila.
     * Se `isRefreshing === false`, define `isRefreshing = true` e dispara a requisição `/auth/refresh` enviando o `refreshToken` atual armazenado no `SecureStore`.
     * Quando o refresh retornar sucesso:
       * Atualiza os tokens no `SecureStore` e no cabeçalho do Axios.
       * Resolve todas as Promises na fila passando o novo `accessToken` para que as requisições pendentes sejam reexecutadas.
       * Define `isRefreshing = false` e limpa a fila.
     * Se o refresh falhar:
       * Limpa a sessão (tokens) no `SecureStore`.
       * Rejeita todas as Promises na fila.
       * Executa o fluxo de logout silencioso chamando `sessionRefreshManager.handleUnauthorized()`.

---

## 3. Reutilização de Componentes e Interface de Edição de Itens

### Mover Itens
A tela de edição de item (`src/app/collections/edit-item/[itemId].tsx`) já dispõe de um modal para mover o item que renderiza o componente `CollectionCreationForm`.
* Atualmente, o método `itemService.moveItem` lança um erro na API real.
* A alteração consistirá em modificar a chamada de `itemService.moveItem` no arquivo `src/services/api/crudServices.ts` para executar a requisição PATCH para `items/update/{itemId}` enviando `{ collectionId: targetCollectionId }`.
* Como o componente `CollectionCreationForm` já permite a seleção da coleção, não haverá necessidade de criar novas estruturas visuais para mover itens.

### Visibilidade ao Criar Coleção
A criação de uma coleção utiliza o componente `CollectionCreationForm.tsx` (ou similar) que atualmente não possui um seletor de visibilidade.
* Iremos modificar a interface do formulário de criação de coleção para incluir um seletor nativo do Expo (`@react-native-picker/picker`) ou um controle segmentado contendo as opções `PRIVATE` (Padrão), `PUBLIC` e `FRIENDS`.
* Essa informação será enviada no corpo da requisição POST `/collections/create`.
