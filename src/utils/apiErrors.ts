import { AxiosError } from 'axios';

export const resolveApiError = (error: unknown, defaultMessage = 'Erro ao carregar'): Error => {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return new Error('Sem conexão');
    }
    if (!error.response) {
      return new Error('Sem conexão');
    }
    const status = error.response.status;
    if (status === 401) {
      return new Error('Sessão expirada. Faça login novamente.');
    }
    if (status === 403) {
      return new Error('Sem permissão');
    }
    if (status === 404) {
      return new Error('Não encontrado');
    }
    if (status >= 500) {
      return new Error('Servidor indisponível');
    }
    const responseData = error.response.data as { message?: string } | undefined;
    return new Error(responseData?.message || defaultMessage);
  }
  return error instanceof Error ? error : new Error(String(error));
};
