import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  AlertCircle,
  Sparkles,
  TrendingUp,
  Info,
  ChefHat,
  ListChecks,
  Camera,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { GeminiVisionResponse } from "@/lib/gemini";
import { useProfile } from "@/contexts/ProfileContext";

type AnalysisResult = GeminiVisionResponse;

interface PersonalizedRisk {
  level: 'safe' | 'moderate' | 'high';
  emoji: string;
  color: string;
  backgroundColor: string;
  message: string;
  reasons: string[];
}

interface AnalysisResultsProps {
  result: AnalysisResult;
  onScanAgain: () => void;
  additionalInfo: string;
  imageUri?: string;
}

export default function AnalysisResults({
  result,
  onScanAgain,
  additionalInfo,
  imageUri,
}: AnalysisResultsProps) {
  const { profile, reactions } = useProfile();

  // Função para calcular risco personalizado
  const calculatePersonalizedRisk = (result: AnalysisResult): PersonalizedRisk => {
    // Análise personalizada
    const reasons: string[] = [];
    let riskScore = 0;

    // 1. Verificar se tem lactose
    if (!result.hasLactose) {
      return {
        level: 'safe',
        emoji: '🟢',
        color: Colors.success,
        backgroundColor: '#E8F5E9',
        message: 'Seguro para você',
        reasons: ['Produto sem lactose', 'Compatível com seu perfil'],
      };
    }

    // 2. Considerar nível de lactose
    if (result.lactoseLevel === 'alto') {
      riskScore += 3;
      reasons.push('Alto teor de lactose');
    } else if (result.lactoseLevel === 'médio') {
      riskScore += 2;
      reasons.push('Teor médio de lactose');
    } else {
      riskScore += 1;
      reasons.push('Baixo teor de lactose');
    }

    // 3. Considerar perfil de intolerância
    if (profile.intoleranceProfile) {
      if (profile.intoleranceProfile.level === 'severa') {
        riskScore += 2;
        reasons.push('Sua intolerância é severa');
      } else if (profile.intoleranceProfile.level === 'moderada') {
        riskScore += 1;
      }

      // 4. Verificar uso de lactase
      if (profile.intoleranceProfile.lactaseUse === 'sempre') {
        riskScore -= 1;
        reasons.push('Uso regular de lactase pode ajudar');
      } else if (profile.intoleranceProfile.lactaseUse === 'nunca') {
        riskScore += 1;
      }
    }

    // 5. Verificar histórico de reações com produtos similares
    const productName = result.productName || additionalInfo.toLowerCase();
    const hasReactionHistory = reactions.some(r => 
      r.intensity >= 3 && productName.includes(r.product.toLowerCase())
    );
    if (hasReactionHistory) {
      riskScore += 2;
      reasons.push('Você teve reações a produtos similares');
    }

    // 6. Verificar alimentos problemáticos
    if (profile.intoleranceProfile?.problematicFoods) {
      const hasProblematicIngredient = profile.intoleranceProfile.problematicFoods.some(food =>
        result.ingredients.some(ing => ing.toLowerCase().includes(food.toLowerCase()))
      );
      if (hasProblematicIngredient) {
        riskScore += 1;
        reasons.push('Contém ingredientes que você relatou como problemáticos');
      }
    }

    // Determinar nível de risco baseado no score
    if (riskScore >= 5) {
      return {
        level: 'high',
        emoji: '🔴',
        color: Colors.error,
        backgroundColor: '#FFE5E5',
        message: 'Alto risco para você',
        reasons,
      };
    } else if (riskScore >= 3) {
      return {
        level: 'moderate',
        emoji: '🟡',
        color: Colors.warning,
        backgroundColor: '#FFF4E6',
        message: 'Risco moderado',
        reasons,
      };
    } else {
      return {
        level: 'moderate',
        emoji: '🟡',
        color: Colors.warning,
        backgroundColor: '#FFF4E6',
        message: 'Risco baixo',
        reasons,
      };
    }
  };

  const personalizedRisk = calculatePersonalizedRisk(result);

  return (
    <View style={styles.resultsContainer}>
      {imageUri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}
      <View
        style={[
          styles.lactoseCard,
          {
            backgroundColor: result.hasLactose
              ? "#FEE"
              : "#E8F5E9",
          },
        ]}
      >
        <View style={styles.lactoseHeader}>
          {result.hasLactose ? (
            <AlertCircle size={28} color={Colors.error} />
          ) : (
            <Sparkles size={28} color={Colors.success} />
          )}
          <View style={styles.lactoseTitleContainer}>
            <Text
              style={[
                styles.lactoseTitle,
                {
                  color: result.hasLactose
                    ? Colors.error
                    : Colors.success,
                },
              ]}
            >
              {result.hasLactose
                ? "Contém Lactose"
                : "Livre de Lactose"}
            </Text>
            {result.hasLactose && result.lactoseLevel && (
              <Text style={styles.lactoseLevel}>
                Nível: {result.lactoseLevel}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Risco Personalizado - Premium */}
      <View style={[styles.riskCard, { backgroundColor: personalizedRisk.backgroundColor }]}>
        <View style={styles.riskHeader}>
          <Text style={styles.riskEmoji}>{personalizedRisk.emoji}</Text>
          <View style={styles.riskTitleContainer}>
            <Text style={[styles.riskTitle, { color: personalizedRisk.color }]}>
              {personalizedRisk.message}
            </Text>
            <Text style={styles.riskSubtitle}>Análise Personalizada</Text>
          </View>
        </View>
        <View style={styles.riskReasons}>
          {personalizedRisk.reasons.map((reason, index) => (
            <View key={index} style={styles.riskReasonItem}>
              <View style={[styles.riskBullet, { backgroundColor: personalizedRisk.color }]} />
              <Text style={styles.riskReasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.cardTitleContainer}>
          <TrendingUp size={20} color={Colors.primary} />
          <Text style={styles.resultCardTitle}>Informações Nutricionais</Text>
        </View>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {result.nutritionalInfo.calories}
            </Text>
            <Text style={styles.nutritionLabel}>Calorias</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {result.nutritionalInfo.protein}g
            </Text>
            <Text style={styles.nutritionLabel}>Proteínas</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {result.nutritionalInfo.carbs}g
            </Text>
            <Text style={styles.nutritionLabel}>Carboidratos</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {result.nutritionalInfo.fat}g
            </Text>
            <Text style={styles.nutritionLabel}>Gorduras</Text>
          </View>
          {result.hasLactose && (
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: Colors.error }]}>
                {result.nutritionalInfo.lactose}g
              </Text>
              <Text style={styles.nutritionLabel}>Lactose</Text>
            </View>
          )}
        </View>
      </View>

      {result.risks && result.risks.length > 0 && (
        <View style={styles.resultCard}>
          <View style={styles.cardTitleContainer}>
            <AlertCircle size={20} color={Colors.error} />
            <Text style={styles.resultCardTitle}>Riscos de Lactose</Text>
          </View>
          {result.risks.map((risk, index) => (
            <View key={index} style={styles.riskItem}>
              <View style={[styles.ingredientBullet, { backgroundColor: Colors.error }]} />
              <Text style={styles.ingredientText}>{risk}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.resultCard}>
        <View style={styles.cardTitleContainer}>
          <Info size={20} color={Colors.primary} />
          <Text style={styles.resultCardTitle}>Recomendações</Text>
        </View>
        {result.recommendations.map((rec, index) => (
          <View key={index} style={styles.ingredientItem}>
            <View style={styles.ingredientBullet} />
            <Text style={styles.ingredientText}>{rec}</Text>
          </View>
        ))}
      </View>

      {result.alternativeRecipes && result.alternativeRecipes.length > 0 && (
        <View style={styles.resultCard}>
          <View style={styles.cardTitleContainer}>
            <ChefHat size={20} color={Colors.primary} />
            <Text style={styles.resultCardTitle}>Receitas Alternativas</Text>
          </View>
          {result.alternativeRecipes.map((recipe, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.ingredientBullet} />
              <Text style={styles.ingredientText}>{recipe}</Text>
            </View>
          ))}
        </View>
      )}

      {result.improvements && result.improvements.length > 0 && (
        <View style={styles.resultCard}>
          <View style={styles.cardTitleContainer}>
            <ListChecks size={20} color={Colors.primary} />
            <Text style={styles.resultCardTitle}>Sugestões de Melhoria</Text>
          </View>
          {result.improvements.map((improvement, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.ingredientBullet} />
              <Text style={styles.ingredientText}>{improvement}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.scanAgainButton}
        onPress={onScanAgain}
      >
        <Camera size={20} color={Colors.primary} />
        <Text style={styles.scanAgainButtonText}>Escanear Novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    gap: 16,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    height: 220,
    backgroundColor: Colors.backgroundSecondary,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  lactoseCard: {
    borderRadius: 16,
    padding: 20,
  },
  lactoseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lactoseTitleContainer: {
    flex: 1,
  },
  lactoseTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  lactoseLevel: {
    fontSize: 14,
    marginTop: 4,
    color: Colors.error,
    fontWeight: "600",
  },
  riskCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  riskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  riskEmoji: {
    fontSize: 32,
  },
  riskTitleContainer: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  riskSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  riskReasons: {
    gap: 8,
  },
  riskReasonItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  riskBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  riskReasonText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  nutritionItem: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  riskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  scanAgainButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
});
