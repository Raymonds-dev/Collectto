# Tailwind Style System

Esta pasta centraliza os tokens visuais usados pelo NativeWind.

## Arquivos

- `tokens.js`: cores, espacos, raios, sombras, gradientes e tipografia.

## Paleta oficial

- Brand principal: `#FE5E00`
- Preto: `#151515`
- Branco: `#F8F8F8`
- Sucesso: `#0BC264`
- Cancelamento/erro: `#E53833`
- Warning: `#FFCC01`
- Info: `#0B6CCD`

## Gradientes

- `gradients.brandJourney`: `#D9534F -> #85AF24 -> #FFCC01 -> #155CA2`
- Stops: `0, 0.35, 0.73, 1`
- `gradients.darkBrandJourney`: versao escura do gradiente da marca

## Fontes

- Logo: `PoetsenOne`
- Escrita: `Inter`

## Como usar

1. Ajuste os tokens em `tokens.js`.
2. O `tailwind.config.js` importa automaticamente esses valores.
3. Use as classes no app com `className`, por exemplo:

```tsx
<View className="bg-surface-base p-4 rounded-2xl border border-surface-border" />
<Text className="font-body text-text-base">Texto base</Text>
<Text className="font-logo text-brand-primary">Collectto</Text>
<View className="bg-feedback-successSoft" />
```

## Nota sobre gradiente no app

Em React Native, prefira `expo-linear-gradient` para backgrounds gradientes:

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/styles/tailwind/tokens';

<LinearGradient
  colors={gradients.brandJourney}
  locations={gradients.brandJourneyStops}
  style={{ borderRadius: 16 }}
