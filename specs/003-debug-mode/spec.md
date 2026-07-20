# Feature Specification: Debug Mode

**Feature Branch**: `feature/003-create-feature-spec`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: User description: "Quero fazer o app funcionar de forma efêmera ... para testar fluxos novos e fazer apresentação offline, com DEBUG true usando mocks em memória e sem API."

## Clarifications

### Session 2026-05-12

- Q: Qual formato de ID deve ser usado nas entidades no modo DEBUG efêmero? → A: IDs de entidades em formato UUID string (compatível com API futura).
- Q: Como o login deve funcionar no modo DEBUG? → A: Aceitar somente credenciais seed definidas no mock de autenticação.
- Q: No modo DEBUG, como armazenar imagens durante a sessão? → A: Salvar arquivo local em cache e manter apenas URIs/metadados em memória.
- Q: No modo DEBUG, qual ordenação de posts derivados de itens deve ser aplicada no feed? → A: Mais recente primeiro (createdAt desc).
- Q: Para armazenamento local de imagens em DEBUG, qual deve ser a estratégia? → A: Usar cache padrão do SO (iOS `Caches`, Android `getCacheDir()`), sem limite durante sessão, com limpeza ao término.
- Q: Qual deve ser a estratégia de logging e observabilidade para a sessão DEBUG? → A: Logs detalhados (INFO/DEBUG levels) para console apenas; sem arquivo persistente; ativado com DEBUG ativo.
- Q: Como o sistema deve se comportar ao tentar transicionar entre modo DEBUG ativo e inativo? → A: Modo DEBUG é imutável em runtime; definido em build/env; requer restart para mudar.
- Q: Qual deve ser o esquema de dados para as entidades principais (Perfil, Coleção, Item, Post) em modo DEBUG? → A: TypeScript interfaces com tipos explícitos; campos obrigatórios + opcionais, alinhados com swagger http://89.167.89.185:8080/swagger-ui/index.html#/
- Q: Como o DEBUG mode interage com a navegação existente (Expo Router) e autenticação? → A: `AuthProvider` detecta DEBUG ativo no boot e carrega dados seed direto, sem mudança em `AuthGate` ou rotas.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Ativar sessão de teste offline efêmera (Priority: P1)

Como pessoa testadora, quero iniciar o app em modo DEBUG para usar dados padrão em memória e navegar sem internet, garantindo demonstração offline dos fluxos principais.

**Why this priority**: Sem este modo, a demonstração offline e os testes rápidos de novos fluxos não acontecem de forma confiável.

**Independent Test**: Com DEBUG ativo, iniciar o app sem conectividade e validar login, navegação entre telas e leitura de dados padrão sem falha de dependência externa.

**Acceptance Scenarios**:

1. **Given** o app está compilado com DEBUG ativo, **When** a pessoa abre o aplicativo sem internet, **Then** o sistema inicializa com dados padrão de sessão em memória
2. **Given** o modo DEBUG está ativo, **When** ocorre uma operação de autenticação, **Then** nenhuma integração externa é chamada
3. **Given** o app é encerrado completamente, **When** é aberto novamente, **Then** a sessão efêmera anterior não é restaurada

---

### User Story 2 - Persistir mudanças entre telas durante a sessão (Priority: P1)

Como pessoa testadora, quero que alterações feitas no fluxo de criação e edição apareçam imediatamente nas demais telas, para validar ponta a ponta em uma única sessão.

**Why this priority**: O objetivo principal é testar jornadas completas; sem consistência de estado entre telas, o teste funcional perde valor.

**Independent Test**: Criar coleção, adicionar item, trocar foto de perfil e navegar entre create item, perfil e feed para confirmar refletividade imediata dos dados.

**Acceptance Scenarios**:

1. **Given** DEBUG ativo e sessão iniciada, **When** uma coleção é criada no fluxo de criação, **Then** ela aparece na tela de perfil dentro da mesma sessão
2. **Given** existe uma coleção na sessão, **When** um item é adicionado a ela, **Then** o item aparece na coleção sem reinicializar o app
3. **Given** a foto de perfil foi alterada na sessão, **When** a pessoa volta para a tela de perfil, **Then** a nova foto é exibida imediatamente

