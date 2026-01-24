import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClientInstance] = useState(() => trpcClient);

  return (
    <trpc.Provider client={trpcClientInstance} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <ProfileProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="paywall" 
                options={{ 
                  presentation: 'modal',
                  animation: 'slide_from_bottom'
                }} 
              />
              <Stack.Screen 
                name="welcome" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false
                }} 
              />
              <Stack.Screen 
                name="quiz" 
                options={{ 
                  headerShown: false 
                }} 
              />
            </Stack>
          </ProfileProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
