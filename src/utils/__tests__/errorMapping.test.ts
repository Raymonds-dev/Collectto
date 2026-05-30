import { mapErrorToMessage } from '../errorMapping';
import { ApiError } from '@/services/api/types';

describe('Error Mapping Utility', () => {
  // Scenario A: HTTP 401 Unauthorized during login
  it('should map HTTP 401 during login to invalid credentials error', () => {
    const apiError = new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    const mapped = mapErrorToMessage(apiError, 'login');

    expect(mapped).toEqual({
      message: 'Email ou senha incorretos. Tente novamente ou redefina sua senha.',
      category: 'AUTH',
      retryable: false,
      code: 'AUTH_INVALID_CREDS',
    });
  });

  // Scenario B: HTTP 401 Unauthorized post-auth
  it('should map HTTP 401 during profile_update or other contexts to session expired error', () => {
    const apiError = new ApiError('Unauthorized', 'UNAUTHORIZED', 401);

    const mappedProfile = mapErrorToMessage(apiError, 'profile_update');
    expect(mappedProfile).toEqual({
      message: 'Sua sessão expirou. Faça login novamente.',
      category: 'AUTH',
      retryable: false,
      code: 'AUTH_SESSION_EXPIRED',
    });

    const mappedGeneric = mapErrorToMessage(apiError, 'generic');
    expect(mappedGeneric).toEqual({
      message: 'Sua sessão expirou. Faça login novamente.',
      category: 'AUTH',
      retryable: false,
      code: 'AUTH_SESSION_EXPIRED',
    });
  });

  // 401 signup context
  it('should map HTTP 401 during signup to unauthorized error', () => {
    const apiError = new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    const mapped = mapErrorToMessage(apiError, 'signup');

    expect(mapped).toEqual({
      message: 'Você não tem permissão para fazer isso. Verifique seu cadastro.',
      category: 'AUTH',
      retryable: false,
      code: 'AUTH_UNAUTHORIZED',
    });
  });

  // Scenario C: HTTP 409 Email conflict during signup
  it('should map HTTP 409 email conflict during signup to email taken conflict error', () => {
    const apiError = new ApiError('Conflict', 'CONFLICT', 409, {
      field: 'email',
    });
    const mapped = mapErrorToMessage(apiError, 'signup');

    expect(mapped).toEqual({
      message: 'Este email já está registrado. Faça login com sua conta existente.',
      category: 'CONFLICT',
      fieldErrors: {
        email: 'Este email já está registrado. Faça login com sua conta existente.',
      },
      retryable: false,
      code: 'CONFLICT_EMAIL_TAKEN',
    });
  });

  it('should detect email conflict from message if field is not specified', () => {
    const apiError = new ApiError('Conflict', 'CONFLICT', 409, {
      message: 'email already exists',
    });
    const mapped = mapErrorToMessage(apiError, 'signup');

    expect(mapped.code).toBe('CONFLICT_EMAIL_TAKEN');
    expect(mapped.fieldErrors?.email).toBe(
      'Este email já está registrado. Faça login com sua conta existente.'
    );
  });

  // Username conflict
  it('should map HTTP 409 username conflict during signup to username taken conflict error', () => {
    const apiError = new ApiError('Conflict', 'CONFLICT', 409, {
      field: 'username',
    });
    const mapped = mapErrorToMessage(apiError, 'signup');

    expect(mapped).toEqual({
      message: 'Este nome de usuário já está sendo usado. Tente outro.',
      category: 'CONFLICT',
      fieldErrors: {
        username: 'Este nome de usuário já está sendo usado. Tente outro.',
      },
      retryable: false,
      code: 'CONFLICT_USERNAME_TAKEN',
    });
  });

  // Scenario D: Timeout error during request
  it('should map timeout error to network timeout error', () => {
    const apiError = new ApiError('Timeout', 'REQUEST_TIMEOUT', 408);
    const mapped = mapErrorToMessage(apiError);

    expect(mapped).toEqual({
      message: 'A solicitação levou muito tempo. Verifique sua conexão e tente novamente.',
      category: 'TIMEOUT',
      retryable: true,
      code: 'NETWORK_TIMEOUT',
    });
  });

  it('should detect timeout from Axios-like plain errors', () => {
    const mockAxiosError = {
      code: 'ECONNABORTED',
      message: 'timeout of 30000ms exceeded',
    };
    const mapped = mapErrorToMessage(mockAxiosError);

    expect(mapped.code).toBe('NETWORK_TIMEOUT');
    expect(mapped.category).toBe('TIMEOUT');
    expect(mapped.retryable).toBe(true);
  });

  // Scenario E: HTTP 429 Too Many Requests with Retry-After header
  it('should map HTTP 429 with Retry-After header to rate limited error with time countdown', () => {
    const mockAxiosError = {
      response: {
        status: 429,
        headers: {
          'retry-after': '45',
        },
      },
    };
    const mapped = mapErrorToMessage(mockAxiosError);

    expect(mapped).toEqual({
      message:
        'Muitas tentativas. Aguarde alguns minutos e tente novamente. Tente novamente em 45 segundos.',
      category: 'SERVER',
      retryable: true,
      retryAfter: 45,
      code: 'RATE_LIMITED',
    });
  });

  it('should map HTTP 429 without Retry-After header to generic rate limited error', () => {
    const mockAxiosError = {
      response: {
        status: 429,
        headers: {},
      },
    };
    const mapped = mapErrorToMessage(mockAxiosError);

    expect(mapped).toEqual({
      message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
      category: 'SERVER',
      retryable: true,
      code: 'RATE_LIMITED',
    });
  });

  // Network Offline check
  it('should map offline network error to network offline error', () => {
    const apiError = new ApiError('Network Error', 'NETWORK_ERROR', null);
    const mapped = mapErrorToMessage(apiError);

    expect(mapped).toEqual({
      message: 'Sem conexão de internet. Verifique sua conexão e tente novamente.',
      category: 'NETWORK',
      retryable: true,
      code: 'NETWORK_OFFLINE',
    });
  });

  it('should detect offline from Axios-like no-response structure', () => {
    const mockAxiosError = {
      message: 'Network Error',
      request: {},
    };
    const mapped = mapErrorToMessage(mockAxiosError);

    expect(mapped.code).toBe('NETWORK_OFFLINE');
    expect(mapped.category).toBe('NETWORK');
    expect(mapped.retryable).toBe(true);
  });

  // Validation errors (HTTP 400)
  it('should map HTTP 400 with details array to fieldErrors', () => {
    const apiError = new ApiError('Bad Request', 'BAD_REQUEST', 400, {
      details: [
        { field: 'email', message: 'email must be an email' },
        { field: 'password', message: 'password too short' },
      ],
    });
    const mapped = mapErrorToMessage(apiError);

    expect(mapped.category).toBe('VALIDATION');
    expect(mapped.code).toBe('BAD_REQUEST_GENERIC');
    expect(mapped.fieldErrors).toEqual({
      email: 'Insira um email válido (exemplo: voce@dominio.com)',
      password: 'password too short',
    });
  });

  it('should map HTTP 400 with message array to fieldErrors based on string matching', () => {
    const apiError = new ApiError('Bad Request', 'BAD_REQUEST', 400, {
      message: [
        'email must be an email',
        'password must be longer than or equal to 6 characters',
        'username must be lowercase',
      ],
    });
    const mapped = mapErrorToMessage(apiError);

    expect(mapped.category).toBe('VALIDATION');
    expect(mapped.fieldErrors).toEqual({
      email: 'Insira um email válido (exemplo: voce@dominio.com)',
      password: 'A senha deve ter no mínimo 8 caracteres e conter pelo menos uma letra maiúscula.',
      username: 'Este nome de usuário já está sendo usado. Tente outro.',
    });
  });

  it('should return fallback message for generic 400 bad request without details', () => {
    const apiError = new ApiError('Bad Request', 'BAD_REQUEST', 400);
    const mapped = mapErrorToMessage(apiError);

    expect(mapped).toEqual({
      message: 'Dados inválidos. Verifique suas informações e tente novamente.',
      category: 'VALIDATION',
      retryable: false,
      code: 'BAD_REQUEST_GENERIC',
    });
  });

  // HTTP 404
  it('should map HTTP 404 to not found error', () => {
    const apiError = new ApiError('Not Found', 'NOT_FOUND', 404);
    const mapped = mapErrorToMessage(apiError);

    expect(mapped).toEqual({
      message: 'Recurso não encontrado.',
      category: 'NOT_FOUND',
      retryable: false,
      code: 'NOT_FOUND',
    });
  });

  // Server Errors 5xx
  it('should map HTTP 500 or 503 to server error', () => {
    const apiError500 = new ApiError('Internal Server Error', 'INTERNAL', 500);
    const mapped500 = mapErrorToMessage(apiError500);

    expect(mapped500).toEqual({
      message: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
      category: 'SERVER',
      retryable: true,
      code: 'SERVER_ERROR',
    });

    const apiError503 = new ApiError('Service Unavailable', 'UNAVAILABLE', 503);
    const mapped503 = mapErrorToMessage(apiError503);

    expect(mapped503).toEqual({
      message: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
      category: 'SERVER',
      retryable: true,
      code: 'SERVER_ERROR',
    });
  });

  // Fallback / Unknown
  it('should map unhandled errors to unknown fallback error', () => {
    const mapped = mapErrorToMessage(new Error('Random JS Error'));

    expect(mapped).toEqual({
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      category: 'UNKNOWN',
      retryable: false,
      code: 'UNKNOWN_ERROR',
    });
  });
});