---

### User Story 3 - Exibir posts derivados dos itens da coleção (Priority: P2)

Como pessoa testadora, quero que o feed de posts reflita os itens das minhas coleções no modo DEBUG, para validar o comportamento do feed com dados reais de uso da sessão.

**Why this priority**: Garante que o fluxo de criação impacta também a visualização social do app, aumentando confiança da demonstração.

**Independent Test**: Inserir itens em coleção no modo DEBUG e validar que o feed apresenta posts correspondentes somente do usuário da sessão de teste.

**Acceptance Scenarios**:

1. **Given** há itens em coleções da sessão de teste, **When** o feed é carregado, **Then** os posts exibidos são derivados desses itens
2. **Given** um novo item foi criado, **When** o feed é atualizado na mesma sessão, **Then** um novo post correspondente aparece

---

### User Story 4 - Preparar transição para API real (Priority: P2)

Como time de produto e engenharia, queremos contratos claros de dados e operações para trocar o backend em memória por API real no futuro sem reescrever fluxos de UI.

**Why this priority**: Reduz retrabalho e acelera migração futura para backend definitivo.

**Independent Test**: Confirmar que as operações de autenticação, perfil, coleções, itens e posts dependem de interfaces estáveis e podem ser satisfeitas por diferentes implementações.

**Acceptance Scenarios**:

1. **Given** o app executa em DEBUG, **When** um fluxo usa autenticação, perfil, coleções ou itens, **Then** ele consome contratos de serviço independentes da origem de dados
2. **Given** uma implementação alternativa de dados, **When** ela respeita os mesmos contratos, **Then** os fluxos principais continuam funcionais sem mudança de comportamento esperado

---

### Edge Cases

- O que acontece quando DEBUG está desativado no build de teste? O sistema segue comportamento normal do ambiente não-DEBUG.
- O que acontece quando dados padrão de sessão estão vazios ou incompletos? O sistema inicia com estado vazio válido, mantendo fluxos utilizáveis.
- O que acontece quando o usuário tenta salvar coleção ou item com dados inválidos no modo DEBUG? As mesmas validações de UX do modo normal devem ser aplicadas.
- O que acontece quando há múltiplas mudanças rápidas (criar coleção e item em sequência)? O estado de sessão mantém consistência e ordem temporal das alterações.
- O que acontece quando o login em DEBUG recebe credenciais não-seed? O sistema bloqueia acesso e retorna erro de autenticação sem chamar integrações externas.
- O que acontece quando uma URI local de imagem expira ou fica indisponível na sessão DEBUG? O sistema deve exibir fallback visual e manter o restante dos dados da sessão íntegro.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O sistema MUST suportar um modo de execução DEBUG ativado por configuração de ambiente para builds de teste.
- **FR-002**: Com DEBUG ativo, o sistema MUST inicializar dados padrão de sessão para autenticação, perfil, coleções e itens.
- **FR-003**: Com DEBUG ativo, o sistema MUST executar autenticação sem chamadas a integrações externas.
- **FR-004**: Com DEBUG ativo, o sistema MUST manter persistência efêmera em memória durante todo o tempo de vida da instância do aplicativo.
- **FR-005**: O sistema MUST descartar todos os dados efêmeros ao encerrar totalmente a instância do aplicativo.
- **FR-006**: O sistema MUST refletir imediatamente em perfil as coleções criadas no fluxo de create item na mesma sessão.
- **FR-007**: O sistema MUST refletir imediatamente em coleções e visualizações relacionadas os itens adicionados na mesma sessão.
- **FR-008**: O sistema MUST refletir imediatamente em perfil a alteração de foto de perfil na mesma sessão.
- **FR-009**: O sistema MUST derivar os posts exibidos a partir dos itens das coleções do usuário da sessão de teste em DEBUG.
- **FR-010**: O sistema MUST manter contratos de serviço separados da implementação para autenticação, perfil, coleções, itens e posts.
- **FR-011**: O sistema MUST permitir troca futura da implementação em memória por implementação baseada em API mantendo os mesmos contratos.
- **FR-012**: O sistema MUST manter validações e comportamentos de fluxo equivalentes entre modo DEBUG e modo não-DEBUG, exceto a origem de dados.
- **FR-013**: O sistema MUST gerar e manter identificadores das entidades de domínio em formato UUID string no modo DEBUG.
- **FR-014**: Com DEBUG ativo, o sistema MUST autenticar apenas com credenciais seed pré-definidas no mock e recusar credenciais divergentes com feedback de erro consistente.
- **FR-015**: Com DEBUG ativo, o sistema MUST persistir imagens da sessão em arquivos locais de cache (plataforma-específico: iOS `Caches`, Android `getCacheDir()`) sem limite durante a sessão e com limpeza automática ao término da aplicação. Em memória, manter apenas URIs e metadados necessários para renderização.
- **FR-016**: Com DEBUG ativo, o sistema MUST ordenar posts derivados de itens por data de criação decrescente no feed (mais recente primeiro).
- **FR-017**: Com DEBUG ativo, o sistema MUST emitir logs detalhados (INFO/DEBUG levels) exclusivamente para console (dev tools, logcat, ou Xcode), sem arquivo persistente, facilitando troubleshooting em tempo real.
- **FR-018**: O modo DEBUG MUST ser imutável durante a execução; definido em build/configuração de ambiente; transição entre modos requer reinicialização completa da aplicação.
- **FR-019**: Todas as entidades de domínio (Tester Profile, Collection, Item, Post Projection) MUST ser definidas como TypeScript interfaces com tipos explícitos e validação, alinhadas com contratos de API referenciados em http://89.167.89.185:8080/swagger-ui/index.html#/
- **FR-020**: O `AuthProvider` em `src/app/_layout.tsx` MUST detectar modo DEBUG no boot; com DEBUG ativo, carregar dados seed direto sem chamar autenticação real ou alterar estrutura de `AuthGate` e rotas existentes.

