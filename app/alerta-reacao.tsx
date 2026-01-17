import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Calendar, AlertTriangle, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useProfile } from '@/contexts/ProfileContext';

export default function ReactionAlertsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reactions, addReaction, removeReaction } = useProfile();
  
  const [showForm, setShowForm] = useState(false);
  const [product, setProduct] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [intensity, setIntensity] = useState(1);

  const handleSaveReaction = () => {
    if (!product || !symptoms) {
      alert('Preencha todos os campos!');
      return;
    }

    addReaction({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      product,
      symptoms: symptoms.split(',').map(s => s.trim()),
      intensity: intensity as 1 | 2 | 3 | 4 | 5,
    });

    setProduct('');
    setSymptoms('');
    setIntensity(1);
    setShowForm(false);
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alertas de Reação</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {!showForm ? (
          <>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
              <Plus size={24} color={Colors.white} />
              <Text style={styles.addButtonText}>Registrar Nova Reação</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Histórico de Reações</Text>

            {reactions.length === 0 ? (
              <View style={styles.emptyState}>
                <AlertTriangle size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>Nenhuma reação registrada ainda.</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {reactions.map((reaction) => (
                  <View key={reaction.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.dateContainer}>
                        <Calendar size={16} color={Colors.textSecondary} />
                        <Text style={styles.dateText}>{formatDate(reaction.date)}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeReaction(reaction.id)}>
                        <Trash2 size={20} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.productName}>{reaction.product}</Text>
                    
                    <View style={styles.symptomsContainer}>
                      {reaction.symptoms.map((symptom, idx) => (
                        <View key={idx} style={styles.symptomBadge}>
                          <Text style={styles.symptomText}>{symptom}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.intensityContainer}>
                      <Text style={styles.intensityLabel}>Intensidade:</Text>
                      <View style={styles.intensityDots}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <View
                            key={i}
                            style={[
                              styles.intensityDot,
                              { backgroundColor: i <= reaction.intensity ? Colors.error : Colors.border }
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Registrar Reação</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Produto consumido</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Leite, Queijo, Bolo..."
                value={product}
                onChangeText={setProduct}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sintomas (separados por vírgula)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Dor abdominal, inchaço, gases..."
                value={symptoms}
                onChangeText={setSymptoms}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Intensidade (1 a 5)</Text>
              <View style={styles.intensitySelector}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.intensityButton,
                      intensity === i && styles.intensityButtonActive
                    ]}
                    onPress={() => setIntensity(i as any)}
                  >
                    <Text style={[
                      styles.intensityButtonText,
                      intensity === i && styles.intensityButtonTextActive
                    ]}>{i}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSaveReaction}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  symptomBadge: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  symptomText: {
    fontSize: 12,
    color: Colors.text,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  intensityLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  intensityDots: {
    flexDirection: 'row',
    gap: 4,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  form: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.text,
  },
  intensitySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityButtonActive: {
    backgroundColor: Colors.error,
  },
  intensityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  intensityButtonTextActive: {
    color: Colors.white,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.backgroundSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    fontWeight: '700',
    color: Colors.text,
  },
  saveButtonText: {
    fontWeight: '700',
    color: Colors.white,
  },
});
