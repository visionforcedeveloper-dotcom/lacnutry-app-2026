import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { 
  ChefHat, 
  ScanLine, 
  MessageCircle,
  Award,
  Flame,
  BookOpen,
  CheckCircle2,
  X,
  Trophy,
  Star,
  TrendingUp,
  Lightbulb,
  Zap
} from "lucide-react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { recipes } from "@/mocks/recipes";
import { useProfile } from "@/contexts/ProfileContext";

const { width } = Dimensions.get("window");

interface MiniGameQuestion {
  statement: string;
  isTrue: boolean;
  funFact: string;
  emoji: string;
}

const getWeekOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return Math.floor(day / 7);
};

const allMiniGameQuestions: MiniGameQuestion[] = [
  {
    statement: "Sorvete de banana congelada tem a mesma textura cremosa do sorvete tradicional",
    isTrue: true,
    funFact: "Banana congelada batida fica super cremosa e é uma ótima alternativa sem lactose!",
    emoji: "🍌"
  },
  {
    statement: "Chocolate amargo sempre contém lactose",
    isTrue: false,
    funFact: "Chocolate amargo puro (70%+) geralmente não tem lactose. Sempre confira o rótulo!",
    emoji: "🍫"
  },
  {
    statement: "Leite de coco pode ser usado em qualquer receita que pede leite comum",
    isTrue: true,
    funFact: "Leite de coco é versátil e funciona em doces, salgados e bebidas!",
    emoji: "🥥"
  },
  {
    statement: "Pessoas intolerantes nunca podem comer queijo",
    isTrue: false,
    funFact: "Existem queijos sem lactose deliciosos e queijos curados com baixo teor de lactose!",
    emoji: "🧀"
  },
  {
    statement: "Abacate pode substituir manteiga em receitas",
    isTrue: true,
    funFact: "Abacate amassado é uma alternativa saudável e cremosa para manteiga em várias receitas!",
    emoji: "🥑"
  },
  {
    statement: "Pão francês tradicional sempre tem leite",
    isTrue: false,
    funFact: "Pão francês tradicional é feito apenas com farinha, água, sal e fermento. Sem lactose!",
    emoji: "🥖"
  },
  {
    statement: "Você pode fazer brigadeiro sem leite condensado",
    isTrue: true,
    funFact: "Brigadeiro vegano com leite condensado de coco fica incrível!",
    emoji: "🍫"
  },
  {
    statement: "Lactose é uma proteína do leite",
    isTrue: false,
    funFact: "Lactose é um açúcar! A proteína do leite é a caseína.",
    emoji: "🥛"
  },
  {
    statement: "Leite de aveia deixa o café com um toque adocicado",
    isTrue: true,
    funFact: "Leite de aveia é naturalmente um pouco doce e combina perfeitamente com café!",
    emoji: "🌾"
  },
  {
    statement: "É impossível fazer pizza sem queijo comum",
    isTrue: false,
    funFact: "Pizza com queijo vegano ou focaccia com legumes são deliciosas!",
    emoji: "🍕"
  },
  {
    statement: "Manteiga pode ser substituída por óleo de coco em receitas",
    isTrue: true,
    funFact: "Óleo de coco é ótimo para substituir manteiga em bolos e biscoitos!",
    emoji: "🥥"
  },
  {
    statement: "Todos os tipos de chocolate contêm lactose",
    isTrue: false,
    funFact: "Chocolate amargo 70% ou mais geralmente não tem lactose. Sempre verifique!",
    emoji: "🍫"
  },
  {
    statement: "Creme de leite pode ser substituído por creme de coco",
    isTrue: true,
    funFact: "Creme de coco é perfeito para molhos, sobremesas e receitas cremosas!",
    emoji: "🥥"
  },
  {
    statement: "Margarina sempre é livre de lactose",
    isTrue: false,
    funFact: "Algumas margarinas contêm leite! Sempre leia o rótulo cuidadosamente.",
    emoji: "🧈"
  },
  {
    statement: "Leite de amêndoas tem o mesmo cálcio que leite de vaca",
    isTrue: false,
    funFact: "Leite de amêndoas tem menos cálcio naturalmente, mas muitas marcas fortificam!",
    emoji: "🥛"
  },
  {
    statement: "Você pode fazer maionese sem leite",
    isTrue: true,
    funFact: "Maionese tradicional é feita com ovos, óleo e limão. Sem lactose!",
    emoji: "🥚"
  },
  {
    statement: "Iogurte grego não contém lactose",
    isTrue: false,
    funFact: "Iogurte grego tem menos lactose que outros, mas ainda contém. Existem versões sem lactose!",
    emoji: "🥣"
  },
  {
    statement: "Castanhas de caju batidas ficam cremosas como queijo",
    isTrue: true,
    funFact: "Castanhas de caju são a base de muitos queijos veganos deliciosos!",
    emoji: "🥜"
  },
  {
    statement: "Mel é uma fonte de lactose",
    isTrue: false,
    funFact: "Mel é 100% vegetal e não contém lactose. É só açúcar natural das abelhas!",
    emoji: "🍯"
  },
  {
    statement: "Pudim de chia pode substituir pudim tradicional",
    isTrue: true,
    funFact: "Pudim de chia com leite vegetal é delicioso e nutritivo!",
    emoji: "🥄"
  },
];

