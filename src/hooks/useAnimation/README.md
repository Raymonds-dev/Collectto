# Motion System

Este guia documenta como usar os hooks e wrappers de animacao do projeto.

## Objetivo

Padronizar a camada de codigo do Reanimated sem limitar composicao. A regra e:

- Presets semanticos para casos comuns.
- Overrides granulares para casos especificos.
- Tokens centralizados para manter consistencia visual e temporal.

## Onde estao os arquivos

- Hooks: `src/hooks/useAnimation`
- Wrappers: `src/components/ui/animated`
- Tokens: `src/styles/tailwind/tokens.js` (chave `motion`)
- Tipos dos tokens no app: `src/styles/tailwind/tokens.native.ts`

## Exports

```ts
import {
  MOTION_PRESETS,
  useComposedMotion,
  usePressMotion,
  useShakeMotion,
  useUnderlineSlideMotion,
} from '@/hooks/useAnimation';

import { AnimatedPressable, MotionView } from '@/components/ui/animated';
```

## Tokens de motion

```ts
tokens.motion.duration.instant;
tokens.motion.duration.fast;
tokens.motion.duration.normal;
tokens.motion.duration.slow;
tokens.motion.duration.pressIn;
tokens.motion.duration.pressOut;

tokens.motion.distance.xs;
tokens.motion.distance.sm;
tokens.motion.distance.md;
tokens.motion.distance.lg;

tokens.motion.scale.press;
tokens.motion.scale.revealStart;
tokens.motion.scale.popStart;
```

Use esses valores como default. So sobrescreva quando houver necessidade de UX clara.

## Presets disponiveis

`MOTION_PRESETS` contem:

- `fade`
- `slideUp`
- `slideDown`
- `slideLeft`
- `slideRight`
- `scaleFade`
- `pop`
- `toastBottom`
- `toastTop`

Cada preset define `from`, `to`, `duration` e `easing`.

## Hook: useComposedMotion

Serve para combinar animacoes de entrada e saida sem reescrever worklets.

### API

```ts
type UseComposedMotionOptions = {
  presets?: MotionPresetName[];
  duration?: number;
  delay?: number;
  distance?: number;
  easing?: EasingFunction;
};
```

### Retorno

```ts
{
  animatedStyle,
  animateIn,
  animateOut,
  resetToHidden,
}
```

### Exemplo: slide up + fade

```tsx
import Animated from 'react-native-reanimated';
import { useComposedMotion } from '@/hooks/useAnimation';

const Example = ({ visible }: { visible: boolean }) => {
  const { animatedStyle, animateIn, animateOut, resetToHidden } = useComposedMotion({
    presets: ['slideUp', 'fade'],
    duration: 320,
    distance: 56,
  });

  useEffect(() => {
    if (visible) {
      resetToHidden();
      animateIn();
      return;
    }

    animateOut();
  }, [animateIn, animateOut, resetToHidden, visible]);

  return <Animated.View style={animatedStyle} />;
};
```

## Hook: usePressMotion

Padrao para feedback de toque (scale + opacity).

### API

```ts
type UsePressMotionOptions = {
  pressedScale?: number;
  pressedOpacity?: number;
  durationIn?: number;
  durationOut?: number;
  easingIn?: EasingFunction;
  easingOut?: EasingFunction;
};
```

### Exemplo com Pressable nativo

```tsx
import Animated from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { usePressMotion } from '@/hooks/useAnimation';

const AnimatedNativePressable = Animated.createAnimatedComponent(Pressable);

const ExampleButton = () => {
  const { animatedStyle, handlePressIn, handlePressOut } = usePressMotion();

  return (
    <AnimatedNativePressable
      style={animatedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    />
  );
};
```

## Hook: useShakeMotion

Use para estados de erro (input invalido, credencial incorreta, etc.).

### Exemplo

```tsx
import Animated from 'react-native-reanimated';
import { useShakeMotion } from '@/hooks/useAnimation';

const ExampleError = ({ hasError }: { hasError: boolean }) => {
  const { animatedStyle, shake } = useShakeMotion();

  useEffect(() => {
    if (hasError) {
      shake();
    }
  }, [hasError, shake]);

  return <Animated.View style={animatedStyle} />;
};
```

## Hook: useUnderlineSlideMotion

Use para indicador de tabs/filtros.

### API

```ts
useUnderlineSlideMotion({
  activeIndex,
  itemCount,
  containerWidth,
  indicatorWidth,
});
```

### Exemplo

