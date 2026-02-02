import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";

export default function IndexScreen() {
  console.log('[IndexScreen] Renderizando tela de entrada...');
  
  const profileContext = useProfile();

  useEffect(() => {
    if (!profileContext || profileContext.isLoading) {
      console.log('[IndexScreen] → Aguardando contexto carregar...');
      return;
    }

    const { userProgress, hasCompletedQuiz, hasSubscription, updateUserProgress } = profileContext;
    
    console.log('[IndexScreen] → Estado atual:', {
      stage: userProgress?.stage,
      hasCompletedQuiz,
      hasSubscription,
    });

    const redirectUser = async () => {
      // Se já tem assinatura, vai direto para o app
      if (hasSubscription) {
        console.log('[IndexScreen] → Usuário premium, indo para app');
        router.replace("/(tabs)");
        return;
      }

      // Baseado no progresso salvo, redirecionar para a tela correta
      switch (userProgress?.stage) {
        case 'quiz':
          console.log('[IndexScreen] → Retomando quiz');
          router.replace('/quiz');
          break;
        case 'paywall':
          console.log('[IndexScreen] → Retomando paywall');
          router.replace('/paywall');
          break;
        case 'completed':
          console.log('[IndexScreen] → Onboarding completo, indo para app');
          router.replace("/(tabs)");
          break;
        default:
          console.log('[IndexScreen] → Iniciando do welcome');
          await updateUserProgress('welcome');
          router.replace('/welcome');
          break;
      }
    };
    
    const timer = setTimeout(() => {
      redirectUser();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [profileContext]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LacNutry</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      <Text style={styles.message}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});