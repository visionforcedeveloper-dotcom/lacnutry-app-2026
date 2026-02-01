import { useState, useEffect } from 'react';

export interface UseRevenueCatReturn {
  isInitialized: boolean;
  isPremium: boolean;
  offerings: any[];
  currentOffering: any | null;
  isLoading: boolean;
  error: string | null;
  purchasePackage: (packageToPurchase: any) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshPremiumStatus: () => Promise<void>;
}

export function useRevenueCat(): UseRevenueCatReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Expo Go app detected. Using RevenueCat in Browser Mode.');
    
    // Simular inicialização
    setTimeout(() => {
      setIsInitialized(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  const purchasePackage = async (packageToPurchase: any): Promise<boolean> => {
    console.log('[RevenueCat Mock] Simulando compra:', packageToPurchase);
    
    // Simular compra bem-sucedida
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsPremium(true);
        resolve(true);
      }, 2000);
    });
  };

  const restorePurchases = async (): Promise<boolean> => {
    console.log('[RevenueCat Mock] Simulando restauração de compras');
    return false;
  };

  const refreshPremiumStatus = async (): Promise<void> => {
    console.log('[RevenueCat Mock] Atualizando status premium');
  };

  return {
    isInitialized,
    isPremium,
    offerings: [],
    currentOffering: {
      monthly: { identifier: 'mock_monthly' },
      annual: { identifier: 'mock_annual' }
    },
    isLoading,
    error: null,
    purchasePackage,
    restorePurchases,
    refreshPremiumStatus,
  };
}