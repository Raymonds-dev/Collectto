# Feature Specification: Adaptadores e Compatibilidade WEB (Metro Extensions & Storage)

**Feature Branch**: `020-web-adapters-compatibility`  
**Created**: 2026-09-26  
**Status**: Draft  
**Input**: User description: "Vamos implementar essa adaptação para a WEB adaptando os storages, criando os wrappers e crop conforme a arquitetura definida, nesse momento não vamos focar no layout, somente qualidade e adaptação de código focando nas renomeações dos arquivos para permitir a leitura correta do bundle e realizar as trocas de funcionalidades para a plataforma corretamente."

## Clarifications

### Session 2026-09-26

- Q: Como o serviço de upload deve validar o limite de tamanho de imagem (10MB) no ambiente Web antes de solicitar as credenciais ao servidor? → A: Ler o tamanho do arquivo via `fetch(photoUri)` e checar `blob.size` dentro do `uploadService` antes de chamar a API (Opção A).
- Q: Como o usuário deve controlar o nível de zoom da imagem nos modais de recorte quando estiver no computador (Web)? → A: Botões discretos (+ / -) de zoom combinados com a roda de rolagem do mouse (wheel) e arraste (Opção A).
- Q: Como o storageAdapter deve se comportar na Web caso o localStorage esteja bloqueado pelo navegador? → A: Fallback transparente em memória (in-memory Map) permitindo o uso normal durante a aba ativa (Opção A).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Persistência de Autenticação e Navegação na WEB (Priority: P1)

Como colecionador acessando o Collectto no navegador WEB (desktop ou celular), quero realizar login e manter minha sessão ativa após atualizar a página (F5) ou reabrir o navegador, para que eu navegue fluidamente sem ter que digitar minhas credenciais constantemente.

**Why this priority**: A autenticação é o fluxo primário de uso. Na WEB, a perda de sessão ao dar refresh na página impede qualquer uso contínuo da aplicação.

**Independent Test**: Acessar a aplicação no navegador, realizar o login com credenciais válidas, atualizar a página (F5) e verificar se o usuário permanece autenticado e redirecionado para seu perfil.

**Acceptance Scenarios**:

1. **Given** um usuário não autenticado na WEB, **When** ele informa credenciais válidas e submete o login, **Then** o acesso é concedido e a sessão é salva no armazenamento local da Web.
2. **Given** um usuário autenticado na WEB, **When** ele atualiza a página ou reabre a aba do navegador, **Then** a sessão é restaurada transparente e o usuário permanece autenticado.
3. **Given** um usuário no aplicativo nativo (iOS/Android), **When** ele realiza login ou navega pelo app, **Then** a sessão permanece armazenada no cofre seguro do sistema operacional sem alterações.

---

### User Story 2 - Upload de Fotos de Coleção e Itens na WEB (Priority: P2)

Como colecionador catalogando itens ou criando coleções na WEB, quero selecionar imagens salvas no meu computador/notebook e enviá-las para minhas coleções sem falhas de envio.

**Why this priority**: Colecionáveis dependem de apresentação visual. Permitir o envio de imagens a partir de dispositivos desktop é essencial para a experiência na WEB.

**Independent Test**: Na versão WEB, selecionar uma imagem do computador ao cadastrar uma coleção ou item e confirmar o salvamento, verificando que a imagem é exibida corretamente.

**Acceptance Scenarios**:

1. **Given** um usuário adicionando uma foto na WEB, **When** ele clica para selecionar arquivo, **Then** a janela do gerenciador de arquivos do sistema operacional (Windows/Mac) é aberta.
2. **Given** uma foto selecionada na WEB, **When** o usuário confirma o cadastro, **Then** a imagem é transmitida com sucesso para o servidor sem erros de sistema de arquivos inacessível.
3. **Given** a inicialização do aplicativo na WEB, **When** o ciclo de limpeza de cache é ativado, **Then** o processo conclui silenciosamente sem gerar exceções no navegador.

---

### User Story 3 - Recorte e Ajuste de Foto de Perfil na WEB (Priority: P3)

