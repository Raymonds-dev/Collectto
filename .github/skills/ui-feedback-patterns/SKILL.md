---
name: ui-feedback-patterns
description: 'Implement and standardize visual and tactile feedback loops (colors, animations, alerts, and modals) for seamless UX. Use when designing forms, empty states, error handling, and destructive actions to ensure consistency.'
argument-hint: 'Quais fluxos, telas ou formulários precisam de revisão de feedback visual?'
compatibility: 'React Native (Expo), TailwindCSS (NativeWind), and Reanimated.'
disable-model-invocation: false
user-invocable: true
---

# UI Feedback Patterns

Skill para implementar, revisar e padronizar os feedbacks visuais e táteis no projeto. A comunicação do estado do app com o usuário deve ser clara, imediata e alinhada ao Design System.

## Quando Usar

- Ao implementar formulários que exigem validação (erro/sucesso).
- Ao criar fluxos que contenham estados vazios (empty states) interativos.
- Ao solicitar confirmações de ações destrutivas (ex.: "Descartar", "Excluir").
- Ao revisar telas poluídas com excesso de labels (ex.: remover asteriscos ou "(Opcional)").
- Ao precisar de componentes modais ou alertas do sistema.

## Diretrizes de UX e Design System

### 1. Limpeza Visual (Clean UI)
- **Regra**: Evite poluir formulários com indicações de "Obrigatório" (`*`) ou "Opcional".
- **Ação**: O usuário deve seguir o fluxo naturalmente. A validação (feedback de erro) deve ocorrer **no momento em que ele tenta avançar ou salvar** sem os dados necessários, ou ao interagir incorretamente com o componente em tempo real.

### 2. Cores Semânticas de Feedback
- Utilize exclusivamente as cores mapeadas no arquivo `tokens.js` e consumidas via `tokens.native.ts`.
- **Erro/Destrutivo**: Use tons vermelhos (`feedback.error`).
  - Fundo suave para dar destaque sem agressividade: `bg-feedback-errorSoft`.
  - Texto e bordas: `text-feedback-error` e `border-feedback-error`.
- **Sucesso**: Use tons verdes (`feedback.success`).
  - Fundo suave: `bg-feedback-successSoft`.
  - Texto e bordas: `text-feedback-success`.
- **Informativo/Destaque**: Use as cores da marca (`brand.primary` e `brand.100` para soft).

### 3. Componentes Reutilizáveis de Feedback
- Todo componente reutilizável criado para modais, alertas ou interações base deve ser posicionado dentro do diretório `src/components/ui/` ou `src/components/ui/animated/` (se for altamente baseado em animações fluidas).
- Nunca duplique um componente que faça as mesmas coisas, apenas altere as `props` ou `variants`.
- **Exemplo**: O sistema de modais deve utilizar o `src/components/ui/Modal.tsx`, aceitando uma `prop` de variante (`type="danger" | "success" | "info"`) para orquestrar as cores do background suave e o ícone semanticamente correto.
- **Interatividade (Tátil)**: Áreas clicáveis (como Empty States) devem usar o `Pressable` ou variantes animadas (`AnimatedPressable`, `Button`) para fornecer feedback ao toque (diminuição de opacidade, hover no web, animações de scala).

### 4. Fluxos de Confirmação (Prevenção de Perda de Dados)
- Não utilize diretamente `Alert.alert` da API nativa se houver um modal customizado da marca. Use o componente `Modal.tsx`.
- Sempre faça bloqueios (Modais de confirmação) para interações que resultem em perda de rascunhos, dados não salvos ou exclusão permanente.

## Fluxo Obrigatório

1. **Análise do Problema**: Verifique onde o usuário pode ficar perdido, cometer erros, ou se sentir sem resposta.
2. **Definição do Tipo de Feedback**: É um feedback temporário? Um erro de formulário? Uma confirmação crítica?
3. **Reuso**: Verifique se os componentes base (`Button`, `Modal`, `MotionView`) em `src/components/ui/` atendem a necessidade.
4. **Aplicação do Estilo**: Configure o componente utilizando a arquitetura do NativeWind ligada aos *tokens* de `feedback.*`.
5. **Teste o Fluxo**: Simule erro, sucesso e cancelamento da ação.
6. **Validação**: Rode os scripts do projeto.

## Validando seu Trabalho

Execute a esteira de validação padrão do projeto para garantir não ter introduzido erros de formatação ou tipagem:

```bash
npm run validate
```

Se precisar corrigir automaticamente erros de estilo:

```bash
npm run validate:fix
```

## Anti-Padrões

- Adicionar textos redundantes na interface ("* Campo obrigatório") em vez de guiar o erro organicamente ou através de modais/labels coloridas dinâmicas.
- Cores "hardcoded" (ex.: `color: 'red'` ou `className="bg-red-500"`). Sempre use o sistema de design (`bg-feedback-error`).
- Criar componentes de layout e feedback misturados na lógica da própria tela (`(tabs)/...`). Se for reutilizável, mova para `src/components/ui/`.
- Ignorar o uso de animações e reações ao toque (botões que não brilham, modals secos). Sempre crie componentes interativos considerando o *feeling* tátil.
