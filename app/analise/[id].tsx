import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";
import AnalysisResults from "@/components/scanner/AnalysisResults";

export default function AnalysisDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { history } = useProfile();

  const analysisId = Array.isArray(id) ? id[0] : id;
  const item = history.find((h) => h.id === analysisId);

  if (!analysisId || !item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen
          options={{
            title: "Análise não encontrada",
            headerShown: true,
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontWeight: "600",
            },
          }}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Análise não encontrada</Text>
          <Text style={styles.emptyText}>
            Não foi possível encontrar os detalhes desta análise.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: item.productName || "Detalhes da Análise",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!item.analysis ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Resumo da Análise</Text>
            <Text style={styles.emptyText}>
              Esta análise foi salva antes da nova versão do scanner.{"\n"}
              Apenas o resumo básico está disponível.
            </Text>
            <View style={styles.basicCard}>
              <Text style={styles.basicTitle}>{item.productName}</Text>
              <Text style={styles.basicStatus}>
                {item.hasLactose ? "Contém lactose" : "Sem lactose"}
              </Text>
              <Text style={styles.basicDate}>
                {new Date(item.date).toLocaleString("pt-BR")}
              </Text>
            </View>
          </View>
        ) : (
          <AnalysisResults
            result={item.analysis}
            onScanAgain={() => {}}
            additionalInfo={item.additionalInfo || ""}
            imageUri={item.imageUri}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  basicCard: {
    marginTop: 24,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    width: "100%",
  },
  basicTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  basicStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  basicDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

