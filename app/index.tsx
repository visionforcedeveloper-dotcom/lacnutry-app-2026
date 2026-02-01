import React, { useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { router } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";

export default function IndexScreen() {
  const profileContext = useProfile();

  console.log('[IndexScreen] Renderizando tela de entrada...');

  // Verificar se o contexto está carregado
  if (!profileContext) {
    console.log('[IndexScreen] Contexto não disponível');
    return <LoadingScreen message="Inicializando aplicativo..." />;
  }

  const { 
    isLoading, 
    isFirstAccess, 
    hasCompletedQuiz, 
    hasSubscription,
    quizProgress 
  } = profileContext;

  // Mostrar loading enquanto carrega dados
  if (isLoading) {
    console.log('[IndexScreen] Ainda carregando dados...');
    return <LoadingScreen message="Carregando seus dados..." />;
  }

  // Lógica de roteamento baseada no estado do usuário
  useEffect(() => {
    console.log('[IndexScreen] Determinando fluxo do usuário...');
    console.log('[IndexScreen] isFirstAccess:', isFirstAccess);
    console.log('[IndexScreen] hasCompletedQuiz:', hasCompletedQuiz);
    console.log('[IndexScreen] hasSubscription:', hasSubscription);
    console.log('[IndexScreen] quizProgress:', quizProgress);

    const determineRoute = () => {
      // Se é o primeiro acesso e não tem progresso do quiz, vai para welcome
      if (isFirstAccess && !quizProgress) {
        console.log('[IndexScreen] → Redirecionando para welcome (primeiro acesso)');
        router.replace('/welcome');
        return;
      }

      // Se tem progresso do quiz mas não completou, continua o quiz
      if (quizProgress && !hasCompletedQuiz) {
        console.log('[IndexScreen] → Redirecionando para quiz (continuar)');
        router.replace('/quiz');
        return;
      }

      // Se completou o quiz mas não tem assinatura, vai para testimonials → paywall
      if (hasCompletedQuiz && !hasSubscription) {
        console.log('[IndexScreen] → Redirecionando para testimonials');
        router.replace('/testimonials');
        return;
      }

      // Se tem assinatura, vai direto para o app
      if (hasSubscription) {
        console.log('[IndexScreen] → Redirecionando para app principal');
        router.replace('/(tabs)');
        return;
      }

      // Fallback: se não se encaixa em nenhum caso, vai para welcome
      console.log('[IndexScreen] → Fallback: redirecionando para welcome');
      router.replace('/welcome');
    };

    // Pequeno delay para garantir que o contexto está totalmente carregado
    const timer = setTimeout(determineRoute, 100);
    
    return () => clearTimeout(timer);
  }, [isFirstAccess, hasCompletedQuiz, hasSubscription, quizProgress]);

  // Mostrar loading enquanto determina a rota
  return <LoadingScreen message="Preparando sua experiência..." />;
}