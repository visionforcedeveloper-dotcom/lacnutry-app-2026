import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
} from "react-native";
import { Sparkles } from "lucide-react-native";
import Colors from "@/constants/Colors";

interface LoadingModalProps {
  visible: boolean;
  progress: number;
}

export default function LoadingModal({ visible, progress }: LoadingModalProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      pulseAnim.setValue(1);
      progressAnim.setValue(0);
    }
  }, [visible, progress]);

  return (
    <Modal
      visible={visible}
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
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
          
          <View style={styles.loadingSteps}>
            <View style={styles.loadingStep}>
              <View
                style={[
                  styles.stepIndicator,
                  progress >= 30 && styles.stepIndicatorActive,
                ]}
              />
              <Text style={styles.stepText}>Processando imagem</Text>
            </View>
            <View style={styles.loadingStep}>
              <View
                style={[
                  styles.stepIndicator,
                  progress >= 60 && styles.stepIndicatorActive,
                ]}
              />
              <Text style={styles.stepText}>Identificando ingredientes</Text>
            </View>
            <View style={styles.loadingStep}>
              <View
                style={[
                  styles.stepIndicator,
                  progress >= 90 && styles.stepIndicatorActive,
                ]}
              />
              <Text style={styles.stepText}>Gerando análise</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "700",
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
    fontWeight: "600",
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
});
