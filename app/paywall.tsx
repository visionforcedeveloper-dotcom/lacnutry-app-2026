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
      initIAPSafe: async () => console.log('[MOCK] initIAPSafe called'),
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
    'com.lacnutry.premium_monthly',
    'com.lactosefree.monthly',
    'lacnutry_mensal',
    'lacnutry_plano_mensal_27',
    'lacnutry_premium_monthly',
    'plano_mensal',
  ],
  YEARLY: [
    'com.lacnutry.premium_yearly',
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

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { completeSubscription, profile, hasSubscription, isPremium, setPremiumStatus } = useProfile();
  
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
      initIAPSafe: async () => {},
    };
  }
  
  const { 
    isPremiumActive,
    connectionErrorMsg,
    purchaseProduct,
    connected,
    products,
    initIAPSafe,
  } = iapHook;
  
  // Inicialização SEGURA do IAP (apenas nesta tela)
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (initIAPSafe) {
        await initIAPSafe();
      }
    };
    
    init();

    return () => {
      mounted = false;
      // O cleanup de conexão já é feito no unmount do hook useInAppPurchase
      // Mas se quisermos garantir, o hook poderia expor endConnection também.
      // Por enquanto, confiar no cleanup do hook.
    };
  }, []);

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
  
  // Sincronizar status premium do hook com o contexto
  useEffect(() => {
    if (isPremiumActive && !isPremium) {
      console.log('[Paywall] Premium ativado pelo hook IAP, atualizando contexto...');
      setPremiumStatus(true);
      // Redirecionar para home se necessário, ou apenas fechar o paywall
      // router.replace('/(tabs)'); 
    }
  }, [isPremiumActive, isPremium, setPremiumStatus]);

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
          '3. IDs corretos: com.lacnutry.premium_monthly, com.lacnutry.premium_yearly, etc.'
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
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.skipButton}>Pular por enquanto</Text>
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
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  trialBadgeText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
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
  skipButton: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
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
});
