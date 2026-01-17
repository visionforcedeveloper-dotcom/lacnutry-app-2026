import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heart, Clock, Users } from "lucide-react-native";
import Colors from "@/constants/colors";
import { recipes } from "@/mocks/recipes";
import { useProfile } from "@/contexts/ProfileContext";

export default function RecipesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useProfile();

  const renderRecipe = ({ item }: { item: (typeof recipes)[0] }) => {
    const favorite = isFavorite(item.id);

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => router.push(`/receita/${item.id}`)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.recipeImage} />
        <View style={styles.recipeContent}>
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
              style={styles.favoriteButton}
              activeOpacity={0.7}
            >
              <Heart
                size={20}
                color={favorite ? Colors.error : Colors.textSecondary}
                fill={favorite ? Colors.error : "transparent"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.recipeDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.recipeInfo}>
            <View style={styles.infoItem}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{item.prepTime} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Users size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {item.servings} {item.servings === 1 ? "porção" : "porções"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: "Receitas",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
        }}
      />

      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  recipeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImage: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.border,
  },
  recipeContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeInfo: {
    flexDirection: "row",
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

