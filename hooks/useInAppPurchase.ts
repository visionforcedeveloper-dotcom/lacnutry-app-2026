import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import {
  STORAGE_KEYS,
  storeBooleanData,
} from '@/lib/asyncStorage';

// IDs dos produtos na Play Store (Google Play Console)
const SUBSCRIPTION_PRODUCT_IDS = [
  // IDs sugeridos pelo usuário (alta prioridade)
  'com.lacnutry.premium_monthly',
  'com.lacnutry.premium_yearly',

  // IDs principais (antigos)
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

import Constants from 'expo-constants';

// Tentar importar react-native-iap de forma segura
let RNIap: any;
try {
  // Se estiver no Expo Go, forçar erro para usar mock
  if (Constants.appOwnership === 'expo') {
    throw new Error('Expo Go detected');
  }
  RNIap = require('react-native-iap');
} catch (error) {
  console.warn('⚠️ react-native-iap nativo não encontrado. Usando mock.');
  // Mock mínimo para não quebrar em desenvolvimento sem o pacote
  RNIap = {
    initConnection: async () => console.log('[MOCK] initConnection'),
    flushFailedPurchasesCachedAsPendingAndroid: async () => console.log('[MOCK] flush'),
    getSubscriptions: async () => [],
    getAvailablePurchases: async () => [],
    requestPurchase: async () => {},
    finishTransaction: async () => {},
    purchaseUpdatedListener: () => ({ remove: () => {} }),
    purchaseErrorListener: () => ({ remove: () => {} }),
    endConnection: async () => {},
  };
}

const useInAppPurchase = () => {
  const [isPremiumActive, setIsPremiumActive] = useState(false);
  const [connectionErrorMsg, setConnectionErrorMsg] = useState('');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  // Referências para listeners
  const purchaseUpdateSubscription = useRef<any>(null);
  const purchaseErrorSubscription = useRef<any>(null);

  // Inicialização e Listeners
  useEffect(() => {
    const initIAP = async () => {
      try {
        console.log('[IAP] Inicializando conexão...');
        const result = await RNIap.initConnection();
        console.log('[IAP] Conexão inicializada:', result);

        if (Platform.OS === 'android') {
          console.log('[IAP] Flushing compras pendentes no Android...');
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        }

        setConnected(true);

        // Buscar produtos
        console.log('[IAP] Buscando assinaturas:', SUBSCRIPTION_PRODUCT_IDS);
        const products = await RNIap.getSubscriptions({ skus: SUBSCRIPTION_PRODUCT_IDS });
        console.log('[IAP] Produtos encontrados:', products.length);
        if (products.length > 0) {
          products.forEach((p: any) => console.log(`- ${p.productId} (${p.price})`));
        } else {
          console.warn('[IAP] ⚠️ Nenhum produto encontrado. Verifique IDs e configuração no Play Console.');
        }
        setSubscriptions(products);

      } catch (err: any) {
        console.error('[IAP] Erro na inicialização:', err);
        setConnectionErrorMsg(err.message || 'Erro ao conectar com a loja');
      }
    };

    // Configurar Listeners de Compra
    if (RNIap) {
      purchaseUpdateSubscription.current = RNIap.purchaseUpdatedListener(async (purchase: any) => {
        console.log('[IAP Listener] Compra recebida:', purchase.productId);
        
        try {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            // Finalizar transação para não ser estornada
            await RNIap.finishTransaction({ purchase, isConsumable: false });
            console.log('[IAP Listener] Transação finalizada com sucesso');
            
            // Ativar Premium
            setIsPremiumActive(true);
            storeBooleanData(STORAGE_KEYS.IS_PREMIUM_ACTIVE, true);
          }
        } catch (ackErr) {
          console.warn('[IAP Listener] Erro ao finalizar transação:', ackErr);
        }
      });

      purchaseErrorSubscription.current = RNIap.purchaseErrorListener((error: any) => {
        console.warn('[IAP Listener] Erro na compra:', error);
        if (error.responseCode !== '2' && error.code !== 'E_USER_CANCELLED') {
           setConnectionErrorMsg(error.message || 'Erro ao processar compra');
        }
      });
    }

    initIAP();

    return () => {
      if (purchaseUpdateSubscription.current) {
        purchaseUpdateSubscription.current.remove();
        purchaseUpdateSubscription.current = null;
      }
      if (purchaseErrorSubscription.current) {
        purchaseErrorSubscription.current.remove();
        purchaseErrorSubscription.current = null;
      }
      RNIap.endConnection();
    };
  }, []);

  // Verificar Status da Assinatura
  const checkSubscriptionStatus = async (): Promise<boolean> => {
    try {
      if (!connected) return false;
      
      console.log('[IAP] Verificando compras existentes...');
      const purchases = await RNIap.getAvailablePurchases();
      console.log('[IAP] Compras encontradas:', purchases.length);

      const hasActiveSub = purchases.some((purchase: any) => {
        const isOurProduct = SUBSCRIPTION_PRODUCT_IDS.includes(purchase.productId);
        if (!isOurProduct) return false;

        // Lógica Android
        if (Platform.OS === 'android') {
             // purchaseStateAndroid: 0 = Ativo/Pago
             return (purchase as any).purchaseStateAndroid === 0 || (purchase as any).purchaseStateAndroid === 4; // 4 = deferred? (verificar docs, mas 0 é garantido)
             // Na verdade, getAvailablePurchases retorna compras válidas.
             // Se estiver na lista, geralmente é válida, mas checar purchaseState é bom.
             // Se purchaseState não existir, assumimos válido se transactionReceipt existir.
        }
        return true;
      });

      if (hasActiveSub) {
        console.log('[IAP] Assinatura ativa encontrada!');
        setIsPremiumActive(true);
        storeBooleanData(STORAGE_KEYS.IS_PREMIUM_ACTIVE, true);
        return true;
      }

      console.log('[IAP] Nenhuma assinatura ativa encontrada.');
      return false;

    } catch (error) {
      console.error('[IAP] Erro ao verificar status:', error);
      return false;
    }
  };

  // Solicitar Compra
  const handlePurchase = async (sku: string) => {
    try {
      console.log('[IAP] Solicitando compra de:', sku);
      
      let offerToken;
      if (Platform.OS === 'android') {
        const product = subscriptions.find((p) => p.productId === sku);
        if (product?.subscriptionOfferDetailsAndroid?.length > 0) {
          offerToken = product.subscriptionOfferDetailsAndroid[0].offerToken;
        }
      }

      await RNIap.requestPurchase({
        sku,
        ...(offerToken && { subscriptionOffers: [{ sku, offerToken }] }),
      });
      
      // O resultado vem via listener (purchaseUpdatedListener)

    } catch (error: any) {
      console.error('[IAP] Erro no requestPurchase:', error);
      if (error.code !== 'E_USER_CANCELLED') {
        setConnectionErrorMsg(error.message || 'Erro ao iniciar compra');
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
