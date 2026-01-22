import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera, AlertCircle } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Camera size={32} color={Colors.primary} />
        <Text style={styles.headerTitle}>Scanner</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.webNotice}>
          <AlertCircle size={64} color={Colors.primary} style={styles.noticeIcon} />
          <Text style={styles.noticeTitle}>
            Scanner não disponível na web
          </Text>
          <Text style={styles.noticeDescription}>
            A função de scanner de produtos está disponível apenas na versão mobile do aplicativo.
            {'\n\n'}
            Para usar o scanner:
            {'\n'}• Baixe o aplicativo na Play Store
            {'\n'}• Use a câmera do celular para escanear produtos
            {'\n'}• Receba análises instantâneas sobre lactose
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
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  webNotice: {
    alignItems: "center",
    maxWidth: 400,
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary + "30",
  },
  noticeIcon: {
    marginBottom: 20,
  },
  noticeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  noticeDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});

























