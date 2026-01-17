import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send } from "lucide-react-native";
import Colors from "@/constants/colors";
import { chatWithNutritionist } from "@/lib/gemini";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function NutritionistScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Armazena histórico de conversa para contexto do Gemini
  const conversationHistory = useRef<Array<{ role: "user" | "model"; text: string }>>([]);
  
  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      const userInput = input.trim();
      setInput("");
      setIsLoading(true);
      
      try {
        // Chamar API do Gemini
        const aiResponse = await chatWithNutritionist(
          userInput,
          conversationHistory.current
        );
        
        // Atualizar histórico
        conversationHistory.current.push(
          { role: "user", text: userInput },
          { role: "model", text: aiResponse }
        );
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiResponse,
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error("Erro ao obter resposta:", error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, verifique sua conexão e tente novamente. 🙏",
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nutricionista IA",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: 20 },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                Olá! 👋 Sou sua nutricionista virtual
              </Text>
              <Text style={styles.emptyStateText}>
                Estou aqui para ajudar com dúvidas sobre dietas sem lactose,
                nutrição e alimentação saudável. 
                {'\n\n'}
                💡 Dica: Me conte sobre sua rotina (acordar, trabalho, treino) 
                que eu crio um cardápio completo personalizado para você!
                {'\n\n'}
                Como posso ajudar hoje?
              </Text>
            </View>
          )}

          {messages.map((message) => (
            <View key={message.id} style={styles.messageWrapper}>
              <View
                style={[
                  styles.messageBubble,
                  message.role === "user"
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === "user" && styles.userMessageText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={styles.messageWrapper}>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Pergunte sobre nutrição..."
            placeholderTextColor={Colors.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  messageWrapper: {
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.white,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.text,
  },
  userMessageText: {
    color: Colors.white,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
