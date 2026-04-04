---
name: merge-develop
description: Realiza o merge da branch 'develop', analisa as alterações e auxilia na resolução de conflitos, priorizando a não exclusão de lógicas de negócio.
---

# Workflow de Merge da Branch Develop

Esta skill automatiza o processo de merge da branch `develop` na sua branch atual. Ela foi desenhada para analisar as alterações, identificar o que há de novo, o que pode ser mesclado e, principalmente, como resolver conflitos de forma segura.

O princípio fundamental é **não apagar nenhuma lógica de negócio**. Se um conflito de lógica for encontrado e não puder ser resolvido imediatamente, a skill manterá ambas as implementações e adicionará um comentário `TODO` para que a equipe possa revisá-lo posteriormente. Isso evita quebras inesperadas e perda de código.

## Passo a Passo

### 1. Verificação do Estado Atual
- A skill verificará se há alterações não commitadas no seu repositório para garantir um merge limpo.

### 2. Fetch das Últimas Alterações
- Executará `git fetch origin` para garantir que todas as referências remotas estejam atualizadas.

### 3. Merge da Branch 'develop'
- A branch `develop` será mesclada na sua branch atual com o comando `git merge origin/develop`.

### 4. Análise de Conflitos
- Se houver conflitos, a skill analisará os arquivos conflitantes.
- **Conflitos simples**: Serão resolvidos automaticamente quando possível.
- **Conflitos de lógica**: A skill identificará blocos de código conflitantes. Em vez de apagar uma das versões, ela combinará ambas e adicionará um comentário, como:
  ```
  // TODO: Conflito de merge - revisar lógica duplicada
  // --- Lógica da sua branch ---
  ...código...
  // --- Lógica da branch develop ---
  ...código...
  ```

### 5. Análise de Novas Funcionalidades
- Após o merge (e a resolução dos conflitos), a skill analisará o `git diff` para apresentar um resumo das novas funcionalidades e alterações que foram integradas da `develop`.

### 6. Finalização
- Ao final, você terá um resumo do que foi feito e uma lista de `TODOs` para os conflitos que precisam de revisão manual.
