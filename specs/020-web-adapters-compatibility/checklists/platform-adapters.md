# Requirements Quality Checklist: Adaptadores de Plataforma e Compatibilidade WEB

**Purpose**: Validar a completude, clareza e rastreabilidade dos requisitos da feature de adaptadores antes da implementação.  
**Created**: 2026-09-26  
**Feature**: [spec.md](../spec.md)  
**Ownership Note**: Os itens abaixo são testes de unidade para os requisitos em linguagem natural. `[x]` indica aprovação do revisor para a qualidade do requisito, e não conclusão de código.

## Requirement Completeness

- [x] CHK001 - Estão definidos os métodos essenciais (`getItem`, `setItem`, `removeItem`) na especificação de persistência de sessão? [Completeness, Spec §FR-001]
- [x] CHK002 - A estratégia de upload pre-signed S3 na Web detalha a leitura de arquivo binário sem depender de chamadas nativas? [Completeness, Spec §FR-003]
- [x] CHK003 - O comportamento de inicialização do app no navegador (no-op para limpeza de cache) está documentado? [Completeness, Spec §FR-004]
- [x] CHK004 - A interface de entrada e saída dos modais de recorte de foto está definida de forma compatível entre mobile e Web? [Completeness, Spec §FR-005]

## Requirement Clarity & Precision

- [x] CHK005 - O limite máximo de tamanho de imagem permitido (10MB) está quantificado objetivamente em bytes ou megabytes? [Clarity, Spec §FR-003]
- [x] CHK006 - A resolução automática de arquivos pelo empacotador (`.web.ts` e `.native.ts`) está especificada sem ambiguidades sobre a necessidade de `Platform.OS`? [Clarity, Spec §FR-002]
- [x] CHK007 - Os controles de escala/zoom para computadores de mesa estão claramente descritos (botões e scroll wheel)? [Clarity, Spec §FR-005]

## Requirement Consistency & Alignment

- [x] CHK008 - Os requisitos de persistência alinham-se à regra da Constituição v1.3.0 de isolamento de infraestrutura por adaptadores de plataforma? [Consistency, Constitution v1.3.0]
- [x] CHK009 - A proibição de duplicar telas inteiras (`Tela.web.tsx` vs `Tela.native.tsx`) está consistente em todos os cenários da especificação? [Consistency, Spec §Assumptions]

## Edge Cases & Exception Handling

- [x] CHK010 - O comportamento do sistema quando o `localStorage` for bloqueado no navegador (modo anônimo estrito) possui especificação de fallback em memória? [Edge Cases, Spec §Edge Cases]
- [x] CHK011 - Está especificada a reação do sistema para imagens corrompidas ou seleções de arquivo inválidas no computador? [Edge Cases, Spec §Edge Cases]

## Measurability & Acceptance Criteria

- [x] CHK012 - O critério de sucesso para permanência da sessão após atualização de página (F5) pode ser testado objetivamente? [Measurability, Spec §SC-001]
- [x] CHK013 - A validação de código livre de warnings e erros está associada a métricas de execução do comando `npm run validate`? [Measurability, Spec §SC-003]

## Notes

- Itens gerados como checklist de qualidade dos requisitos.
- `/speckit-implement` consome estes critérios durante as revisões de PR e entrega.
