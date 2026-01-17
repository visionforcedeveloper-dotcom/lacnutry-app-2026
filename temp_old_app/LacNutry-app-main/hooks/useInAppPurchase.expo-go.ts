/**
 * MOCK para Expo Go
 * react-native-iap NÃO funciona no Expo Go (precisa de NitroModules)
 * Este mock permite testar a interface sem quebrar o app
 */

import { useState } from 'react';

const useInAppPurchase = () => {
  const [isPremiumActive] = useState(false);
  const [connectionErrorMsg] = useState(
    'Expo Go não suporta Google Play Billing.\n\n' +
    'Para testar pagamentos:\n' +
    '1. Gere AAB: eas build --platform android\n' +
    '2. Upload no Play Console\n' +
    '3. Instale via Play Store'
  );

  const purchaseProduct = async (productId: string) => {
    console.log('[MOCK IAP] Tentativa de compra:', productId);
    console.log('[MOCK IAP] Expo Go não suporta billing');
    throw new Error('Google Play Billing não disponível no Expo Go');
  };

  const checkSubscriptionStatus = async (): Promise<boolean> => {
    console.log('[MOCK IAP] Verificação de assinatura no Expo Go');
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

