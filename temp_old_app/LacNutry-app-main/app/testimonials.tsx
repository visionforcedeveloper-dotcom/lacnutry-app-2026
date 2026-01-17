import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Star, Users, TrendingUp, Heart, ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";

interface Testimonial {
  id: number;
  name: string;
  avatar: any;
  rating: number;
  text: string;
  achievement?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ana Silva",
    avatar: require('@/assets/images/D1.png'),
    rating: 5,
    text: "Depois que baixei o LacNutry parei de sofrer tentando descobrir se o alimento tinha lactose. O scanner ajuda MUITO no mercado. Ficou muito mais fácil viver sem passar mal.",
    achievement: "Usa o scanner diariamente",
  },
  {
    id: 2,
    name: "Juliana Costa",
    avatar: require('@/assets/images/D2.png'),
    rating: 5,
    text: "O app me salvou no dia a dia! As receitas sem lactose são práticas e baratinhas. Hoje tenho muito mais variedade na dieta.",
    achievement: "100+ receitas testadas",
  },
  {
    id: 3,
    name: "Carlos Mendes",
    avatar: require('@/assets/images/D3.png'),
    rating: 5,
    text: "Sempre ficava com medo de comer algo errado fora de casa. Com o LacNutry, só aponto a câmera e já sei se posso consumir. Me trouxe segurança.",
    achievement: "Sem crises há 3 meses",
  },
  {
    id: 4,
    name: "Rafael Santos",
    avatar: require('@/assets/images/D4.png'),
    rating: 5,
    text: "Finalmente um app que entende quem é intolerante! O LacNutry me ajudou a controlar minhas crises porque agora sei exatamente o que posso ou não consumir. Uso todos os dias.",
    achievement: "Vida transformada",
  },
];

export default function TestimonialsScreen() {
  const insets = useSafeAreaInsets();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const handleContinue = () => {
    router.replace("/paywall");
  };

  const handleBack = () => {
    router.back();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={20}
        fill={index < rating ? "#FFB800" : "transparent"}
        color={index < rating ? "#FFB800" : "#E0E0E0"}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color={Colors.white} size={28} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Avalie-nos</Text>

        {/* Rating Card */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingContent}>
            <View style={styles.starsRow}>
              <Text style={styles.ratingNumber}>4.8</Text>
              {renderStars(5)}
            </View>
          </View>
          <View style={styles.laurelLeft}>🏆</View>
          <View style={styles.laurelRight}>🏆</View>
        </View>

        {/* Main Message */}
        <Text style={styles.mainMessage}>
          LacNutry foi feito para{"\n"}pessoas como você
        </Text>

        {/* Users Badge */}
        <View style={styles.usersBadge}>
          <View style={styles.avatarsRow}>
            <Image source={require('@/assets/images/D1.png')} style={styles.avatarImage} />
            <Image source={require('@/assets/images/D2.png')} style={[styles.avatarImage, styles.avatarOverlap]} />
            <Image source={require('@/assets/images/D3.png')} style={[styles.avatarImage, styles.avatarOverlap]} />
          </View>
          <Text style={styles.usersText}>5M+ Usuários do LacNutry</Text>
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialsContainer}>
          {testimonials.map((testimonial, index) => (
            <View
              key={testimonial.id}
              style={[
                styles.testimonialCard,
                index === currentTestimonial && styles.testimonialCardActive,
              ]}
            >
              <View style={styles.testimonialHeader}>
                <View style={styles.testimonialUser}>
                  <Image source={testimonial.avatar} style={styles.testimonialAvatarImage} />
                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    {testimonial.achievement && (
                      <Text style={styles.testimonialAchievement}>
                        {testimonial.achievement}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.testimonialStars}>
                  {renderStars(testimonial.rating)}
                </View>
              </View>
              <Text style={styles.testimonialText}>{testimonial.text}</Text>
            </View>
          ))}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <TrendingUp color={Colors.primary} size={32} />
            <Text style={styles.statNumber}>94%</Text>
            <Text style={styles.statLabel}>Melhoraram os sintomas</Text>
          </View>
          <View style={styles.statCard}>
            <Heart color="#FF6B6B" size={32} />
            <Text style={styles.statNumber}>4.8/5</Text>
            <Text style={styles.statLabel}>Avaliação média</Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "800" as const,
    color: Colors.white,
    marginBottom: 24,
    letterSpacing: -1,
  },
  ratingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  ratingContent: {
    alignItems: "center",
    zIndex: 1,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: Colors.white,
  },
  ratingSubtext: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  laurelLeft: {
    position: "absolute",
    left: 20,
    top: "50%",
    transform: [{ translateY: -15 }],
    fontSize: 40,
  },
  laurelRight: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -15 }],
    fontSize: 40,
  },
  mainMessage: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 36,
  },
  usersBadge: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarOverlap: {
    marginLeft: -20,
  },
  usersText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  testimonialsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  testimonialCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testimonialCardActive: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  testimonialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  testimonialUser: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  testimonialAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  testimonialAchievement: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  testimonialStars: {
    flexDirection: "row",
    gap: 2,
  },
  testimonialText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.primary,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButton: {
    borderRadius: 28,
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
});

