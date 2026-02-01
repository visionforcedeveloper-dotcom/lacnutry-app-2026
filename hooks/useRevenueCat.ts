import { useState, useEffect } from 'react';
import Constants from 'expo-constants';

// Importação condicional baseada no ambiente
function getRevenueCatService() {
  if (Constants.appOwnership === 'expo') {
    // Expo Go - retornar mock
    return null;
  } else {
    // Build nativo - importar RevenueCat real
    try {
      return require('@/lib/revenuecat').RevenueCatService;
    } catch (error) {
      console.error('[useRevenueCat] Erro ao importar RevenueCat:', error);
      return null;
    }
  }
}

const RevenueCatService = getRevenueCatService();
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

export interface UseRevenueCatReturn {
  isInitialized: boolean;
  isPremium: boolean;
  offerings: PurchasesOffering[];
  currentOffering: PurchasesOffering | null;
  isLoading: boolean;
  error: string | null;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshPremiumStatus: () => Promise<void>;
}

export function useRevenueCat(): UseRevenueCatReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering[]>([]);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se está no Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  // Inicializar RevenueCat
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isExpoGo) {
          console.log('Expo Go app detected. Using RevenueCat in Browser Mode.');
          
          // Mock para Expo Go
          setTimeout(() => {
            if (mounted) {
              setIsInitialized(true);
              setCurrentOffering({
                monthly: { identifier: 'mock_monthly' },
                annual: { identifier: 'mock_annual' }
              } as any);
              setIsLoading(false);
            }
          }, 1000);
          return;
        }

        if (!RevenueCatService) {
          throw new Error('RevenueCat não disponível');
        }

        await RevenueCatService.initialize();
        
        if (!mounted) return;
        
        setIsInitialized(true);
        
        // Carregar ofertas
        await loadOfferings();
        
        // Verificar status premium
        await refreshPremiumStatus();
        
      } catch (err: any) {
        console.error('[useRevenueCat] Erro na inicialização:', err);
        if (mounted) {
          setError(err.message || 'Erro ao inicializar RevenueCat');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [isExpoGo]);

  const loadOfferings = async () => {
    if (isExpoGo || !RevenueCatService) return;
    
    try {
      const [allOfferings, current] = await Promise.all([
        RevenueCatService.getOfferings(),
        RevenueCatService.getCurrentOffering()
      ]);
      
      setOfferings(allOfferings);
      setCurrentOffering(current);
      
      console.log('[useRevenueCat] Ofertas carregadas:', allOfferings.length);
      console.log('[useRevenueCat] Oferta atual:', current?.identifier);
      
    } catch (err: any) {
      console.error('[useRevenueCat] Erro ao carregar ofertas:', err);
      setError(err.message || 'Erro ao carregar ofertas');
    }
  };

  const refreshPremiumStatus = async () => {
    if (isExpoGo || !RevenueCatService) return;
    
    try {
      const premium = await RevenueCatService.isPremiumActive();
      setIsPremium(premium);
      console.log('[useRevenueCat] Status premium:', premium);
    } catch (err: any) {
      console.error('[useRevenueCat] Erro ao verificar premium:', err);
    }
  };

  const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<boolean> => {
    try {
      setError(null);
      
      if (isExpoGo) {
        console.log('[RevenueCat Mock] Simulando compra:', packageToPurchase);
        
        // Simular compra bem-sucedida no Expo Go
        return new Promise((resolve) => {
          setTimeout(() => {
            setIsPremium(true);
            resolve(true);
          }, 2000);
        });
      }

      if (!RevenueCatService) {
        throw new Error('RevenueCat não disponível');
      }
      
      const success = await RevenueCatService.purchasePackage(packageToPurchase);
      
      if (success) {
        setIsPremium(true);
        console.log('[useRevenueCat] Compra realizada com sucesso');
      }
      
      return success;
    } catch (err: any) {
      console.error('[useRevenueCat] Erro na compra:', err);
      setError(err.message || 'Erro na compra');
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setError(null);
      
      if (isExpoGo) {
        console.log('[RevenueCat Mock] Simulando restauração de compras');
        return false;
      }

      if (!RevenueCatService) {
        throw new Error('RevenueCat não disponível');
      }
      
      const success = await RevenueCatService.restorePurchases();
      
      if (success) {
        setIsPremium(true);
        console.log('[useRevenueCat] Compras restauradas com sucesso');
      }
      
      return success;
    } catch (err: any) {
      console.error('[useRevenueCat] Erro ao restaurar compras:', err);
      setError(err.message || 'Erro ao restaurar compras');
      return false;
    }
  };

  return {
    isInitialized,
    isPremium,
    offerings,
    currentOffering,
    isLoading,
    error,
    purchasePackage,
    restorePurchases,
    refreshPremiumStatus,
  };
}