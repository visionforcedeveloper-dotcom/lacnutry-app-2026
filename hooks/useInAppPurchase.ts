import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import {
  STORAGE_KEYS,
  storeBooleanData,
  getBooleanData,
} from '@/lib/asyncStorage';

// IDs dos produtos na Play Store (Google Play Console)
const SUBSCRIPTION_PRODUCT_IDS = [
  // IDs principais (novos)
  'com.lactosefree.monthly',
  'com.lactosefree.annual',
  
  // IDs alternativos (testar todos)
  'lacnutry_mensal',
  'lacnutry_anual',
  'lacnutry_annual',
  'lacnutry_plano_mensal_27',
  'lacnutry_premium_anual',
  'lacnutry_premium_monthly',
  'premium_anual',
  'plano_mensal',
];

// Mock do hook useIAP e funções
const mockUseIAP = (options?: any) => {
  return {
    connected: false,
    subscriptions: [],
    fetchProducts: async () => console.log('[MOCK IAP] Fetch products'),
    finishTransaction: async () => console.log('[MOCK IAP] Finish transaction'),
    requestPurchase: async () => console.log('[MOCK IAP] Request purchase'),
  };
};

const mockGetAvailablePurchases = async () => {
  console.log('[MOCK IAP] Get available purchases');
  return [];
};

const mockRequestPurchase = async () => {
  console.log('[MOCK IAP] Request purchase');
  return null;
};

// Variáveis para armazenar o módulo real ou o mock
let useIAP: any = mockUseIAP;
let getAvailablePurchases: any = mockGetAvailablePurchases;
let requestPurchase: any = mockRequestPurchase;

// Tentar importar react-native-iap
try {
  const iap = require('react-native-iap');
  useIAP = iap.useIAP;
  getAvailablePurchases = iap.getAvailablePurchases;
  requestPurchase = iap.requestPurchase;
} catch (error) {
  console.warn('⚠️ react-native-iap nativo não encontrado. Usando mock.');
}

// Tipos precisam ser importados de forma segura ou redefinidos se necessário
// Para simplificar neste contexto, vamos usar 'any' onde os tipos estritos falhariam sem o módulo
type Purchase = any;
type PurchaseError = any;
type ProductSubscription = any;

const { IS_PREMIUM_ACTIVE } = STORAGE_KEYS;

/**
 * Hook customizado para compras in-app
 * ATUALIZADO para usar o novo useIAP hook do react-native-iap v14+
 * Baseado no exemplo oficial: react-native-iap/example-expo
 */
