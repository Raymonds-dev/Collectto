# Padroes do Projeto Collectto

## 1. Objetivo

Este documento define como executar o projeto e quais praticas seguir para manter o codigo consistente, seguro, facil de evoluir e alinhado ao padrao esperado pelo time e pelos LLMs que atuam no repo.

## 2. Comandos essenciais

### 2.1 Instalar dependencias

```bash
npm install
```

### 2.2 Rodar o app

```bash
npm run start
```

Opcoes uteis:

```bash
npm run android
npm run ios
npm run web
npm run cache:clear
```

### 2.3 Qualidade de codigo

```bash
npm run lint
npm run lint:fix
npm run type-check
npm run format
npm run format:check
npm run validate
```

## 3. Fluxo recomendado no dia a dia

1. Rode `npm install` ao atualizar branch ou trocar de maquina.
2. Inicie com `npm run start` ou `npm run cache:clear` se houver comportamento estranho.
3. Antes de cada commit, rode `npm run validate`.
4. Se `format:check` falhar, rode `npm run format`.
5. Se `lint` falhar, corrija os erros e rode `npm run lint` novamente.
6. Se `type-check` falhar, ajuste a tipagem antes de seguir.

## 4. Regras de TypeScript

1. Ao escrever funcoes TypeScript, use sempre atribuicao com arrow function.
2. Exemplos validos: `const functionName = () => {}`, `const functionName = async () => {}` e `const functionName = (param1: string, param2: number) => {}`.
3. As excecoes para essa regra sao definicoes de componentes React, metodos dentro de classes e callbacks definidos inline.
4. Use anotacoes explicitas de parametros e retorno em funcoes publicas, utilitarios compartilhados e contratos de servico.
5. Evite `any`; prefira `unknown`, unions, interfaces e types semanticos.
6. Mantenha funcoes pequenas, com responsabilidade unica, e use guard clauses quando isso reduzir aninhamento.
7. Para APIs publicas e funcoes complexas, adicione JSDoc quando isso ajudar a esclarecer uso e comportamento.

## 5. Lint, formatacao e qualidade

1. `eslint` deve ficar sem warnings e sem erros.
2. Nao ignore regras com disable sem justificativa clara e curta no proprio trecho.
3. Mantenha importacoes organizadas e remova imports, variaveis e codigo morto nao utilizados.
4. Use nomes claros e consistentes para variaveis, funcoes e componentes.
5. Prefira codigo autoexplicativo; comentarios devem existir apenas quando agregarem contexto real.
6. Respeite a formatacao aplicada por Prettier e rode `npm run format:check` antes de abrir PR.

## 6. Testes

1. Todo novo recurso deve incluir cobertura de testes adequada.
2. Todo bug fix deve incluir teste de regressao.
3. Quando houver suite automatizada no projeto, ela deve passar antes do commit.
4. Use a ferramenta de testes do projeto e nomes de testes descritivos, cobrindo casos de borda e condicoes de erro.
5. Quando testes dependerem de integracoes externas, faca mock dessas dependencias de forma apropriada.
6. Neste repositorio, a validacao oficial continua sendo `npm run validate`; se houver script `test` em uma evolucao futura, ele tambem deve entrar no fluxo pre-commit.

## 7. Padrao de UI e estilos

1. Use tokens centralizados em [src/styles/tailwind/tokens.js](src/styles/tailwind/tokens.js).
2. Nao hardcode cores novas em componentes sem atualizar os tokens.
3. Priorize classes NativeWind com nomenclatura semantica como `brand`, `surface`, `text` e `feedback`.
4. Para modo escuro, use tokens `dark.*` e mantenha contraste de leitura.
5. Prefira `feedback.*Soft` para fundos de alerta e `feedback.*` para texto e icone.
6. Siga o guia de nomenclatura em [src/styles/tailwind/README.md](src/styles/tailwind/README.md).

### 7.1 Excecoes de NativeWind

1. Se o componente nao aplicar corretamente classes NativeWind, use `style` ou `StyleSheet` de forma pontual e controlada.
2. Essa excecao vale para bibliotecas com suporte parcial, como `expo-linear-gradient` e `@expo/vector-icons/Ionicons`.
3. Mesmo usando `style` ou `StyleSheet`, cores, espacamentos e medidas devem vir dos tokens do projeto.
4. Priorize NativeWind para estrutura e layout; use `style` ou `StyleSheet` apenas no trecho que realmente nao funciona com classes.
5. Ao aplicar a excecao, deixe um comentario curto no codigo explicando por que NativeWind nao foi suficiente.
6. Mesmo com uso pontual de `style` ou `StyleSheet`, siga as boas praticas organizacionais definidas em [.github/skills/ui-ux-pro-max/SKILL.md](.github/skills/ui-ux-pro-max/SKILL.md).

