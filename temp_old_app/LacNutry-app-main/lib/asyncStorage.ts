import AsyncStorage from '@react-native-async-storage/async-storage';

// Detecta se está rodando na web de forma segura
const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Storage wrapper que funciona em web e mobile
const Storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },
  
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('[Storage] Erro ao salvar na web:', e);
      }
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  
  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('[Storage] Erro ao remover na web:', e);
      }
      return;
    }
    return AsyncStorage.removeItem(key);
  }
};

// Chaves de armazenamento do app
export const STORAGE_KEYS = {
  IS_PREMIUM_ACTIVE: '@is_premium_active',
};

/**
 * Salva um valor booleano no Storage (AsyncStorage no mobile, localStorage na web)
 */
export const storeBooleanData = async (key: string, value: boolean) => {
  try {
    const stringValue = value.toString();
    await Storage.setItem(key, stringValue);
    console.log(`[Storage] Salvo: ${key} = ${value}`);
  } catch (e) {
    console.error(`[Storage] Erro ao salvar ${key}:`, e);
  }
};

/**
 * Recupera um valor booleano do Storage
 * Retorna false se não encontrar nada
 */
export const getBooleanData = async (key: string): Promise<boolean> => {
  try {
    const value = await Storage.getItem(key);
    const boolValue = value === 'true';
    console.log(`📖 [Storage] Lido: ${key} = ${boolValue}`);
    return boolValue;
  } catch (e) {
    console.error(`[Storage] Erro ao ler ${key}:`, e);
    return false;
  }
};

export { Storage };



