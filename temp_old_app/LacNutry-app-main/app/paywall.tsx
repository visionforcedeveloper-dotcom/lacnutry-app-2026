import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Check,
  Zap,
  Heart,
  TrendingUp,
  Shield,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Calendar,
  CreditCard,
  X,
  RefreshCw,
} from "lucide-react-native";
import { router } from "expo-router";
import Constants from 'expo-constants';
import Colors from "@/constants/colors";
import { useProfile } from "@/contexts/ProfileContext";

// Conditional import: Mock para Expo Go, real para build nativo
// Envolto em try-catch para evitar crashes
function getInAppPurchaseHook() {
  try {
    if (Constants.appOwnership === 'expo') {
      // Expo Go - usar mock
      return require('@/hooks/useInAppPurchase.expo-go').default;
    } else {
      // Build nativo - usar real
      return require('@/hooks/useInAppPurchase').default;
    }
  } catch (error) {
    console.error('[Paywall] Erro ao carregar hook IAP:', error);
    // Fallback mock
    return () => ({
      isPremiumActive: false,
      connectionErrorMsg: 'Erro ao inicializar pagamentos',
      purchaseProduct: async () => {},
      connected: false,
      products: [],
    });
  }
}

const useInAppPurchase = getInAppPurchaseHook();

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
  productId: string;
}

// Mapeamento de planos para IDs
// O app vai usar o PRIMEIRO ID que for encontrado
const PRODUCT_IDS = {
  MONTHLY: [
    'com.lactosefree.monthly',
    'lacnutry_mensal',
    'lacnutry_plano_mensal_27',
    'lacnutry_premium_monthly',
    'plano_mensal',
  ],
  YEARLY: [
    'com.lactosefree.annual',
    'lacnutry_anual',
    'lacnutry_annual',
    'lacnutry_premium_anual',
    'premium_anual',
  ],
};

const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    title: "1 Mês",
    subtitle: "R$ 27,00/mês",
    price: 27,
    oldPrice: 97,
    period: "mês",
    pricePerMonth: 27,
    productId: PRODUCT_IDS.MONTHLY[0], // Vai ser ajustado dinamicamente
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
    productId: PRODUCT_IDS.YEARLY[0], // Vai ser ajustado dinamicamente
    features: [],
  },
];