## 8. Componentes reutilizaveis

1. Componentes UI ficam em [src/components/ui](src/components/ui).
2. Todo componente reutilizavel deve ter props tipadas.
3. Inclua estados minimos como `disabled`, `loading` e acessibilidade basica quando aplicavel.
4. Evite duplicar logica visual entre telas; extraia para `ui` quando fizer sentido.
5. Mantenha naming consistente, como `secondary` e `success`.

### 8.1 Regra owner vs visitor

1. Nao crie componentes duplicados para a mesma responsabilidade, como `ProfileHeaderView` e `ProfileHeaderEdit`.
2. Use um unico componente, como `ProfileHeader`, com props de controle como `isOwner`, `status` ou `role` para alternar o que e exibido.
3. Centralize a decisao de renderizacao em um ponto unico, como subcomponente interno, funcao utilitaria ou mapeamento de estado.
4. Garanta seguranca no cliente: controles visuais de owner/visitor servem apenas para UX e nao substituem autorizacao no backend.
5. Nunca confie apenas na flag da interface para acao sensivel como editar, excluir ou moderar; valide permissao tambem na API.
6. Para estados invalidos ou faltantes, aplique fallback seguro, escondendo a acao privilegiada e exibindo apenas opcoes publicas.
7. Escreva tipagem explicita para estados de permissao, usando union types quando houver mais de dois perfis.

## 9. Acessibilidade minima

1. Todo botao deve ter `accessibilityRole` e `accessibilityLabel`.
2. Garanta area de toque adequada com `hitSlop` quando necessario.
3. Nao dependa apenas de cor para indicar estado.
4. Preserve contraste adequado entre texto e fundo.

## 10. Expo e navegacao

1. Mantenha `scheme` configurado em [app.json](app.json) para evitar build quebrado com Linking.
2. Se usar Expo Router, mantenha os peers obrigatorios instalados: `expo-constants`, `expo-linking` e `react-native-screens`.
3. Quando houver erro estranho em runtime, tente `npm run cache:clear` primeiro.

## 11. Performance e seguranca

1. Evite re-renders desnecessarios em componentes React.
2. Use memoizacao apenas quando houver beneficio real e mensuravel.
3. Considere lazy loading para componentes nao criticos quando isso melhorar o custo inicial.
4. Valide entradas do usuario e trate erros de forma previsivel.
5. Os erros devem ser tratados e logados com mensagens claras, nao ignorados ou silenciados.
6. Nao armazene dados sensiveis em localStorage ou sessionStorage.
7. Revise dependencias com atencao a vulnerabilidades conhecidas antes de adicionar novas libs.
8. Prefira if statements simples e guard clauses para controle de fluxo complexo, evitando aninhamento profundo.
9. Mantenha funcoes pequenas e com responsabilidade unica para facilitar teste e manutencao.
10. Evite usar `any` em TypeScript, prefira tipos mais especificos ou `unknown` para garantir seguranca de tipo.
11. Use HTTPS para todas as comunicacoes de rede e valide certificados quando fizer chamadas a APIs externas.
12. Implemente tratamento de erros robusto para falhas de rede, incluindo retries exponenciais e feedback claro para o usuario.
13. Evite expor chaves de API ou segredos no codigo cliente; use variaveis de ambiente e proteja essas informacoes no backend sempre que possivel.
14. Mantenha dependencias atualizadas e remova aquelas que nao sao mais necessarias para reduzir a superficie de ataque.

## 12. Checklist rapido antes de PR

1. O projeto sobe com `npm run start`.
2. `npm run validate` passa.
3. Nao existem TODO criticos sem tarefa vinculada.
4. Nao ha cor hardcoded fora do design system.
5. Nao ha regressao visual evidente em light/dark.
6. Rotas e fluxo principal foram testados manualmente.

## 13. Troubleshooting comum

1. Erros apos mudar config Expo: rode `npm run cache:clear`.
2. Inconsistencia de dependencias: rode `npm install` novamente.
3. Erro de tipagem inesperado: rode `npm run type-check` isolado para focar no problema.
4. Erro visual no NativeWind: confirme se o token existe em [src/styles/tailwind/tokens.js](src/styles/tailwind/tokens.js) e se [tailwind.config.js](tailwind.config.js) importa corretamente.

## 14. Skills e quando usar

1. `mock-centralization`: use quando houver mocks, fakes ou fixture data espalhados em telas, providers ou services, ou quando for preciso centralizar dados em [src/mocks](src/mocks).
2. `react-native-architecture`: use quando a tarefa envolver Expo Router, navegacao, integracao nativa, state management, offline-first ou performance de app React Native.
3. `ui-ux-pro-max`: use quando a tarefa envolver interface, layout, interacao, acessibilidade, animacoes, cores, tipografia ou refinamento visual.
