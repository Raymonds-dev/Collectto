# Convencoes de Branches e Pull Requests

Este guia define o fluxo de trabalho para criar branches, abrir PRs e revisar codigo no projeto Collectto.

## 1. Estrategia de branches

- `main`: branch estavel e pronta para producao.
- Toda mudanca deve nascer de uma branch propria.
- Nunca commitar direto em `main`.

## 2. Padrao de nome das branches

Use o formato:

```text
<tipo>/<descricao-curta>
```

Tipos recomendados:

- `feature/`: nova funcionalidade
- `fix/`: correcao de bug
- `refactor/`: refatoracao sem alterar comportamento funcional
- `chore/`: tarefa tecnica (deps, config, scripts, docs internas)
- `docs/`: documentacao
- `hotfix/`: correcao urgente em producao

Exemplos:

- `feature/login-social`
- `feature/profile-edit`
- `fix/auth-redirect-loop`
- `chore/update-eslint-config`
- `docs/branching-guide`

## 3. Como criar uma branch

Partindo da `main` atualizada:

```bash
git checkout main
git pull origin main
git checkout -b feature/nome-da-feature
```

## 4. Commits

Boas praticas:

- Commits pequenos e focados.
- Mensagens claras no imperativo.
- Evite misturar mudancas sem relacao.

Padrao sugerido:

```text
<tipo>: <descricao>
```

Exemplos:

- `feat: adiciona fluxo de login`
- `fix: corrige redirecionamento apos logout`
- `docs: adiciona guia de branches`

## 5. Como abrir Pull Request

Para branches com prefixos `feature/`, `fix/`, `refactor/`, `chore/` e `docs/`, o PR para `develop` e aberto automaticamente pelo CI ao fazer push.

Para branches com prefixo `hotfix/`, o PR e aberto automaticamente direto para `main`.

1. Envie sua branch:

```bash
git push origin feature/nome-da-feature
```

2. No GitHub, clique em "Compare & pull request".
3. Preencha titulo e descricao com contexto de negocio e tecnico.
4. Vincule issue/tarefa quando existir.
5. Adicione reviewers responsaveis.

Observacao: se a automacao criar o PR automaticamente, apenas complemente os detalhes necessarios na descricao.

Observacao importante: a cada push em qualquer branch, a CI executa validacoes de lint, type-check e formatacao. O merge deve acontecer somente com checks passando.

Titulo sugerido de PR:

```text
[tipo] resumo curto da mudanca
```

Exemplos:

- `[feature] tela de perfil com dados do usuario`
- `[fix] corrige persistencia da sessao`

## 6. Checklist antes de abrir PR

- Codigo compila e roda localmente.
- `npm run validate` executado sem erros.
- Sem arquivos temporarios ou debug sobrando.
- Mudancas revisadas pelo proprio autor.
- Escopo da PR esta claro e limitado.

## 7. Guia de revisao de PR

Ao revisar, foque em:

- Correta implementacao da regra de negocio.
- Risco de regressao.
- Legibilidade e manutencao do codigo.
- Cobertura de casos de erro e estados de loading.
- Compatibilidade com padroes do projeto.

Checklist rapido para review:

- Funciona no fluxo feliz e no fluxo de erro.
- Nao quebra navegacao/autenticacao.
- Nao introduz efeitos colaterais ocultos.
- Mantem padrao de nomenclatura e estrutura.

## 8. Merge da PR

- Preferencia por "Squash and merge" para manter historico limpo.
- Requer pelo menos 1 aprovacao.
- Nao fazer merge com checks falhando.
- Apos merge, deletar branch remota.

Para `develop -> main`, existe automacao para abertura do PR de release e solicitacao de revisao. O merge em `main` deve acontecer somente apos revisao e aprovacao.

Para `hotfix -> main`, o owner precisa participar da revisao/aprovacao antes do merge.

## 9. Fluxo resumido

1. Criar branch com prefixo correto (`feature/`, `fix/`, `refactor/`, `chore/`, `docs/` ou `hotfix/`).
2. Implementar mudanca em commits pequenos.
3. Rodar validacoes locais (`npm run validate`).
4. Fazer push para disparar CI e abertura automatica de PR.
5. Revisar, ajustar feedback e aprovar.
6. Mergear e remover branch.
