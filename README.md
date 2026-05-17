# Collectto

Aplicativo mobile em React Native com Expo Router, autenticacao local e design system via NativeWind.

## Visao geral

O projeto usa estrutura de rotas por pastas (Expo Router) com dois grupos principais:

- `(auth)`: telas de autenticacao
- `(tabs)`: area autenticada com abas

A sessao e persistida localmente com `expo-secure-store`.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- Expo Router 6
- TypeScript
- NativeWind + Tailwind CSS
- ESLint + Prettier

## Requisitos

- Node.js 20+
- npm 10+
- Expo Go (opcional para testes rapidos)
- Android Studio e/ou Xcode (para emuladores)

## Instalacao

```bash
npm install
```

## Executando o projeto

```bash
npm run start
```

Comandos úteis:

```bash
npm run android
npm run ios
npm run web
npm run cache:clear
```

## Scripts disponiveis

- `npm run start`: inicia o bundler Expo (Expo Go)
- `npm run android`: abre no Android (Expo Go)
- `npm run ios`: abre no iOS (Expo Go)
- `npm run web`: abre no Web
- `npm run prebuild`: gera projetos nativos
- `npm run lint`: executa ESLint
- `npm run lint:fix`: corrige problemas de lint automaticamente
- `npm run format`: formata arquivos com Prettier
- `npm run format:check`: valida formatacao
- `npm run type-check`: validacao de tipos TypeScript
- `npm run validate`: executa type-check + lint + format:check

## Estrutura do projeto

```text
src/
  app/
    _layout.tsx            # AuthGate + Stack raiz
    (auth)/                # fluxo nao autenticado
    (tabs)/                # fluxo autenticado
  components/              # componentes reutilizaveis
  hooks/                   # hooks customizados
  providers/               # providers de contexto
  services/                # acesso a APIs/storage
  styles/                  # global.css + tokens do Tailwind
  types/                   # tipos TypeScript
```

## Fluxo de autenticacao

1. `AuthProvider` faz bootstrap da sessao ao iniciar.
2. O token e lido de `expo-secure-store` (`src/services/authSession.ts`).
3. `AuthGate` em `src/app/_layout.tsx` decide redirecionamento:
   - sem usuario: envia para `/(auth)/login`
   - com usuario: envia para `/(tabs)/profile`
4. O login atual usa sessao mock local.

## Estilo e Design System

- Tokens centralizados em `src/styles/tailwind/tokens.js`
- Configuracao Tailwind em `tailwind.config.js`
- Estilos globais em `src/styles/global.css`

Leia tambem:

- `src/styles/tailwind/README.md`

## Qualidade de codigo

Antes de abrir PR, rode:

```bash
npm run validate
```

## Fluxo de branches e PR

Consulte o guia em `BRANCHING.md` para padrao de nomes de branch, abertura de PR e revisao.

## Solucao de problemas

- Se o app nao navegar corretamente, limpe cache:

```bash
npm run cache:clear
```

- Se houver erro relacionado ao Router no Android, confirme dependencias:
  - `expo-constants`
  - `expo-linking`
  - `react-native-screens`

## Licenca

Projeto privado (`private: true`). Defina a licenca do repositorio antes de distribuicao publica.
