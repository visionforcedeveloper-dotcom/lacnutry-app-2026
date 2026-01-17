import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChefHat, MessageCircle, ArrowRight } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";

export default function FerramentasScreen() {
  const insets = useSafeAreaInsets();

  const tools = [
    {
      id: "recipe-generator",
      title: "Gerador de Receitas",
      description:
        "Crie receitas personalizadas sem lactose usando IA. Informe seus ingredientes favoritos e restrições.",
      icon: ChefHat,
      color: "#F39C12",
      bgColor: "#FFF4E6",
      route: "/gerador-receitas",
    },
    {
      id: "nutritionist",
      title: "Nutricionista IA",
      description:
        "Converse com nossa nutricionista virtual sobre dietas sem lactose, dúvidas nutricionais e mais.",
      icon: MessageCircle,
      color: "#2ECC71",
      bgColor: "#E8F5E9",
      route: "/nutricionista",
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assistentes IA</Text>
        <Text style={styles.headerSubtitle}>
          Recursos inteligentes para sua dieta sem lactose
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              activeOpacity={0.8}
              onPress={() => {
                if (tool.route) {
                  router.push(tool.route as any);
                }
              }}
            >
              <View style={styles.toolCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: tool.bgColor }]}>
                  <Icon size={32} color={tool.color} />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolDescription}>{tool.description}</Text>
                </View>
                <ArrowRight size={24} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.comingSoonSection}>
          <Text style={styles.comingSoonTitle}>Em Breve</Text>
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonText}>
              ✨ Plano de Refeições Semanal
            </Text>
          </View>
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonText}>
              ✨ Lista de Compras Inteligente
            </Text>
          </View>
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonText}>
              ✨ Análise Nutricional Completa
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  toolCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  toolCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  toolDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  comingSoonSection: {
    marginTop: 32,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  comingSoonCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  comingSoonText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
