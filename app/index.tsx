import { Redirect } from "expo-router";
import { useProfile } from "@/contexts/ProfileContext";
import { View, ActivityIndicator } from "react-native";
import Colors from "@/constants/colors";

export default function Index() {
  const { isLoading, hasCompletedQuiz } = useProfile();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Se ainda não completou o quiz, redireciona para ele
  // Isso garante o fluxo: Quiz > Depoimentos > Paywall > App
  if (!hasCompletedQuiz) {
    return <Redirect href="/quiz" />;
  }

  // Se já completou, vai para o app normal
  return <Redirect href="/(tabs)" />;
}
