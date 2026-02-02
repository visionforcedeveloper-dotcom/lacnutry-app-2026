import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { 
  ScanLine, 
  AlertCircle,
  Crown,
  Award,
  Flame,
  CheckCircle2,
  X,
  TrendingUp,
  Lightbulb,
  History,
  Activity,
} from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";

const dailyTips = [
  {
    title: "Leia os Rótulos",
    description: "Lactose pode se esconder em produtos inesperados como pães, embutidos e molhos. Sempre verifique!",
    icon: "📋",
  },
  {
    title: "Leites Vegetais",
    description: "Experimente diferentes opções: amêndoas, coco, aveia, soja. Cada um tem sabor único!",
    icon: "🥛",
  },
  {
    title: "Cálcio Natural",
    description: "Brócolis, espinafre, sardinha e tofu são ótimas fontes de cálcio sem lactose.",
    icon: "🥦",
  },
  {
    title: "Sobremesas Deliciosas",
    description: "Sorvetes de frutas, mousses de abacate e pudins de chia são perfeitos sem lactose!",
    icon: "🍨",
  },
  {
    title: "Restaurantes",
    description: "Não tenha vergonha de perguntar sobre os ingredientes. Sua saúde vem primeiro!",
    icon: "🍽️",
  },
];

export default function HomeScreen() {
  const { favorites, history, stats, reactions } = useProfile();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const currentTip = dailyTips[currentTipIndex];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % dailyTips.length);
    }, 8000);
    return () => clearInterval(tipInterval);
  }, []);

  const mainFeatures = [
    {
      id: "scanner",
      title: "Scanner IA",
      description: "Analise alimentos e pratos com inteligência artificial",
      icon: ScanLine,
      color: Colors.primary,
      bgColor: Colors.primaryLight,
      route: "/(tabs)/scanner",
    },
    {
      id: "emergency",
      title: "Passei Mal Agora",
      description: "Orientações de emergência para reações à lactose",
      icon: AlertCircle,
      color: "#E74C3C",
      bgColor: "#FFE5E5",
      route: "/modo-emergencia",
      isEmergency: true,
    },
    {
      id: "reactions",
      title: "Alertas de Reação",
      description: "Registre reações e identifique padrões",
      icon: Activity,
      color: "#9B59B6",
      bgColor: "#F3E5F5",
      route: "/(tabs)/receitas",
      isPremium: true,
    },
    {
      id: "premium",
      title: "Recursos Premium",
      description: "Ferramentas personalizadas para sua intolerância",
      icon: Crown,
      color: "#F39C12",
      bgColor: "#FFF4E6",
      route: "/(tabs)/ferramentas",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LacNutry</Text>
          <Text style={styles.headerSubtitle}>
            Seu assistente inteligente para uma vida sem lactose
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Flame color={Colors.warning} size={24} />
            </View>
            <Text style={styles.statValue}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>dias de sequência</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <ScanLine color={Colors.primary} size={24} />
            </View>
            <Text style={styles.statValue}>{stats.totalScans}</Text>
            <Text style={styles.statLabel}>análises realizadas</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Activity color={Colors.error} size={24} />
            </View>
            <Text style={styles.statValue}>{reactions.length}</Text>
            <Text style={styles.statLabel}>reações registradas</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.tipCard}
          activeOpacity={0.9}
          onPress={() => setCurrentTipIndex((currentTipIndex + 1) % dailyTips.length)}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipGradient}
          >
            <View style={styles.tipHeader}>
              <Text style={styles.tipEmoji}>{currentTip.icon}</Text>
              <View style={styles.tipBadge}>
                <Lightbulb color={Colors.primary} size={12} />
                <Text style={styles.tipBadgeText}>Dica do Dia</Text>
              </View>
            </View>
            <Text style={styles.tipTitle}>{currentTip.title}</Text>
            <Text style={styles.tipDescription}>{currentTip.description}</Text>
            <View style={styles.tipIndicators}>
              {dailyTips.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.tipIndicator,
                    index === currentTipIndex && styles.tipIndicatorActive
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades Principais</Text>
          <View style={styles.featuresGrid}>
            {mainFeatures.map((feature) => {
              const Icon = feature.icon;
              
              return (
                <TouchableOpacity
                  key={feature.id}
                  style={styles.featureCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (feature.route) {
                      router.push(feature.route as any);
                    }
                  }}
                >
                  <View style={[styles.featureIconContainer, { backgroundColor: feature.bgColor }]}>
                    <Icon color={feature.color} size={28} />
                  </View>
                  <Text style={styles.featureTitle}>
                    {feature.title}
                  </Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {history.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Análises</Text>
              <TouchableOpacity onPress={() => router.push("/historico")}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.historyScroll}
            >
              {history.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.historyCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/analise/${item.id}` as any)}
                >
                  <View
                    style={[
                      styles.historyBadge,
                      { backgroundColor: item.hasLactose ? "#FFE5E5" : Colors.successLight }
                    ]}
                  >
                    {item.hasLactose ? (
                      <X color={Colors.error} size={16} />
                    ) : (
                      <CheckCircle2 color={Colors.success} size={16} />
                    )}
                  </View>
                  <Text style={styles.historyCardTitle} numberOfLines={2}>
                    {item.productName}
                  </Text>
                  <Text style={styles.historyCardDate}>
                    {new Date(item.date).toLocaleDateString("pt-BR")}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progresso Semanal</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Award color={Colors.primary} size={32} />
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressTitle}>Continue assim!</Text>
                <Text style={styles.progressSubtitle}>
                  Você está indo muito bem na sua jornada sem lactose
                </Text>
              </View>
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>{stats.totalScans}</Text>
                <Text style={styles.progressStatLabel}>Análises</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>{favorites.length}</Text>
                <Text style={styles.progressStatLabel}>Favoritas</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>{stats.streakDays}</Text>
                <Text style={styles.progressStatLabel}>Dias Ativos</Text>
              </View>
            </View>
          </View>
        </View>

        {reactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Reações</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/receitas")}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reactionsContainer}>
              {reactions.slice(0, 3).map((reaction) => (
                <View key={reaction.id} style={styles.reactionCard}>
                  <View style={styles.reactionHeader}>
                    <Text style={styles.reactionProduct}>{reaction.product}</Text>
                    <View style={[styles.intensityBadge, { 
                      backgroundColor: reaction.intensity >= 4 ? '#FFE5E5' : 
                                      reaction.intensity >= 3 ? '#FFF4E6' : '#E8F5E9'
                    }]}>
                      <Text style={[styles.intensityText, {
                        color: reaction.intensity >= 4 ? Colors.error : 
                               reaction.intensity >= 3 ? Colors.warning : Colors.success
                      }]}>
                        {reaction.intensity}/5
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reactionSymptoms}>
                    {reaction.symptoms.slice(0, 3).map((symptom, index) => (
                      <View key={index} style={styles.symptomChip}>
                        <Text style={styles.symptomText}>{symptom}</Text>
                      </View>
                    ))}
                    {reaction.symptoms.length > 3 && (
                      <Text style={styles.moreSymptomsText}>+{reaction.symptoms.length - 3}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: Colors.background,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  tipCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  tipGradient: {
    padding: 24,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tipEmoji: {
    fontSize: 48,
  },
  tipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  tipBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  tipTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.white,
    opacity: 0.95,
    marginBottom: 16,
  },
  tipIndicators: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  tipIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  tipIndicatorActive: {
    backgroundColor: Colors.white,
    width: 20,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative" as const,
  },
  featureCardLocked: {
    opacity: 0.7,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  lockBadge: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  historyScroll: {
    paddingRight: 20,
  },
  historyCard: {
    width: 140,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  historyCardTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  historyCardDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  progressStatItem: {
    alignItems: "center",
  },
  progressStatValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  reactionsContainer: {
    gap: 12,
  },
  reactionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reactionProduct: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
  },
  intensityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  reactionSymptoms: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  symptomChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  symptomText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  moreSymptomsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
});
