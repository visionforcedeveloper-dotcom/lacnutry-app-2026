import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User } from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";

export default function IntoleranceProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useProfile();

  const currentProfile = profile.intoleranceProfile;

  const [level, setLevel] = useState<"leve" | "moderada" | "severa">(
    currentProfile?.level || "moderada"
  );
  const [lactaseUse, setLactaseUse] = useState<"sempre" | "as-vezes" | "nunca">(
    currentProfile?.lactaseUse || "as-vezes"
  );
  const [problematicFoods, setProblematicFoods] = useState(
    currentProfile?.problematicFoods.join(", ") || ""
  );
  const [symptomFrequency, setSymptomFrequency] = useState(
    currentProfile?.symptomFrequency || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        ...profile,
        intoleranceProfile: {
          level,
          lactaseUse,
          problematicFoods: problematicFoods
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f),
          symptomFrequency: symptomFrequency.trim(),
        },
      });

      Alert.alert(
        "Sucesso",
        "Perfil de intolerância salvo com sucesso!",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível salvar o perfil de intolerância",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Perfil de Intolerância",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <User size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Configure Seu Perfil</Text>
          <Text style={styles.subtitle}>
            Informe detalhes sobre sua intolerância para receber recomendações
            personalizadas
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Grau da Intolerância</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                level === "leve" && styles.optionCardActive,
              ]}
              onPress={() => setLevel("leve")}
              activeOpacity={0.8}
            >
              <Text style={styles.optionTitle}>Leve</Text>
              <Text style={styles.optionSubtitle}>
                Poucos sintomas, tolerância moderada
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                level === "moderada" && styles.optionCardActive,
              ]}
              onPress={() => setLevel("moderada")}
              activeOpacity={0.8}
            >
              <Text style={styles.optionTitle}>Moderada</Text>
              <Text style={styles.optionSubtitle}>
                Sintomas regulares, necessita atenção
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                level === "severa" && styles.optionCardActive,
              ]}
              onPress={() => setLevel("severa")}
              activeOpacity={0.8}
            >
              <Text style={styles.optionTitle}>Severa</Text>
              <Text style={styles.optionSubtitle}>
                Reações intensas, evita completamente
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Uso de Lactase</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                lactaseUse === "sempre" && styles.optionCardActive,
              ]}
              onPress={() => setLactaseUse("sempre")}
              activeOpacity={0.8}
            >
              <Text style={styles.optionTitle}>Sempre</Text>
              <Text style={styles.optionSubtitle}>
                Uso regular antes de refeições com lactose
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                lactaseUse === "as-vezes" && styles.optionCardActive,
              ]}
              onPress={() => setLactaseUse("as-vezes")}
              activeOpacity={0.8}
            >
              <Text style={styles.optionTitle}>Às Vezes</Text>
              <Text style={styles.optionSubtitle}>
                Uso ocasional quando necessário
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                lactaseUse === "nunca" && styles.optionCardActive,
              ]}
              onPress={() => setLactaseUse("nunca")}
              activeOpacity={0.8}
            >
              <Text style={styles.optionTitle}>Nunca</Text>
              <Text style={styles.optionSubtitle}>
                Não utilizo suplementos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Alimentos Problemáticos</Text>
          <Text style={styles.sectionDescription}>
            Liste os alimentos que causam reações frequentes (separados por
            vírgula)
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ex: leite integral, queijo mussarela, iogurte natural..."
            placeholderTextColor={Colors.textSecondary}
            value={problematicFoods}
            onChangeText={setProblematicFoods}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Frequência de Sintomas</Text>
          <Text style={styles.sectionDescription}>
            Com que frequência você apresenta sintomas?
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ex: 2-3 vezes por semana, raramente, somente após grandes quantidades..."
            placeholderTextColor={Colors.textSecondary}
            value={symptomFrequency}
            onChangeText={setSymptomFrequency}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Salvando..." : "Salvar Perfil"}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Estes dados são usados para personalizar as recomendações do
            scanner, alertas de risco e sugestões de produtos mais seguros
            para você.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  cardGroup: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 96,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  infoBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

