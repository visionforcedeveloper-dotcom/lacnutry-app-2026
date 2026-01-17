import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, AlertCircle, CheckCircle, Trash2 } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useProfile } from "@/contexts/ProfileContext";

export default function HistoricoScreen() {
  const insets = useSafeAreaInsets();
  const { history, clearHistory } = useProfile();

  const handleClearHistory = () => {
    Alert.alert(
      "Limpar Histórico",
      "Tem certeza que deseja limpar todo o histórico de análises?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => clearHistory(),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} minutos atrás`;
    } else if (hours < 24) {
      return `${hours} horas atrás`;
    } else if (days === 1) {
      return "Ontem";
    } else if (days < 7) {
      return `${days} dias atrás`;
    } else {
      return date.toLocaleDateString("pt-BR");
    }
  };

  const renderHistoryItem = ({
    item,
  }: {
    item: typeof history[0];
  }) => (
    <View style={styles.historyCard}>
      <View
        style={[
          styles.statusIcon,
          item.hasLactose ? styles.statusIconWarning : styles.statusIconSuccess,
        ]}
      >
        {item.hasLactose ? (
          <AlertCircle size={20} color={Colors.error} />
        ) : (
          <CheckCircle size={20} color={Colors.success} />
        )}
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.productName}>{item.productName}</Text>
        <View style={styles.historyMeta}>
          <Clock size={12} color={Colors.textSecondary} />
          <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              item.hasLactose
                ? styles.statusTextWarning
                : styles.statusTextSuccess,
            ]}
          >
            {item.hasLactose ? "Contém Lactose" : "Sem Lactose"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: "Histórico",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
          headerRight: () =>
            history.length > 0 ? (
              <TouchableOpacity
                onPress={handleClearHistory}
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color={Colors.white} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Nenhuma análise ainda</Text>
          <Text style={styles.emptyText}>
            Seu histórico de análises de produtos aparecerá aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusIconWarning: {
    backgroundColor: "#FFEBEE",
  },
  statusIconSuccess: {
    backgroundColor: "#E8F5E9",
  },
  historyContent: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  historyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusTextWarning: {
    color: Colors.error,
  },
  statusTextSuccess: {
    color: Colors.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
