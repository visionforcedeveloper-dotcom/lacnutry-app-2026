import { Tabs } from "expo-router";
import { Home, AlertCircle, ScanLine, Crown, User } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600" as const,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="receitas"
        options={{
          title: "Receitas",
          tabBarIcon: ({ color, size }) => <AlertCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ferramentas"
        options={{
          title: "Mais",
          tabBarIcon: ({ color, size }) => <Crown color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
