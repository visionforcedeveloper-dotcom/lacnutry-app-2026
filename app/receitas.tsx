import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, AlertCircle, Clock, Activity, TrendingDown, Lock, Calendar, Zap } from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";

export default function ReactionAlertsScreen() {
  const insets = useSafeAreaInsets();
  const { reactions, addReaction, getReactionPatterns } = useProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Formulário
  const [product, setProduct] = useState("");
  const [timeToSymptoms, setTimeToSymptoms] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState("");

  const symptomOptions = [
    "Dor abdominal",
    "Gases",
    "Diarreia",
    "Náusea",
    "Inchaço",
    "Cólicas",
    "Vômito",
    "Mal-estar",
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddReaction = async () => {
    if (!product.trim() || selectedSymptoms.length === 0) {
      Alert.alert("Atenção", "Preencha o produto e selecione pelo menos um sintoma.");
      return;
    }

    const timeInMinutes = parseInt(timeToSymptoms) || 0;

    await addReaction({
      product: product.trim(),
      timeToSymptoms: timeInMinutes,
      symptoms: selectedSymptoms,
      intensity,
      notes: notes.trim() || undefined,
    });

    // Resetar formulário
    setProduct("");
    setTimeToSymptoms("");
    setSelectedSymptoms([]);
    setIntensity(3);
    setNotes("");
    setShowAddModal(false);

    Alert.alert("Sucesso!", "Reação registrada com sucesso.");
  };

  const patterns = getReactionPatterns();

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alertas de Reação</Text>
          <Text style={styles.headerSubtitle}>
            {reactions.length} {reactions.length === 1 ? 'reação registrada' : 'reações registradas'}
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {patterns && reactions.length >= 3 && (
            <View style={styles.patternsCard}>
              <View style={styles.patternsHeader}>
                <TrendingDown size={24} color={Colors.primary} />
                <Text style={styles.patternsTitle}>Padrões Identificados</Text>
              </View>
              
              {patterns.mostProblematicProducts.length > 0 && (
                <View style={styles.patternSection}>
                  <Text style={styles.patternLabel}>Produtos Mais Problemáticos:</Text>
                  {patterns.mostProblematicProducts.slice(0, 3).map((item, index) => (
                    <View key={index} style={styles.patternItem}>
                      <Text style={styles.patternProduct}>• {item.product}</Text>
                      <Text style={styles.patternCount}>{item.count}x</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.patternSection}>
                <Text style={styles.patternLabel}>Sintomas Mais Comuns:</Text>
                {patterns.commonSymptoms.slice(0, 3).map((item, index) => (
                  <Text key={index} style={styles.patternText}>
                    • {item.symptom} ({item.count}x)
                  </Text>
                ))}
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Activity size={16} color={Colors.primary} />
                  <Text style={styles.statValue}>
                    {patterns.avgIntensity.toFixed(1)}/5
                  </Text>
                  <Text style={styles.statLabel}>Intensidade Média</Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={16} color={Colors.primary} />
                  <Text style={styles.statValue}>
                    {Math.round(patterns.avgTimeToSymptoms)} min
                  </Text>
                  <Text style={styles.statLabel}>Tempo Médio</Text>
                </View>
              </View>
            </View>
          )}

          {reactions.length === 0 ? (
            <View style={styles.emptyState}>
              <AlertCircle size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>
                Nenhuma reação registrada
              </Text>
              <Text style={styles.emptyStateText}>
                Comece a registrar suas reações para identificar padrões e receber alertas personalizados
              </Text>
            </View>
          ) : (
            <View style={styles.reactionsContainer}>
              <Text style={styles.sectionTitle}>Histórico de Reações</Text>
              {reactions.map((reaction) => (
                <View key={reaction.id} style={styles.reactionCard}>
                  <View style={styles.reactionHeader}>
                    <Text style={styles.reactionProduct}>{reaction.product}</Text>
                    <View style={[styles.intensityBadge, { 
                      backgroundColor: reaction.intensity >= 4 ? '#FFE5E5' : 
                                      reaction.intensity >= 3 ? '#FFF4E6' : '#E8F5E9'
                    }]}>
                      <Text style={[styles.intensityText, {
                        color: reaction.intensity >= 4 ? Colors.error : 
                               reaction.intensity >= 3 ? Colors.warning : Colors.success
                      }]}>
                        {reaction.intensity}/5
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reactionMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>
                        {reaction.timeToSymptoms > 0 
                          ? `${reaction.timeToSymptoms} min` 
                          : 'Imediato'}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>
                        {new Date(reaction.date).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.symptomsContainer}>
                    {reaction.symptoms.map((symptom, index) => (
                      <View key={index} style={styles.symptomChip}>
                        <Text style={styles.symptomText}>{symptom}</Text>
                      </View>
                    ))}
                  </View>
                  {reaction.notes && (
                    <Text style={styles.reactionNotes}>{reaction.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Registrar Reação</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Produto/Alimento Consumido *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: Queijo mussarela"
                placeholderTextColor={Colors.textSecondary}
                value={product}
                onChangeText={setProduct}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Tempo até os sintomas (minutos)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: 30"
                placeholderTextColor={Colors.textSecondary}
                value={timeToSymptoms}
                onChangeText={setTimeToSymptoms}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Sintomas *</Text>
              <View style={styles.symptomsGrid}>
                {symptomOptions.map((symptom) => (
                  <TouchableOpacity
                    key={symptom}
                    style={[
                      styles.symptomOption,
                      selectedSymptoms.includes(symptom) && styles.symptomOptionActive
                    ]}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <Text
                      style={[
                        styles.symptomOptionText,
                        selectedSymptoms.includes(symptom) && styles.symptomOptionTextActive
                      ]}
                    >
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Intensidade: {intensity}/5</Text>
              <View style={styles.intensitySelector}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.intensityButton,
                      intensity === level && styles.intensityButtonActive,
                      { backgroundColor: 
                        level <= 2 ? '#E8F5E9' :
                        level === 3 ? '#FFF4E6' : '#FFE5E5'
                      }
                    ]}
                    onPress={() => setIntensity(level as 1 | 2 | 3 | 4 | 5)}
                  >
                    <Text style={[
                      styles.intensityButtonText,
                      intensity === level && styles.intensityButtonTextActive
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Observações (opcional)</Text>
              <TextInput
                style={styles.formTextArea}
                placeholder="Ex: Comi em jejum, estava com estresse..."
                placeholderTextColor={Colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddReaction}
            >
              <Zap size={20} color={Colors.white} />
              <Text style={styles.submitButtonText}>Registrar Reação</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  lockedIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  lockedDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  upgradeButton: {
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
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  patternsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  patternsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  patternsTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  patternSection: {
    marginBottom: 16,
  },
  patternLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  patternItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  patternProduct: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  patternCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  patternText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  reactionsContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  reactionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  reactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reactionProduct: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
  },
  intensityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  reactionMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  symptomsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  symptomChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  symptomText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  reactionNotes: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
    marginTop: 8,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTextArea: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  symptomOption: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  symptomOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  symptomOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  symptomOptionTextActive: {
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  intensitySelector: {
    flexDirection: "row",
    gap: 8,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  intensityButtonActive: {
    borderColor: Colors.primary,
  },
  intensityButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  intensityButtonTextActive: {
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