### Key Entities

- **Debug Session State**: Estado efêmero em memória que representa dados do usuário de teste durante a execução do app.
- **Tester Profile**: Perfil da pessoa de teste, incluindo identificador UUID string, nome de exibição e foto de perfil atual.
- **Collection**: Agrupador de itens pertencente à pessoa de teste, com identificador UUID string e metadados para exibição no perfil.
- **Item**: Elemento criado em uma coleção, com identificador UUID string, e base para geração de post no feed.
- **Post Projection**: Representação de feed derivada dos itens da pessoa de teste para visualização de posts, com identificador UUID string.
- **Session Media Asset**: Referência de mídia da sessão contendo URI local de cache, tipo e metadados mínimos para exibição de foto de perfil, item e coleção.
- **Service Contract**: Definição de operações de domínio (autenticação, perfil, coleções, itens, posts) independente da fonte de dados.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Em ambiente de teste com DEBUG ativo, 100% dos fluxos de login, perfil, coleção e item funcionam sem dependência de conectividade externa.
- **SC-002**: Em DEBUG, 100% das coleções criadas ficam visíveis no perfil em até 1 segundo na mesma sessão.
- **SC-003**: Em DEBUG, 100% dos itens adicionados a coleções aparecem nas visualizações relacionadas em até 1 segundo na mesma sessão.
- **SC-004**: Em DEBUG, 100% das trocas de foto de perfil são refletidas na tela de perfil em até 1 segundo na mesma sessão.
- **SC-005**: Em DEBUG, 100% dos novos itens passam a compor os posts exibidos após atualização do feed na mesma sessão.
- **SC-006**: A migração para fonte de dados alternativa pode ser validada reaproveitando ao menos 90% dos cenários funcionais definidos nesta especificação, sem redefinir critérios de comportamento.

## Assumptions

- O modo DEBUG é destinado exclusivamente a testes locais, demonstrações offline e validação funcional de fluxos em evolução.
- No modo DEBUG, existe um único usuário de teste ativo por sessão para simplificar o comportamento esperado.
- A experiência de interface e regras de validação de entrada devem permanecer consistentes entre DEBUG e não-DEBUG.
- A origem futura de dados seguirá contratos oficiais de API e poderá usar como referência o catálogo disponível em http://89.167.89.185:8080/swagger-ui/index.html#/, sem alterar os resultados funcionais definidos.
