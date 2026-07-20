# Quickstart Guide: Social Feed Integration

Este guia rápido orienta sobre como testar e validar localmente as funcionalidades de integração da tela de Feed/Home, incluindo interações de curtir, comentar (com tratamento de teclado e exclusão de comentários) e compartilhamento.

## 1. Comandos de Validação e Qualidade

Antes de efetuar commits ou abrir um PR, garanta que o projeto esteja livre de erros de compilação ou warnings de linter rodando a suite de validação completa:

```bash
# Executa a validação completa (TypeScript, ESLint e Prettier)
npm run validate
```

Para corrigir erros de estilo automaticamente:

```bash
# Corrige formatação e regras de lint auto-fixáveis
npm run lint:fix
npm run format
```

---

## 2. Cenários de Testes Locais

### Cenário A: Comportamento do Teclado na Tela de Comentários
1. Abra o aplicativo na aba Home (Feed).
2. Toque no botão de comentário de qualquer publicação para abrir o modal de comentários.
3. Clique no campo de entrada de texto (`TextInput`) na parte inferior do modal.
4. **Verificação (no Android e no iOS)**:
   * A janela ou o contêiner do modal deve se ajustar automaticamente para cima de forma fluida.
   * O campo de digitação e o botão de enviar **não** devem ser obstruídos pelo teclado nativo.
   * O usuário deve conseguir ler o texto enquanto digita.

### Cenário B: Exclusão de Comentário Próprio
1. Abra o modal de comentários de uma publicação.
2. Digite um comentário e toque no botão de enviar (ícone de seta/avião).
3. Localize o comentário que você acabou de enviar (identificado por `isAuthor` ativo).
4. **Verificação**:
   * O comentário deve exibir um botão/ícone de lixeira (`trash-outline`) no lado direito.
   * Ao tocar no ícone de lixeira, deve surgir um alerta nativo de confirmação: *"Excluir comentário? Esta ação não pode ser desfeita."* com opções de *"Cancelar"* e *"Excluir"*.
   * Ao selecionar *"Excluir"*, o comentário deve ser removido localmente imediatamente (de forma otimista) e o contador de comentários do post no feed deve decrementar em 1.
   * Outros comentários de terceiros **não** devem exibir o ícone de lixeira.

### Cenário C: Redirecionamento para a Coleção do Item
1. Na lista do feed, localize um card de item.
2. Toque no nome da coleção associada ao item (ex: "Coleção de Moedas").
3. **Verificação**:
   * O aplicativo deve navegar com sucesso para a rota `/collections/[collectionId]` correspondente àquela coleção.
   * Ao clicar no botão de voltar na barra de cabeçalho da tela de coleção, o usuário deve retornar exatamente para a mesma posição no feed principal.

### Cenário D: Verificação da BaseURL e Chamada de Likes
1. Execute o app e comece a interagir com os likes (ícone de coração).
2. **Verificação nos Logs/Network**:
   * As requisições de feed, likes e comentários devem estar apontando para o endpoint base `https://api.collectto.app` (ex: `https://api.collectto.app/posts/...`).
   * A curtida deve atualizar a UI localmente e disparar a requisição de rede em background de forma transparente.
