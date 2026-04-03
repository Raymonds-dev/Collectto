---
name: mock-centralization
description: 'Centralize mocks in src/mocks by domain for React Native/TypeScript projects. Use when refactoring TODO(api), mock, fake, fixture data, moving decentralized constants, creating new mock domains, fixing imports, and validating with npm run validate plus lint/format fixes.'
argument-hint: 'Quais arquivos ou telas devem ter mocks centralizados?'
compatibility: 'Use esta skill para projetos React Native com TypeScript que possuem mocks descentralizados. Ideal para organizar dados fake por dominio, facilitar refatoracao futura para API real, e garantir consistencia de importacoes e qualidade de codigo.'
disable-model-invocation: false
user-invocable: true
---

# Mock Centralization

Skill para padronizar a centralizacao de mocks em projetos React Native/TypeScript, com foco em organizacao por dominio e seguranca de refatoracao.

## Quando Usar

- Quando houver mocks espalhados em telas, providers, componentes ou services.
- Quando existir TODO(api) indicando troca futura para API real.
- Quando o projeto precisar de organizacao por dominio dentro de src/mocks.
- Quando for necessario mover dados fake sem quebrar imports.

## Resultado Esperado

- Mocks localizados em src/mocks e separados por dominio.
- Um ponto de entrada unico em src/mocks/index.ts com reexports.
- Consumo dos mocks via imports consistentes.
- Projeto validado com npm run validate.

## Fluxo Obrigatorio

1. Identificar mocks descentralizados da pasta src/mocks.
2. Classificar cada mock por dominio existente.
3. Criar novo dominio em src/mocks quando nenhum dominio atual servir.
4. Mover o mock para o arquivo de dominio apropriado.
5. Atualizar imports nos consumidores e remover definicoes antigas.
6. Garantir reexport em src/mocks/index.ts.
7. Rodar validacao final e corrigir problemas automaticamente.

## Procedimento Detalhado

### 1) Descoberta

- Buscar sinais de mock no codigo com termos: TODO(api), mock, fake, fixture, placeholder.
- Priorizar arquivos de UI e providers onde mocks costumam aparecer.
- Montar lista de candidatos com arquivo e simbolo.

Comando sugerido:

```bash
rg -n "TODO\(api\)|mock|fake|fixture|placeholder" src
```

### 2) Decisao de Dominio

Usar esta logica de decisao:

- Auth/sessao/login/perfil autenticado: src/mocks/auth.ts
- Perfil publico/hashtag/colecoes no perfil: src/mocks/profile.ts
- Itens de colecao/detalhes/fallback de imagem de colecao: src/mocks/collections.ts
- Nao se encaixa nos dominios atuais: criar novo arquivo de dominio em src/mocks/<dominio>.ts

Regras para criar novo dominio:

- Nome curto e semantico (ex.: notifications, settings, onboarding).
- Exportar apenas dados e builders mock desse contexto.
- Evitar mistura de dominios no mesmo arquivo.

### 3) Centralizacao

- Mover constantes, arrays, builders e placeholders para o dominio escolhido.
- Preservar comentarios TODO(api) junto dos mocks que representam contratos futuros.
- Remover mock inline do arquivo consumidor apos migracao.

### 4) Importacoes

- Atualizar consumidores para importar de @/mocks (via barrel) ou do dominio, conforme padrao do projeto.
- Garantir que src/mocks/index.ts reexporte todos os dominios.

Checklist de import:

- Nenhum import quebrado apos mover simbolos.
- Nenhum simbolo duplicado entre dominios.
- Nenhuma referencia ao mock antigo permaneceu no arquivo original.

### 5) Qualidade e Validacao

Sempre executar nesta ordem:

```bash
npm run validate
```

Se houver erro de lint/formatacao, executar:

```bash
npm run lint:fix && npm run format
```

Depois, executar novamente:

```bash
npm run validate
```

## Criterios de Conclusao

- Todos os mocks descentralizados mapeados no escopo da tarefa foram movidos.
- Cada mock esta em um dominio coerente dentro de src/mocks.
- Novos dominios foram criados quando necessario.
- Imports e reexports foram corrigidos.
- Validacao final passou sem erros.

## Anti-Padroes

- Criar um unico arquivo gigante de mocks sem separacao por dominio.
- Deixar TODO(api) sem o mock correspondente no dominio correto.
- Atualizar apenas parte dos imports e manter duplicidade de fonte de verdade.
- Encerrar a tarefa sem rodar npm run validate.

## Prompts de Exemplo

- Centralize os mocks de autenticacao e perfil que ainda estao inline fora de src/mocks.
- Encontre TODO(api) de mocks na aba collections e mova para o dominio certo.
- Revise src e crie um novo dominio de mocks para notificacoes, depois ajuste imports e valide.
