import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles, Heart, ChefHat } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import Svg, { Circle, G } from 'react-native-svg';

export default function LoadingScreen() {
  const insets = useSafeAreaInsets();
  const [progress] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentMessage, setCurrentMessage] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  const loadingMessages = [
    "Coletando respostas...",
    "Analisando suas preferências...",
    "Preparando receitas personalizadas...",
    "Configurando seu perfil...",
    "Quase pronto!",
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animar porcentagem de 0 a 100
    let currentPercentage = 0;
    const percentageInterval = setInterval(() => {
      currentPercentage += 2;
      setAnimatedPercentage(currentPercentage);
      if (currentPercentage >= 100) {
        clearInterval(percentageInterval);
      }
    }, 30); // 100 / 2 * 30ms = 1500ms (1.5 segundos)

    Animated.timing(progress, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    const timeout = setTimeout(() => {
      router.replace("/paywall");
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(percentageInterval);
      clearTimeout(timeout);
    };
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 40,
              paddingBottom: insets.bottom + 40,
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.title}>Preparando sua experiência</Text>
          <Text style={styles.subtitle}>
            Estamos personalizando tudo para você!
          </Text>

          {/* Gráfico Donut */}
          <View style={styles.donutContainer}>
            <Svg width={220} height={220} viewBox="0 0 220 220">
              <G rotation={-90} origin="110, 110">
                {/* Círculo de fundo (cinza claro) */}
                <Circle
                  cx="110"
                  cy="110"
                  r="90"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="18"
                  fill="none"
                />
                {/* Círculo animado (branco) */}
                <Circle
                  cx="110"
                  cy="110"
                  r="90"
                  stroke="white"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray={`${(animatedPercentage / 100) * 565} 565`}
                  strokeLinecap="round"
                />
              </G>
            </Svg>
            
            {/* Porcentagem no centro do donut */}
            <View style={styles.donutCenter}>
              <Text style={styles.donutPercentage}>{animatedPercentage}%</Text>
              <Text style={styles.donutLabel}>Carregando</Text>
            </View>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              {loadingMessages[currentMessage]}
            </Text>
          </View>

          <View style={styles.factsContainer}>
            <Sparkles color={Colors.white} size={24} style={styles.factsIcon} />
            <Text style={styles.factsTitle}>Você sabia?</Text>
            <Text style={styles.factsText}>
              70% da população mundial tem algum grau de intolerância à
              lactose. Você não está sozinho(a)!
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 48,
  },
  donutContainer: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    position: "relative",
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  donutPercentage: {
    fontSize: 56,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 4,
  },
  donutLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: "600" as const,
  },
  messageContainer: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.white,
    textAlign: "center",
  },
  factsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  factsIcon: {
    marginBottom: 12,
  },
  factsTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  factsText: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.95,
    lineHeight: 22,
    textAlign: "center",
  },
});
