import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Clock, Users, ChefHat, CheckCircle2, Heart } from "lucide-react-native";
import Colors from "@/constants/colors";
import { recipes } from "@/mocks/recipes";
import { useProfile } from "@/contexts/ProfileContext";

export default function ReceitaDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useProfile();
  const recipe = recipes.find((r) => r.id === id);
  const recipeId = Array.isArray(id) ? id[0] : id || '';
  const isFav = isFavorite(recipeId);

  if (!recipe) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Receita não encontrada</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: recipe.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[styles.backButton, { top: insets.top + 16 }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.favoriteButton, { top: insets.top + 16 }]}
              onPress={() => {
                console.log('❤️ Favorite button pressed for recipe:', recipeId);
                console.log('📍 Current favorite status:', isFav);
                toggleFavorite(recipeId);
              }}
              activeOpacity={0.8}
            >
              <Heart
                size={24}
                color={isFav ? Colors.error : Colors.text}
                fill={isFav ? Colors.error : "transparent"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={styles.title}>{recipe.title}</Text>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.description}>{recipe.description}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaCard}>
                  <Clock size={20} color={Colors.primary} />
                  <Text style={styles.metaLabel}>Preparo</Text>
                  <Text style={styles.metaValue}>{recipe.prepTime} min</Text>
                </View>
                <View style={styles.metaCard}>
                  <Users size={20} color={Colors.primary} />
                  <Text style={styles.metaLabel}>Porções</Text>
                  <Text style={styles.metaValue}>{recipe.servings}</Text>
                </View>
                <View style={styles.metaCard}>
                  <ChefHat size={20} color={Colors.primary} />
                  <Text style={styles.metaLabel}>Calorias</Text>
                  <Text style={styles.metaValue}>
                    {recipe.nutritionInfo?.calories || 0}
                  </Text>
                </View>
              </View>
            </View>

            {recipe.nutritionInfo && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informações Nutricionais</Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {recipe.nutritionInfo.protein}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Proteína</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {recipe.nutritionInfo.carbs}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Carboidratos</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {recipe.nutritionInfo.fat}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Gorduras</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredientes</Text>
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Modo de Preparo</Text>
              <View style={styles.instructionsList}>
                {recipe.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {recipe.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {recipe.isLactoseFree && (
                  <View style={[styles.tag, styles.lactoseFreeTag]}>
                    <CheckCircle2 size={14} color={Colors.success} />
                    <Text style={[styles.tagText, styles.lactoseFreeText]}>
                      Sem Lactose
                    </Text>
                  </View>
                )}
              </View>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  imageContainer: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 400,
  },
  backButton: {
    position: "absolute",
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteButton: {
    position: "absolute",
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    lineHeight: 36,
  },
  difficultyBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
  },
  metaCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    justifyContent: "space-around",
  },
  nutritionItem: {
    alignItems: "center",
    gap: 8,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  nutritionLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  ingredientsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  lactoseFreeTag: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lactoseFreeText: {
    color: Colors.success,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
});