Como colecionador personalizando meu perfil na WEB, quero ajustar o enquadramento (posição e escala) da minha foto de perfil ou capa antes de salvar, gerando uma imagem final recortada com qualidade.

**Why this priority**: Garante paridade de recursos em relação ao aplicativo mobile, permitindo o ajuste estético de fotos sem depender de capturas de tela nativas.

**Independent Test**: Alterar a foto de perfil na WEB, ajustar o enquadramento no modal de corte, confirmar e verificar se a nova foto recortada é salva no perfil.

**Acceptance Scenarios**:

1. **Given** um usuário ajustando sua foto de perfil na WEB, **When** o modal de recorte é exibido, **Then** a interface de ajuste é carregada normalmente no navegador.
2. **Given** um ajuste de foto finalizado na WEB, **When** o usuário clica em confirmar, **Then** o recorte é processado localmente no navegador e aplicado ao perfil.
3. **Given** um usuário no aplicativo celular, **When** ele ajusta a foto de perfil, **Then** o modal de recorte nativo continua funcionando com alta performance.

---

### Edge Cases

- **Modo de Navegação Privada Estrita**: Caso o `localStorage` esteja bloqueado ou inacessível no navegador, o sistema MUST ativar um fallback transparente em memória (`in-memory Map`), permitindo a navegação e autenticação normais na aba ativa.
- **Leitura de Arquivos de Imagem Inválidos**: Exibir mensagem de erro informativa caso a imagem selecionada no computador esteja corrompida ou em formato não suportado.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O sistema MUST isolar o armazenamento de sessão por plataforma, utilizando armazenamento local no navegador (`localStorage`, com fallback em memória caso bloqueado) para WEB e armazenamento seguro (`SecureStore`) para celulares (iOS/Android), em conformidade com a Constituição v1.3.0.
- **FR-002**: A resolução de adaptadores de plataforma MUST ser tratada em nível de empacotador de arquivos (Metro extensions `.web.ts` e `.native.ts`), eliminando código condicional redundante no fluxo principal.
- **FR-003**: O serviço de envio de imagens MUST realizar requisições HTTP compatíveis com o navegador para arquivos de mídia quando executado na WEB, validando previamente o limite de 10MB via `blob.size` (obtido por `fetch(photoUri)`) antes de solicitar credenciais pré-assinadas.
- **FR-004**: Os serviços de armazenamento de fotos locais MUST tratar graciosamente a ausência do sistema de arquivos nativo quando em ambiente WEB.
- **FR-005**: O recorte de imagem de perfil e capa MUST utilizar processamento de lona visual (Canvas) no ambiente WEB, suportando reposicionamento por arraste e controle de zoom através de botões discretos (+ / -) e rolagem do mouse (wheel), mantendo isolamento em relação ao componente nativo de captura.
- **FR-006**: A aplicação MUST cumprir 100% das regras de validação do projeto (compilação TypeScript, regras de linting e formatação sem warnings ou erros).

### Key Entities

- **Contrato de Storage**: Interface que define operações de leitura, escrita e remoção de chaves de armazenamento local e seguro.
- **Provedor de Mídia**: Abstração de persistência e upload de imagens com adaptadores dedicados para Web e plataformas nativas.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% dos fluxos de login e recuperação de sessão na WEB permanecem ativos após atualizar a página (F5) ou reabrir o navegador.
- **SC-002**: O envio de fotos de perfil, capas e itens na WEB é concluído com 100% de sucesso sem falhas de execução.
- **SC-003**: O comando de validação unificada do projeto (`npm run validate`) executa com 0 erros e 0 warnings.
- **SC-004**: O tempo de inicialização do aplicativo na WEB não é afetado por carregamento de bibliotecas exclusivas de celular.

## Assumptions

- O foco desta especificação é restrito às adaptações de infraestrutura, adaptadores de plataforma e compatibilidade do bundle para a WEB, conforme alinhado com a Constituição v1.3.0.
- Reformulações e ajustes responsivos de layout CSS para monitores widescreen são escopo de fases posteriores.
- A resolução de arquivos por plataforma `.web.ts` / `.native.ts` e `.web.tsx` / `.native.tsx` está habilitada e operacional na ferramenta de empacotamento do projeto.
