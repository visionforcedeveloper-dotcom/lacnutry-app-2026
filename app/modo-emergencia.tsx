import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertOctagon, Phone, FileText, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function EmergencyModeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleCallEmergency = () => {
    Linking.openURL('tel:192');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modo Emergência</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.alertCard}>
          <AlertOctagon size={48} color={Colors.white} />
          <Text style={styles.alertTitle}>Está tendo uma reação?</Text>
          <Text style={styles.alertMessage}>
            Mantenha a calma. Se sentir falta de ar, inchaço na garganta ou tontura severa, busque ajuda médica imediatamente.
          </Text>
          <TouchableOpacity style={styles.emergencyButton} onPress={handleCallEmergency}>
            <Phone size={24} color={Colors.error} />
            <Text style={styles.emergencyButtonText}>Ligar para Emergência (192)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que fazer agora</Text>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Pare de consumir</Text>
              <Text style={styles.stepDescription}>
                Interrompa imediatamente o consumo do alimento que causou a reação.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Tome sua medicação</Text>
              <Text style={styles.stepDescription}>
                Se você tem lactase ou outros medicamentos prescritos para alívio de sintomas, tome-os conforme orientação médica.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Hidrate-se</Text>
              <Text style={styles.stepDescription}>
                Beba bastante água para ajudar na digestão e evitar desidratação em caso de diarreia.
              </Text>
            </View>
          </View>

           <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Repouso</Text>
              <Text style={styles.stepDescription}>
                Descanse e evite esforços físicos até que os sintomas diminuam.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <FileText size={24} color={Colors.primary} />
          <Text style={styles.infoText}>
            Estas são orientações gerais. Siga sempre as instruções do seu médico.
          </Text>
        </View>
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
  alertCard: {
    backgroundColor: Colors.error,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
    fontWeight: '600',
  },
});