const useInAppPurchase = () => {
  const [isPremiumActive, setIsPremiumActive] = useState(false);
  const [connectionErrorMsg, setConnectionErrorMsg] = useState('');
  const fetchedProductsOnceRef = useRef(false);

  // ==========================================
  // 1. Usar o novo useIAP hook (ou mock)
  // ==========================================
  const {
    connected,
    subscriptions,
    fetchProducts,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase: Purchase) => {
      console.log('[IAP Hook] Compra bem-sucedida!');
      console.log('Product ID:', purchase.productId);
      console.log('Transaction ID:', purchase.transactionId);

      // Finalizar transação
      try {
        await finishTransaction({
          purchase,
          isConsumable: false,
        });
        console.log('[IAP Hook] Transação finalizada');
      } catch (err) {
        console.warn('[IAP Hook] Erro ao finalizar transação:', err);
      }

      // ATIVAR PREMIUM
      setIsPremiumActive(true);
      storeBooleanData(STORAGE_KEYS.IS_PREMIUM_ACTIVE, true);
    },
    onPurchaseError: (error: PurchaseError) => {
      console.error('[IAP Hook] Erro na compra');
      console.error('Code:', error.code);
      console.error('Message:', error.message);

      // Se já possui, ativar
      if ((error.code as string) === 'E_ALREADY_OWNED') {
        console.log('[IAP Hook] Usuário já possui!');
        setIsPremiumActive(true);
        storeBooleanData(STORAGE_KEYS.IS_PREMIUM_ACTIVE, true);
      } else if ((error.code as string) !== 'E_USER_CANCELLED') {
        setConnectionErrorMsg(error.message || 'Erro na compra');
      }
    },
  });

  // ==========================================
  // 2. Buscar produtos quando conectar
  // ==========================================
  useEffect(() => {
    if (connected && !fetchedProductsOnceRef.current) {
      console.log('[IAP Hook] Buscando produtos...');
      console.log('IDs:', SUBSCRIPTION_PRODUCT_IDS);

      fetchProducts({
        skus: SUBSCRIPTION_PRODUCT_IDS,
        type: 'subs',
      });
      fetchedProductsOnceRef.current = true;
    }
  }, [connected, fetchProducts]);

  // ==========================================
  // 3. Log quando produtos forem carregados
  // ==========================================
  useEffect(() => {
    if (subscriptions.length > 0) {
      console.log('[IAP Hook] Produtos carregados:', subscriptions.length);
      subscriptions.forEach((product: any) => {
        console.log(`- ${product.productId || product.id}`);
        console.log(`  Preço: ${product.localizedPrice || product.displayPrice || product.price}`);
        
        // Log detalhes Android
        if (Platform.OS === 'android' && product.subscriptionOfferDetailsAndroid) {
          console.log(`  Ofertas:`, product.subscriptionOfferDetailsAndroid.length);
          product.subscriptionOfferDetailsAndroid.forEach((offer: any, idx: number) => {
            console.log(`    [${idx}] basePlanId: ${offer.basePlanId}, offerToken: ${offer.offerToken?.substring(0, 20)}...`);
          });
        }
      });
    } else if (connected && fetchedProductsOnceRef.current) {
      console.error('[IAP Hook] Nenhum produto encontrado!');
      setConnectionErrorMsg(
        'Produtos não encontrados.\n\n' +
        'Verifique:\n' +
        '- App instalado via Play Store\n' +
        '- Conta cadastrada como testador\n' +
        '- Produtos ativos no Play Console'
      );
    }
  }, [subscriptions, connected]);

  // ==========================================
  // 4. Verificar assinatura ativa no Google Play
  // ==========================================
  const checkSubscriptionStatus = async (): Promise<boolean> => {
    try {
      console.log('[IAP Hook] 🔍 Verificando assinaturas ativas no Google Play...');
      const purchases = await getAvailablePurchases();
      
      console.log('[IAP Hook] Total de compras encontradas:', purchases.length);
      
      // REGRA 1: Sem compras = sem acesso
      if (purchases.length === 0) {
        console.log('[IAP Hook] ❌ Nenhuma assinatura encontrada');
        console.log('[IAP Hook] Motivos possíveis:');
        console.log('[IAP Hook] - Período de teste expirou sem conversão');
        console.log('[IAP Hook] - Usuário cancelou a assinatura');
        console.log('[IAP Hook] - Nunca comprou');
        return false;
      }
      
      // REGRA 2: Verificar se há assinatura ATIVA e PAGA dos nossos produtos
      const hasActiveSub = purchases.some((purchase: any) => {
        console.log('[IAP Hook] 🔎 Analisando compra:', purchase.productId);
        
        // Verificar se é um dos nossos produtos
        const isOurProduct = SUBSCRIPTION_PRODUCT_IDS.includes(purchase.productId);
        
        if (!isOurProduct) {
          console.log('[IAP Hook] ⚠️ Produto não reconhecido:', purchase.productId);
          return false;
        }
        
        // No Android, verificar estado da compra detalhadamente
        if (Platform.OS === 'android') {
          const purchaseState = (purchase as any).purchaseStateAndroid;
          
          // Estados do Google Play:
          // 0 = purchased (ATIVO e PAGO)
          // 1 = canceled (CANCELADO pelo usuário)
          // 2 = pending (PENDENTE - aguardando pagamento)
          
          console.log('[IAP Hook] Estado da compra:', purchaseState);
          
          switch (purchaseState) {
            case 0:
              console.log('[IAP Hook] ✅ Assinatura ATIVA e PAGA');
              return true;
            
            case 1:
              console.log('[IAP Hook] ❌ Assinatura CANCELADA');
              console.log('[IAP Hook] Motivo: Usuário cancelou ou pagamento recusado');
              return false;
            
            case 2:
              console.log('[IAP Hook] ⏳ Assinatura PENDENTE');
              console.log('[IAP Hook] Motivo: Aguardando aprovação do pagamento');
              console.log('[IAP Hook] Possíveis causas:');
              console.log('[IAP Hook] - Cartão bloqueado');
              console.log('[IAP Hook] - Sem saldo/limite');
              console.log('[IAP Hook] - Pagamento em análise');
              return false;
            
            default:
              console.log('[IAP Hook] ❓ Estado desconhecido:', purchaseState);
              return false;
          }
        }
        
        // iOS considera ativa se está na lista getAvailablePurchases
        return true;
      });
      
      if (hasActiveSub) {
        console.log('[IAP Hook] 🎉 Usuário tem assinatura válida!');
        setIsPremiumActive(true);
        storeBooleanData(STORAGE_KEYS.IS_PREMIUM_ACTIVE, true);
        return true;
      }
      
      console.log('[IAP Hook] ❌ Nenhuma assinatura válida encontrada nos produtos conhecidos');
      return false;
      
    } catch (error) {
      console.error('[IAP Hook] Erro ao verificar status:', error);
      return false;
    }
  };

  /**
   * Função pública para solicitar compra
   */
  const handlePurchase = async (sku: string) => {
    try {
      console.log('[IAP Hook] Solicitando compra:', sku);
      
      // Buscar oferta específica para Android se necessário
      let offerToken;
      if (Platform.OS === 'android') {
        const product = subscriptions.find((p: any) => p.productId === sku);
        if (product && product.subscriptionOfferDetailsAndroid && product.subscriptionOfferDetailsAndroid.length > 0) {
          // Pega o primeiro offerToken disponível (geralmente é o base plan ou trial)
          offerToken = product.subscriptionOfferDetailsAndroid[0].offerToken;
        }
      }

      await requestPurchase({
        sku,
        ...(offerToken && { subscriptionOffers: [{ sku, offerToken }] }),
      });
      
    } catch (error: any) {
      console.error('[IAP Hook] Erro ao solicitar compra:', error);
      if (error.code !== 'E_USER_CANCELLED') {
        setConnectionErrorMsg(error.message || 'Erro ao processar compra');
      }
    }
  };

  return {
    isPremiumActive,
    subscriptions,
    connectionErrorMsg,
    checkSubscriptionStatus,
    handlePurchase,
    connected,
  };
};

export default useInAppPurchase;
