/**
 * Interface do adaptador de armazenamento de chave-valor.
 * Permite alternar entre SecureStore (nativo) e localStorage/in-memory (web).
 */
export interface StorageAdapter {
  /**
   * Recupera o valor de uma chave armazenada.
   * Retorna null caso a chave não exista ou esteja inacessível.
   */
  getItem: (key: string) => Promise<string | null>;

  /**
   * Grava um valor associado a uma chave.
   * Lança erro caso a operação falhe irreversivelmente.
   */
  setItem: (key: string, value: string) => Promise<void>;

  /**
   * Remove a chave especificada.
   * Não lança erro caso a chave não exista.
   */
  removeItem: (key: string) => Promise<void>;
}
