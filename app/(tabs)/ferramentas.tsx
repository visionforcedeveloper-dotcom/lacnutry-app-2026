import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User, AlertOctagon, Award, AlertCircle, ArrowRight, Lock } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";

export default function FerramentasScreen() {
  const insets = useSafeAreaInsets();

  const tools = [
    {
      id: "intolerance-profile",
      title: "Perfil de Intolerância",
      description:
        "Defina seu grau de intolerância e alimentos mais problemáticos.",
      icon: User,
      color: "#6C63FF",
      bgColor: "#E8E6FF",
      route: "/nutricionista",
      isPremium: true,
    },
    {
      id: "reaction-alerts",
      title: "Alertas de Reação",
      description:
        "Registre suas reações, identifique padrões e receba alertas personalizados de risco.",
      icon: AlertCircle,
      color: "#E74C3C",
      bgColor: "#FFE5E5",
      route: "/alerta-reacao",
      isPremium: true,
    },
    {
      id: "emergency-mode",
      title: "Modo Emergência",
      description:
        "Acesse orientações imediatas sobre o que fazer quando tiver uma reação à lactose.",
      icon: AlertOctagon,
      color: "#E67E22",
      bgColor: "#FFF4E6",
      route: "/modo-emergencia",
      isPremium: true,
    },
    {
      id: "safe-products",
      title: "Produtos Mais Seguros",
      description:
        "Descubra os produtos mais confiáveis baseados em milhares de relatos de usuários.",
      icon: Award,
      color: "#2ECC71",
      bgColor: "#E8F5E9",
      route: "/produtos-seguros",
      isPremium: true,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ferramentas</Text>
        <Text style={styles.headerSubtitle}>
          Recursos personalizados para sua intolerância à lactose
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
                  <View style={styles.toolTitleRow}>
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                  </View>
                  <Text style={styles.toolDescription}>{tool.description}</Text>
                </View>
                <ArrowRight size={24} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Dica</Text>
          <Text style={styles.infoText}>
            Configure seu Perfil de Intolerância primeiro para receber recomendações 
            ainda mais precisas no Scanner e nos Alertas de Reação.
          </Text>
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
  premiumBanner: {
    flexDirection: "row",
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 12,
    alignItems: "center",
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.white,
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
  toolCardLocked: {
    opacity: 0.7,
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
    position: "relative" as const,
  },
  lockOverlay: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    backgroundColor: Colors.text,
    borderRadius: 8,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  toolInfo: {
    flex: 1,
  },
  toolTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  premiumBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  toolDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
