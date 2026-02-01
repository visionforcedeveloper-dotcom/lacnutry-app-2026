import { Stack } from "expo-router";
import React from "react";
import { ProfileProvider } from "@/contexts/ProfileContext";

export default function RootLayout() {
  console.log('[RootLayout] Renderizando layout raiz...');
  
  return (
    <ProfileProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="quiz" />
        <Stack.Screen name="configuracoes" />
        <Stack.Screen name="editar-perfil" />
        <Stack.Screen name="favoritos" />
        <Stack.Screen name="historico" />
        <Stack.Screen name="modo-emergencia" />
        <Stack.Screen name="nutricionista" />
        <Stack.Screen name="produtos-seguros" />
        <Stack.Screen name="receitas" />
        <Stack.Screen name="testimonials" />
        <Stack.Screen name="alerta-reacao" />
        <Stack.Screen name="analise/[id]" />
        <Stack.Screen name="receita/[id]" />
      </Stack>
    </ProfileProvider>
  );
}
