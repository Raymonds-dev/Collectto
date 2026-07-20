# Quickstart Guide: Auth, Items, and Collections Enhancements

Este guia rápido orienta sobre como testar e validar localmente as novas funcionalidades de autenticação (refresh token), movimentação de itens e visibilidade de coleções.

## 1. Comandos de Validação e Qualidade

Antes de commitar qualquer alteração, garanta que o projeto não possui erros de compilação ou warnings de linter:

```bash
# Executa a validação completa (TypeScript, ESLint e Prettier)
npm run validate
```

Para aplicar correções automáticas de estilo e formatação:

```bash
# Corrige arquivos de código automaticamente
npm run validate:fix
```

---

## 2. Cenários de Testes Locais

### Cenário A: Validação do Refresh Token Silencioso
1. Realize o login no aplicativo móvel com credenciais válidas.
2. Aguarde a expiração natural do token de acesso ou simule a expiração forçando o vencimento do tempo de expiração do JWT.
3. Navegue entre as abas ou abra uma coleção para forçar uma requisição de API.
4. **Verificação**:
   * O aplicativo NÃO deve retornar à tela de login.
   * O console ou logs devem indicar o disparo da rota `/auth/refresh` enviando o `refreshToken`.
   * As requisições simultâneas devem ser seguradas em fila e completadas com sucesso após a resposta do refresh.

### Cenário B: Movimentação de Itens entre Coleções
1. Navegue até a tela de detalhes de um item pertencente à Coleção A.
2. Clique no botão de Ações Rápida ou Editar para abrir o formulário.
3. Clique no botão de movimento ("Mover" ou seta para a direita) para abrir a lista de coleções.
4. Escolha a Coleção B e confirme.
5. **Verificação**:
   * O item deve sumir da Coleção A e passar a pertencer à Coleção B.
   * A requisição disparada deve ser uma requisição PATCH para `/items/update/{itemId}` contendo a propriedade `collectionId`.

### Cenário C: Escolha de Visibilidade ao Criar Coleção
1. Clique no botão de criação de uma nova coleção.
2. Na tela do formulário de criação, selecione uma das opções de visibilidade no dropdown/picker: `PRIVATE`, `PUBLIC` ou `FRIENDS`.
3. Salve a coleção.
4. **Verificação**:
   * A coleção deve ser criada com o status de visibilidade correspondente escolhido pelo usuário.
   * Ao inspecionar os detalhes da coleção, a visibilidade deve estar correta.
