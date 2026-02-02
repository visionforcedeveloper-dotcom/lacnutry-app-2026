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
import Colors from "@/constants/Colors";
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
  },
  {
    id: 2,
    question: "Qual destes sintomas você sente mais?",
    options: ["Gases e inchaço", "Dor abdominal", "Náusea", "Diarreia"],
  },
  {
    id: 3,
    question: "Há quanto tempo você tem sintomas de intolerância?",
    options: ["Menos de 6 meses", "6 meses a 1 ano", "1 a 3 anos", "Mais de 3 anos"],
  },
  {
    id: 4,
    question: "Você já evitou eventos sociais por medo de consumir lactose?",
    options: ["Sim, várias vezes", "Algumas vezes", "Raramente", "Nunca"],
  },
  {
    id: 6,
    question: "Quanto tempo após consumir lactose os sintomas aparecem?",
    options: ["30 minutos a 2 horas", "Imediatamente", "Após 6 horas", "No dia seguinte"],
  },
  {
    id: 7,
    question: "Você se sente limitado(a) nas escolhas alimentares?",
    options: ["Sim, muito", "Um pouco", "Raramente", "Não"],
  },
  {
    id: 10,
    question: "Você está preparado(a) para mudar de vida com as ferramentas inteligentes do LacNutry?",
    options: ["Sim, estou pronto(a)!", "Quero conhecer as ferramentas", "Tenho curiosidade", "Vamos lá!"],
  },
  {
    id: 11,
    question: "Qual é seu nível de experiência com alimentação sem lactose?",
    options: ["Iniciante - acabei de descobrir", "Intermediário - alguns meses", "Avançado - mais de 1 ano", "Expert - vivo sem lactose há anos"],
  },
  {
    id: 12,
    question: "Você lê os rótulos dos alimentos antes de comprar?",
    options: ["Sempre", "Frequentemente", "Às vezes", "Nunca"],
  },
  {
    id: 13,
    question: "Quais substitutos você gostaria de aprender a usar?",
    options: ["Leites vegetais", "Queijos sem lactose", "Manteigas e cremes", "Todos"],
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

export default function QuizScreen() {
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

  // Mock trpc if needed or keep if it works
  // const saveQuizMutation = trpc.user.saveQuiz.useMutation();

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
    
    // Atualizar progresso para paywall
    const { updateUserProgress } = useProfile();
    await updateUserProgress('paywall');
    
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
        setTimeout(() => {
          router.replace("/paywall");
        }, 500);
      }
    }, 50); // Total: 5 segundos (100 * 50ms)
    
    // Salvar no backend (opcional, se tiver TRPC configurado)
    /*
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
    */
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
                  Tenha acesso às informações nutricionais de produtos que contém lactose
                </Text>
                
                <View style={styles.scanImageContainer}>
                  <Image 
                    source={require('@/assets/img-10.png')}
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
                    source={require('@/assets/images/3.png')}
                    style={styles.motivationalImage}
                    resizeMode="contain"
                  />
                </View>
              </>
            )}
            
            <TouchableOpacity
              style={styles.motivationalButton}
              onPress={handleMotivationalContinue}
            >
              <Text style={styles.motivationalButtonText}>Continuar</Text>
              <CheckCircle2 color={Colors.primary} size={24} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (quizCompleted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <Text style={styles.loadingTitle}>Personalizando sua experiência...</Text>
            
            <View style={styles.loadingBarContainer}>
              <Animated.View 
                style={[
                  styles.loadingBarFill, 
                  { 
                    width: loadingBarAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }) 
                  }
                ]} 
              />
            </View>
            <Text style={styles.loadingPercentage}>{loadingProgress}%</Text>
            
            <Text style={styles.loadingMessage}>{loadingMessage}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <X color={Colors.text} size={24} />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }) 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((currentQuestion / quizQuestions.length) * 100)}%
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionText}>{question.question}</Text>
        
        {question.explanation && (
          <View style={styles.explanationContainer}>
            <Lightbulb color={Colors.primary} size={20} />
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {question.type === 'text-input' ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder={question.inputPlaceholder}
                value={textInputValue}
                onChangeText={setTextInputValue}
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize={question.inputType === 'email' ? 'none' : 'words'}
                keyboardType={question.inputType === 'email' ? 'email-address' : 'default'}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !textInputValue.trim() && styles.submitButtonDisabled
                ]}
                onPress={handleTextInputSubmit}
                disabled={!textInputValue.trim()}
              >
                <Text style={styles.submitButtonText}>Continuar</Text>
                <CheckCircle2 color={Colors.white} size={20} />
              </TouchableOpacity>
            </View>
          ) : (
            question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.optionButtonSelected
                ]}
                onPress={() => handleAnswerSelect(index)}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswer === index && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
                <View style={[
                  styles.radioButton,
                  selectedAnswer === index && styles.radioButtonSelected
                ]}>
                  {selectedAnswer === index && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      {question.type !== 'text-input' && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedAnswer === null && styles.nextButtonDisabled
            ]}
            onPress={handleNextQuestion}
            disabled={selectedAnswer === null}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion === quizQuestions.length - 1 ? 'Finalizar' : 'Continuar'}
            </Text>
            <CheckCircle2 color={Colors.white} size={24} />
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 5,
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    lineHeight: 32,
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    gap: 10,
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
    color: '#F57F17',
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  inputContainer: {
    gap: 20,
  },
  textInput: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 16,
    gap: 10,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.disabled,
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 16,
    gap: 10,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.disabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivationalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationalContent: {
    width: '100%',
    height: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivationalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 15,
    textAlign: 'center',
  },
  motivationalMessage: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20,
  },
  donutChart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInfo: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  donutInfoItem: {
    marginBottom: 5,
  },
  donutPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  donutLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  donutDivider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 10,
  },
  donutPopulation: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  donutPopulationLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    width: '45%',
  },
  statIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
    marginBottom: 10,
  },
  statIndicatorSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  communityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 10,
  },
  communityText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  motivationalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    gap: 10,
    marginTop: 20,
  },
  motivationalButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    width: '80%',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 5,
  },
  loadingPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  loadingMessage: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scanImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  scanImage: {
    width: '100%',
    height: '100%',
  },
  motivationalQuestion: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  motivationalImage: {
    width: '100%',
    height: '100%',
  },
});
