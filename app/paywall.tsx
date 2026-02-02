import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  X,
  RefreshCw,
} from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { useProfile } from "@/contexts/ProfileContext";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import { PurchasesPackage } from 'react-native-purchases';

interface PricingPlan {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  oldPrice: number;
  period: string;
  pricePerMonth: number;
  savings?: string;
  popular?: boolean;
  features: string[];
  packageType: 'monthly' | 'annual';
}

const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    title: "1 Mês",
    subtitle: "R$ 27,00/mês",
    price: 27,
    oldPrice: 97,
    period: "mês",
    pricePerMonth: 27,
    packageType: 'monthly',
    features: [],
  },
  {
    id: "annual",
    title: "12 Meses",
    subtitle: "R$ 8,08/mês",
    price: 97,
    oldPrice: 324,
    period: "ano",
    pricePerMonth: 8.08,
    savings: "R$ 97,00 no total",
    popular: true,
    packageType: 'annual',
    features: [],
  },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { completeSubscription, hasSubscription, isPremium, setPremiumStatus, completeOnboarding, updateUserProgress } = useProfile();
  
  // Hook do RevenueCat
  const {
    isInitialized,
    isPremium: isRevenueCatPremium,
    offerings,
    currentOffering,
    isLoading,
    error,
    purchasePackage,
    restorePurchases,
    refreshPremiumStatus,
  } = useRevenueCat();
  
  // Estados da UI
  const [selectedPlan, setSelectedPlan] = useState<string>("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  
  // Animação do botão CTA
  const buttonPulseAnim = useState(new Animated.Value(1))[0];
  
  // Estados do FAQ
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  
  // Sincronizar status premium do RevenueCat com o contexto
  useEffect(() => {
    if (isRevenueCatPremium && !isPremium) {
      console.log('[Paywall] Premium ativado pelo RevenueCat, atualizando contexto...');
      setPremiumStatus(true);
    }
  }, [isRevenueCatPremium, isPremium, setPremiumStatus]);

  useEffect(() => {
    // Animação de pulso contínua
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ==========================================
  // FUNÇÃO DE COMPRA COM REVENUECAT
  // ==========================================

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);

    try {
      console.log('[Paywall] Iniciando compra do plano:', planId);
      
      if (!currentOffering) {
        Alert.alert('Erro', 'Nenhuma oferta disponível no momento');
        return;
      }

      // Encontrar o pacote correto baseado no plano selecionado
      let packageToPurchase: PurchasesPackage | null = null;
      
      if (planId === 'monthly') {
        packageToPurchase = currentOffering.monthly || null;
      } else if (planId === 'annual') {
        packageToPurchase = currentOffering.annual || null;
      }

      if (!packageToPurchase) {
        Alert.alert(
          'Produto não encontrado',
          `Pacote ${planId} não está disponível na oferta atual.`
        );
        return;
      }

      console.log('[Paywall] Comprando pacote:', packageToPurchase.identifier);

      const success = await purchasePackage(packageToPurchase);
      
      if (success) {
        console.log('[Paywall] Compra realizada com sucesso!');
        
        // Atualizar contexto
        await completeSubscription();
        await updateUserProgress('completed');
        
        Alert.alert(
          'Sucesso!',
          'Sua assinatura foi ativada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Completar onboarding e ir para o app
                completeOnboarding().then(() => {
                  router.replace("/(tabs)");
                });
              }
            }
          ]
        );
      }

    } catch (err: any) {
      console.error('[Paywall] Erro na compra:', err);
      
      if (err.code === 'PURCHASE_CANCELLED') {
        console.log('[Paywall] Usuário cancelou a compra');
        // Não mostrar erro quando usuário cancela
        return;
      } else {
        Alert.alert(
          'Erro na compra', 
          err.message || 'Ocorreu um erro durante a compra. Tente novamente.'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // FUNÇÃO PARA RESTAURAR COMPRAS
  // ==========================================

  const handleRestorePurchases = async () => {
    try {
      console.log('[Paywall] Restaurando compras...');
      
      const success = await restorePurchases();
      
      if (success) {
        Alert.alert(
          'Sucesso!',
          'Suas compras foram restauradas com sucesso!',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Atualizar progresso e completar onboarding
                await updateUserProgress('completed');
                completeOnboarding().then(() => {
                  router.replace("/(tabs)");
                });
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Nenhuma compra encontrada',
          'Não encontramos nenhuma compra anterior para restaurar.'
        );
      }
    } catch (err: any) {
      console.error('[Paywall] Erro ao restaurar compras:', err);
      Alert.alert(
        'Erro',
        'Não foi possível restaurar suas compras. Tente novamente.'
      );
    }
  };

  // ==========================================
  // HANDLER DE SELEÇÃO DE PLANO
  // ==========================================

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ==========================================
  // HANDLER DO FAQ
  // ==========================================

  const toggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // ==========================================
  // FAQ DATA
  // ==========================================

  const faqData = [
    {
      id: 'trial',
      icon: Calendar,
      question: 'Como experimentar gratuitamente?',
      answer: `Você tem 3 dias grátis para testar todas as funcionalidades premium do LacNutry!\n\n• Acesso completo a todas as receitas\n• Scanner de produtos ilimitado\n• Nutricionista IA\n• Gerador de receitas personalizadas\n• Zero anúncios\n\nApós os 3 dias, você será cobrado automaticamente ${selectedPlan === 'monthly' ? 'R$ 27,00 por mês' : 'R$ 97,00 por ano (equivalente a R$ 8,08/mês)'}.`
    },
    {
      id: 'cancel',
      icon: X,
      question: 'Como cancelar antes de ser cobrado?',
      answer: `Cancelar é super fácil! Você pode cancelar a qualquer momento antes do fim dos 3 dias de teste e não será cobrado nada.\n\n📱 Como cancelar:\n1. Abra a Google Play Store\n2. Toque em "Pagamentos e assinaturas"\n3. Selecione "Assinaturas"\n4. Encontre "LacNutry"\n5. Toque em "Cancelar assinatura"\n\nSe cancelar durante o teste, você ainda poderá usar o app até o final dos 3 dias!`
    },
    {
      id: 'charge',
      icon: CreditCard,
      question: 'Quando serei cobrado?',
      answer: `A cobrança acontece apenas APÓS os 3 dias de teste grátis.\n\n💳 Detalhes da cobrança:\n\n• Plano Mensal: R$ 27,00/mês\n  ${selectedPlan === 'monthly' ? '✓ Selecionado' : ''}\n\n• Plano Anual: R$ 97,00/ano (R$ 8,08/mês)\n  ${selectedPlan === 'annual' ? '✓ Selecionado' : ''}\n  Economize R$ 227,00 por ano!\n\nA cobrança é feita automaticamente no cartão cadastrado na Google Play.`
    },
    {
      id: 'renew',
      icon: RefreshCw,
      question: 'Como funciona a renovação?',
      answer: `Sua assinatura renova automaticamente para sua conveniência!\n\n🔄 Renovação:\n• A cada ${selectedPlan === 'monthly' ? 'mês' : 'ano'} sua assinatura renova automaticamente\n• Você será cobrado ${selectedPlan === 'monthly' ? 'R$ 27,00' : 'R$ 97,00'} no início de cada período\n• Pode cancelar a qualquer momento com pelo menos 24h de antecedência\n• Sem taxas ocultas ou surpresas\n• Sem compromisso de permanência\n\nVocê mantém o controle total da sua assinatura!`
    },
  ];

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando opções de pagamento...</Text>
        <Text style={styles.debugText}>Conectando ao RevenueCat...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erro ao carregar pagamentos</Text>
        <Text style={styles.debugText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => refreshPremiumStatus()}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>RevenueCat não inicializado</Text>
        <Text style={styles.debugText}>
          Verifique a configuração da API Key
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Title */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>LacNutry</Text>
        </View>
        
        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Scanner inteligente</Text>
            </View>

            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Registro de reações</Text>
            </View>

            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Botão de emergência</Text>
            </View>

            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Sem anúncios</Text>
            </View>
          </View>
        </View>

        {/* Plans Container */}
        <View style={styles.plansContainer}>
          {pricingPlans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  plan.popular && styles.planCardPopular,
                ]}
                onPress={() => handlePlanSelect(plan.id)}
                activeOpacity={0.9}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>POPULAR!</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    <Text style={[styles.planTitle, isSelected && styles.planTitleSelected]}>
                      {plan.title}
                    </Text>
                    {plan.savings && (
                      <Text style={styles.planSavings}>{plan.savings}</Text>
                    )}
                  </View>
                  
                  <View style={styles.planPricing}>
                    <Text style={[styles.planSubtitle, isSelected && styles.planSubtitleSelected]}>
                      {plan.subtitle}
                    </Text>
                    
                    <View style={[styles.planCheckbox, isSelected && styles.planCheckboxSelected]}>
                      {isSelected && <Check color={Colors.white} size={20} />}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Subscribe Button com Animação */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTagline}>
            Assinantes não arriscam. Eles conferem
          </Text>
          
          <Animated.View style={{ transform: [{ scale: buttonPulseAnim }] }}>
            <TouchableOpacity
              style={[styles.subscribeButton, isProcessing && styles.subscribeButtonDisabled]}
              onPress={() => handleSubscribe(selectedPlan)}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.subscribeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.subscribeButtonText}>
                  {isProcessing ? "Processando..." : "Experimentar 3 Dias Grátis"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* FAQ Interativo - Perguntas Frequentes */}
        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>Perguntas Frequentes</Text>
          <Text style={styles.faqSubtitle}>Toque para saber mais</Text>
          
          {faqData.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            const Icon = faq.icon;
            
            return (
              <TouchableOpacity
                key={faq.id}
                style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.faqIconContainer}>
                    <Icon color={Colors.primary} size={22} />
                  </View>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <View style={styles.faqChevron}>
                    {isExpanded ? (
                      <ChevronUp color={Colors.primary} size={20} />
                    ) : (
                      <ChevronDown color={Colors.textSecondary} size={20} />
                    )}
                  </View>
                </View>
                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text style={styles.restoreButton}>Restaurar Compras</Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Cobrança recorrente. Cancele a qualquer momento.
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  benefitsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  benefitsList: {
    gap: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'visible',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#F0F9F4',
  },
  planCardPopular: {
    borderColor: Colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  popularBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  planTitleSelected: {
    color: Colors.primary,
  },
  planSavings: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  planSubtitleSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  planCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  ctaTagline: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  faqContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  faqSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  faqCardExpanded: {
    borderColor: Colors.primary,
    backgroundColor: '#F9FAFB',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  faqIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  faqChevron: {
    marginLeft: 10,
  },
  faqBody: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingLeft: 59, // Alinhar com o texto da pergunta
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 15,
  },
  restoreButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.text,
  },
  debugText: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});
