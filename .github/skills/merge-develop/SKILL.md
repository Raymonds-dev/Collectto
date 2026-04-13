---
name: merge-develop
description: Realiza o merge da branch 'develop', analisa as alterações e auxilia na resolução de conflitos, priorizando a não exclusão de lógicas de negócio.
---

# Workflow de Merge da Branch Develop

Esta skill automatiza o processo de merge da branch `develop` na sua branch atual. Ela complementa a skill genérica de merge com as regras específicas do fluxo de develop e com um cuidado extra para não perder lógica de negócio.

O princípio fundamental é **não apagar nenhuma lógica de negócio**. Quando houver conflito de comportamento, preserve a intenção das duas branches, extraia um helper se isso reduzir duplicação e, se não houver resolução segura no momento, mantenha o trecho mais completo possível com um `TODO` curto para revisão posterior.

## Regras de Ouro

- Não descarte comportamento silenciosamente para “resolver rápido”.
- Conflitos simples de formatação ou reorganização devem ser resolvidos de forma objetiva.
- Conflitos que alterem fluxo, dados, validação ou efeitos colaterais devem ser analisados antes de concluir.
- Sempre que o merge de `develop` trouxer mudanças amplas, revisar o diff final é obrigatório.

## Passo a Passo

### 1. Verificação do Estado Atual

- A skill verificará se há alterações não commitadas no seu repositório para garantir um merge limpo.

### 2. Fetch das Últimas Alterações

- Executará `git fetch origin` para garantir que todas as referências remotas estejam atualizadas.

### 3. Merge da Branch 'develop'

- A branch `develop` será mesclada na sua branch atual com o comando `git merge origin/develop`.
- Se o projeto usar outra convenção para tracking remoto, siga a convenção existente, sem forçar um caminho diferente.

### 4. Análise de Conflitos

- Se houver conflitos, a skill analisará os arquivos conflitantes.
- **Conflitos simples**: Serão resolvidos automaticamente quando possível.
- **Conflitos de lógica**: A skill identificará blocos de código conflitantes. Em vez de apagar uma das versões sem análise, ela tentará preservar ambas as intenções, podendo combinar trechos ou extrair um ponto comum. Se não houver resolução segura, manterá o bloco mais completo possível e adicionará um comentário, como:
  ```
  // TODO: Conflito de merge - revisar lógica duplicada
  // --- Lógica da sua branch ---
  ...código...
  // --- Lógica da branch develop ---
  ...código...
  ```

### 5. Análise de Novas Funcionalidades

- Após o merge (e a resolução dos conflitos), a skill analisará o `git diff` para apresentar um resumo das novas funcionalidades e alterações que foram integradas da `develop`.
- Se algum conflito exigir preservação manual, o resumo deve apontar explicitamente o que ficou pendente.

### 6. Finalização

- Ao final, você terá um resumo do que foi feito e uma lista de `TODOs` para os conflitos que precisam de revisão manual.
