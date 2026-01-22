import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  X,
  CheckCircle2,
  Heart,
  Sparkles,
  Star,
  Lightbulb,
  Zap,
  Users,
} from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useProfile } from "@/contexts/ProfileContext";
import { trpc } from "@/lib/trpc";
import Svg, { Circle, G } from 'react-native-svg';
import { FirebaseAnalyticsService } from "@/lib/firebase-analytics";

interface QuizQuestion {
  id: number;
  question: string;
  options?: string[];
  explanation?: string;
  motivationalMessage?: string;
  type?: 'multiple-choice' | 'text-input';
  inputPlaceholder?: string;
  inputType?: 'text' | 'email';
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Você costuma sentir desconforto após consumir leite?",
    options: ["Sim, sempre", "Às vezes", "Raramente", "Nunca"],
    explanation: "Compreender seus sintomas é o primeiro passo para uma vida mais saudável!",
  },
  {
    id: 2,
    question: "Qual destes sintomas você sente mais?",
    options: ["Gases e inchaço", "Dor abdominal", "Náusea", "Diarreia"],
    explanation: "Identificar seus sintomas nos ajuda a personalizar suas receitas.",
  },
  {
    id: 3,
    question: "Há quanto tempo você tem sintomas de intolerância?",
    options: ["Menos de 6 meses", "6 meses a 1 ano", "1 a 3 anos", "Mais de 3 anos"],
    explanation: "Conhecer seu histórico nos ajuda a entender melhor suas necessidades.",
  },
  {
    id: 4,
    question: "Você já evitou eventos sociais por medo de consumir lactose?",
    options: ["Sim, várias vezes", "Algumas vezes", "Raramente", "Nunca"],
    explanation: "Com as receitas certas, você pode aproveitar qualquer evento sem preocupações.",
  },
  {
    id: 6,
    question: "Quanto tempo após consumir lactose os sintomas aparecem?",
    options: ["30 minutos a 2 horas", "Imediatamente", "Após 6 horas", "No dia seguinte"],
    explanation: "Essas informações são importantes para personalizar suas recomendações.",
  },
  {
    id: 7,
    question: "Você se sente limitado(a) nas escolhas alimentares?",
    options: ["Sim, muito", "Um pouco", "Raramente", "Não"],
    explanation: "Não se preocupe! Existem milhares de receitas deliciosas sem lactose esperando por você.",
  },
  {
    id: 10,
    question: "Você está preparado(a) para mudar de vida com as ferramentas inteligentes do LacNutry?",
    options: ["Sim, estou pronto(a)!", "Quero conhecer as ferramentas", "Tenho curiosidade", "Vamos lá!"],
    explanation: "Incrível! Com o Scanner de produtos, Nutricionista IA e Gerador de receitas, você terá tudo para uma vida sem lactose e cheia de sabor! 🚀",
  },
  {
    id: 11,
    question: "Qual é seu nível de experiência com alimentação sem lactose?",
    options: ["Iniciante - acabei de descobrir", "Intermediário - alguns meses", "Avançado - mais de 1 ano", "Expert - vivo sem lactose há anos"],
    explanation: "Vamos personalizar o conteúdo de acordo com sua experiência.",
  },
  {
    id: 12,
    question: "Você lê os rótulos dos alimentos antes de comprar?",
    options: ["Sempre", "Frequentemente", "Às vezes", "Nunca"],
    explanation: "Vamos te ensinar a identificar lactose escondida em produtos inesperados.",
  },
  {
    id: 13,
    question: "Quais substitutos você gostaria de aprender a usar?",
    options: ["Leites vegetais", "Queijos sem lactose", "Manteigas e cremes", "Todos"],
    explanation: "Perfeito! Temos receitas incríveis com todos esses substitutos.",
  },
  {
    id: 14,
    question: "Qual é o seu nome?",
    type: 'text-input' as const,
    inputPlaceholder: "Digite seu nome completo",
    inputType: 'text' as const,
  },
];

