/*
 * Referencia de integracao futura:
 * 1) Centralizar cliente HTTP e headers de autenticacao nesta camada.
 * 2) Implementar funcoes por dominio (ex.: authApi, collectionsApi) e retornar tipos de src/types.
 * 3) Mapear payload do backend para modelos da aplicacao antes de chegar na UI.
 * 4) Tratar erros de rede/API aqui e expor mensagens amigaveis para a camada de tela.
 */

export type ApiIntegrationTodo = {
  status: 'pending';
  note: string;
};

export const apiIntegrationReference: ApiIntegrationTodo = {
  status: 'pending',
  note: 'Criar client.ts e separar endpoints por dominio em src/services/api.',
};