/>;
```

## Motion System

A documentacao de hooks, wrappers e exemplos de animacao esta em:

- `src/hooks/useAnimation/README.md`

Use esse guia para:

- escolher presets semanticos;
- combinar animacoes (fade + slide, scale + fade);
- aplicar feedback de toque padronizado;
- usar underline animado em tabs e filtros.

## Convencao recomendada

- `brand-*`: identidade visual primaria e variacoes.
- `surface-*`: fundos, cards e bordas.
- `text-*`: hierarquia de texto e legibilidade.
- `feedback-*`: sucesso, alerta, erro e informacao.
- `overlay-*`: scrims para modais e estados de foco.

## Guia de nomenclaturas

Este guia explica para que serve cada grupo e cada variacao de token.

### `brand`

Identidade principal da marca. Use para CTA principal, elementos de destaque e estados ativos.

- `brand.primary`: cor principal da marca (atalho semantico).
- `brand.50` ate `brand.950`: escala tonal da marca.
  : `50-200` para fundos suaves.
  : `300-500` para elementos interativos e destaque.
  : `600-950` para estados pressionados, contraste alto e uso pontual em dark.

### `neutral`

Cores neutras de referencia da identidade.

- `neutral.black`: preto institucional.
- `neutral.white`: branco institucional.

### `surface`

Camadas de fundo e estrutura visual da interface (modo claro).

- `surface.base`: fundo principal da tela.
- `surface.canvas`: superficie de app mais limpa para composicao.
- `surface.muted`: blocos secundarios e secoes discretas.
- `surface.card`: cards e containers destacados.
- `surface.border`: divisorias e bordas padrao.
- `surface.borderStrong`: bordas com maior enfase.
- `surface.inverse`: superficie invertida para contraste.

### `text`

Hierarquia tipografica e legibilidade (modo claro).

- `text.base`: texto principal (titulos e corpo prioritario).
- `text.muted`: texto secundario (subtitulos, meta info).
- `text.subtle`: texto de baixo destaque (apoio).
- `text.disabled`: texto de estado desabilitado.
- `text.inverse`: texto sobre fundo escuro/invertido.

### `feedback`

Estados semanticos de sistema.

- `feedback.success`: sucesso e confirmacoes.
- `feedback.warning`: alertas e atencao.
- `feedback.error`: erros e acoes destrutivas.
- `feedback.info`: informacoes neutras.
- `feedback.*Soft`: fundo suave do respectivo estado para banners, alerts e chips.

### `overlay`

Camadas de sobreposicao para foco visual.

- `overlay.scrim`: escurecimento forte para modal aberto.
- `overlay.scrimSoft`: escurecimento mais leve para estados transitorios.

### `dark.surface`

Camadas de fundo para modo escuro.

- `dark.surface.base`: fundo principal do app em dark.
- `dark.surface.canvas`: canvas base para composicao.
- `dark.surface.muted`: secoes secundarias.
- `dark.surface.card`: cards em dark.
- `dark.surface.border`: borda padrao em dark.
- `dark.surface.borderStrong`: borda enfatizada.
- `dark.surface.elevated`: camada elevada (sheet, bloco em foco).

### `dark.text`

Hierarquia tipografica para modo escuro.

- `dark.text.base`: texto principal em dark.
- `dark.text.muted`: texto secundario em dark.
- `dark.text.subtle`: apoio em dark.
- `dark.text.disabled`: estado desabilitado em dark.
- `dark.text.inverse`: texto para superficies claras em contexto dark.

### `dark.brand`

Aplicacao da marca em dark mode.

- `dark.brand.primary`: CTA principal em dark.
- `dark.brand.hover`: estado hover/foco visual (web e design token).
- `dark.brand.pressed`: estado pressionado.
- `dark.brand.soft`: fundo suave para destaque de marca sem excesso de contraste.

### `dark.feedback`

Estados semanticos adaptados para modo escuro.

- `dark.feedback.success|warning|error|info`: cores de estado em dark.
- `dark.feedback.*Soft`: fundos suaves com contraste seguro para dark.

### `dark.overlay`

Sobreposicoes para modo escuro.

- `dark.overlay.scrim`: bloqueio forte em modal/dialog.
- `dark.overlay.scrimSoft`: bloqueio leve para transicoes.

### `gradients`

Gradientes institucionais.

- `gradients.brandJourney`: gradiente principal da marca.
- `gradients.brandJourneyStops`: paradas do gradiente principal.
- `gradients.brandWarm`: gradiente quente para destaque/CTA.
- `gradients.darkBrandJourney`: versao escura do gradiente principal.
- `gradients.darkBrandJourneyStops`: paradas da versao escura.

### `fontFamily`

Familias tipograficas semanticas.

- `fontFamily.logo`: fonte da marca (PoetsenOne).
- `fontFamily.sans`: fallback geral de UI (Inter).
- `fontFamily.heading`: titulos e chamadas.
- `fontFamily.body`: corpo de texto.

## Regras de uso rapido

- Use `brand.primary` para 1 CTA principal por tela.
- Use `surface.*` para estrutura e `text.*` para hierarquia de conteudo.
- Use `feedback.*` para significado semantico, nunca apenas decoracao.
- Em dark mode, priorize `dark.surface.*` e `dark.text.*` para manter contraste.
- Prefira `*Soft` para fundo de alertas e a cor base para icone/titulo do alerta.

## Paleta escura (dark)

Tokens adicionados com foco em contraste, legibilidade e estados semanticos:

- `dark.surface.*`: base, canvas, muted, card, border, borderStrong, elevated
- `dark.text.*`: base, muted, subtle, disabled, inverse
- `dark.brand.*`: primary, hover, pressed, soft
- `dark.feedback.*`: success/warning/error/info e variantes Soft
- `dark.overlay.*`: scrims para modal e camadas de bloqueio

Exemplos de classes:

```tsx
<View className="bg-dark-surface-base" />
<View className="bg-dark-surface-card border border-dark-surface-border" />
<Text className="text-dark-text-base">Titulo em dark mode</Text>
<Text className="text-dark-text-muted">Texto secundario</Text>
<View className="bg-dark-brand-soft" />
<View className="bg-dark-feedback-errorSoft" />
```

## Boas praticas de UI/UX

- Use `text-base` para conteudo principal e preserve contraste alto em `text-text-base`.
- Reserve `brand-primary` para CTA principal por tela.
- Use `feedback-*Soft` para fundo de alertas e `feedback-*` para icones/textos de estado.
- Mantenha `surface-border` para separacoes comuns e `surface-borderStrong` para enfase.
- Em dark mode, prefira `dark.surface-card` para elevacao e nao use preto puro em tudo.
- Garanta contraste minimo de 4.5:1 para texto principal sobre `dark.surface-*`.
- Reserve `dark.brand.primary` para CTA principal e use `dark.brand.soft` em estados passivos.
