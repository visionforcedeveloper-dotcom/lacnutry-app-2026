import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { useIAP, requestPurchase, getAvailablePurchases, type Purchase, type PurchaseError, type ProductSubscription } from 'react-native-iap';
import {
  STORAGE_KEYS,
  storeBooleanData,
  getBooleanData,
} from '@/lib/asyncStorage';

const { IS_PREMIUM_ACTIVE } = STORAGE_KEYS;

// IDs dos produtos na Play Store (Google Play Console)
// IMPORTANTE: Devem corresponder EXATAMENTE aos IDs criados no Play Console
// BUSCAR TODOS os IDs possíveis para testar qual funciona
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
  // 1. Usar o novo useIAP hook
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
      setAndStoreFullAppPurchase(true);
    },
    onPurchaseError: (error: PurchaseError) => {
      console.error('[IAP Hook] Erro na compra');
      console.error('Code:', error.code);
      console.error('Message:', error.message);

      // Se já possui, ativar
      if (error.code === 'E_ALREADY_OWNED') {
        console.log('[IAP Hook] Usuário já possui!');
        setAndStoreFullAppPurchase(true);
      } else if (error.code !== 'E_USER_CANCELLED') {
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
      const hasActiveSub = purchases.some(purchase => {
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
        // (Apple já remove automaticamente assinaturas expiradas/canceladas)
        console.log('[IAP Hook] ✅ iOS - assinatura ativa');
        return true;
      });
      
      if (hasActiveSub) {
        console.log('[IAP Hook] ✅ ACESSO LIBERADO - Assinatura válida encontrada');
      } else {
        console.log('[IAP Hook] 🚫 ACESSO BLOQUEADO - Sem assinatura válida');
        console.log('[IAP Hook] Redirecionando para paywall...');
      }
      
      return hasActiveSub;
      
    } catch (error) {
      console.error('[IAP Hook] ❌ Erro ao verificar assinatura:', error);
      // IMPORTANTE: Em caso de erro de rede, retorna false por segurança
      // Melhor bloquear temporariamente do que dar acesso indevido
      console.log('[IAP Hook] Por segurança, bloqueando acesso até resolver o erro');
      return false;
    }
  };

  // ==========================================
  // 5. Carregar status premium salvo e verificar com Google Play
  // ==========================================
  useEffect(() => {
    getBooleanData(IS_PREMIUM_ACTIVE).then((data) => {
      console.log('[IAP Hook] Status premium salvo:', data);
      setIsPremiumActive(data);
    });
  }, []);

  // ==========================================
  // 6. Verificar assinatura quando conectar ao Google Play
  // ==========================================
  useEffect(() => {
    if (connected) {
      console.log('[IAP Hook] Conectado! Verificando status da assinatura...');
      
      // Aguardar um pouco para garantir que a conexão está estável
      const timer = setTimeout(async () => {
        const isActive = await checkSubscriptionStatus();
        
        // Atualizar status apenas se mudou
        const currentStatus = await getBooleanData(IS_PREMIUM_ACTIVE);
        if (isActive !== currentStatus) {
          console.log('[IAP Hook] Status mudou! Antigo:', currentStatus, '| Novo:', isActive);
          setAndStoreFullAppPurchase(isActive);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [connected]);

  // ==========================================
  // Função para comprar produto
  // ==========================================
  const purchaseProduct = async (productId: string) => {
    console.log('[IAP Hook] Iniciando compra:', productId);

    // Reset erro
    if (connectionErrorMsg) setConnectionErrorMsg('');

    if (!connected) {
      const errorMsg = 'Não conectado ao Google Play';
      console.error('[IAP Hook]', errorMsg);
      setConnectionErrorMsg(errorMsg);
      return;
    }

    if (subscriptions.length === 0) {
      const errorMsg = 'Nenhum produto disponível';
      console.error('[IAP Hook]', errorMsg);
      setConnectionErrorMsg(errorMsg);
      return;
    }

    // Verificar se produto existe
    const subscription = subscriptions.find((p: any) => 
      (p.productId === productId || p.id === productId)
    );
    
    if (!subscription) {
      const errorMsg = `Produto ${productId} não encontrado`;
      console.error('[IAP Hook]', errorMsg);
      setConnectionErrorMsg(errorMsg);
      return;
    }

    try {
      console.log('[IAP Hook] Produto encontrado, iniciando compra...');

      // Usar a mesma abordagem do exemplo funcionando
      await requestPurchase({
        request: {
          ios: {
            sku: productId,
          },
          android: {
            skus: [productId],
            subscriptionOffers:
              Platform.OS === 'android' &&
              'subscriptionOfferDetailsAndroid' in subscription &&
              (subscription as any).subscriptionOfferDetailsAndroid
                ? (subscription as any).subscriptionOfferDetailsAndroid.map((offer: any) => ({
                    sku: productId,
                    offerToken: offer.offerToken,
                  }))
                : [],
          },
        },
        type: 'subs',
      });

      console.log('[IAP Hook] Requisição de compra enviada!');

    } catch (error: any) {
      console.error('[IAP Hook] Erro ao comprar:', error);
      
      if (error.code !== 'E_USER_CANCELLED') {
        setConnectionErrorMsg(error.message || 'Erro ao processar compra');
      }
      
      throw error;
    }
  };

  // ==========================================
  // Função auxiliar: salvar status premium
  // ==========================================
  const setAndStoreFullAppPurchase = (value: boolean) => {
    setIsPremiumActive(value);
    storeBooleanData(IS_PREMIUM_ACTIVE, value);
    console.log(`[IAP Hook] Premium ativo:`, value);
  };

  // ==========================================
  // RETORNAR
  // ==========================================
  return {
    isPremiumActive,
    connectionErrorMsg,
    purchaseProduct,
    connected,
    products: subscriptions,
    checkSubscriptionStatus, // Expor função para verificação manual
  };
};

export default useInAppPurchase;
