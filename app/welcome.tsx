import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/Colors";

const { width } = Dimensions.get("window");

const imageSources = [
  {
    id: "1",
    image: require("@/assets/img-10.png"),
  },
  {
    id: "2",
    image: require("@/assets/img-20.png"),
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleStartQuiz = () => {
    router.replace("/quiz");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % imageSources.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.gradient}
      >
        <View style={[styles.languageIndicator, { top: insets.top + 16 }]}>
          <Text style={styles.languageText}>PT</Text>
          <Text style={styles.flagEmoji}>🇧🇷</Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.videoContainer}>
              <Animated.Image
                source={imageSources[activeIndex].image}
                style={[styles.videoImage, { opacity: fadeAnim }]}
                resizeMode="contain"
              />
            </View>

            <View style={styles.ctaContainer}>
              <Text style={styles.ctaTitle}>
                Viva sem desconforto — a sua liberdade começa aqui
              </Text>

              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleStartQuiz}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaButtonText}>Começar</Text>
                <ArrowRight color={Colors.primary} size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  languageIndicator: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  languageText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  flagEmoji: {
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    marginBottom: 40,
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  videoImage: {
    width: width - 48,
    height: 450,
    borderRadius: 24,
    alignSelf: "center",
  },
  ctaContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 32,
    paddingHorizontal: 8,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
});
