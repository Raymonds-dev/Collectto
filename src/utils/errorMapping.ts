import { ErrorContext, MappedError } from '../types/error';
import { ApiError } from '../services/api/types';

/**
 * Helper to check if an error is a timeout error.
 */
const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.code === 'REQUEST_TIMEOUT' || error.status === 408;
  }
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.code === 'ECONNABORTED' ||
      err.status === 408 ||
      err.response?.status === 408 ||
      (typeof err.message === 'string' && err.message.toLowerCase().includes('timeout'))
    );
  }
  return false;
};

/**
 * Helper to check if an error is a network offline error.
 */
const isOfflineError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.code === 'NETWORK_ERROR';
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.code === 'NETWORK_ERROR' ||
      err.message === 'Network Error' ||
      (!err.response && err.request)
    );
  }
  return false;
};

/**
 * Centralized error mapping function. Matches any caught error (AxiosError, Network offline, etc.)
 * against the provided context and returns a user-friendly MappedError object.
 *
 * @param error - The raw error caught in a try/catch block.
 * @param context - The context in which the error occurred.
 * @returns MappedError object containing pt-BR user message and category.
 */
export const mapErrorToMessage = (
  error: unknown,
  context: ErrorContext = 'generic'
): MappedError => {
  // 1. Timeout Check
  if (isTimeoutError(error)) {
    return {
      message: 'A solicitação levou muito tempo. Verifique sua conexão e tente novamente.',
      category: 'TIMEOUT',
      retryable: true,
      code: 'NETWORK_TIMEOUT',
    };
  }

  // 2. Network Offline Check
  if (isOfflineError(error)) {
    return {
      message: 'Sem conexão de internet. Verifique sua conexão e tente novamente.',
      category: 'NETWORK',
      retryable: true,
      code: 'NETWORK_OFFLINE',
    };
  }

  // Extract HTTP status code and response data safely
  let status: number | null = null;
  let responseData: any = null;
  let retryAfter: number | undefined = undefined;

  if (error instanceof ApiError) {
    status = error.status;
    responseData = error.data;
    if (error.originalError) {
      const axiosError = error.originalError as any;
      const headers = axiosError?.response?.headers || axiosError?.headers;
      if (headers) {
        const retryAfterHeader = headers['retry-after'] || headers['Retry-After'];
        if (retryAfterHeader) {
          const parsed = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsed) && parsed > 0) {
            retryAfter = parsed;
          }
        }
      }
    }
  } else if (error && typeof error === 'object') {
    const err = error as any;
    status = err.status || err.response?.status || null;
    responseData = err.data || err.response?.data || null;
    const headers = err.response?.headers || err.headers;
    if (headers) {
      const retryAfterHeader = headers['retry-after'] || headers['Retry-After'];
      if (retryAfterHeader) {
        const parsed = parseInt(retryAfterHeader, 10);
        if (!isNaN(parsed) && parsed > 0) {
          retryAfter = parsed;
        }
      }
    }
  }

  // 3. HTTP Status Codes Mapping
  if (status !== null) {
    switch (status) {
      case 401: {
        if (context === 'login') {
          return {
            message: 'Email ou senha incorretos. Tente novamente ou redefina sua senha.',
            category: 'AUTH',
            retryable: false,
            code: 'AUTH_INVALID_CREDS',
          };
        }
        if (context === 'signup') {
          return {
            message: 'Você não tem permissão para fazer isso. Verifique seu cadastro.',
            category: 'AUTH',
            retryable: false,
            code: 'AUTH_UNAUTHORIZED',
          };
        }
        // 'profile_update' or 'generic'
        return {
          message: 'Sua sessão expirou. Faça login novamente.',
          category: 'AUTH',
          retryable: false,
          code: 'AUTH_SESSION_EXPIRED',
        };
      }

      case 409: {
        // Parse the conflict field
        let conflictField: 'email' | 'username' | null = null;
        if (responseData) {
          if (responseData.field === 'email') {
            conflictField = 'email';
          } else if (responseData.field === 'username') {
            conflictField = 'username';
          } else {
            const rawMsg = String(responseData.message || '').toLowerCase();
            if (rawMsg.includes('email')) {
              conflictField = 'email';
            } else if (rawMsg.includes('username') || rawMsg.includes('nome de usuário')) {
              conflictField = 'username';
            }
          }
        }

        if (context === 'signup' || context === 'profile_update') {
          if (conflictField === 'email') {
            const msg = 'Este email já está registrado. Faça login com sua conta existente.';
            return {
              message: msg,
              category: 'CONFLICT',
              fieldErrors: { email: msg },
              retryable: false,
              code: 'CONFLICT_EMAIL_TAKEN',
            };
          }
          if (conflictField === 'username') {
            const msg = 'Este nome de usuário já está sendo usado. Tente outro.';
            return {
              message: msg,
              category: 'CONFLICT',
              fieldErrors: { username: msg },
              retryable: false,
              code: 'CONFLICT_USERNAME_TAKEN',
            };
          }
        }

        return {
          message: 'Conflito de dados. Verifique as informações e tente novamente.',
          category: 'CONFLICT',
          retryable: false,
          code: 'CONFLICT_GENERIC',
        };
      }

      case 429: {
        const baseMsg = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
        const message = retryAfter
          ? `${baseMsg} Tente novamente em ${retryAfter} segundos.`
          : baseMsg;
        return {
          message,
          category: 'SERVER',
          retryable: true,
          retryAfter,
          code: 'RATE_LIMITED',
        };
      }

      case 400: {
        const fieldErrors: Record<string, string> = {};
        if (responseData) {
          // Format 1: details array (structured fields)
          if (Array.isArray(responseData.details)) {
            responseData.details.forEach((detail: any) => {
              if (detail && typeof detail === 'object' && detail.field && detail.message) {
                const fieldName = String(detail.field);
                let mappedMsg = String(detail.message);
                if (
                  fieldName === 'email' &&
                  (mappedMsg.includes('email') || mappedMsg.includes('válido'))
                ) {
                  mappedMsg = 'Insira um email válido (exemplo: voce@dominio.com)';
                }
                fieldErrors[fieldName] = mappedMsg;
              }
            });
          }
          // Format 2: NestJS validation message array
          else if (Array.isArray(responseData.message)) {
            responseData.message.forEach((msg: any) => {
              if (typeof msg === 'string') {
                const lower = msg.toLowerCase();
                if (lower.includes('email')) {
                  fieldErrors['email'] = 'Insira um email válido (exemplo: voce@dominio.com)';
                } else if (lower.includes('password') || lower.includes('senha')) {
                  fieldErrors['password'] =
                    'A senha deve ter no mínimo 8 caracteres e conter pelo menos uma letra maiúscula.';
                } else if (lower.includes('username') || lower.includes('usuário')) {
                  fieldErrors['username'] =
                    'Este nome de usuário já está sendo usado. Tente outro.';
                } else if (lower.includes('birthday') || lower.includes('nascimento')) {
                  fieldErrors['birthdayDate'] =
                    'Data de nascimento inválida. Use o formato yyyy-MM-dd.';
                }
              }
            });
          }
        }

        const hasFieldErrors = Object.keys(fieldErrors).length > 0;
        return {
          message: 'Dados inválidos. Verifique suas informações e tente novamente.',
          category: 'VALIDATION',
          fieldErrors: hasFieldErrors ? fieldErrors : undefined,
          retryable: false,
          code: 'BAD_REQUEST_GENERIC',
        };
      }

      case 404: {
        return {
          message: 'Recurso não encontrado.',
          category: 'NOT_FOUND',
          retryable: false,
          code: 'NOT_FOUND',
        };
      }

      default: {
        if (status >= 500 && status <= 599) {
          return {
            message: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
            category: 'SERVER',
            retryable: true,
            code: 'SERVER_ERROR',
          };
        }
      }
    }
  }

  // 4. Default Fallback / Unknown
  return {
    message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    category: 'UNKNOWN',
    retryable: false,
    code: 'UNKNOWN_ERROR',
  };
};