function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { completeSubscription, profile, hasSubscription } = useProfile();
  
  // Hook customizado de compras (padrão DoableDanny) com fallback para erro
  let iapHook;
  try {
    iapHook = useInAppPurchase();
  } catch (error) {
    console.error('[Paywall] Erro ao inicializar useInAppPurchase:', error);
    // Fallback caso o hook falhe
    iapHook = {
      isPremiumActive: false,
      connectionErrorMsg: 'Erro ao conectar com Google Play',
      purchaseProduct: async () => {},
      connected: false,
      products: [],
    };
  }
  
  const { 
    isPremiumActive,
    connectionErrorMsg,
    purchaseProduct,
    connected,
    products,
  } = iapHook;
  
  // Estados da UI
  const [selectedPlan, setSelectedPlan] = useState<string>("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(4 * 60 * 60);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const [availableProductIds, setAvailableProductIds] = useState<{monthly: string | null, yearly: string | null}>({
    monthly: null,
    yearly: null,
  });
  
  // Estado de loading
  const isLoading = !connected;
  
  // Animação do botão CTA
  const buttonPulseAnim = useState(new Animated.Value(1))[0];
  
  // Estados do FAQ
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  
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

  // Descobrir quais IDs estão disponíveis
  useEffect(() => {
    if (products.length > 0) {
      console.log('[Paywall] Descobrindo IDs disponíveis...');
      console.log('[Paywall] Total produtos encontrados:', products.length);
      
      // Encontrar primeiro ID mensal que existe
      const monthlyId = PRODUCT_IDS.MONTHLY.find(id => 
        products.some((p: any) => p.productId === id || p.id === id)
      );
      
      // Encontrar primeiro ID anual que existe
      const yearlyId = PRODUCT_IDS.YEARLY.find(id => 
        products.some((p: any) => p.productId === id || p.id === id)
      );
      
      console.log('[Paywall] ID Mensal encontrado:', monthlyId || 'NENHUM');
      console.log('[Paywall] ID Anual encontrado:', yearlyId || 'NENHUM');
      
      setAvailableProductIds({
        monthly: monthlyId || null,
        yearly: yearlyId || null,
      });

      // Listar TODOS os produtos encontrados
      console.log('[Paywall] === TODOS OS PRODUTOS ENCONTRADOS ===');
      products.forEach((p: any) => {
        console.log(`- ${p.productId || p.id} | ${p.localizedPrice || p.price}`);
      });
      console.log('[Paywall] ======================================');
    }
  }, [products]);

  // Timer de oferta
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer de oferta
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // FUNÇÃO DE COMPRA SIMPLIFICADA (padrão DoableDanny)
  // ==========================================

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);

    try {
      console.log('[Paywall] Botão clicado, planId:', planId);
      
      const plan = pricingPlans.find(p => p.id === planId);
      if (!plan) {
        Alert.alert('Erro', 'Plano não encontrado');
        throw new Error('Plano não encontrado');
      }

      // Usar ID dinâmico descoberto
      const productId = planId === 'monthly' 
        ? availableProductIds.monthly 
        : availableProductIds.yearly;

      if (!productId) {
        Alert.alert(
          'Produto não encontrado',
          `Nenhum ID de produto ${planId} foi encontrado.\n\n` +
          `Produtos disponíveis:\n${products.map((p: any) => `- ${p.productId || p.id}`).join('\n')}`
        );
        setIsProcessing(false);
        return;
      }

      console.log('[Paywall] Usando productId:', productId);
      console.log('[Paywall] Produtos disponíveis:', products.length);
      console.log('[Paywall] Conectado?', connected);

      if (!connected) {
        Alert.alert('Erro', 'Não conectado ao Google Play. Verifique se o app foi instalado via Play Store.');
        return;
      }

      if (products.length === 0) {
        Alert.alert(
          'Erro', 
          'Nenhum produto encontrado.\n\n' +
          'Verifique:\n' +
          '1. App instalado via Play Store\n' +
          '2. Produtos ativos no Play Console\n' +
          '3. IDs corretos: com.lactosefree.monthly e com.lactosefree.annual'
        );
        return;
      }

      console.log('[Paywall] Chamando purchaseProduct...');
      
      // Chamar função do hook com ID descoberto
      await purchaseProduct(productId);
      
      console.log('[Paywall] purchaseProduct retornou (popup deve ter aparecido)');

    } catch (err: any) {
      console.error('[Paywall] Erro:', err);
      
      if (err.code === 'E_USER_CANCELLED') {
        console.log('[Paywall] Usuário cancelou');
      } else {
        Alert.alert(
          'Erro na compra', 
          err.message || 'Erro desconhecido\n\n' + JSON.stringify(err)
        );
      }
    } finally {
      // Aguardar um pouco antes de desbloquear o botão
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  // ==========================================
  // EFEITO: Monitorar quando premium for ativado
  // ==========================================
  useEffect(() => {
    if (isPremiumActive && !hasSubscription) {
      // Ativar no contexto do app e AGUARDAR completar
      console.log('[Paywall] Premium ativo detectado, ativando assinatura...');
      completeSubscription().then(() => {
        console.log('[Paywall] Assinatura ativada com sucesso, redirecionando...');
        // Pequeno delay para garantir que o estado foi atualizado
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 500);
      }).catch((err) => {
        console.error('[Paywall] Erro ao ativar assinatura:', err);
      });
    }
  }, [isPremiumActive, hasSubscription, completeSubscription]);

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
        <Text style={styles.debugText}>Conectando ao Google Play...</Text>
      </View>
    );
  }

  // DEBUG: Mostrar status
  if (!connected) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Não conectado ao Google Play</Text>
        <Text style={styles.debugText}>
          Erro: {connectionErrorMsg || 'Desconhecido'}
        </Text>
        <Text style={styles.debugText}>
          Verifique se o app foi instalado via Play Store (Internal Testing)
        </Text>
      </View>
    );
  }

  // DEBUG: Não bloquear o paywall se produtos não forem encontrados
  // O usuário ainda pode ver os planos e tentar assinar
  if (products.length === 0) {
    console.log('[Paywall] ⚠️ Nenhum produto encontrado, mas continuando...');
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
          <View style={styles.benefitRow}>
            <View style={styles.trialBadge}>
              <Sparkles color={Colors.white} size={18} />
              <Text style={styles.trialBadgeText}>APROVEITE 3 DIAS GRÁTIS</Text>
            </View>
          </View>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Mais de 120 receitas personalizadas</Text>
            </View>

            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Novas receitas toda semana</Text>
            </View>

            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Scanner de produtos</Text>
            </View>

            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Nutricionista IA</Text>
            </View>

            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Gerador de receitas personalizadas</Text>
            </View>

            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Sem anúncios</Text>
            </View>

            <View style={styles.benefitItem}>
              <Check color={Colors.primary} size={22} />
              <Text style={styles.benefitText}>Suporte prioritário</Text>
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
          <Text style={styles.faqTitle}>❓ Perguntas Frequentes</Text>
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
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.footerDisclaimer}>
          Ao assinar, você concorda com nossos Termos de Uso e Política de Privacidade
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  benefitsContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  benefitRow: {
    marginBottom: 16,
    alignItems: "center",
  },
  trialBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  trialBadgeText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.white,
    letterSpacing: 1,
  },
  benefitsList: {
    gap: 14,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  planCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  planCardPopular: {
    borderColor: Colors.primary,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    left: 20,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#000",
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  planInfo: {
    flex: 1,
  },
  planPricing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  planTitleSelected: {
    color: Colors.primary,
  },
  planSavings: {
    fontSize: 13,
    color: Colors.textSecondary,
    textDecorationLine: "line-through",
    flexWrap: "wrap",
  },
  planSubtitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginRight: 12,
  },
  planSubtitleSelected: {
    color: Colors.primary,
  },
  planCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  planCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  ctaTagline: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  subscribeButton: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  debugText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  footerDisclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 16,
    marginHorizontal: 20,
    paddingBottom: 20,
  },
  // ==========================================
  // FAQ STYLES
  // ==========================================
  faqContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  faqSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqCardExpanded: {
    borderColor: Colors.primary,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    lineHeight: 20,
  },
  faqChevron: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  faqAnswerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
  },
});

// Componente com ErrorBoundary manual
class PaywallErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[Paywall] Erro capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, styles.centerContent]}>
          <AlertTriangle color={Colors.error} size={64} />
          <Text style={styles.errorText}>Erro ao carregar paywall</Text>
          <Text style={styles.debugText}>
            {this.state.error?.message || 'Erro desconhecido'}
          </Text>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => {
              this.setState({ hasError: false, error: null });
              router.replace('/(tabs)');
            }}
          >
            <View style={styles.subscribeButtonGradient}>
              <Text style={styles.subscribeButtonText}>Ir para o App</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function PaywallScreenWithErrorBoundary() {
  return (
    <PaywallErrorBoundary>
      <PaywallScreen />
    </PaywallErrorBoundary>
  );
}
