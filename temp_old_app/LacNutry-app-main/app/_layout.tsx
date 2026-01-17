import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { trpc, trpcClient } from "@/lib/trpc";
import Constants from 'expo-constants';

const queryClient = new QueryClient();

// Função para carregar o hook IAP dinamicamente
function getInAppPurchaseHook() {
  try {
    if (Constants.appOwnership === 'expo') {
      return require('@/hooks/useInAppPurchase.expo-go').default;
    } else {
      return require('@/hooks/useInAppPurchase').default;
    }
  } catch (error) {
    console.error('[Navigation] Erro ao carregar hook IAP:', error);
    return null;
  }
}

function NavigationHandler() {
  const router = useRouter();
  const segments = useSegments();
  const { isFirstAccess, hasCompletedQuiz, hasSubscription, isLoading, cancelSubscription } = useProfile();
  const [hasShownExpirationAlert, setHasShownExpirationAlert] = useState(false);
  
  // Hook IAP (apenas em build nativo)
  const useInAppPurchaseHook = getInAppPurchaseHook();
  const iapData = useInAppPurchaseHook ? useInAppPurchaseHook() : null;

  // ==========================================
  // VERIFICAÇÃO PERIÓDICA DE ASSINATURA
  // ==========================================
  useEffect(() => {
    if (!iapData || !hasSubscription) return;

    const checkSubscription = async () => {
      try {
        console.log('[Navigation] 🔍 Verificando status da assinatura com Google Play...');
        
        if (!iapData.checkSubscriptionStatus) {
          console.log('[Navigation] Função de verificação não disponível');
          return;
        }
        
        const isActive = await iapData.checkSubscriptionStatus();
        
        // VERIFICAR SE PERDEU ACESSO
        // Possíveis cenários:
        // 1. Período de teste (3 dias) expirou sem conversão
        // 2. Usuário cancelou a assinatura
        // 3. Pagamento recusado (cartão bloqueado, sem saldo, etc)
        // 4. Assinatura vencida/expirada
        if (hasSubscription && !isActive && !hasShownExpirationAlert) {
          console.log('[Navigation] 🚫 ACESSO PERDIDO - Bloqueando app...');
          
          // Desativar assinatura no contexto IMEDIATAMENTE
          await cancelSubscription();
          
          // Mostrar alerta explicativo
          setHasShownExpirationAlert(true);
          Alert.alert(
            '🔒 Acesso Bloqueado',
            'Detectamos que sua assinatura não está mais ativa.\n\n' +
            'Isso pode ter acontecido por:\n' +
            '• Período de teste (3 dias) expirou\n' +
            '• Assinatura foi cancelada\n' +
            '• Pagamento recusado (cartão bloqueado/sem saldo)\n' +
            '• Assinatura vencida\n\n' +
            'Para continuar usando o LacNutry, assine um plano agora!',
            [
              {
                text: 'Ver Planos e Assinar',
                onPress: () => {
                  router.replace('/paywall');
                },
              },
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error('[Navigation] Erro ao verificar assinatura:', error);
      }
    };

    // VERIFICAÇÃO 1: Ao montar o componente
    checkSubscription();

    // VERIFICAÇÃO 2: Quando o app volta do background
    // Importante para detectar quando usuário cancela pelo Play Store
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[Navigation] 📱 App voltou do background - verificando assinatura...');
        checkSubscription();
      }
    });

    // VERIFICAÇÃO 3: A cada 5 minutos (enquanto app está aberto)
    // Para detectar expirações durante uso
    const interval = setInterval(() => {
      console.log('[Navigation] ⏰ Verificação periódica (5min)...');
      checkSubscription();
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [hasSubscription, iapData, cancelSubscription, hasShownExpirationAlert]);

  // ==========================================
  // NAVEGAÇÃO BASEADA NO STATUS DO USUÁRIO
  // ==========================================
  useEffect(() => {
    if (isLoading) return;

    // Usuário está em uma das telas de fluxo de onboarding - não redirecionar
    const isInOnboardingFlow = segments.includes("welcome") || 
                               segments.includes("quiz-lactose") || 
                               segments.includes("testimonials") ||
                               segments.includes("paywall") ||
                               segments.includes("loading");
    
    if (isInOnboardingFlow) {
      console.log('[Navigation] Usuário em fluxo de onboarding, não redirecionando');
      return;
    }

    // Fluxo de navegação correto:
    // 1. Primeiro acesso -> Welcome
    if (isFirstAccess) {
      console.log('[Navigation] Redirecionando para welcome (primeiro acesso)');
      router.replace("/welcome");
      return;
    }

    // 2. Quiz não completado -> Quiz
    if (!hasCompletedQuiz) {
      console.log('[Navigation] Redirecionando para quiz (não completado)');
      router.replace("/quiz-lactose");
      return;
    }

    // 3. Sem assinatura -> Paywall (OBRIGATÓRIO!)
    if (!hasSubscription) {
      console.log('[Navigation] Redirecionando para paywall (sem assinatura)');
      router.replace("/paywall");
      return;
    }

    // 4. Tudo OK -> Pode usar o app
    console.log('[Navigation] Usuário tem acesso completo ao app');
    
  }, [isFirstAccess, hasCompletedQuiz, hasSubscription, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>
          <NavigationHandler />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="quiz-lactose" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="testimonials" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="paywall" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="loading" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="configuracoes" options={{ title: "Configurações", headerShown: true }} />
            <Stack.Screen name="editar-perfil" options={{ title: "Editar Perfil", headerShown: true }} />
            <Stack.Screen name="favoritos" options={{ title: "Favoritos", headerShown: true }} />
            <Stack.Screen name="historico" options={{ title: "Histórico", headerShown: true }} />
            <Stack.Screen name="nutricionista" />
            <Stack.Screen name="gerador-receitas" />
            <Stack.Screen name="receita/[id]" />
            <Stack.Screen name="test-trpc" options={{ title: "Test tRPC", headerShown: true }} />
          </Stack>
        </ProfileProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
