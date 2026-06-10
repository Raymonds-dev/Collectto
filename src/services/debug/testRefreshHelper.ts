import { sessionRefreshManager } from '../auth/sessionRefreshManager';
import { getSessionRefreshToken } from '../storage/authSession';

/**
 * Script utilitário temporário para testar a rotação do Refresh Token.
 * Imprime os tokens (atual, novo e novo armazenado) no console de debug do dispositivo/simulador.
 */
export const runRefreshTest = async (): Promise<void> => {
  console.log('\n==================================================');
  console.log('🔄 [TEST-REFRESH] Iniciando teste de refresh token...');
  console.log('==================================================');

  try {
    // 1. Token atual armazenado
    const currentStoredRefresh = await getSessionRefreshToken();
    console.log('1. Refresh Token Armazenado ATUAL:', currentStoredRefresh);

    // 2. Executar o refresh
    console.log('2. Executando performRefresh()...');
    const newAccess = await sessionRefreshManager.performRefresh();
    console.log('3. Novo Access Token retornado:', newAccess);

    // 3. Novo token armazenado
    const newStoredRefresh = await getSessionRefreshToken();
    console.log('4. Novo Refresh Token Armazenado (Armazenamento Seguro):', newStoredRefresh);

    if (currentStoredRefresh === newStoredRefresh) {
      console.warn('⚠️ [TEST-REFRESH] Alerta: O Refresh Token não rotacionou/mudou.');
    } else {
      console.log('✅ [TEST-REFRESH] Rotação concluída com sucesso!');
    }
    console.log('==================================================\n');
  } catch (error: any) {
    console.error('❌ [TEST-REFRESH] Falha no teste de refresh:', error);
    console.log('==================================================\n');
  }
};
