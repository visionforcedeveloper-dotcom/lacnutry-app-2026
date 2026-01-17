import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useProfile } from "@/contexts/ProfileContext";

export default function ConfiguracoesScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoScan, setAutoScan] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            Alert.alert("Logout", "Funcionalidade em desenvolvimento");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Configurações",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>
                  Notificações Gerais
                </Text>
                <Text style={styles.settingDescription}>
                  Receber todas as notificações do app
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: Colors.border,
                  true: Colors.primaryLight,
                }}
                thumbColor={notifications ? Colors.primary : Colors.textSecondary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notificações Push</Text>
                <Text style={styles.settingDescription}>
                  Alertas em tempo real
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{
                  false: Colors.border,
                  true: Colors.primaryLight,
                }}
                thumbColor={pushNotifications ? Colors.primary : Colors.textSecondary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notificações por Email</Text>
                <Text style={styles.settingDescription}>
                  Receber atualizações por email
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{
                  false: Colors.border,
                  true: Colors.primaryLight,
                }}
                thumbColor={emailNotifications ? Colors.primary : Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scanner</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Análise Automática</Text>
                <Text style={styles.settingDescription}>
                  Analisar produtos automaticamente após scan
                </Text>
              </View>
              <Switch
                value={autoScan}
                onValueChange={setAutoScan}
                trackColor={{
                  false: Colors.border,
                  true: Colors.primaryLight,
                }}
                thumbColor={autoScan ? Colors.primary : Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <View style={styles.settingCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{profile.name}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Restrições</Text>
              <Text style={styles.infoValue}>
                {profile.allergies.join(", ")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>LacNutry v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Feito com 💚 para pessoas intolerantes à lactose
          </Text>
          <Text style={styles.supportEmail}>
            Suporte: visionforce.developer@gmail.com
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },
  infoRow: {
    padding: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.error,
  },

  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  supportEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});
