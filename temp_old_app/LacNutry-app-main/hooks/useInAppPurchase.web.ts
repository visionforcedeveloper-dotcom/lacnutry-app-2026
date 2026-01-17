/**
 * MOCK para Web
 * react-native-iap NÃO funciona na web
 * Este mock permite testar a interface sem quebrar o app
 */

import { useState } from 'react';

const useInAppPurchase = () => {
  const [isPremiumActive] = useState(false);
  const [connectionErrorMsg] = useState(
    'Pagamentos não disponíveis na versão web.\n\n' +
    'Para testar pagamentos, use o aplicativo mobile.'
  );

  const purchaseProduct = async (productId: string) => {
    console.log('[WEB IAP] Tentativa de compra:', productId);
    console.log('[WEB IAP] Pagamentos não disponíveis na web');
    throw new Error('Pagamentos não disponíveis na versão web');
  };

  const checkSubscriptionStatus = async (): Promise<boolean> => {
    console.log('[WEB IAP] Verificação de assinatura na web');
    return false;
  };

  return {
    isPremiumActive,
    connectionErrorMsg,
    purchaseProduct,
    checkSubscriptionStatus,
    connected: false,
    products: [],
  };
};

export default useInAppPurchase;








