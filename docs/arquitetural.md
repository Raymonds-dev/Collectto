# Documentação Arquitetural — Collectto

---

# Visão Geral

## Objetivo

O Collectto frontend é um aplicativo mobile em React Native organizado em camadas bem definidas: roteamento por sistema de arquivos (Expo Router), estado global via React Context, comunicação com API REST via cliente HTTP centralizado com singleton e interceptors, e design system por tokens com NativeWind.

## Contexto

O frontend é um dos dois componentes do produto Collectto. Ele consome uma API REST backend (não gerenciada neste repositório) e faz upload direto de imagens para um serviço de armazenamento externo (S3-compatible). O usuário final acessa o app em dispositivos Android e iOS.

---

# Visão de Contexto

## Diagrama de Contexto

```mermaid
flowchart LR
    Usuario["Usuário (Android/iOS)"] --> App["Collectto App\n(React Native)"]
    App --> API["API REST Backend"]
    App --> Storage["Object Storage\n(S3-compatible)"]
    API --> Storage
```

### Explicação

- O **usuário** interage com o app mobile (Android ou iOS).
- O **app** consome a **API REST backend** para todas as operações de dados (auth, coleções, itens, feed, notificações).
- O **app** realiza upload de imagens diretamente para o **Object Storage** via presigned URLs geradas pela API — a API não processa o arquivo diretamente.
- A **API** também acessa o Storage para operações de leitura e geração de URLs.

---

# Componentes de Alto Nível

## Principais Componentes

- **Expo Router (app/):** Roteamento por sistema de arquivos. Define grupos `(auth)` e `(tabs)`, além de stacks aninhados para coleções e usuários.
- **Providers:** Camada de estado global via React Context. `AuthProvider` gerencia sessão JWT; `NotificationProvider` gerencia notificações; providers de coleção/item/post encapsulam estado de contexto.
- **HTTP Client (services/api/):** Singleton `HttpClient` baseado em Axios com interceptors de autenticação, retry automático e tratamento padronizado de erros.
- **Services:** Funções de endpoint por domínio (usuários, coleções, itens, feed, uploads, notificações).
- **Components/UI:** Componentes reutilizáveis do design system com props tipadas e acessibilidade mínima.
- **Design System (styles/):** Tokens centralizados em `tokens.js`, classes utilitárias via NativeWind/Tailwind.

## Diagrama de Componentes

```mermaid
flowchart TB
    subgraph App["Collectto App"]
        Router["Expo Router\n(app/)"]
        subgraph Providers["Providers"]
            Auth["AuthProvider"]
            Notif["NotificationProvider"]
            CtxProviders["Collection/Item/Post\nContext Providers"]
        end
        subgraph Services["Services Layer"]
            HttpClient["HttpClient\n(Singleton + Interceptors)"]
            PhotoStorage["PhotoStorage\n(Upload + Cache)"]
            AuthService["Auth Service\n(Secure Store)"]
        end
        Components["Components/UI\n(Design System)"]
    end

    Router --> Providers
    Providers --> Services
    Router --> Components
    HttpClient --> API["API REST Backend"]
    PhotoStorage --> Storage["Object Storage"]
```

---

# Fluxos Arquiteturais

## Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant App
    participant AuthProvider
    participant SecureStore
    participant API

    App->>AuthProvider: Bootstrap (inicialização)
    AuthProvider->>SecureStore: Lê token salvo
    SecureStore-->>AuthProvider: Token (ou vazio)
    AuthProvider->>API: GET users/me (com token)
    API-->>AuthProvider: Dados do usuário (ou 401)
    AuthProvider-->>App: user + isLoading=false
    App->>App: AuthGate decide rota inicial
```

## Fluxo de Upload de Imagem

```mermaid
sequenceDiagram
    participant App
    participant API
    participant Storage

    App->>API: POST uploads/presigned-urls
    API-->>App: URLs pré-assinadas
    App->>Storage: PUT imagem (upload direto)
    Storage-->>App: 200 OK
    App->>API: POST items/create (com URL da imagem)
    API-->>App: Item criado
```

## Fluxo de Refresh de Token

```mermaid
sequenceDiagram
    participant Request
    participant Interceptor
    participant API
    participant SecureStore

    Request->>Interceptor: Requisição com token expirado
    Interceptor->>API: POST auth/refresh (refresh token)
    API-->>Interceptor: Novo access token
    Interceptor->>SecureStore: Salva novo token
    Interceptor->>Request: Reenvia requisição original
```

---

# Integrações

## Sistemas Externos

| Sistema | Tipo de Integração | Finalidade |
| ------- | ------------------ | ---------- |
| API REST Backend | HTTPS / REST (Axios) | Dados de usuários, coleções, itens, feed e notificações |
| Object Storage (S3-compatible) | HTTPS / PUT direto | Upload de imagens de perfil e itens via presigned URLs |

---

# Requisitos Arquiteturais

- **Multiplataforma:** O app deve funcionar corretamente em Android e iOS com comportamento consistente entre plataformas.
- **Segurança de sessão:** Tokens JWT armazenados exclusivamente via `expo-secure-store` (não em AsyncStorage ou localStorage).
- **Resiliência de rede:** O cliente HTTP aplica retry automático com backoff exponencial para falhas transitórias.
- **Desempenho:** Evitar re-renders desnecessários; uso de memoização apenas onde há benefício mensurável.

---

# Restrições Arquiteturais

- O frontend é exclusivamente mobile; não é considerado suporte a desktop.
- O estado de autenticação e autorização no cliente serve apenas para UX; toda validação real ocorre na API.
- Não há persistência offline; todas as operações requerem conectividade.
- Secrets e chaves de API não devem ser expostos no bundle do app; usar variáveis de ambiente `EXPO_PUBLIC_*` apenas para valores não sensíveis.

---

# Referências

- [Documentação Funcional](./funcional.md)
- [Documentação Técnica](./tecnica.md)
