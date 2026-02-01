import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Camera, Image as ImageIcon } from "lucide-react-native";
import Colors from "@/constants/colors";

interface InitialStateProps {
  onStartCamera: () => void;
  onPickImage: () => void;
  additionalInfo: string;
  setAdditionalInfo: (text: string) => void;
}

export default function InitialState({
  onStartCamera,
  onPickImage,
  additionalInfo,
  setAdditionalInfo,
}: InitialStateProps) {
  return (
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
          onPress={onStartCamera}
        >
          <Camera size={20} color={Colors.white} />
          <Text style={styles.startButtonText}>Tirar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.galleryPickerButton}
          onPress={onPickImage}
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
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "700",
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
    fontWeight: "700",
    color: Colors.primary,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
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
    fontWeight: "600",
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
