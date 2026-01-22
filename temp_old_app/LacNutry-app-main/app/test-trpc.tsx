import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";

export default function TestTRPCScreen() {
  const insets = useSafeAreaInsets();
  
  const hiQuery = trpc.example.hi.useMutation();
  const saveQuizMutation = trpc.user.saveQuiz.useMutation();

  const testHi = async () => {
    try {
      console.log("🧪 Testing hi endpoint...");
      const result = await hiQuery.mutateAsync({ name: "Test User" });
      console.log("✅ Hi result:", result);
      alert(`Success! ${JSON.stringify(result)}`);
    } catch (error: any) {
      console.error("❌ Hi error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const testSaveQuiz = async () => {
    try {
      console.log("🧪 Testing saveQuiz endpoint...");
      const result = await saveQuizMutation.mutateAsync({
        name: "Test User",
        email: "test@example.com",
        answers: { "1": 0, "2": 1 },
        score: 75,
      });
      console.log("✅ SaveQuiz result:", result);
      alert(`Success! ${JSON.stringify(result)}`);
    } catch (error: any) {
      console.error("❌ SaveQuiz error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const testBackendHealth = async () => {
    try {
      console.log("🧪 Testing backend health...");
      const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
      console.log("🔍 Base URL:", baseUrl);
      
      if (!baseUrl) {
        alert("ERROR: EXPO_PUBLIC_RORK_API_BASE_URL is not set!");
        return;
      }
      
      const testUrl = `${baseUrl}/test`;
      console.log("🔍 Testing URL:", testUrl);
      
      const response = await fetch(testUrl);
      console.log("🔍 Response status:", response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Response not OK:", text);
        alert(`Backend returned ${response.status}: ${text}`);
        return;
      }
      
      const data = await response.json();
      console.log("✅ Backend health:", data);
      alert(`Backend OK! ${JSON.stringify(data)}`);
    } catch (error: any) {
      console.error("❌ Backend health error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>tRPC Test</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color={Colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Backend Tests</Text>

        <TouchableOpacity
          style={[styles.button, hiQuery.isPending && styles.buttonDisabled]}
          onPress={testBackendHealth}
        >
          <Text style={styles.buttonText}>Test Backend Health</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>tRPC Tests</Text>

        <TouchableOpacity
          style={[styles.button, hiQuery.isPending && styles.buttonDisabled]}
          onPress={testHi}
          disabled={hiQuery.isPending}
        >
          <Text style={styles.buttonText}>
            {hiQuery.isPending ? "Testing..." : "Test Hi Endpoint"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, saveQuizMutation.isPending && styles.buttonDisabled]}
          onPress={testSaveQuiz}
          disabled={saveQuizMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {saveQuizMutation.isPending ? "Testing..." : "Test SaveQuiz Endpoint"}
          </Text>
        </TouchableOpacity>

        {hiQuery.isError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Hi Error:</Text>
            <Text style={styles.errorText}>{hiQuery.error.message}</Text>
          </View>
        )}

        {hiQuery.isSuccess && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Hi Success:</Text>
            <Text style={styles.successText}>{JSON.stringify(hiQuery.data, null, 2)}</Text>
          </View>
        )}

        {saveQuizMutation.isError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>SaveQuiz Error:</Text>
            <Text style={styles.errorText}>{saveQuizMutation.error.message}</Text>
          </View>
        )}

        {saveQuizMutation.isSuccess && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>SaveQuiz Success:</Text>
            <Text style={styles.successText}>
              {JSON.stringify(saveQuizMutation.data, null, 2)}
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Backend URL:</Text>
          <Text style={styles.infoText}>{process.env.EXPO_PUBLIC_RORK_API_BASE_URL}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#C62828",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#D32F2F",
    fontFamily: "monospace",
  },
  successBox: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#2E7D32",
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: "#388E3C",
    fontFamily: "monospace",
  },
  infoBox: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "monospace",
  },
});
