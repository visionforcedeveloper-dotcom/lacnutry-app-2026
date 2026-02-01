import Purchases, { PurchasesOffering, LOG_LEVEL } from 'react-native-purchases';

// Configuração das chaves da API
const REVENUECAT_API_KEY = 'goog_FcaBGmgzPTgJqWLjMfYcPLLzdQO';

export class RevenueCatService {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('[RevenueCat] Inicializando...');
      
      // Configurar RevenueCat
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: null, // Deixar null para usar anonymous ID
      });

      // Configurar logs para debug (apenas em desenvolvimento)
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      this.initialized = true;
      console.log('[RevenueCat] Inicializado com sucesso');
    } catch (error) {
      console.error('[RevenueCat] Erro na inicialização:', error);
      throw error;
    }
  }

  static async getOfferings(): Promise<PurchasesOffering[]> {
    try {
      const offerings = await Purchases.getOfferings();
      console.log('[RevenueCat] Ofertas carregadas:', offerings.all);
      return Object.values(offerings.all);
    } catch (error) {
      console.error('[RevenueCat] Erro ao carregar ofertas:', error);
      return [];
    }
  }

  static async getCurrentOffering(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('[RevenueCat] Erro ao carregar oferta atual:', error);
      return null;
    }
  }

  static async purchasePackage(packageToPurchase: any): Promise<boolean> {
    try {
      console.log('[RevenueCat] Iniciando compra:', packageToPurchase.identifier);
      
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('[RevenueCat] Compra realizada:', customerInfo);
      
      // Verificar se o usuário tem acesso premium
      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      return isPremium;
    } catch (error: any) {
      console.error('[RevenueCat] Erro na compra:', error);
      
      if (error.code === 'PURCHASE_CANCELLED') {
        console.log('[RevenueCat] Compra cancelada pelo usuário');
        return false;
      }
      
      throw error;
    }
  }

  static async restorePurchases(): Promise<boolean> {
    try {
      console.log('[RevenueCat] Restaurando compras...');
      
      const customerInfo = await Purchases.restorePurchases();
      
      console.log('[RevenueCat] Compras restauradas:', customerInfo);
      
      // Verificar se o usuário tem acesso premium
      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      return isPremium;
    } catch (error) {
      console.error('[RevenueCat] Erro ao restaurar compras:', error);
      throw error;
    }
  }

  static async getCustomerInfo(): Promise<any> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Erro ao obter info do cliente:', error);
      throw error;
    }
  }

  static async isPremiumActive(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active['premium'] !== undefined;
    } catch (error) {
      console.error('[RevenueCat] Erro ao verificar premium:', error);
      return false;
    }
  }
}