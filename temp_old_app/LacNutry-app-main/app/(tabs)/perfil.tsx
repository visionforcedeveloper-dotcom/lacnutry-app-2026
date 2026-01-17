import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  User,
  Heart,
  BookmarkCheck,
  Settings,
  Bell,
  HelpCircle,
  Info,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useProfile } from "@/contexts/ProfileContext";

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, favorites, history, stats } = useProfile();

  const menuItems = [
    {
      section: "Conta",
      items: [
        {
          icon: User,
          title: "Editar Perfil",
          subtitle: "Nome, email e preferências",
          route: "/editar-perfil",
        },
        {
          icon: Bell,
          title: "Notificações",
          subtitle: "Gerenciar alertas e lembretes",
          route: "/configuracoes",
        },
      ],
    },
    {
      section: "Conteúdo",
      items: [
        {
          icon: Heart,
          title: "Receitas Favoritas",
          subtitle: `${favorites.length} receitas salvas`,
          route: "/favoritos",
        },
        {
          icon: BookmarkCheck,
          title: "Histórico",
          subtitle: `${history.length} análises recentes`,
          route: "/historico",
        },
      ],
    },
    {
      section: "Geral",
      items: [
        {
          icon: Settings,
          title: "Configurações",
          subtitle: "Preferências do app",
          route: "/configuracoes",
        },
        {
          icon: HelpCircle,
          title: "Ajuda & Suporte",
          subtitle: "visionforce.developer@gmail.com",
          route: null,
          action: "support",
        },
        {
          icon: Info,
          title: "Sobre o App",
          subtitle: "Versão 1.0.0",
          route: null,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User size={40} color={Colors.white} />
        </View>
        <Text style={styles.userName}>{profile.name}</Text>
        <Text style={styles.userEmail}>{profile.email}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex === section.items.length - 1 &&
                        styles.menuItemLast,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (item.action === "support") {
                        Alert.alert(
                          "Ajuda & Suporte",
                          "Entre em contato conosco através do e-mail:\n\nvisionforce.developer@gmail.com",
                          [
                            {
                              text: "Cancelar",
                              style: "cancel",
                            },
                            {
                              text: "Enviar E-mail",
                              onPress: () => {
                                Linking.openURL("mailto:visionforce.developer@gmail.com");
                              },
                            },
                          ]
                        );
                      } else if (item.route) {
                        router.push(item.route as any);
                      }
                    }}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconContainer}>
                        <Icon size={20} color={Colors.primary} />
                      </View>
                      <View style={styles.menuItemText}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Receitas Salvas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalScans}</Text>
            <Text style={styles.statLabel}>Análises Feitas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Dias de Sequência</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Feito com 💚 para pessoas intolerantes à lactose
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
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
