# Documentação Técnica — Collectto

---

# Visão Geral Técnica

## Tecnologias Utilizadas

- **React Native 0.81** com **React 19**
- **Expo SDK 54** + **Expo Router 6** (roteamento por sistema de arquivos)
- **TypeScript 5.9**
- **NativeWind** (Tailwind CSS para React Native) com design system por tokens
- **Axios** com cliente HTTP centralizado (Singleton + interceptors)
- **expo-secure-store** para persistência segura de tokens
- **react-native-reanimated 4** para animações
- **Jest** + **Testing Library React Native** para testes
- **ESLint + Prettier** para qualidade de código

## Objetivo Técnico

App mobile em React Native com Expo Router, autenticação JWT persistida com Secure Store, design system via NativeWind com tokens centralizados, e comunicação com API REST via cliente HTTP com interceptors de autenticação e retry automático.

---

# Estrutura do Projeto

## Organização do Código

```text
frontend/
├── src/
│   ├── app/                    # Rotas (Expo Router file-based routing)
│   │   ├── _layout.tsx         # Layout raiz: providers, AuthGate, Stack
│   │   ├── (auth)/             # Grupo de rotas não autenticadas
│   │   │   ├── tela_inicial.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/             # Grupo de rotas autenticadas com abas
│   │   │   ├── index.tsx       # Feed
│   │   │   ├── explore.tsx     # Explorar
│   │   │   ├── profile.tsx     # Perfil do usuário
│   │   │   └── create-item.tsx
│   │   ├── collections/        # Rotas de coleções (stack aninhado)
│   │   └── users/              # Rotas de perfis de usuários
│   ├── components/             # Componentes reutilizáveis
│   │   └── ui/                 # Componentes do design system
│   ├── hooks/                  # Custom hooks
│   ├── mocks/                  # Dados mock centralizados por domínio
│   ├── providers/              # Context providers
│   │   ├── AuthProvider.tsx    # Sessão, login, logout, refresh
│   │   ├── HttpClientProvider.tsx
│   │   ├── NotificationProvider.tsx
│   │   └── index.tsx           # Composição de providers de contexto
│   ├── services/               # Acesso a APIs e storage
│   │   ├── api/                # Cliente HTTP + endpoints REST
│   │   ├── auth/               # Serviços de autenticação
│   │   ├── debug/              # Flags e sessão de debug
│   │   ├── photo-storage/      # Upload e cache local de fotos
│   │   └── storage/            # Wrappers de persistência local
│   ├── styles/                 # Design system
│   │   ├── global.css          # Classes base e utilitários globais
│   │   └── tailwind/
│   │       ├── tokens.js       # Tokens centralizados (cores, espaçamento)
│   │       └── README.md       # Guia de nomenclatura do design system
│   └── types/                  # Definições TypeScript por domínio
├── docs/                       # Documentação técnica e funcional
├── specs/                      # Especificações de features
├── app.json                    # Configuração Expo (scheme, name, etc.)
├── tailwind.config.js          # Configuração do Tailwind + NativeWind
└── jest.config.js              # Configuração de testes
```

## Responsabilidades por Camada

| Camada | Responsabilidade |
| ------ | ---------------- |
| `app/` | Definição de rotas e layouts via Expo Router (file-based routing) |
| `components/ui/` | Componentes visuais reutilizáveis do design system |
| `providers/` | Estado global via React Context (auth, notificações, coleções, itens) |
| `services/api/` | Cliente HTTP centralizado, interceptors e funções de endpoint |
| `services/auth/` | Leitura/escrita de tokens e lógica de sessão |
| `services/photo-storage/` | Upload de imagens via presigned URLs e cache local |
| `hooks/` | Lógica reutilizável encapsulada em custom hooks |
| `mocks/` | Dados centralizados para debug e testes |
| `types/` | Contratos de tipos TypeScript por domínio |
| `styles/` | Tokens de design e estilos globais |

---

# Dependências

## Dependências Externas

| Dependência | Finalidade |
| ----------- | ---------- |
| API REST backend | Fonte de dados principal (usuários, coleções, itens, feed) |
| Serviço de armazenamento (S3-compatible) | Upload direto de imagens via presigned URLs |
| `expo-secure-store` | Armazenamento seguro local para tokens JWT |

---

# Configuração do Sistema

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
| -------- | --------- | ------- |
| `EXPO_PUBLIC_API_BASE_URL` | URL base da API backend | `https://api.collectto.com` |

> **Nota:** A variável deve ter o prefixo `EXPO_PUBLIC_` para ser exposta ao bundle do Expo. Se não definida, o app usa a URL padrão de desenvolvimento definida em `src/services/api/config.ts`.

## Perfis de Execução

- **Dev local:** `npm run start` — bundler Expo com hot reload
- **Debug mode:** Flag controlada por `src/services/debug/debugFlags.ts` — usa dados mock da sessão de debug em vez da API real
- **Produção:** Build via EAS (`eas.json`) com variáveis de ambiente injetadas no build

---

# Build e Execução

## Como Executar Localmente

```bash
# Instale as dependências
npm install

# Inicie o bundler Expo (abre QR code para Expo Go)
npm run start

# Para Android (emulador ou dispositivo)
npm run android

# Para iOS (apenas macOS)
npm run ios

# Se houver comportamento estranho, limpe o cache
npm run cache:clear
```

## Qualidade de Código

```bash
# Verificação de tipos TypeScript
npm run type-check

# Lint (deve passar sem warnings)
npm run lint

# Correção automática de lint
npm run lint:fix

# Formatação com Prettier
npm run format

# Validação completa (type-check + lint + format:check)
npm run validate
```

---

# Testes

## Como Executar Testes

```bash
# Rodar todos os testes
npm run test

# Rodar com cobertura
npm run test:coverage
```

Os testes usam Jest + Testing Library React Native. Integrações externas (API, storage) devem ser mockadas. A validação oficial antes de cada PR é `npm run validate`.

---

# Design System

## Tokens e Estilos

- Tokens centralizados em `src/styles/tailwind/tokens.js`
- Nomenclatura semântica: `brand`, `surface`, `text`, `feedback`
- Modo escuro via tokens `dark.*`
- Guia de nomenclatura em `src/styles/tailwind/README.md`
- Não hardcodar cores em componentes; sempre referenciar tokens

---

# Limitações Técnicas

- O app requer conectividade com internet; não há suporte offline.
- Upload de imagens depende de geração de presigned URL pela API antes do envio direto ao storage.
- O modo debug (`debugFlags.ts`) substitui chamadas à API por dados mock; não deve ser ativado em produção.

---

# Referências

- [Documentação Funcional](./funcional.md)
- [Documentação Arquitetural](./arquitetural.md)
- [Design System — README dos tokens](../src/styles/tailwind/README.md)
- [API Services — README](../src/services/api/README.md)