```tsx
const { animatedStyle } = useUnderlineSlideMotion({
  activeIndex,
  itemCount: options.length,
  containerWidth: tabsWidth,
});

<Animated.View style={[{ width: 40 }, animatedStyle]} />;
```

## Wrapper: MotionView

Wrapper declarativo para mostrar/esconder com presets.

```tsx
<MotionView visible={isOpen} presets={['fade', 'scaleFade']} duration={280}>
  <View className="rounded-2xl bg-surface-card p-4" />
</MotionView>
```

## Wrapper: AnimatedPressable

Wrapper para feedback de toque sem repetir setup manual.

```tsx
<AnimatedPressable
  accessibilityRole="button"
  accessibilityLabel="Salvar"
  onPress={onSave}
  className="items-center justify-center rounded-2xl bg-brand-primary px-4 py-3"
/>
```

## Mapa pratico de quando usar

- Navegacao entre telas: `slide` no stack (via router options/layout).
- Detalhe contextual na mesma tela: `slideLeft + fade` (ou `slideRight + fade`).
- Feedback neutro: `fade`.
- Elemento novo com foco: `scaleFade`.
- Alertas curtos: `pop` ou `toastBottom`.
- Erro de formulario: `shake`.
- Tabs/filtros: `useUnderlineSlideMotion`.
- Interacao de toque: `usePressMotion` ou `AnimatedPressable`.

## Guia rapido por contexto

Use esta matriz quando precisar decidir rapidamente qual combinacao aplicar.

### 1) Navegacao entre telas

- Pergunta de UX: de onde veio e para onde foi a proxima tela?
- Padrao: `slide` no stack/layout.
- Quando usar: perfil -> colecao -> item em rota real.

```tsx
// src/app/_layout.tsx (exemplo conceitual)
<Stack
  screenOptions={{
    headerShown: false,
    animation: 'slide_from_right',
  }}
/>
```

### 2) Feedback curto (sucesso, aviso, erro)

- Neutro: `fade`.
- Chamar atencao sem agressividade: `pop` ou `scaleFade`.
- Erro de validacao: `useShakeMotion`.

```tsx
const { animatedStyle, animateIn, animateOut } = useComposedMotion({
  presets: ['pop'],
  duration: tokens.motion.duration.fast,
});
```

### 3) Modal

- Decisao importante: `scaleFade` (+ `fade`).
- Acoes contextuais: `slideUp` (+ `fade`) estilo bottom sheet.
- Sempre parear entrada e saida.

```tsx
<MotionView visible={isOpen} presets={['slideUp', 'fade']} distance={56} duration={320}>
  <View className="rounded-2xl bg-surface-card p-4" />
</MotionView>
```

### 4) Lista/Grid

- Entrada de conteudo: combinar `fade` com stagger por item.
- Interacao: `AnimatedPressable` para feedback de toque consistente.

```tsx
<AnimatedPressable
  accessibilityRole="button"
  accessibilityLabel="Abrir item"
  onPress={onPressItem}
  className="aspect-square rounded-[18px]"
/>
```

### 5) Tabs e filtros

- Indicador: `useUnderlineSlideMotion`.
- Troca de conteudo: `crossfade` via composicao de `fade` in/out.

```tsx
const { animatedStyle } = useUnderlineSlideMotion({
  activeIndex,
  itemCount: options.length,
  containerWidth,
});
```

Regra pratica: comece com preset semantico, depois ajuste `duration` e `distance` so quando houver necessidade clara de UX.

## Combinacao recomendada (nao engessada)

- Comece por preset semantico.
- Ajuste `duration` e `distance` no componente quando necessario.
- Evite variar easing em excesso; priorize consistencia de ritmo.
- Se animacao nao deixa claro de onde veio e para onde foi, revise.

## Exemplo completo: detalhe de item na mesma tela

```tsx
const { animatedStyle, animateIn, animateOut, resetToHidden } = useComposedMotion({
  presets: ['slideLeft', 'fade'],
  duration: tokens.motion.duration.fast,
  distance: 56,
});

const open = () => {
  resetToHidden();
  setSelectedItem(item);
  animateIn();
};

const close = () => {
  animateOut();
  setTimeout(() => setSelectedItem(null), 220);
};
```

## Observacoes importantes

- Em Android, nao passe `easing` indefinido para `withTiming`; os hooks atuais ja tratam isso.
- Prefira wrappers/hooks do sistema em vez de escrever animacao manual em cada tela.
- Quando adicionar novos presets, atualize `motion.types.ts` e este README.
