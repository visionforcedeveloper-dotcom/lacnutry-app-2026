import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Award, TrendingUp, Users, CheckCircle, Lock, Star, Shield } from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";

interface SafeProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  safetyScore: number;
  userReports: number;
  benefits: string[];
  emoji: string;
}

const safeProducts: SafeProduct[] = [
  {
    id: "1",
    name: "Leite de Aveia Natural",
    brand: "Marca A",
    category: "Leites Vegetais",
    safetyScore: 98,
    userReports: 1247,
    benefits: [
      "100% vegetal",
      "Rico em fibras",
      "Sem alergênicos comuns",
    ],
    emoji: "🌾",
  },
  {
    id: "2",
    name: "Iogurte de Coco Natural",
    brand: "Marca B",
    category: "Iogurtes",
    safetyScore: 97,
    userReports: 983,
    benefits: [
      "Sem lactose certificado",
      "Probióticos naturais",
      "Baixo açúcar",
    ],
    emoji: "🥥",
  },
  {
    id: "3",
    name: "Queijo Vegano Defumado",
    brand: "Marca C",
    category: "Queijos",
    safetyScore: 96,
    userReports: 856,
    benefits: [
      "Textura cremosa",
      "Alto teor proteico",
      "Versátil em receitas",
    ],
    emoji: "🧀",
  },
  {
    id: "4",
    name: "Creme de Leite de Coco",
    brand: "Marca D",
    category: "Cremes",
    safetyScore: 95,
    userReports: 742,
    benefits: [
      "Consistência perfeita",
      "Sem conservantes",
      "Ideal para culinária",
    ],
    emoji: "🥥",
  },
  {
    id: "5",
    name: "Leite de Amêndoas com Cálcio",
    brand: "Marca E",
    category: "Leites Vegetais",
    safetyScore: 94,
    userReports: 689,
    benefits: [
      "Fortificado com cálcio",
      "Baixa caloria",
      "Sabor suave",
    ],
    emoji: "🌰",
  },
  {
    id: "6",
    name: "Sorvete de Banana Congelada",
    brand: "Marca F",
    category: "Sobremesas",
    safetyScore: 93,
    userReports: 621,
    benefits: [
      "Apenas 1 ingrediente",
      "Naturalmente doce",
      "Zero lactose",
    ],
    emoji: "🍌",
  },
  {
    id: "7",
    name: "Manteiga de Coco Orgânica",
    brand: "Marca G",
    category: "Gorduras",
    safetyScore: 92,
    userReports: 578,
    benefits: [
      "Orgânica certificada",
      "Fonte de MCTs",
      "Sabor neutro",
    ],
    emoji: "🥥",
  },
  {
    id: "8",
    name: "Requeijão Vegano Cremoso",
    brand: "Marca H",
    category: "Queijos",
    safetyScore: 91,
    userReports: 512,
    benefits: [
      "Textura autêntica",
      "Baixo sódio",
      "Ótimo para lanches",
    ],
    emoji: "🧈",
  },
  {
    id: "9",
    name: "Chocolate Amargo 70%",
    brand: "Marca I",
    category: "Chocolates",
    safetyScore: 90,
    userReports: 489,
    benefits: [
      "Sem leite",
      "Rico em antioxidantes",
      "Baixo açúcar",
    ],
    emoji: "🍫",
  },
  {
    id: "10",
    name: "Bebida de Arroz Natural",
    brand: "Marca J",
    category: "Leites Vegetais",
    safetyScore: 89,
    userReports: 445,
    benefits: [
      "Hipoalergênico",
      "Digestão fácil",
      "Adocicado natural",
    ],
    emoji: "🌾",
  },
];

export default function SafeProductsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const categories = ["Todos", "Leites Vegetais", "Queijos", "Iogurtes", "Sobremesas", "Cremes"];

  const filteredProducts = selectedCategory === "Todos"
    ? safeProducts
    : safeProducts.filter(p => p.category === selectedCategory);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Produtos Mais Seguros",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
        }}
      />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerContent}>
            <Shield size={32} color={Colors.success} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Top 10 Produtos</Text>
              <Text style={styles.headerSubtitle}>
                Baseado em {safeProducts.reduce((sum, p) => sum + p.userReports, 0).toLocaleString()} relatos
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <TrendingUp size={20} color={Colors.success} />
            <Text style={styles.infoText}>
              Ranking atualizado semanalmente com base em relatos de usuários verificados
            </Text>
          </View>

          {filteredProducts.map((product, index) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              
              <View style={styles.productHeader}>
                <Text style={styles.productEmoji}>{product.emoji}</Text>
                <View style={styles.productTitleContainer}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                </View>
              </View>

              <View style={styles.scoreContainer}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreValue}>{product.safetyScore}</Text>
                  <Text style={styles.scoreLabel}>Segurança</Text>
                </View>
                <View style={styles.scoreDetails}>
                  <View style={styles.scoreDetailItem}>
                    <Users size={16} color={Colors.primary} />
                    <Text style={styles.scoreDetailText}>
                      {product.userReports.toLocaleString()} relatos
                    </Text>
                  </View>
                  <View style={styles.scoreDetailItem}>
                    <Star size={16} color={Colors.warning} />
                    <Text style={styles.scoreDetailText}>
                      {product.category}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Por que é seguro:</Text>
                {product.benefits.map((benefit, idx) => (
                  <View key={idx} style={styles.benefitItem}>
                    <CheckCircle size={14} color={Colors.success} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.disclaimerCard}>
            <Award size={20} color={Colors.primary} />
            <Text style={styles.disclaimerText}>
              Este ranking é baseado em relatos de usuários e não substitui recomendações médicas. 
              Sempre consulte um profissional de saúde para orientações personalizadas.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  lockedIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  lockedDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  categoriesScroll: {
    flexGrow: 0,
    backgroundColor: Colors.background,
    paddingBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.text,
  },
  productCard: {
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
  rankBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  productEmoji: {
    fontSize: 40,
  },
  productTitleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scoreContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.success,
  },
  scoreLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  scoreDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  scoreDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreDetailText: {
    fontSize: 13,
    color: Colors.text,
  },
  benefitsContainer: {
    gap: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  disclaimerCard: {
    flexDirection: "row",
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
    marginTop: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text,
  },
});

