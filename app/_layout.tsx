import { Stack } from "expo-router";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { trpc, trpcClient } from "@/lib/trpc";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>
          <Stack
            initialRouteName="welcome"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="configuracoes" options={{ title: "Configurações", headerShown: true }} />
            <Stack.Screen name="editar-perfil" options={{ title: "Editar Perfil", headerShown: true }} />
            <Stack.Screen name="favoritos" options={{ title: "Favoritos", headerShown: true }} />
            <Stack.Screen name="historico" options={{ title: "Histórico", headerShown: true }} />
            <Stack.Screen name="analise/[id]" options={{ title: "Detalhes da Análise", headerShown: true }} />
            <Stack.Screen name="nutricionista" options={{ headerShown: false }} />
            <Stack.Screen name="quiz" options={{ headerShown: false }} />
            <Stack.Screen name="testimonials" options={{ headerShown: false }} />
            <Stack.Screen name="paywall" options={{ headerShown: false }} />
            <Stack.Screen name="gerador-receitas" />
            <Stack.Screen name="receita/[id]" />
            <Stack.Screen name="test-trpc" options={{ title: "Test tRPC", headerShown: true }} />
          </Stack>
        </ProfileProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
