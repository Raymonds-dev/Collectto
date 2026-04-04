import { type AuthUser } from '@/types/auth';

export const MOCK_AUTH_SESSION_TOKEN = 'mock-session-token';
export const MOCK_AUTH_BOOTSTRAP_EMAIL = 'user@collectto.app';

// TODO(api): substituir construcao local por payload retornado no endpoint de autenticacao.
export function buildMockAuthUser(email: string): AuthUser {
  return {
    id: 'local-user',
    email,
    name: email.split('@')[0] || 'User',
  };
}
