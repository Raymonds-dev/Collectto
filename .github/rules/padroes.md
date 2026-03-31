# Padroes do Projeto Collectto

## 1. Objetivo

Este documento define como executar o projeto, como usar os linters e quais praticas seguir para manter o codigo consistente, seguro e facil de evoluir.

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
5. Se `lint` falhar, corrija erros e rode `npm run lint` novamente.
6. Se `type-check` falhar, ajuste tipagem antes de seguir.

## 4. Regras de lint e tipagem

1. `lint` deve ficar sem warnings e sem erros.
2. Nao ignorar regras com disable sem justificativa clara.
3. Tipos explicitos em componentes compartilhados.
4. Evitar `any`; prefira unions, interfaces e types semanticos.
5. Resolver warnings de importacao e ordenacao antes de abrir PR.

## 5. Padrao de UI e estilos

1. Usar tokens centralizados em [src/styles/tailwind/tokens.js](src/styles/tailwind/tokens.js).
2. Nao hardcodar cores novas em componentes sem atualizar tokens.
3. Priorizar classes NativeWind com nomenclatura semantica (`brand`, `surface`, `text`, `feedback`).
4. Para modo escuro, usar tokens `dark.*` e manter contraste de leitura.
5. Preferir `feedback.*Soft` para fundos de alerta e `feedback.*` para texto/icone.
6. Seguir guia de nomenclatura em [src/styles/tailwind/README.md](src/styles/tailwind/README.md).

### 5.1 Excecoes de NativeWind (obrigatoria)

1. Se o componente nao aplicar corretamente classes NativeWind, usar `style` ou `StyleSheet` de forma pontual e controlada.
2. Essa excecao vale para bibliotecas com suporte parcial, como `expo-linear-gradient` e `@expo/vector-icons/Ionicons`.
3. Mesmo usando `style`/`StyleSheet`, as cores, espacamentos e medidas devem vir dos tokens do projeto, sem hardcode novo.
4. Priorizar NativeWind para estrutura e layout; usar `style`/`StyleSheet` apenas no trecho que realmente nao funciona com classes.
5. Ao aplicar excecao, deixar um comentario curto no codigo explicando por que NativeWind nao foi suficiente.
6. Mesmo com uso pontual do `style`/`StyleSheet`, utilize de boa práticas organizacionais definidas em `.agents\skills\ui-ux-pro-max\SKILL.md`

## 6. Componentes reutilizaveis

1. Componentes UI ficam em `src/components/ui`.
2. Todo componente reutilizavel deve ter props tipadas.
3. Incluir estados minimos: `disabled`, `loading` e acessibilidade basica quando aplicavel.
4. Evitar duplicar logica visual entre telas; extrair para `ui`.
5. Manter naming consistente (`secondary`, `success`)

### 6.1 Regra owner vs visitor (obrigatoria)

1. Nao criar componentes duplicados para a mesma responsabilidade (ex.: `ProfileHeaderView` e `ProfileHeaderEdit`).
2. Usar um unico componente (ex.: `ProfileHeader`) com props de controle (`isOwner`, `status`, `role` ou equivalente) para alternar o que e exibido.
3. Centralizar a decisao de renderizacao em um ponto unico (subcomponente interno, funcao utilitaria ou mapeamento de estado), evitando logica espalhada na tela.
4. Garantir seguranca no cliente: controles visuais de owner/visitor servem apenas para UX e nao substituem autorizacao no backend.
5. Nunca confiar apenas na flag da interface para acao sensivel (editar, excluir, moderar); validar permissao tambem na API (pergunte caso seja necessário, desde quy verique essa possibilidade).
6. Para estados invalidos ou faltantes, aplicar fallback seguro (ex.: esconder acao privilegiada e exibir apenas opcoes publicas).
7. Escrever tipagem explicita para estados de permissao (union types), evitando `boolean` ambiguo quando houver mais de dois perfis.

## 7. Acessibilidade minima

1. Todo botao deve ter `accessibilityRole` e `accessibilityLabel`.
2. Garantir area de toque adequada com `hitSlop` quando necessario.
3. Nao depender apenas de cor para indicar estado.
4. Preservar contraste adequado entre texto e fundo.

## 8. Expo e navegacao

1. Manter `scheme` configurado em [app.json](app.json) para evitar build quebrado com Linking.
2. Se usar Expo Router, manter peers obrigatorios instalados (`expo-constants`, `expo-linking`, `react-native-screens`).
3. Quando houver erro estranho em runtime, tentar `npm run cache:clear` primeiro.

## 9. Checklist rapido antes de PR

1. Projeto sobe com `npm run start`.
2. `npm run validate` ok.
3. Sem TODO critico sem task vinculada.
4. Sem cor hardcoded fora do design system.
5. Sem regressao visual evidente em light/dark.
6. Rotas e fluxo principal testados manualmente.

## 10. Troubleshooting comum

1. Erros apos mudar config Expo: rode `npm run cache:clear`.
2. Inconsistencia de dependencias: rode `npm install` novamente.
3. Erro de tipagem inesperado: rode `npm run type-check` isolado para focar no problema.
4. Erro visual no NativeWind: confirmar se token existe em `tokens.js` e se `tailwind.config.js` importa corretamente.
