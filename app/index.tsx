import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";

export default function IndexScreen() {
  console.log('[IndexScreen] Renderizando tela de entrada...');
  
  const profileContext = useProfile();

  useEffect(() => {
    console.log('[IndexScreen] → Forçando fluxo de onboarding');
    
    // Limpar dados salvos para forçar o fluxo completo
    const resetAndRedirect = async () => {
      if (profileContext?.resetAllData) {
        console.log('[IndexScreen] → Resetando dados do usuário');
        await profileContext.resetAllData();
      }
      
      console.log('[IndexScreen] → Redirecionando para welcome');
      // Redirecionar para welcome
      router.replace('/welcome');
    };
    
    // Executar sempre, mesmo se o contexto não estiver carregado
    const timer = setTimeout(() => {
      resetAndRedirect();
    }, 100); // Pequeno delay para garantir que o contexto seja carregado
    
    return () => clearTimeout(timer);
  }, [profileContext]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LacNutry</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      <Text style={styles.message}>Iniciando fluxo de onboarding...</Text>
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