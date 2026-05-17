/*
 * Referencia para integracao futura:
 * - Os mocks estao separados por dominio para facilitar manutencao e leitura.
 * - Quando a API estiver pronta, substitua imports deste arquivo por chamadas em src/services/api.
 */

// Mocks dinamicos (Debug Session)
export * from '@/mocks/debug-seed';

// Mocks estaticos (Shared UI/Explore)
export * from '@/mocks/profile';
export * from '@/mocks/explore';
export * from '@/mocks/comments';