const getWeeklyQuestions = (): MiniGameQuestion[] => {
  const weekNumber = getWeekOfYear();
  const shuffled = [...allMiniGameQuestions];
  
  const seed = weekNumber;
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(((seed + i) * 9301 + 49297) % 233280 / 233280 * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, 10);
};

const dailyTips = [
  {
    title: "Leia os Rótulos",
    description: "Lactose pode se esconder em produtos inesperados como pães, embutidos e molhos. Sempre verifique!",
    icon: "📋",
  },
  {
    title: "Leites Vegetais",
    description: "Experimente diferentes opções: amêndoas, coco, aveia, soja. Cada um tem sabor único!",
    icon: "🥛",
  },
  {
    title: "Cálcio Natural",
    description: "Brócolis, espinafre, sardinha e tofu são ótimas fontes de cálcio sem lactose.",
    icon: "🥦",
  },
  {
    title: "Sobremesas Deliciosas",
    description: "Sorvetes de frutas, mousses de abacate e pudins de chia são perfeitos sem lactose!",
    icon: "🍨",
  },
  {
    title: "Restaurantes",
    description: "Não tenha vergonha de perguntar sobre os ingredientes. Sua saúde vem primeiro!",
    icon: "🍽️",
  },
];

export default function HomeScreen() {
  const { favorites, history, stats } = useProfile();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [miniGameQuestions, setMiniGameQuestions] = useState<MiniGameQuestion[]>([]);
  const [currentGameQuestion, setCurrentGameQuestion] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameStreak, setGameStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];

  const featuredRecipes = recipes.slice(0, 3);
  const currentTip = dailyTips[currentTipIndex];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % dailyTips.length);
    }, 8000);
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult) {
      const handleTimeoutFunc = () => {
        setIsCorrect(false);
        setShowResult(true);
        setIsPlaying(false);
        setGameStreak(0);
        
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => {
          if (currentGameQuestion < miniGameQuestions.length - 1) {
            setCurrentGameQuestion(currentGameQuestion + 1);
            setShowResult(false);
            setIsCorrect(null);
            setTimeLeft(30);
            setIsPlaying(true);
          } else {
            setGameCompleted(true);
          }
        }, 2000);
      };
      handleTimeoutFunc();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, showResult, currentGameQuestion, shakeAnim, miniGameQuestions.length]);

  const startMiniGame = () => {
    const weeklyQuestions = getWeeklyQuestions();
    setMiniGameQuestions(weeklyQuestions);
    setShowMiniGame(true);
    setCurrentGameQuestion(0);
    setGameScore(0);
    setGameStreak(0);
    setShowResult(false);
    setIsCorrect(null);
    setGameCompleted(false);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  const handleAnswer = (answer: boolean) => {
    if (showResult) return;
    
    setIsPlaying(false);
    const correct = answer === miniGameQuestions[currentGameQuestion].isTrue;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      const bonus = Math.max(0, timeLeft);
      setGameScore(gameScore + 10 + bonus);
      setGameStreak(gameStreak + 1);
      
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setGameStreak(0);
      
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setTimeout(() => {
      if (currentGameQuestion < miniGameQuestions.length - 1) {
        setCurrentGameQuestion(currentGameQuestion + 1);
        setShowResult(false);
        setIsCorrect(null);
        setTimeLeft(30);
        setIsPlaying(true);
      } else {
        setGameCompleted(true);
      }
    }, 2000);
  };

  const resetMiniGame = () => {
    setShowMiniGame(false);
    setMiniGameQuestions([]);
    setCurrentGameQuestion(0);
    setGameScore(0);
    setGameStreak(0);
    setShowResult(false);
    setIsCorrect(null);
    setGameCompleted(false);
    setTimeLeft(30);
    setIsPlaying(false);
  };

  const getGameMessage = () => {
    if (gameScore >= 150) return "🏆 Campeão Sem Lactose!";
    if (gameScore >= 100) return "🌟 Expert em Lactose!";
    if (gameScore >= 50) return "👍 Bom Conhecimento!";
    return "💪 Continue Praticando!";
  };

  if (showMiniGame && miniGameQuestions.length > 0) {
    const currentQ = miniGameQuestions[currentGameQuestion];
    
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#6C63FF", "#4834DF"]}
          style={styles.gameContainer}
        >
          <View style={styles.gameHeader}>
            <TouchableOpacity onPress={resetMiniGame} style={styles.gameCloseButton}>
              <X color={Colors.white} size={24} />
            </TouchableOpacity>
            <View style={styles.gameScoreContainer}>
              <Flame color={Colors.warning} size={20} />
              <Text style={styles.gameScoreText}>{gameScore}</Text>
            </View>
          </View>

          {!gameCompleted ? (
            <View style={styles.gameContent}>
              <View style={styles.gameProgressContainer}>
                <Text style={styles.gameProgressText}>
                  {currentGameQuestion + 1} / {miniGameQuestions.length}
                </Text>
              </View>

              <Animated.View
                style={[
                  styles.gameTimerContainer,
                  {
                    transform: [{ scale: timeLeft <= 5 ? scaleAnim : 1 }],
                  },
                ]}
              >
                <Text style={[styles.gameTimerText, timeLeft <= 5 && styles.gameTimerWarning]}>
                  {timeLeft}s
                </Text>
              </Animated.View>

              {gameStreak >= 3 && (
                <View style={styles.streakBadge}>
                  <Flame color={Colors.warning} size={16} />
                  <Text style={styles.streakText}>{gameStreak}x Streak!</Text>
                </View>
              )}

              <Animated.View
                style={[
                  styles.gameQuestionCard,
                  {
                    transform: [{ translateX: shakeAnim }],
                  },
                ]}
              >
                <Text style={styles.gameQuestionEmoji}>{currentQ.emoji}</Text>
                <Text style={styles.gameQuestionText}>{currentQ.statement}</Text>
              </Animated.View>

              {showResult && (
                <Animated.View
                  style={[
                    styles.gameFeedbackCard,
                    {
                      opacity: fadeAnim,
                      backgroundColor: isCorrect ? "#E8F8F5" : "#FADBD8",
                    },
                  ]}
                >
                  {isCorrect ? (
                    <CheckCircle2 color={Colors.success} size={32} />
                  ) : (
                    <X color={Colors.error} size={32} />
                  )}
                  <Text
                    style={[
                      styles.gameFeedbackTitle,
                      { color: isCorrect ? Colors.success : Colors.error },
                    ]}
                  >
                    {isCorrect ? "Correto!" : "Ops!"}
                  </Text>
                  <Text style={styles.gameFeedbackText}>{currentQ.funFact}</Text>
                </Animated.View>
              )}

              {!showResult && (
                <View style={styles.gameButtonsContainer}>
                  <TouchableOpacity
                    style={styles.gameFalseButton}
                    onPress={() => handleAnswer(false)}
                    activeOpacity={0.8}
                  >
                    <X color={Colors.white} size={32} />
                    <Text style={styles.gameButtonText}>FALSO</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.gameTrueButton}
                    onPress={() => handleAnswer(true)}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 color={Colors.white} size={32} />
                    <Text style={styles.gameButtonText}>VERDADEIRO</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <ScrollView
              style={styles.gameResultContent}
              contentContainerStyle={styles.gameResultScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.gameResultContainer}>
                <View style={styles.gameResultTrophyContainer}>
                  <Trophy color={Colors.warning} size={80} />
                </View>
                <Text style={styles.gameResultTitle}>Jogo Concluído!</Text>
                <Text style={styles.gameResultScore}>{gameScore}</Text>
                <Text style={styles.gameResultMessage}>{getGameMessage()}</Text>

                <View style={styles.gameResultStats}>
                  <View style={styles.gameResultStat}>
                    <Star color={Colors.warning} size={24} />
                    <Text style={styles.gameResultStatValue}>{gameScore}</Text>
                    <Text style={styles.gameResultStatLabel}>Pontos</Text>
                  </View>
                  <View style={styles.gameResultStat}>
                    <TrendingUp color={Colors.success} size={24} />
                    <Text style={styles.gameResultStatValue}>
                      {Math.round((gameScore / (miniGameQuestions.length * 40)) * 100)}%
                    </Text>
                    <Text style={styles.gameResultStatLabel}>Precisão</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.gameRestartButton} onPress={startMiniGame}>
                  <Text style={styles.gameRestartButtonText}>Jogar Novamente</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gameHomeButton} onPress={resetMiniGame}>
                  <Text style={styles.gameHomeButtonText}>Voltar ao Início</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LacNutry</Text>
          <Text style={styles.headerSubtitle}>Descubra receitas deliciosas sem lactose</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Flame color={Colors.warning} size={24} />
            </View>
            <Text style={styles.statValue}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>dias de sequência</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <BookOpen color={Colors.primary} size={24} />
            </View>
            <Text style={styles.statValue}>{recipes.length}</Text>
            <Text style={styles.statLabel}>receitas disponíveis</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Star color={Colors.warning} size={24} />
            </View>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>favoritos</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.tipCard}
          activeOpacity={0.9}
          onPress={() => setCurrentTipIndex((currentTipIndex + 1) % dailyTips.length)}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipGradient}
          >
            <View style={styles.tipHeader}>
              <Text style={styles.tipEmoji}>{currentTip.icon}</Text>
              <View style={styles.tipBadge}>
                <Lightbulb color={Colors.primary} size={12} />
                <Text style={styles.tipBadgeText}>Dica do Dia</Text>
              </View>
            </View>
            <Text style={styles.tipTitle}>{currentTip.title}</Text>
            <Text style={styles.tipDescription}>{currentTip.description}</Text>
            <View style={styles.tipIndicators}>
              {dailyTips.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.tipIndicator,
                    index === currentTipIndex && styles.tipIndicatorActive
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.miniGameBanner}
          onPress={startMiniGame}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#6C63FF", "#4834DF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.miniGameGradient}
          >
            <View style={styles.miniGameContent}>
              <View style={styles.miniGameIconContainer}>
                <Zap color={Colors.warning} size={32} />
              </View>
              <View style={styles.miniGameTextContainer}>
                <Text style={styles.miniGameTitle}>Mini Game Rápido</Text>
                <Text style={styles.miniGameSubtitle}>
                  Verdadeiro ou Falso? Teste seus conhecimentos sobre lactose! (30s por pergunta)
                </Text>
              </View>
            </View>
            <View style={styles.miniGameArrow}>
              <Star color={Colors.white} size={24} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/scanner")}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
              <ScanLine color={Colors.primary} size={24} />
            </View>
            <Text style={styles.actionTitle}>Scanner</Text>
            <Text style={styles.actionSubtitle}>Analise pratos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/ferramentas")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FFF4E6" }]}>
              <ChefHat color="#F39C12" size={24} />
            </View>
            <Text style={styles.actionTitle}>Receitas IA</Text>
            <Text style={styles.actionSubtitle}>Gerar receitas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/ferramentas")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#E8F5E9" }]}>
              <MessageCircle color="#2ECC71" size={24} />
            </View>
            <Text style={styles.actionTitle}>Nutricionista</Text>
            <Text style={styles.actionSubtitle}>Chat com IA</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Receitas em Destaque</Text>
            <TouchableOpacity onPress={() => router.push("/receitas")}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipesScroll}
          >
            {featuredRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: recipe.imageUrl }}
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.recipeGradient}
                >
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <View style={styles.recipeMetaContainer}>
                      <View style={styles.recipeMeta}>
                        <Text style={styles.recipeMetaText}>
                          {recipe.prepTime} min
                        </Text>
                      </View>
                      <View style={styles.recipeMeta}>
                        <Text style={styles.recipeMetaText}>
                          {recipe.difficulty}
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {history.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Análises</Text>
              <TouchableOpacity onPress={() => router.push("/historico")}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.historyScroll}
            >
              {history.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <View
                    style={[
                      styles.historyBadge,
                      { backgroundColor: item.hasLactose ? "#FFE5E5" : Colors.successLight }
                    ]}
                  >
                    {item.hasLactose ? (
                      <X color={Colors.error} size={16} />
                    ) : (
                      <CheckCircle2 color={Colors.success} size={16} />
                    )}
                  </View>
                  <Text style={styles.historyCardTitle} numberOfLines={2}>
                    {item.productName}
                  </Text>
                  <Text style={styles.historyCardDate}>
                    {new Date(item.date).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progresso Semanal</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Award color={Colors.primary} size={32} />
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressTitle}>Continue assim!</Text>
                <Text style={styles.progressSubtitle}>
                  Você está indo muito bem na sua jornada sem lactose
                </Text>
              </View>
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>{stats.totalScans}</Text>
                <Text style={styles.progressStatLabel}>Análises</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>{favorites.length}</Text>
                <Text style={styles.progressStatLabel}>Favoritas</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>{stats.streakDays}</Text>
                <Text style={styles.progressStatLabel}>Dias Ativos</Text>
              </View>
            </View>
          </View>
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
  safeArea: {
    flex: 0,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: Colors.background,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  actionCard: {
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
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  recipesScroll: {
    paddingRight: 20,
  },
  recipeCard: {
    width: width * 0.7,
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  recipeGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 8,
  },
  recipeMetaContainer: {
    flexDirection: "row",
    gap: 8,
  },
  recipeMeta: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeMetaText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 24,
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
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  tipCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  tipGradient: {
    padding: 24,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tipEmoji: {
    fontSize: 48,
  },
  tipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  tipBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  tipTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.white,
    opacity: 0.95,
    marginBottom: 16,
  },
  tipIndicators: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  tipIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  tipIndicatorActive: {
    backgroundColor: Colors.white,
    width: 20,
  },
  miniGameBanner: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#4834DF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  miniGameGradient: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  miniGameContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  miniGameIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  miniGameTextContainer: {
    flex: 1,
  },
  miniGameTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 4,
  },
  miniGameSubtitle: {
    fontSize: 13,
    color: Colors.white,
    lineHeight: 18,
    opacity: 0.9,
  },
  miniGameArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  gameContainer: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  gameCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  gameScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  gameScoreText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  gameContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  gameProgressContainer: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  gameProgressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  gameTimerContainer: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  gameTimerText: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  gameTimerWarning: {
    color: Colors.warning,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    backgroundColor: Colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  gameQuestionCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  gameQuestionEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  gameQuestionText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 28,
  },
  gameFeedbackCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  gameFeedbackTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginTop: 12,
    marginBottom: 8,
  },
  gameFeedbackText: {
    fontSize: 15,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 22,
  },
  gameButtonsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  gameFalseButton: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gameTrueButton: {
    flex: 1,
    backgroundColor: Colors.success,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gameButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  gameResultContent: {
    flex: 1,
  },
  gameResultScrollContent: {
    flexGrow: 1,
    paddingTop: 40,
  },
  gameResultContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  gameResultTrophyContainer: {
    marginBottom: 24,
  },
  gameResultTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 16,
  },
  gameResultScore: {
    fontSize: 64,
    fontWeight: "700" as const,
    color: Colors.warning,
    marginBottom: 8,
  },
  gameResultMessage: {
    fontSize: 20,
    color: Colors.white,
    marginBottom: 32,
  },
  gameResultStats: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    marginBottom: 32,
  },
  gameResultStat: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  gameResultStatValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.white,
    marginTop: 8,
    marginBottom: 4,
  },
  gameResultStatLabel: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
  },
  gameRestartButton: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gameRestartButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#6C63FF",
  },
  gameHomeButton: {
    paddingVertical: 12,
  },
  gameHomeButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
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
  quizTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  quizProgress: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quizProgressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  quizContent: {
    flex: 1,
  },
  quizScrollContent: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    fontWeight: "500" as const,
  },
  explanationCard: {
    marginTop: 24,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  explanationText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  quizResultContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  resultTrophyContainer: {
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  resultStatsContainer: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 32,
  },
  resultStat: {
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultStatValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  resultStatLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  restartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    marginBottom: 12,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  backHomeButton: {
    paddingVertical: 12,
  },
  backHomeButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  historyScroll: {
    paddingRight: 20,
  },
  historyCard: {
    width: 140,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  historyCardTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  historyCardDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  progressStatItem: {
    alignItems: "center",
  },
  progressStatValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
});
