# Research: Adaptadores e Compatibilidade WEB

**Feature**: `020-web-adapters-compatibility`  
**Date**: 2026-09-26  
**Status**: Completed  

## 1. Technical Decisions

### Decision 1: Isolamento de Infraestrutura por Extensões do Metro Bundler (`.web.ts` vs `.native.ts`)
- **Decision**: Utilizar a resolução nativa de arquivos por plataforma do Metro (`.web.ts` e `.native.ts`) para os módulos de armazenamento e envio de arquivos.
- **Rationale**:
  - Elimina condicionais em tempo de execução (`if (Platform.OS === 'web')`) nos arquivos principais de negócio.
  - Permite tree-shaking automático no empacotamento: o bundle Web não inclui `expo-secure-store` nem `expo-file-system`, e o bundle nativo (iOS/Android) não inclui dependências de browser (`window.localStorage`, `HTMLCanvasElement`).
  - O código consumidor apenas importa `./adapters/storageAdapter` ou `./adapters/uploadAdapter`, e o Metro resolve o arquivo correspondente de forma transparente.
- **Alternatives Considered**:
  - *Arquivo único com `Platform.OS === 'web'`*: Rejeitado por carregar dependências nativas e web no mesmo arquivo, causando falhas de compilação ou warnings de imports não resolvidos em bundles web.
  - *Subpastas separadas com reexport dinâmico*: Rejeitado por ser mais verboso do que as extensões nativas padronizadas do ecossistema Expo/React Native.

---

### Decision 2: Abstração de Armazenamento Local (`storageAdapter`) com Resiliência em Memória
- **Decision**: No `storageAdapter.web.ts`, utilizar `window.localStorage` encapsulado em bloco `try/catch`. Caso o acesso seja bloqueado por políticas do navegador (ex: modo anônimo estrito do Safari ou `SecurityError`), ativar um fallback automático em memória (`in-memory Map`).
- **Rationale**:
  - Evita crash fatal durante o login em navegadores com restrições estritas de privacidade.
  - Garante persistência da sessão entre reloads (F5) em condições normais, e garante navegabilidade contínua na aba ativa mesmo quando o armazenamento permanente estiver bloqueado.
- **Alternatives Considered**:
  - *`sessionStorage`*: Rejeitado porque a sessão seria destruída ao fechar a aba ou reabrir o navegador, violando o cenário de usuário primário (P1).
  - *Falha silenciosa sem fallback*: Rejeitado porque causaria deslogamento instantâneo a cada mudança de estado.

---

### Decision 3: Processamento de Recorte de Fotos na Web via HTML5 Canvas
- **Decision**: Criar adaptadores de componente para os modais de crop (`ProfilePhotoCropModal.web.tsx` e `ProfileBackgroundCropModal.web.tsx`) e renomear os arquivos atuais para `.native.tsx`. Na versão Web, a geração da imagem recortada é realizada desenhando o corte em um `<canvas>` HTML5 oculto com `ctx.drawImage` e exportando via `toDataURL('image/png')`.
- **Rationale**:
  - `react-native-view-shot` depende de APIs nativas de captura de views não suportadas na Web.
  - O HTML5 Canvas é uma API padrão de alta performance disponível em 100% dos navegadores desktop e móveis, com zero dependências externas.
  - Preserva os mesmos controles visuais e propriedades (`imageUri`, `onConfirm`, `onCancel`) consumidos pelas telas de perfil e configurações.
  - Suporta controles de zoom acessíveis via botões (+ / -) e roda do mouse (`wheel`) adequados para ambientes desktop.
- **Alternatives Considered**:
  - *Substituir `ViewShot` por uma biblioteca externa Web (ex: `html2canvas` ou `react-image-crop`)*: Rejeitado por inflar o tamanho do bundle e introduzir dependências de terceiros desnecessárias para uma operação de 30 linhas de Canvas nativo.
  - *Desativar o recorte na Web*: Rejeitado por quebrar a paridade de funcionalidades e a experiência de identidade visual do colecionador.

---

### Decision 4: Uploads na Web via Requisições HTTP `fetch` Padrão
- **Decision**: Adaptar o envio de mídias em `uploadService` para que na Web a transmissão ocorra via `fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob })`. A validação do limite de 10MB é feita antes da requisição lendo `blob.size` a partir de `fetch(photoUri)`.
- **Rationale**:
  - `expo-file-system` (`FileSystem.uploadAsync`) falha na Web por depender de diretórios locais de sistema operacional.
  - A API nativa `fetch` com `Blob` é o padrão da Web para envios binários para URLs pré-assinadas S3.
- **Alternatives Considered**:
  - *Uso de `XMLHttpRequest` manual com `FileReader`*: Rejeitado por ser mais verboso e menos ergonômico que `fetch` com Promises.

---

### Decision 5: Preservação de Componente Único de Telas/UI
- **Decision**: Manter as telas em arquivo único (`profile.tsx`, `account.tsx`, `create-item.tsx`, etc.), adaptando apenas a infraestrutura e os modais nativos específicos.
- **Rationale**:
  - Conforme definido na Constituição v1.3.0 e na solicitação do usuário, é vedado duplicar telas inteiras (`Tela.web.tsx` vs `Tela.native.tsx`).
  - Telas consomem componentes e serviços agnósticos de plataforma, preservando 100% da lógica e JSX.
