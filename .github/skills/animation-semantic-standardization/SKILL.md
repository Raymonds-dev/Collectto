---
name: animation-semantic-standardization
description: 'Implement and standardize Reanimated animations using project semantics. Use when creating new animations, auditing animation code outside wrappers/hooks, fixing non-semantic motion, migrating ad-hoc withTiming/withSpring code, and deciding whether to reuse or create a new preset while keeping MotionView/AnimatedPressable as first choice.'
argument-hint: 'Quais telas/componentes devem ser auditados ou implementados?'
compatibility: 'Use em projetos React Native com Reanimated onde existe design system de motion com hooks, presets e wrappers. Ideal para padronizar sem engessar composicao.'
disable-model-invocation: false
user-invocable: true
---

# Animation Semantic Standardization

Skill para implementar animacoes novas e corrigir animacoes fora do padrao semantico do projeto.

## Quando Usar

- Ao implementar uma nova animacao em tela, componente ou fluxo.
- Ao encontrar animacao manual fora do sistema (ex.: withTiming solto, Animated.View com logica local repetida).
- Ao revisar consistencia de motion entre telas.
- Ao migrar interacoes de toque para wrappers semanticos.

## Referencias Obrigatorias

Antes de editar, ler:

- src/hooks/useAnimation/README.md
- src/hooks/useAnimation/motion.types.ts
- src/hooks/useAnimation/useComposedMotion.ts
- src/hooks/useAnimation/usePressMotion.ts
- src/hooks/useAnimation/useUnderlineSlideMotion.ts
- src/components/ui/animated/AnimatedPressable.tsx
- src/components/ui/animated/MotionView.tsx
- src/styles/tailwind/tokens.js

## Resultado Esperado

- Animacao implementada com semantica do sistema.
- Quando fizer sentido de UX, animacao de entrada deve ter animacao de saida correspondente.
- Nenhuma animacao nova criada fora da camada padronizada sem justificativa.
- Reuso de presets existentes sempre que possivel.
- Quando necessario criar preset novo, incluir token/mapeamento/documentacao.
- Projeto validado sem erro de tipo, lint e formato.

## Fluxo Obrigatorio

1. Ler referencias do motion system.
2. Classificar a animacao por contexto (navegacao, conteudo, feedback, modal, lista, tabs, press).
3. Identificar se existe implementacao fora do padrao.
4. Corrigir com hook/wrapper existente, priorizando semantica.
5. Se nao houver preset adequado, criar um novo com contrato completo.
6. Atualizar documentacao e exemplos quando houver novo preset ou nova regra de uso.
7. Validar com scripts do projeto.

## Decisao Semantica (Escolha Rapida)

- Press/Touch feedback:
  - Preferir src/components/ui/animated/AnimatedPressable.
  - Se componente nao puder usar wrapper, usar usePressMotion.

- Enter/Exit de conteudo na mesma tela:
  - Preferir MotionView.
  - Quando precisar de controle manual de ciclo, usar useComposedMotion.
  - Regra de pareamento: entrada e saida devem conversar entre si (ex.: fade in -> fade out, slide up -> slide down/fade out conforme contexto).

- Erro/negacao:
  - Usar useShakeMotion.

- Indicador de tab/filtro:
  - Usar useUnderlineSlideMotion.

- Toast/feedback curto:
  - Priorizar presets toastBottom/toastTop/pop via useComposedMotion ou MotionView.

- Navegacao entre telas:
  - Priorizar screenOptions no layout/stack com direcionalidade clara.

## Procedimento Detalhado

### 1) Descoberta

Buscar sinais de animacao fora do padrao:

```bash
rg -n "react-native-reanimated|withTiming|withSpring|useSharedValue|createAnimatedComponent|Animated\\." src/app src/components
```

Buscar interacoes sem wrapper de press:

```bash
rg -n "<Pressable|onPressIn|onPressOut|active:opacity" src/components src/app
```

### 2) Classificacao

Para cada caso encontrado, classificar:

- Tipo: press, enter/exit, feedback, tab indicator, navegacao.
- Local: tela, componente ui, componente feature.
- Padrao atual: semantico ou ad-hoc.

### 3) Correcao Preferencial

- Primeiro tentar wrappers existentes:
  - AnimatedPressable
  - MotionView

- Se wrappers nao cobrirem o caso, usar hook semantico:
  - usePressMotion
  - useComposedMotion
  - useShakeMotion
  - useUnderlineSlideMotion

### 4) Criar Nova Semantica (somente se necessario)

Criar novo preset diretamente quando fizer sentido para o contexto de UX.

Recomendacao:

- Avaliar composicao de presets existentes como opcao rapida.
- Se a semantica ficar confusa ou exigir override excessivo, criar preset dedicado.

Ao criar novo preset, obrigatorio:

1. Atualizar src/hooks/useAnimation/motion.types.ts.
2. Se precisar de novos defaults, atualizar src/styles/tailwind/tokens.js.
3. Atualizar guia src/hooks/useAnimation/README.md com exemplo.
4. Garantir nome semantico (ex.: modalScale, crossfade, staggerIn).

### 5) Regras de Implementacao

- Preferir wrappers para semantica e visual consistente.
- Evitar duplicar logica de withTiming em varios componentes.
- Nao passar easing indefinido para withTiming.
- Manter direcionalidade clara: de onde veio e para onde foi.
- Sempre avaliar animacao de saida quando houver animacao de entrada; nao deixar componente desaparecer de forma abrupta sem justificativa.
- Exemplo esperado: modal com fade in deve encerrar com fade out.
- Evitar exagero de variacoes de duration/easing sem justificativa.

### 6) Validacao

Executar:

```bash
npm run type-check
npm run lint
npm run format:check
npm run validate
```

Se format/lint falhar, corrigir e rodar novamente.

## Criterios de Conclusao

- Toda animacao do escopo foi classificada e padronizada.
- Casos fora do padrao foram migrados para wrappers/hooks semanticos.
- Entradas e saidas foram validadas em pares nos fluxos em que isso faz sentido.
- Presets novos (se houver) foram documentados e tokenizados.
- Validacao final passou.

## Anti-Padroes

- Criar animacao ad-hoc quando ja existe wrapper/hook equivalente.
- Duplicar presets com nomes diferentes e comportamento igual.
- Alterar duracoes globalmente sem avaliar impacto nas telas existentes.
- Fechar tarefa sem atualizar guia quando semantica nova foi criada.

## Prompts de Exemplo

- Implemente uma animacao de entrada para card de detalhe usando semantica existente e prefira MotionView.
- Encontre animacoes fora do padrao no modulo de profile e migre para wrappers/hooks do motion system.
- Revise tabs e filtros, padronize underline e crossfade com semantica do projeto.
- Nao existe preset para este caso de modal: crie um preset novo com token e atualize o README de motion.
