import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Clock, Users, TrendingUp, Coffee, Utensils, Moon, Cake, ChevronDown } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { recipes } from "@/mocks/recipes";
import { Recipe } from "@/types/recipe";

const RECIPES_PER_PAGE = 20;

export default function ReceitasScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("todas");
  const [displayedCount, setDisplayedCount] = useState(RECIPES_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filters = [
    { id: "todas", label: "Todas", icon: null },
    { id: "café da manhã", label: "Café", icon: Coffee },
    { id: "almoço", label: "Almoço", icon: Utensils },
    { id: "jantar", label: "Jantar", icon: Moon },
    { id: "sobremesa", label: "Sobremesa", icon: Cake },
  ];

  // Resetar contador quando filtro ou busca mudar
  useEffect(() => {
    setDisplayedCount(RECIPES_PER_PAGE);
  }, [searchQuery, selectedFilter]);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "todas" || recipe.tags.includes(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  // Receitas a serem exibidas (com paginação)
  const displayedRecipes = filteredRecipes.slice(0, displayedCount);
  const hasMoreRecipes = displayedCount < filteredRecipes.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simular um pequeno delay para UX
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + RECIPES_PER_PAGE, filteredRecipes.length));
      setIsLoadingMore(false);
    }, 300);
  };

  const renderRecipeCard = (recipe: Recipe) => (
    <TouchableOpacity 
      key={recipe.id} 
      style={styles.recipeCard} 
      activeOpacity={0.8}
      onPress={() => router.push(`/receita/${recipe.id}`)}
    >
      <Image
        source={{ uri: recipe.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {recipe.title}
          </Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {recipe.description}
        </Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{recipe.prepTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{recipe.servings} porções</Text>
          </View>
          <View style={styles.metaItem}>
            <TrendingUp size={14} color={Colors.success} />
            <Text style={[styles.metaText, { color: Colors.success }]}>
              {recipe.nutritionInfo?.calories || 0} cal
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Receitas</Text>
        <Text style={styles.headerSubtitle}>
          {filteredRecipes.length} receitas sem lactose
        </Text>
        {displayedCount < filteredRecipes.length && (
          <Text style={styles.headerLoadingInfo}>
            Exibindo {displayedCount} de {filteredRecipes.length}
          </Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar receitas..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScrollView}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                activeOpacity={0.7}
              >
                {Icon && (
                  <Icon
                    size={20}
                    color={
                      selectedFilter === filter.id
                        ? Colors.white
                        : Colors.text
                    }
                  />
                )}
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhuma receita encontrada
            </Text>
          </View>
        ) : (
          <>
            {displayedRecipes.map(renderRecipeCard)}
            
            {hasMoreRecipes && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={isLoadingMore}
                activeOpacity={0.8}
              >
                {isLoadingMore ? (
                  <ActivityIndicator color={Colors.primary} size="small" />
                ) : (
                  <>
                    <ChevronDown size={20} color={Colors.primary} />
                    <Text style={styles.loadMoreText}>
                      Carregar mais receitas
                    </Text>
                    <Text style={styles.loadMoreSubtext}>
                      +{Math.min(RECIPES_PER_PAGE, filteredRecipes.length - displayedCount)} receitas
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
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
    paddingTop: 16,
    paddingBottom: 12,
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
  },
  headerLoadingInfo: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600" as const,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filtersScrollView: {
    flexGrow: 0,
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  filterTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  recipeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  difficultyBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  loadMoreButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    minHeight: 80,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginTop: 8,
  },
  loadMoreSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: "500" as const,
  },
});