const motivationalScreens = [
  {
    index: 3,
    type: 'statistics' as const,
    title: "Você Não Está Sozinho(a)!",
    message: "65% da população mundial tem algum grau de intolerância à lactose. Você faz parte de uma comunidade enorme!",
    icon: Heart,
    gradient: [Colors.primary, Colors.primaryDark] as readonly [string, string],
    percentage: 65,
    population: 5.395,
  },
  {
    index: 7,
    type: 'mockup-recipes' as const,
    title: "Liberdade Alimentar",
    message: "Com o LacNutry, você terá acesso a centenas de receitas deliciosas sem lactose. Sem limitações, só possibilidades!",
    icon: Sparkles,
    gradient: [Colors.primary, Colors.primaryDark] as readonly [string, string],
  },
  {
    index: 11,
    type: 'mockup-scanner' as const,
    title: "Saúde e Bem-Estar",
    message: "Eliminar a lactose pode melhorar sua digestão, energia e qualidade de vida. Você está no caminho certo!",
    icon: Zap,
    gradient: [Colors.primary, Colors.primaryDark] as readonly [string, string],
  },
];

export default function QuizLactoseScreen() {
  const insets = useSafeAreaInsets();
  const { completeQuiz, quizProgress, saveQuizProgress, clearQuizProgress } = useProfile();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [progressRestored, setProgressRestored] = useState(false);

  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score] = useState(0);
  const [showMotivational, setShowMotivational] = useState(false);
  const [motivationalIndex, setMotivationalIndex] = useState(0);
  const [textInputValue, setTextInputValue] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [animatedPopulation, setAnimatedPopulation] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const progressAnim = useState(new Animated.Value(0))[0];
  const loadingBarAnim = useState(new Animated.Value(0))[0];
  const circleAnim = useState(new Animated.Value(0))[0];
  const buttonScaleAnim = useState(new Animated.Value(1))[0];

  const animateEntry = useCallback(() => {
    // Animação desabilitada para evitar bugs no mobile
    fadeAnim.setValue(1);
    scaleAnim.setValue(1);
  }, [fadeAnim, scaleAnim]);

  const animateExit = useCallback(() => {
    // Animação desabilitada para evitar bugs no mobile
    return new Promise<void>((resolve) => {
      resolve();
    });
  }, []);

  const animateButtonPress = useCallback(() => {
    // Animação desabilitada para evitar bugs no mobile
    buttonScaleAnim.setValue(1);
  }, [buttonScaleAnim]);

  // Restaurar progresso ao iniciar o quiz
  useEffect(() => {
    if (!progressRestored && quizProgress) {
      console.log('🔄 Restaurando progresso do quiz:', quizProgress);
      setCurrentQuestion(quizProgress.currentQuestion);
      setAnswers(quizProgress.answers || {});
      if (quizProgress.userName) setUserName(quizProgress.userName);
      if (quizProgress.userEmail) setUserEmail(quizProgress.userEmail);
      setProgressRestored(true);
    }
  }, [quizProgress, progressRestored]);

  // Salvar progresso automaticamente a cada mudança
  useEffect(() => {
    if (progressRestored || Object.keys(answers).length > 0) {
      const progress = {
        currentQuestion,
        answers,
        userName: userName || undefined,
        userEmail: userEmail || undefined,
      };
      saveQuizProgress(progress);
    }
  }, [currentQuestion, answers, userName, userEmail, progressRestored, saveQuizProgress]);

  // Registrar início do quiz no Firebase Analytics
  useEffect(() => {
    FirebaseAnalyticsService.logQuizStart();
  }, []);

  useEffect(() => {
    animateEntry();
    
    // Animar números se for tela de estatísticas
    if (showMotivational) {
      const motivational = motivationalScreens[motivationalIndex];
      if (motivational.type === 'statistics') {
        // Reset
        setAnimatedPercentage(0);
        setAnimatedPopulation(0);
        circleAnim.setValue(0);
        
        // Animar porcentagem
        let currentPercentage = 0;
        const percentageInterval = setInterval(() => {
          currentPercentage += 1;
          setAnimatedPercentage(currentPercentage);
          if (currentPercentage >= (motivational.percentage || 65)) {
            clearInterval(percentageInterval);
          }
        }, 20);
        
        // Animar população
        let currentPopulation = 0;
        const populationInterval = setInterval(() => {
          currentPopulation += 0.1;
          setAnimatedPopulation(currentPopulation);
          if (currentPopulation >= (motivational.population || 5.395)) {
            clearInterval(populationInterval);
          }
        }, 30);
        
        // Animar círculo
        Animated.timing(circleAnim, {
          toValue: motivational.percentage || 65,
          duration: 1500,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [currentQuestion, showMotivational, animateEntry]);

  useEffect(() => {
    // Barra de progresso acelerada nas primeiras 7 perguntas
    // Nas primeiras 7 perguntas (0-6), cada uma representa ~10% da barra (70% total)
    // Nas últimas 6 perguntas (7-12), cada uma representa ~5% da barra (30% restante)
    let newProgress = 0;
    if (currentQuestion < 7) {
      // Primeiras 7 perguntas: 0% a 70%
      newProgress = ((currentQuestion + 1) / 7) * 70;
    } else {
      // Últimas 6 perguntas: 70% a 100%
      newProgress = 70 + (((currentQuestion - 6) / (quizQuestions.length - 7)) * 30);
    }
    
    Animated.timing(progressAnim, {
      toValue: newProgress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion, progressAnim]);

  const saveQuizMutation = trpc.user.saveQuiz.useMutation();

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    const question = quizQuestions[currentQuestion];
    setAnswers(prev => ({ ...prev, [question.id.toString()]: answerIndex }));
    
    // Registrar resposta no Firebase Analytics
    FirebaseAnalyticsService.logQuizAnswer(
      question.id,
      answerIndex,
      question.question
    );
  };

  const handleNextQuestion = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    const nextQuestion = currentQuestion + 1;
    
    // Registrar progresso no Firebase Analytics
    FirebaseAnalyticsService.logQuizProgress(
      nextQuestion,
      quizQuestions.length
    );
    
    const motivationalScreen = motivationalScreens.find(m => m.index === nextQuestion);
    
    if (motivationalScreen) {
      setShowMotivational(true);
      setMotivationalIndex(motivationalScreens.indexOf(motivationalScreen));
      
      // Registrar visualização da tela motivacional
      FirebaseAnalyticsService.logMotivationalScreen(
        motivationalScreen.type,
        motivationalScreens.indexOf(motivationalScreen)
      );
    } else if (nextQuestion < quizQuestions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null);
    } else {
      handleQuizComplete();
    }
    
    setIsTransitioning(false);
  };

  const handleTextInputSubmit = async () => {
    if (!textInputValue.trim()) return;
    if (isTransitioning) return;
    
    const question = quizQuestions[currentQuestion];
    const trimmedValue = textInputValue.trim();
    
    if (question.id === 14) {
      setIsTransitioning(true);
      
      setUserName(trimmedValue);
      
      // Registrar input de nome no Firebase Analytics
      FirebaseAnalyticsService.logTextInputSubmit(question.id, 'name');
      
      // Gerar email automaticamente baseado no timestamp
      const autoEmail = `user_${Date.now()}@lacnutry.app`;
      setUserEmail(autoEmail);
      
      // Completar quiz imediatamente após o nome
      handleQuizCompleteWithEmail(autoEmail);
      
      setIsTransitioning(false);
    }
  };


  const handleQuizCompleteWithEmail = async (email: string) => {
    console.log('📡 Iniciando salvamento do quiz...');
    console.log('📝 Dados:', { userName, email, answersCount: Object.keys(answers).length, score });
    
    // Registrar conclusão no Firebase Analytics
    await FirebaseAnalyticsService.logQuizComplete(
      userName,
      email,
      answers,
      score
    );
    
    // Mensagens de loading dinâmicas
    const loadingMessages = [
      'Aplicando fórmula de TMB...',
      'Calculando calorias ideais...',
      'Definindo macronutrientes...',
      'Personalizando recomendações...',
      'Finalizando configuração...'
    ];

    // Completar quiz e limpar progresso imediatamente
    await completeQuiz(userName, email);
    await clearQuizProgress();
    setQuizCompleted(true);

    // Animar a barra de progresso e mensagens
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setLoadingProgress(progress);
      
      // Atualizar mensagem baseado no progresso
      if (progress === 20) setLoadingMessage(loadingMessages[0]);
      else if (progress === 40) setLoadingMessage(loadingMessages[1]);
      else if (progress === 60) setLoadingMessage(loadingMessages[2]);
      else if (progress === 80) setLoadingMessage(loadingMessages[3]);
      else if (progress === 95) setLoadingMessage(loadingMessages[4]);
      
      Animated.timing(loadingBarAnim, {
        toValue: progress,
        duration: 50,
        useNativeDriver: false,
      }).start();

      if (progress >= 100) {
        clearInterval(interval);
        // Após 5 segundos (100 * 50ms), navegar para tela de depoimentos
        setTimeout(() => {
          router.replace('/testimonials');
        }, 500);
      }
    }, 50); // Total: 5 segundos (100 * 50ms)
    
    // Salvar no backend de forma assíncrona sem bloquear
    saveQuizMutation.mutateAsync({
      name: userName,
      email: email,
      answers,
      score,
    }).then((result) => {
      console.log('✅ Quiz salvo no backend:', result);
    }).catch((error: any) => {
      console.log('⚠️ Não foi possível salvar no backend (continuando localmente):', error?.message);
    });
  };

  const handleQuizComplete = async () => {
    await handleQuizCompleteWithEmail(userEmail);
  };

  const handleMotivationalContinue = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    setShowMotivational(false);
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(null);
    setIsTransitioning(false);
  };



  if (showMotivational) {
    const motivational = motivationalScreens[motivationalIndex];
    const IconComponent = motivational.icon;

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={motivational.gradient}
          style={styles.motivationalContainer}
        >
          <View style={styles.motivationalContent}>
            {/* Tela 1: Estatísticas com círculo animado */}
            {motivational.type === 'statistics' && (
              <>
                <Text style={styles.motivationalTitle}>{motivational.title}</Text>
                <Text style={styles.motivationalMessage}>{motivational.message}</Text>
                
                {/* Gráfico Donut animado com estatísticas */}
                <View style={styles.chartContainer}>
                  <View style={styles.donutRow}>
                    {/* Donut Chart */}
                    <View style={styles.donutChart}>
                      <Svg width={180} height={180} viewBox="0 0 180 180">
                        <G rotation={-90} origin="90, 90">
                          {/* Círculo de fundo (35% - cinza claro) */}
                          <Circle
                            cx="90"
                            cy="90"
                            r="70"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="24"
                            fill="none"
                          />
                          {/* Círculo animado (65% - branco) */}
                          <Circle
                            cx="90"
                            cy="90"
                            r="70"
                            stroke="white"
                            strokeWidth="24"
                            fill="none"
                            strokeDasharray={`${(animatedPercentage / 100) * 440} 440`}
                            strokeLinecap="round"
                          />
                        </G>
                      </Svg>
                    </View>
                    
                    {/* Informações ao lado do donut */}
                    <View style={styles.donutInfo}>
                      <View style={styles.donutInfoItem}>
                        <Text style={styles.donutPercentage}>{Math.round(animatedPercentage)}%</Text>
                        <Text style={styles.donutLabel}>da população</Text>
                      </View>
                      <View style={styles.donutDivider} />
                      <View style={styles.donutInfoItem}>
                        <Text style={styles.donutPopulation}>
                          {animatedPopulation.toFixed(1).replace('.', ',')}
                        </Text>
                        <Text style={styles.donutPopulationLabel}>bilhões de pessoas</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Estatísticas complementares */}
                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <View style={styles.statIndicator} />
                      <Text style={styles.statNumber}>65%</Text>
                      <Text style={styles.statLabel}>Com intolerância</Text>
                    </View>
                    <View style={styles.statBox}>
                      <View style={[styles.statIndicator, styles.statIndicatorSecondary]} />
                      <Text style={styles.statNumber}>35%</Text>
                      <Text style={styles.statLabel}>Sem intolerância</Text>
                    </View>
                  </View>
                  
                  <View style={styles.communityBanner}>
                    <Users color={Colors.white} size={24} />
                    <Text style={styles.communityText}>
                      Você faz parte de uma comunidade de milhões!
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Tela 2: Liberdade Alimentar (com pergunta e imagem) */}
            {motivational.type === 'mockup-recipes' && (
              <>
                <Text style={styles.motivationalQuestion}>
                  Quer descobrir os detalhes nutricionais de cada produto antes de comprar?
                </Text>
                
                <View style={styles.scanImageContainer}>
                  <Image 
                    source={require('@/assets/images/scan tela print.png')}
                    style={styles.scanImage}
                    resizeMode="contain"
                  />
                </View>
              </>
            )}

            {/* Tela 3: Saúde e Bem-Estar (com imagem) */}
            {motivational.type === 'mockup-scanner' && (
              <>
                <Text style={styles.motivationalTitle}>{motivational.title}</Text>
                <Text style={styles.motivationalMessage}>{motivational.message}</Text>
                
                <View style={styles.imageContainer}>
                  <Image 
                    source={require('@/assets/images/RECEBA INFORMAÇÕES EM TEMPO REAL.png')}
                    style={styles.motivationalImage}
                    resizeMode="contain"
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleMotivationalContinue}
              disabled={isTransitioning}
            >
              <Text style={styles.continueButtonText}>
                {motivational.type === 'mockup-recipes' ? 'Sim, eu quero!' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (quizCompleted) {
    return (
      <View style={styles.loadingContainer}>
        <ScrollView
          contentContainerStyle={styles.loadingScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loadingContent}>
            {/* Porcentagem grande */}
            <Text style={styles.loadingPercentageBig}>{loadingProgress}%</Text>

            {/* Título */}
            <Text style={styles.loadingTitle}>
              Estamos configurando{'\n'}tudo para você
            </Text>

            {/* Barra de progresso */}
            <View style={styles.loadingProgressContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarGradient,
                    {
                      width: loadingBarAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#E91E63', '#9C27B0', '#3F51B5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressBarGradientInner}
                  />
                </Animated.View>
              </View>
            </View>

            {/* Status atual */}
            <Text style={styles.loadingStatus}>{loadingMessage}</Text>

            {/* Lista de configurações */}
            <View style={styles.configList}>
              <Text style={styles.configListTitle}>Configurando seu perfil</Text>
              
              <View style={styles.configItem}>
                <CheckCircle2 
                  color={loadingProgress >= 20 ? Colors.success : Colors.textSecondary} 
                  size={24} 
                  fill={loadingProgress >= 20 ? Colors.success : 'transparent'}
                />
                <Text style={styles.configItemText}>Receitas sem lactose personalizadas</Text>
              </View>

              <View style={styles.configItem}>
                <CheckCircle2 
                  color={loadingProgress >= 40 ? Colors.success : Colors.textSecondary} 
                  size={24}
                  fill={loadingProgress >= 40 ? Colors.success : 'transparent'}
                />
                <Text style={styles.configItemText}>Scanner inteligente de produtos</Text>
              </View>

              <View style={styles.configItem}>
                <CheckCircle2 
                  color={loadingProgress >= 60 ? Colors.success : Colors.textSecondary} 
                  size={24}
                  fill={loadingProgress >= 60 ? Colors.success : 'transparent'}
                />
                <Text style={styles.configItemText}>Nutricionista IA especializada</Text>
              </View>

              <View style={styles.configItem}>
                <CheckCircle2 
                  color={loadingProgress >= 80 ? Colors.success : Colors.textSecondary} 
                  size={24}
                  fill={loadingProgress >= 80 ? Colors.success : 'transparent'}
                />
                <Text style={styles.configItemText}>Análise de sintomas e restrições</Text>
              </View>

              <View style={styles.configItem}>
                <CheckCircle2 
                  color={loadingProgress >= 95 ? Colors.success : Colors.textSecondary} 
                  size={24}
                  fill={loadingProgress >= 95 ? Colors.success : 'transparent'}
                />
                <Text style={styles.configItemText}>Plano alimentar sem lactose</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const question = quizQuestions[currentQuestion];
  const isTextInputQuestion = question?.type === 'text-input';

  const showNearEndMessage = currentQuestion >= 8; // Pergunta 9+ (ajustado após remover uma pergunta)

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          onPress={() => {
            // Registrar abandono do quiz no Firebase Analytics
            FirebaseAnalyticsService.logQuizAbandoned(
              currentQuestion,
              quizQuestions.length
            );
            router.back();
          }} 
          style={styles.closeButton}
        >
          <X color={Colors.text} size={24} />
        </TouchableOpacity>
        
        <View style={styles.headerProgress}>
          {/* Contador removido - apenas barra de progresso */}
        </View>

        <View style={{ width: 40 }} />
      </View>

      {showNearEndMessage && (
        <View style={styles.nearEndMessage}>
          <Zap color={Colors.primary} size={16} />
          <Text style={styles.nearEndMessageText}>
            Quase lá! Você está chegando ao fim
          </Text>
        </View>
      )}

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        {isTextInputQuestion ? (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={question.inputPlaceholder}
              placeholderTextColor={Colors.textSecondary}
              value={textInputValue}
              onChangeText={setTextInputValue}
              keyboardType={question.inputType === 'email' ? 'email-address' : 'default'}
              autoCapitalize={question.inputType === 'email' ? 'none' : 'words'}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleTextInputSubmit}
            />
            <TouchableOpacity
              style={[
                styles.textInputButton,
                !textInputValue.trim() && styles.textInputButtonDisabled
              ]}
              onPress={handleTextInputSubmit}
              disabled={!textInputValue.trim() || isTransitioning}
            >
              <Text style={styles.textInputButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => {
              const isSelected = selectedAnswer === index;
  
              let backgroundColor = Colors.white;
              let borderColor = Colors.border;
  
              if (isSelected) {
                backgroundColor = Colors.primaryLight;
                borderColor = Colors.primary;
              }
  
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    { backgroundColor, borderColor },
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionIndicator,
                        { borderColor: isSelected ? Colors.primary : Colors.border },
                        isSelected && { backgroundColor: Colors.primary },
                      ]}
                    >
                      {isSelected && (
                        <CheckCircle2 color={Colors.white} size={16} />
                      )}
                    </View>
                    <Text style={[styles.optionText, { color: Colors.text }]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedAnswer !== null && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextQuestion}
              activeOpacity={0.8}
              disabled={isTransitioning}
            >
              <Text style={styles.nextButtonText}>Continuar</Text>
            </TouchableOpacity>
          )}
          </>
        )}

        {selectedAnswer !== null && !isTextInputQuestion && question.explanation && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Lightbulb color={Colors.primary} size={24} />
              <Text style={styles.explanationTitle}>Explicação</Text>
            </View>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerProgress: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerProgressText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF4E6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.warning,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.border,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  nearEndMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  nearEndMessageText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  questionContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  questionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  questionBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 16,
  },
  optionButton: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  optionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500" as const,
    flex: 1,
    lineHeight: 22,
  },
  explanationCard: {
    marginTop: 24,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  explanationMotivational: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
  },
  explanationMotivationalText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
    lineHeight: 20,
  },
  motivationalContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: "center",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  motivationalContent: {
    alignItems: "center",
  },
  motivationalIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  motivationalTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 12,
  },
  motivationalMessage: {
    fontSize: 16,
    color: Colors.white,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.95,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  motivationalProgress: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 32,
  },
  motivationalProgressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  continueButton: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  statisticsCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    position: 'relative',
  },
  circleWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  populationNumber: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.primary,
    textAlign: 'center',
  },
  percentageText: {
    position: 'absolute',
    top: 20,
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  donutChart: {
    width: 180,
    height: 180,
  },
  donutInfo: {
    justifyContent: 'center',
    gap: 12,
  },
  donutInfoItem: {
    alignItems: 'flex-start',
  },
  donutPercentage: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 2,
  },
  donutLabel: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
  },
  donutDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  donutPopulation: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 2,
  },
  donutPopulationLabel: {
    fontSize: 11,
    color: Colors.white,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '90%',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statIndicator: {
    width: 40,
    height: 6,
    backgroundColor: Colors.white,
    borderRadius: 3,
    marginBottom: 8,
  },
  statIndicatorSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  communityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    marginBottom: 16,
  },
  communityText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
    lineHeight: 19,
  },
  imageContainer: {
    marginVertical: 24,
    alignItems: 'center',
    width: '100%',
  },
  motivationalImage: {
    width: '90%',
    height: 260,
  },
  motivationalImageLarge: {
    width: '100%',
    height: 380,
    marginTop: 20,
  },
  motivationalIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  motivationalQuestion: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 34,
    paddingHorizontal: 20,
  },
  scanImageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  scanImage: {
    width: '100%',
    height: 400,
  },
  mockupPhone: {
    width: '90%',
    maxWidth: 340,
    height: 380,
    backgroundColor: '#1A1A1A',
    borderRadius: 40,
    padding: 6,
    marginTop: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  mockupScreen: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 34,
    padding: 16,
    overflow: 'hidden',
  },
  mockupHeader: {
    marginBottom: 12,
  },
  mockupHeaderTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  mockupHeaderSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  mockupRecipeCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
  },
  mockupRecipeImage: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    marginBottom: 8,
  },
  mockupRecipeTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  mockupRecipeMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scannerAlert: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#E74C3C',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 13,
    color: '#E74C3C',
  },
  nutritionCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 16,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lactoseWarning: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 8,
  },
  resultContainer: {
    flex: 1,
  },
  closeButtonResult: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultScrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultContent: {
    alignItems: "center",
  },
  resultTrophyContainer: {
    marginBottom: 24,
  },
  resultEmoji: {
    fontSize: 100,
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 18,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 32,
  },
  resultScoreContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    marginBottom: 24,
  },
  resultScoreLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 56,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 16,
  },
  resultScoreBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  resultScoreBarFill: {
    height: "100%",
    backgroundColor: Colors.white,
  },
  resultScorePercentage: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  resultMessage: {
    fontSize: 18,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 26,
  },
  resultStatsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 24,
  },
  resultStatCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  resultStatValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.white,
    marginTop: 12,
    marginBottom: 4,
  },
  resultStatLabel: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.8,
  },
  resultMotivationalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    marginTop: 32,
    width: "100%",
  },
  resultMotivationalText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  loadingSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  loadingMessage: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  progressBarWrapper: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  loadingPercentage: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700' as const,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loadingContent: {
    alignItems: 'center',
    width: '100%',
  },
  loadingPercentageBig: {
    fontSize: 96,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 24,
    letterSpacing: -4,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 36,
  },
  loadingProgressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarGradient: {
    height: '100%',
    borderRadius: 6,
  },
  progressBarGradientInner: {
    flex: 1,
    borderRadius: 6,
  },
  loadingStatus: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 48,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  configList: {
    width: '100%',
  },
  configListTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  configItemText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  resultExploreButton: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    width: "100%",
    alignItems: "center",
  },
  resultExploreButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  resultHomeButton: {
    paddingVertical: 12,
  },
  resultHomeButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  textInputContainer: {
    gap: 20,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textInputButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  textInputButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  textInputButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  resultContinueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  resultContinueButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    alignItems: "center" as const,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
