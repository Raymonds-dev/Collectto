# Data Model & Entidades: Adaptadores e Compatibilidade WEB

**Feature**: `020-web-adapters-compatibility`  
**Date**: 2026-09-26  
**Status**: Completed  

## 1. Entidades e Contratos de Dados

### 1.1 Contrato de Armazenamento (`StorageAdapter`)

Define as operações essenciais para persistência local ou segura de chaves de autenticação (tokens JWT e refresh tokens), implementado separadamente por plataforma.

```typescript
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

#### Regras de Validação e Comportamento
- `getItem`:
  - Retorna `string` caso a chave exista.
  - Retorna `null` se a chave não existir ou em caso de erro silencioso.
- `setItem`:
  - Grava o valor no armazenamento nativo seguro (`SecureStore`) ou web (`localStorage`).
  - Em caso de bloqueio de segurança/quota no navegador, deve redirecionar a persistência para memória volátil (`in-memory Map`).
- `removeItem`:
  - Remove a chave sem disparar exceção caso a chave não exista previamente.

---

### 1.2 Contrato do Provedor de Mídia e Upload (`HttpUploadAdapter`)

Abstrai o envio binário de fotos locais para URLs pré-assinadas S3.

```typescript
export interface HttpUploadParams {
  uploadUrl: string;
  photoUri: string;
  contentType: string;
}

export interface HttpUploadAdapter {
  uploadBinary(params: HttpUploadParams): Promise<{ status: number }>;
  getFileSize(uri: string): Promise<number>;
}
```

#### Regras de Validação
- `uploadBinary`:
  - Na Web: Converte `photoUri` para `Blob` via `fetch` e executa requisição HTTP `PUT`.
  - No Nativo: Executa `FileSystem.uploadAsync` com `FileSystemUploadType.BINARY_CONTENT`.
  - Retorna `{ status: number }` indicando o código HTTP da resposta.
- `getFileSize`:
  - Deve validar o limite máximo de 10.485.760 bytes (10MB).
  - Retorna o tamanho em bytes do arquivo/blob selecionado.

---

### 1.3 Contrato de Modais de Recorte de Imagem (`CropModalProps`)

Garante interface idêntica entre as implementações `.native.tsx` e `.web.tsx`.

```typescript
export interface CropModalProps {
  visible: boolean;
  imageUri: string | null;
  onCancel: () => void;
  onConfirm: (croppedUri: string) => void;
}
```

#### Transformações de Estado no Recorte Web (Canvas)
- **Entrada**: `imageUri` (string `blob:http...` ou `data:...`).
- **Estado Local de Ajuste**:
  - `scale`: número entre 1.0 e 3.0 (ajustado por zoom ou scroll wheel).
  - `translateX`: deslocamento horizontal em pixels (ajustado por arraste).
  - `translateY`: deslocamento vertical em pixels (ajustado por arraste).
- **Saída**: `croppedUri` (string em formato Data URL `data:image/png;base64,...`).
