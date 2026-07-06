# Documentação Funcional — Collectto

---

# Visão Geral

## Objetivo

O Collectto é uma rede social mobile para colecionadores. Ele permite que usuários organizem suas coleções pessoais, cataloguem itens e interajam com outros colecionadores por meio de um feed social.

## Problema

Colecionadores não possuem uma ferramenta dedicada que combine gestão pessoal de acervo com interação social. Ferramentas genéricas (planilhas, apps de notas) não oferecem contexto de comunidade, e redes sociais genéricas não suportam catalogação estruturada de itens.

## Solução

Um aplicativo mobile que une dois pilares: **gestão de coleções** (organização e catalogação de itens) e **interação social** (feed e engajamento entre colecionadores).

---

# Escopo

## Dentro do Escopo

- Autenticação de usuários (login e cadastro)
- Gerenciamento de perfil (foto, bio, informações básicas)
- Criação, listagem e visualização de coleções
- Cadastro e visualização de itens dentro de coleções
- Feed de publicações relacionadas a coleções e itens
- Tela de notificações com atividades relevantes do usuário
- Interação social básica (seguir usuários, visualizar coleções públicas)

## Fora do Escopo

- Marketplace (compra e venda entre usuários)
- Transações financeiras de qualquer tipo
- Chat ou mensagens diretas entre usuários
- Grupos, fóruns ou comunidades
- Integração com APIs externas de catálogo (ex: APIs de quadrinhos, selos, etc.)
- Sistema de gamificação (pontos, badges, rankings)
- Avatares customizáveis ou representações 3D

---

# Usuários e Papéis

## Perfis de Usuário

| Perfil | Descrição | Responsabilidade |
| ------ | --------- | ---------------- |
| Colecionador (dono) | Usuário autenticado dono do perfil | Gerenciar suas coleções, itens e configurações de conta |
| Visitante | Usuário autenticado visualizando perfil de outro | Visualizar coleções e itens públicos de outros usuários |

---

# Funcionalidades Principais

- **Autenticação:** Login com JWT, cadastro de nova conta, persistência segura de sessão
- **Perfil:** Visualização e edição de dados pessoais, foto de perfil, bio
- **Coleções:** Criar, listar, visualizar e excluir coleções pessoais
- **Itens:** Cadastrar, visualizar e excluir itens dentro de uma coleção (com nome, descrição e imagem)
- **Feed:** Visualizar publicações de outros colecionadores com conteúdo de coleções e itens
- **Explorar:** Descobrir coleções e usuários públicos
- **Notificações:** Acompanhar atividades relevantes como novos seguidores

---

# Fluxos Principais

## Fluxo de Autenticação

### Descrição

O usuário acessa o app, que verifica se há uma sessão ativa antes de direcionar para login ou área autenticada.

### Passos

1. App inicializa e o `AuthProvider` faz bootstrap da sessão lendo token do `expo-secure-store`.
2. `AuthGate` avalia o estado: com token válido → redireciona para `/(tabs)/profile`; sem token → redireciona para `/(auth)/tela_inicial`.
3. Usuário realiza login com e-mail e senha.
4. API retorna access token + refresh token; sessão é persistida localmente.
5. App entra na área autenticada.

## Fluxo de Criação de Coleção

### Descrição

Usuário cria uma nova coleção a partir do seu perfil.

### Passos

1. Usuário acessa seu perfil e toca em "Nova coleção".
2. Preenche nome e descrição e confirma.
3. App envia `POST /collections/create` para a API.
4. Coleção aparece na listagem do perfil.

## Fluxo de Adição de Item

### Descrição

Usuário adiciona um item a uma coleção existente.

### Passos

1. Usuário acessa uma coleção e toca em "Adicionar item".
2. Preenche nome, descrição e seleciona imagem da galeria.
3. App faz upload da imagem via URL pré-assinada (`uploads/presigned-urls`) e envia `POST /items/create`.
4. Item aparece na listagem da coleção.

---

# Regras de Negócio

- Somente o dono da coleção pode criar, editar ou excluir itens e coleções.
- Controles visuais de dono/visitante são apenas para UX; a autorização é validada pela API.
- O feed exibe publicações de coleções e itens, não posts genéricos sem contexto.
- Coleções são o núcleo do produto; o feed é um complemento.
- A navegação prioriza Perfil → Coleções → Itens.

---

# Premissas

- O usuário possui conectividade com a internet para todas as operações (sem suporte offline).
- A autorização e regras de negócio complexas são responsabilidade da API backend.
- Upload de imagens ocorre diretamente para armazenamento externo via URL pré-assinada.

---

# Glossário

| Termo | Significado |
| ----- | ----------- |
| Coleção | Agrupamento criado pelo usuário para organizar itens de um mesmo tema |
| Item | Objeto individual catalogado dentro de uma coleção |
| Feed | Lista de publicações de outros colecionadores |
| JWT | JSON Web Token — mecanismo de autenticação stateless |
| Presigned URL | URL temporária gerada pela API para upload direto de arquivos |

---

# Referências

- [Documentação Técnica](./tecnica.md)
- [Documentação Arquitetural](./arquitetural.md)
- [Contexto do Produto](.github/PRODUCTS.md)
