---
name: commit-batching
description: 'Padronize commits Git com boas praticas: analise o diff completo, agrupe mudancas por assunto, valide qualidade antes de commitar, escreva mensagens claras e publique os commits agrupados com push organizado. Use quando precisar separar alteracoes grandes em commits relevantes, revisar historico de branch, preparar PR e gerar resumo de commits via MCP GitHub.'
argument-hint: 'Qual branch/escopo devo analisar e como voce quer agrupar os commits (por camada, feature, fix, chore)?'
user-invocable: true
compatibility: 'Github MCP, terminal'
disable-model-invocation: false
---

# Commit Batching

Skill para transformar um conjunto grande de alteracoes em um historico de commits limpo, auditavel e facil de revisar.

## Quando usar

- Ha muitas mudancas misturadas no working tree.
- Voce quer dividir em commits por intencao (infra, refactor, feature, docs).
- Voce precisa revisar commits ja feitos e reagrupa-los em blocos logicos.
- Voce quer um resumo de PR baseado nos commits da branch.

## Resultado esperado

- Commits pequenos a medios, cada um com um objetivo claro.
- Mensagens de commit consistentes e orientadas a impacto.
- Branch validada antes do push, com commits agrupados ja publicados no remoto.
- Resumo final da branch pronto para PR.

## Fluxo padrao

1. Diagnosticar estado da branch

- Rodar `git status --short --branch`.
- Confirmar branch atual e remoto (`git branch --show-current`, `git remote -v`).
- Listar mudancas gerais (`git diff --stat`).

2. Classificar mudancas por tema

- Separar por grupos de valor:
  - `chore`: configuracao, tooling, CI, docs operacionais.
  - `refactor`: reorganizacao sem alterar comportamento esperado.
  - `feat`: comportamento novo visivel para usuario.
  - `fix`: correcao de bug/regressao.
- Evitar misturar grupos diferentes no mesmo commit.

3. Aplicar gate de qualidade antes dos commits

- Rodar validacao do projeto (ex.: `npm run validate`).
- Se falhar:
  - corrigir erros bloqueantes;
  - repetir validacao ate passar.
- Nao criar commit com erro conhecido de tipagem/lint/format.

4. Montar commits em partes

- Stage parcial por grupo com `git add` seletivo.
- Revisar o staging com `git diff --cached --stat` e `git diff --cached`.
- Commits recomendados:
  - primeiro: base/chore de infraestrutura;
  - segundo: refactors e centralizacoes;
  - terceiro+: features/fixes por fluxo de produto.

5. Publicar commits agrupados

- Confirmar que todos os grupos planejados viraram commits distintos.
- Conferir a sequencia final com `git log --oneline -n <N>`.
- Publicar os commits da branch:
  - com upstream ainda nao configurado: `git push -u origin <branch>`;
  - com upstream configurado: `git push`.
- Se o push falhar, resolver bloqueio (rejeicao de remoto, conflito, permissao) antes de finalizar.

6. Mensagens de commit

- Preferir formato semantico curto:
  - `docs: ...`
  - `chore: ...`
  - `refactor: ...`
  - `feat: ...`
  - `fix: ...`
- Regra pratica:
  - titulo: objetivo principal;
  - corpo (opcional): contexto, risco, migracao.

7. Verificacao final e publicacao

- Confirmar arvore limpa: `git status --short` deve ficar vazio.
- Revisar historico da branch: `git log --oneline -n <N>`.
- Confirmar branch sincronizada com remoto (`git status --short --branch`).

## Regras de decisao (branching logic)

1. Quando separar em commit novo

- Se altera motivacao tecnica diferente.
- Se altera camada diferente (config vs dominio vs UI).
- Se parte da mudanca pode ser revertida sem afetar o resto.

2. Quando manter junto

- Mudancas pequenas e inseparaveis para o codigo funcionar.
- Ajustes mecanicos diretamente dependentes do commit principal.

3. Quando interromper e pedir alinhamento

- Historico precisa de reescrita destrutiva (`rebase -i` em branch compartilhada).
- Mudancas conflitantes com PR ja em revisao e aprovacoes pendentes.

## Checklist de conclusao

- [ ] Validacao do projeto passou.
- [ ] Cada commit tem um unico proposito.
- [ ] Mensagens de commit estao claras e semanticas.
- [ ] Branch foi publicada sem erros.
- [ ] Resumo de commits para PR foi gerado.

## Resumo de PR com MCP GitHub (opcional)

1. Identificar PR aberto da branch

- Buscar PR por head branch no repositorio.

2. Se houver PR aberto

- Coletar ultimos commits e escopo por commit.
- Publicar resumo unico consolidado como comentario de review (`COMMENT`) com:
  - objetivo da branch;
  - lista de commits (hash curto + titulo);
  - agrupamento logico por tipo (`feat`, `fix`, `refactor`, `chore`, `docs`);
  - principais areas alteradas;
  - status da validacao.

3. Se nao houver PR aberto

- Informar bloqueio claramente.
- Sugerir abrir PR primeiro e depois publicar resumo.

## Prompt examples

- `Use /commit-batching para analisar minha branch e separar em commits relevantes por tema.`
- `Use /commit-batching e publique os commits agrupados em chore, refactor e feat.`
- `Use /commit-batching para revisar, publicar os commits agrupados e gerar um resumo pronto para comentario de PR.`
