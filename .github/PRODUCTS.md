## 📌 Visão Geral do Produto

O **Collectto** é um aplicativo mobile que funciona como uma rede social voltada para colecionadores.

O principal objetivo é permitir que usuários:

- Organizem suas coleções pessoais
- Cataloguem itens com detalhes
- Interajam com outros colecionadores

O app combina dois pilares principais:

1. **Gestão de coleções (organização pessoal)**
2. **Interação social (feed e engajamento)**

---

## 🎯 Objetivo do Produto

Criar uma experiência mobile simples, intuitiva e visualmente agradável para que usuários consigam:

- Registrar e organizar suas coleções
- Visualizar coleções de outros usuários
- Compartilhar itens e interagir socialmente

---

## 📱 Plataforma

- Aplicativo **mobile**
- Desenvolvido em **React Native**
- Foco total em experiência mobile (não considerar desktop)

---

## 🧩 Estrutura Funcional (Escopo)

O front-end deve contemplar os seguintes módulos:

### 1. Autenticação e Acesso

- Tela de login
- Tela de cadastro
- Estados de loading e erro

---

### 2. Perfil do Usuário

- Visualização do perfil
- Foto de perfil
- Informações básicas do usuário
- Lista de coleções do usuário

---

### 3. Coleções

- Criação de coleções
- Listagem de coleções
- Visualização de uma coleção específica

Cada coleção contém:

- Nome
- Descrição
- Lista de itens

---

### 4. Itens (Catalogação)

- Cadastro de itens dentro de uma coleção
- Visualização detalhada de itens

Cada item pode conter:

- Nome
- Descrição
- Imagem
- Informações adicionais

---

### 5. Feed (Rede Social)

- Lista de publicações (feed)
- Conteúdos relacionados a coleções e itens
- Interações básicas (ex: visualização de posts)

---

### 6. Notificações

- Tela de notificações
- Lista de atividades relevantes do usuário

---

## 🚫 Não Escopo (IMPORTANTE)

O front-end **NÃO deve considerar ou implementar**:

- ❌ Marketplace (compra e venda)
- ❌ Transações financeiras
- ❌ Chat ou mensagens diretas
- ❌ Grupos ou fóruns
- ❌ Integração com APIs externas de catálogo
- ❌ Sistema de gamificação (pontos, badges, etc.)
- ❌ Avatares customizáveis/3D

Esses pontos **não devem influenciar decisões de UI, navegação ou arquitetura**.

---

## 🧠 Regras de Produto (Importante para o Agente)

- O app é **centrado em coleções**, não em posts genéricos
- O feed existe, mas é um complemento — não o núcleo
- A navegação deve priorizar:
  - Perfil
  - Coleções
  - Itens

- A experiência deve ser:
  - Simples
  - Visual
  - Intuitiva

---

## 🧭 Navegação Esperada (Alto nível)

- Login / Cadastro
- Home / Feed
- Explorar
- Perfil
- Coleções
- Notificações

---

## 🎨 UI/UX Guidelines

- Interface limpa e moderna
- Foco em imagens (colecionáveis são visuais)
- Componentes reutilizáveis
- Feedback visual (loading, empty states, erros)

---

## 🔄 Estados que DEVEM ser tratados

Todas as telas devem considerar:

- Loading
- Erro
- Lista vazia
- Conteúdo carregado

---

## 📦 Tipo de Dados (Visão do Front)

### Usuário

- id
- nome
- foto
- bio

### Coleção

- id
- nome
- descrição
- lista de itens

### Item

- id
- nome
- descrição
- imagem

### Post (Feed)

- id
- usuário
- conteúdo (coleção ou item)
- data

---

## ⚠️ Considerações Técnicas para o Front

- O front consome APIs (não definir lógica de negócio complexa)
- Foco em:
  - Componentização
  - Navegação
  - Estado da UI

---

## ✅ Resumo

O Collectto é um app mobile que:

- Organiza coleções pessoais
- Permite catalogar itens
- Possui elementos de rede social

Mas **não é um marketplace nem um app de mensagens**.

O front-end deve refletir isso claramente.
