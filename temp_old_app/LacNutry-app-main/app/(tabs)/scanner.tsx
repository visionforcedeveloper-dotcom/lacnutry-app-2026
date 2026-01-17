import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Camera, X, Sparkles, AlertCircle, Info, TrendingUp, Apple, ChefHat, ListChecks, Image as ImageIcon } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useProfile } from "@/contexts/ProfileContext";
import { analyzeProductImage } from "@/lib/gemini";

interface AnalysisResult {
  hasLactose: boolean;
  lactoseLevel?: "baixo" | "médio" | "alto";
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    lactose: number;
  };
  risks: string[];
  recommendations: string[];
  alternativeRecipes?: string[];
  improvements?: string[];
}

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const { addToHistory } = useProfile();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [additionalInfo, setAdditionalInfo] = useState("");

  const analyzeImage = async (base64Image: string) => {
    try {
      setIsAnalyzing(true);
      setAnalyzingProgress(0);
      setIsCameraActive(false);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Iniciar animação de progresso
      const progressInterval = setInterval(() => {
        setAnalyzingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Chamar API do Gemini para análise real da imagem
      const result = await analyzeProductImage(
        base64Image,
        additionalInfo.trim() || undefined
      );
      
      clearInterval(progressInterval);
      setAnalyzingProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setAnalysisResult(result);
      
      addToHistory({
        id: Date.now().toString(),
        productName: result.productName || additionalInfo.trim() || 'Análise de alimento',
        date: new Date().toISOString(),
        hasLactose: result.hasLactose,
      });
      
      console.log('✅ Análise adicionada ao histórico:', result.productName);
    } catch (error) {
      console.error("Erro ao analisar imagem:", error);
      setIsAnalyzing(false);
      
      let errorMessage = "Erro ao analisar imagem. ";
      if (error instanceof Error) {
        if (error.message.includes("API")) {
          errorMessage += "Problema ao conectar com o serviço de análise. Verifique sua conexão.";
        } else if (error.message.includes("JSON")) {
          errorMessage += "Erro ao processar resposta. Tente novamente.";
        } else {
          errorMessage += "Tente novamente.";
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
      });

      if (!photo || !photo.base64) {
        throw new Error("Falha ao capturar imagem");
      }

      const base64Image = `data:image/jpeg;base64,${photo.base64}`;
      await analyzeImage(base64Image);
    } catch (error) {
      console.error("Erro ao capturar foto:", error);
      alert("Erro ao capturar foto. Tente novamente.");
      setIsAnalyzing(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert("Permissão para acessar a galeria é necessária!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsCameraActive(false);
        setAnalysisResult(null);
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await analyzeImage(base64Image);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      alert("Erro ao selecionar imagem. Tente novamente.");
    }
  };

  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        alert("Permissão de câmera necessária para usar o scanner");
        return;
      }
    }
    setAnalysisResult(null);
    setIsCameraActive(true);
  };

  const handleCloseCamera = () => {
    setIsCameraActive(false);
  };

  const handleNewScan = () => {
    setAnalysisResult(null);
    setAdditionalInfo("");
    handleStartCamera();
  };

  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      Animated.timing(progressAnim, {
        toValue: analyzingProgress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      pulseAnim.setValue(1);
      progressAnim.setValue(0);
      setAnalyzingProgress(0);
    }
  }, [isAnalyzing, analyzingProgress]);

  if (isCameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={"back" as CameraType}
        >
          <View style={[styles.cameraOverlay, { paddingTop: insets.top }]}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseCamera}
              >
                <X size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.cameraCenter}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanInstruction}>
                Posicione o alimento dentro do quadro
              </Text>
            </View>

            <View style={styles.cameraFooter}>
              {isAnalyzing ? (
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator size="large" color={Colors.white} />
                  <Text style={styles.analyzingText}>Analisando...</Text>
                </View>
              ) : (
                <View style={styles.cameraActions}>
                  <TouchableOpacity
                    style={styles.galleryButton}
                    onPress={handlePickImage}
                  >
                    <ImageIcon size={28} color={Colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleTakePhoto}
                  >
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                  <View style={styles.galleryButtonPlaceholder} />
                </View>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <>
      <Modal
        visible={isAnalyzing}
        transparent
        animationType="fade"
      >
        <View style={styles.loadingModal}>
          <View style={styles.loadingContent}>
            <Animated.View
              style={[
                styles.loadingIconContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Sparkles size={48} color={Colors.primary} />
            </Animated.View>
            
            <Text style={styles.loadingTitle}>Analisando Imagem</Text>
            <Text style={styles.loadingSubtitle}>
              Identificando ingredientes e informações nutricionais...
            </Text>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{analyzingProgress}%</Text>
            </View>
            
            <View style={styles.loadingSteps}>
              <View style={styles.loadingStep}>
                <View
                  style={[
                    styles.stepIndicator,
                    analyzingProgress >= 30 && styles.stepIndicatorActive,
                  ]}
                />
                <Text style={styles.stepText}>Processando imagem</Text>
              </View>
              <View style={styles.loadingStep}>
                <View
                  style={[
                    styles.stepIndicator,
                    analyzingProgress >= 60 && styles.stepIndicatorActive,
                  ]}
                />
                <Text style={styles.stepText}>Identificando ingredientes</Text>
              </View>
              <View style={styles.loadingStep}>
                <View
                  style={[
                    styles.stepIndicator,
                    analyzingProgress >= 90 && styles.stepIndicatorActive,
                  ]}
                />
                <Text style={styles.stepText}>Gerando análise</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scanner IA</Text>
        <Text style={styles.headerSubtitle}>
          Analise alimentos e pratos com inteligência artificial
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!analysisResult ? (
          <View style={styles.initialState}>
            <View style={styles.iconContainer}>
              <Camera size={64} color={Colors.primary} />
            </View>
            <Text style={styles.initialTitle}>Scanner de Alimentos</Text>
            <Text style={styles.initialDescription}>
              Tire uma foto de qualquer prato ou alimento e descubra se contém
              lactose, seus ingredientes e informações nutricionais
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartCamera}
              >
                <Camera size={20} color={Colors.white} />
                <Text style={styles.startButtonText}>Tirar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.galleryPickerButton}
                onPress={handlePickImage}
              >
                <ImageIcon size={20} color={Colors.primary} />
                <Text style={styles.galleryPickerButtonText}>Escolher da Galeria</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.additionalInfoContainer}>
              <Text style={styles.additionalInfoLabel}>
                Informações adicionais (opcional)
              </Text>
              <TextInput
                style={styles.additionalInfoInput}
                placeholder="Ex: bolo sem lactose, queijo vegano, etc."
                placeholderTextColor={Colors.textSecondary}
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={styles.additionalInfoHint}>
                Adicione detalhes sobre o alimento para melhorar a análise
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <View
              style={[
                styles.lactoseCard,
                {
                  backgroundColor: analysisResult.hasLactose
                    ? "#FEE"
                    : "#E8F5E9",
                },
              ]}
            >
              <View style={styles.lactoseHeader}>
                {analysisResult.hasLactose ? (
                  <AlertCircle size={28} color={Colors.error} />
                ) : (
                  <Sparkles size={28} color={Colors.success} />
                )}
                <View style={styles.lactoseTitleContainer}>
                  <Text
                    style={[
                      styles.lactoseTitle,
                      {
                        color: analysisResult.hasLactose
                          ? Colors.error
                          : Colors.success,
                      },
                    ]}
                  >
                    {analysisResult.hasLactose
                      ? "Contém Lactose"
                      : "Livre de Lactose"}
                  </Text>
                  {analysisResult.hasLactose && analysisResult.lactoseLevel && (
                    <Text style={styles.lactoseLevel}>
                      Nível: {analysisResult.lactoseLevel}
                    </Text>
                  )}
                </View>
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
                    {analysisResult.nutritionalInfo.calories}
                  </Text>
                  <Text style={styles.nutritionLabel}>Calorias</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {analysisResult.nutritionalInfo.protein}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Proteínas</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {analysisResult.nutritionalInfo.carbs}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Carboidratos</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {analysisResult.nutritionalInfo.fat}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Gorduras</Text>
                </View>
                {analysisResult.hasLactose && (
                  <View style={styles.nutritionItem}>
                    <Text style={[styles.nutritionValue, { color: Colors.error }]}>
                      {analysisResult.nutritionalInfo.lactose}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Lactose</Text>
                  </View>
                )}
              </View>
            </View>

            {analysisResult.risks && analysisResult.risks.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardTitleContainer}>
                  <AlertCircle size={20} color={Colors.error} />
                  <Text style={styles.resultCardTitle}>Riscos de Lactose</Text>
                </View>
                {analysisResult.risks.map((risk, index) => (
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
              {analysisResult.recommendations.map((rec, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>{rec}</Text>
                </View>
              ))}
            </View>

            {analysisResult.alternativeRecipes && analysisResult.alternativeRecipes.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardTitleContainer}>
                  <ChefHat size={20} color={Colors.primary} />
                  <Text style={styles.resultCardTitle}>Receitas Alternativas</Text>
                </View>
                {analysisResult.alternativeRecipes.map((recipe, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientBullet} />
                    <Text style={styles.ingredientText}>{recipe}</Text>
                  </View>
                ))}
              </View>
            )}

            {analysisResult.improvements && analysisResult.improvements.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardTitleContainer}>
                  <ListChecks size={20} color={Colors.primary} />
                  <Text style={styles.resultCardTitle}>Sugestões de Melhoria</Text>
                </View>
                {analysisResult.improvements.map((improvement, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientBullet} />
                    <Text style={styles.ingredientText}>{improvement}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={handleNewScan}
            >
              <Camera size={20} color={Colors.primary} />
              <Text style={styles.scanAgainButtonText}>Escanear Novamente</Text>
            </TouchableOpacity>
          </View>
        )}
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
  initialState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  initialDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  actionButtons: {
    width: "100%",
    gap: 12,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
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
  galleryPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  galleryPickerButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: Colors.text,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  cameraHeader: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: Colors.white,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  scanInstruction: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cameraFooter: {
    padding: 40,
    alignItems: "center",
  },
  cameraActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  galleryButtonPlaceholder: {
    width: 56,
    height: 56,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
  },
  analyzingContainer: {
    alignItems: "center",
    gap: 16,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  resultsContainer: {
    gap: 16,
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
    fontWeight: "700" as const,
  },
  lactoseLevel: {
    fontSize: 14,
    marginTop: 4,
    color: Colors.error,
    fontWeight: "600" as const,
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
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
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
    fontWeight: "700" as const,
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
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
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
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  loadingModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  loadingIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  progressBarContainer: {
    width: "100%",
    marginBottom: 24,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center",
  },
  loadingSteps: {
    width: "100%",
    gap: 12,
  },
  loadingStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepIndicatorActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  additionalInfoContainer: {
    width: "100%",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  additionalInfoLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  additionalInfoInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 80,
  },
  additionalInfoHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 16,
  },
});
