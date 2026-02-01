import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";
import {
  analyzeProductImage,
  type GeminiVisionResponse,
} from "@/lib/gemini";
import LoadingModal from "@/components/scanner/LoadingModal";
import InitialState from "@/components/scanner/InitialState";
import AnalysisResults from "@/components/scanner/AnalysisResults";

type AnalysisResult = GeminiVisionResponse;

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const { addToHistory } = useProfile();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  const analyzeImage = async (base64Image: string) => {
    try {
      setIsAnalyzing(true);
      setAnalyzingProgress(0);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Iniciar animação de progresso simulada
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
        imageUri: capturedImageUri || undefined,
        analysis: result,
        additionalInfo: additionalInfo.trim() || undefined,
      });
      
      console.log('✅ Análise adicionada ao histórico:', result.productName);
    } catch (error) {
      console.error("[Scanner] Erro ao analisar imagem:", error);
      setIsAnalyzing(false);
      
      let errorMessage = "Erro ao analisar imagem. ";
      if (error instanceof Error) {
        if (error.message.includes("base64") || error.message.includes("formato")) {
          errorMessage = "Erro no formato da imagem. Tente tirar outra foto com boa iluminação.";
        } else if (error.message.includes("API") || error.message.includes("Erro na API")) {
          errorMessage = "Problema ao conectar com o serviço de análise. Verifique sua conexão.";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Erro ao processar resposta. Tente novamente.";
        } else if (error.message.includes("Limite")) {
          errorMessage = "Muitas análises em pouco tempo. Aguarde alguns segundos e tente novamente.";
        } else {
          errorMessage = error.message || "Erro desconhecido. Tente novamente.";
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCaptureImage = async (fromCamera: boolean) => {
    try {
      let result;

      if (fromCamera) {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          alert("Permissão para usar a câmera é necessária!");
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 1,
          base64: true,
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          alert("Permissão para acessar a galeria é necessária!");
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 1,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];

        if (!asset.base64) {
          alert("Erro ao processar imagem. Tente outra foto.");
          return;
        }

        setCapturedImageUri(asset.uri ?? null);
        setAnalysisResult(null);
        const base64Image = `data:image/jpeg;base64,${asset.base64}`;
        await analyzeImage(base64Image);
      }
    } catch (error) {
      console.error("[Scanner] Erro ao capturar/selecionar imagem:", error);
      alert("Erro ao processar imagem. Tente novamente.");
    }
  };

  const handleStartCamera = () => {
    handleCaptureImage(true);
  };

  const handlePickImage = () => {
    handleCaptureImage(false);
  };

  const handleNewScan = () => {
    setAnalysisResult(null);
    setAdditionalInfo("");
    setCapturedImageUri(null);
  };

  return (
    <>
      <LoadingModal visible={isAnalyzing} progress={analyzingProgress} />

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
            <InitialState
              onStartCamera={handleStartCamera}
              onPickImage={handlePickImage}
              additionalInfo={additionalInfo}
              setAdditionalInfo={setAdditionalInfo}
            />
          ) : (
            <AnalysisResults
              result={analysisResult}
              onScanAgain={handleNewScan}
              additionalInfo={additionalInfo}
              imageUri={capturedImageUri || undefined}
            />
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
    fontWeight: "700",
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
});
