import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Constants from 'expo-constants';
import { Storage } from '@/lib/asyncStorage';
import type { GeminiVisionResponse } from '@/lib/gemini';

// Importação condicional do RevenueCat
function getRevenueCatService() {
  if (Constants.appOwnership === 'expo') {
    return null; // Não usar RevenueCat no Expo Go
  } else {
    try {
      return require('@/lib/revenuecat').RevenueCatService;
    } catch (error) {
      console.error('[ProfileContext] Erro ao importar RevenueCat:', error);
      return null;
    }
  }
}

const RevenueCatService = getRevenueCatService();

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  allergies: string[];
  preferences: string[];
  intoleranceProfile?: {
    level: 'leve' | 'moderada' | 'severa';
    lactaseUse: 'sempre' | 'as-vezes' | 'nunca';
    problematicFoods: string[];
    symptomFrequency: string;
  };
}

export interface ReactionReport {
  id: string;
  product: string;
  timeToSymptoms: number; // em minutos
  symptoms: string[];
  intensity: 1 | 2 | 3 | 4 | 5;
  date: string;
  notes?: string;
}

export interface ScanHistory {
  id: string;
  productName: string;
  date: string;
  hasLactose: boolean;
  imageUri?: string;
  analysis?: GeminiVisionResponse;
  additionalInfo?: string;
}

export interface StatsData {
  totalScans: number;
  streakDays: number;
  lastAccessDate: string;
}

const STORAGE_KEYS = {
  PROFILE: '@lacnutry_profile',
  FAVORITES: '@lacnutry_favorites',
  HISTORY: '@lacnutry_history',
  FIRST_ACCESS: '@lacnutry_first_access',
  STATS: '@lacnutry_stats',
  REACTIONS: '@lacnutry_reactions',
  QUIZ_COMPLETED: '@lacnutry_quiz_completed',
  QUIZ_PROGRESS: '@lacnutry_quiz_progress',
  SUBSCRIPTION: '@lacnutry_subscription',
  USER_PROGRESS: '@lacnutry_user_progress',
};

export interface QuizProgress {
  currentQuestion: number;
  answers: Record<string, number>;
  userName?: string;
  userEmail?: string;
}

export type UserProgressStage = 'welcome' | 'quiz' | 'paywall' | 'completed';

export interface UserProgress {
  stage: UserProgressStage;
  completedAt?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Usuário',
  email: 'usuario@email.com',
  allergies: ['Lactose'],
  preferences: ['Sem Lactose', 'Vegano'],
};

export const [ProfileProvider, useProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [reactions, setReactions] = useState<ReactionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstAccess, setIsFirstAccess] = useState(true);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [quizProgress, setQuizProgress] = useState<QuizProgress | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({ stage: 'welcome' });
  const [stats, setStats] = useState<StatsData>({
    totalScans: 0,
    streakDays: 0,
    lastAccessDate: new Date().toISOString(),
  });

  const loadData = useCallback(async () => {
    console.log('[ProfileContext] 🚀 Iniciando carregamento de dados...');
    
    try {
      // Inicializar RevenueCat apenas se disponível (não no Expo Go)
      if (RevenueCatService) {
        console.log('[ProfileContext] 💳 Inicializando RevenueCat...');
        try {
          await RevenueCatService.initialize();
          console.log('[ProfileContext] ✅ RevenueCat inicializado com sucesso');
          
          // Verificar status premium do RevenueCat
          const isRevenueCatPremium = await RevenueCatService.isPremiumActive();
          if (isRevenueCatPremium) {
            console.log('[ProfileContext] 👑 Premium ativo no RevenueCat');
            setHasSubscription(true);
            setIsPremium(true);
          }
        } catch (error) {
          console.error('[ProfileContext] ❌ Erro ao inicializar RevenueCat:', error);
        }
      } else {
        console.log('[ProfileContext] 📱 RevenueCat não disponível (Expo Go detectado)');
      }

      console.log('[ProfileContext] 📂 Carregando dados do storage...');

      const [
        profileData,
        favoritesData,
        historyData,
        reactionsData,
        firstAccessData,
        quizCompletedData,
        quizProgressData,
        subscriptionData,
        statsData,
        userProgressData,
      ] = await Promise.all([
        Storage.getItem(STORAGE_KEYS.PROFILE),
        Storage.getItem(STORAGE_KEYS.FAVORITES),
        Storage.getItem(STORAGE_KEYS.HISTORY),
        Storage.getItem(STORAGE_KEYS.REACTIONS),
        Storage.getItem(STORAGE_KEYS.FIRST_ACCESS),
        Storage.getItem(STORAGE_KEYS.QUIZ_COMPLETED),
        Storage.getItem(STORAGE_KEYS.QUIZ_PROGRESS),
        Storage.getItem(STORAGE_KEYS.SUBSCRIPTION),
        Storage.getItem(STORAGE_KEYS.STATS),
        Storage.getItem(STORAGE_KEYS.USER_PROGRESS),
      ]);

      console.log('[ProfileContext] 📊 Processando dados carregados...');

      if (profileData) {
        setProfile(JSON.parse(profileData));
      }
      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }
      if (historyData) {
        setHistory(JSON.parse(historyData));
      }
      if (reactionsData) {
        setReactions(JSON.parse(reactionsData));
      }
      if (quizProgressData) {
        setQuizProgress(JSON.parse(quizProgressData));
      }
      if (userProgressData) {
        setUserProgress(JSON.parse(userProgressData));
      }

      setIsFirstAccess(firstAccessData === null);
      setHasCompletedQuiz(quizCompletedData === 'true');
      setHasSubscription(subscriptionData === 'true');
      setIsPremium(subscriptionData === 'true');
      
      if (statsData) {
        const parsedStats = JSON.parse(statsData);
        const today = new Date().toISOString().split('T')[0];
        const lastAccess = new Date(parsedStats.lastAccessDate).toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreakDays = parsedStats.streakDays;
        
        if (lastAccess === yesterday) {
          newStreakDays = parsedStats.streakDays + 1;
        } else if (lastAccess !== today) {
          newStreakDays = 1;
        }
        
        const updatedStats = {
          ...parsedStats,
          streakDays: newStreakDays,
          lastAccessDate: new Date().toISOString(),
        };
        
        setStats(updatedStats);
        await Storage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));
      } else {
        const initialStats = {
          totalScans: 0,
          streakDays: 1,
          lastAccessDate: new Date().toISOString(),
        };
        setStats(initialStats);
        await Storage.setItem(STORAGE_KEYS.STATS, JSON.stringify(initialStats));
      }
    } catch (error) {
      console.error('[ProfileContext] ❌ Erro crítico ao carregar dados:', error);
    } finally {
      console.log('[ProfileContext] ✅ Carregamento finalizado, definindo isLoading = false');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    try {
      await Storage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, []);

  const toggleFavorite = useCallback(async (recipeId: string) => {
    console.log('[Profile] Toggle favorite called for:', recipeId);
    setFavorites((currentFavorites) => {
      console.log('[Profile] Current favorites:', currentFavorites);
      const newFavorites = currentFavorites.includes(recipeId)
        ? currentFavorites.filter((id) => id !== recipeId)
        : [...currentFavorites, recipeId];
      
      console.log('[Profile] New favorites:', newFavorites);
      
      Storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites))
        .then(() => {
          console.log('[Profile] Favorites saved successfully');
        })
        .catch((error) => {
          console.error('[Profile] Error toggling favorite:', error);
        });
      
      return newFavorites;
    });
  }, []);

  const addToHistory = useCallback(async (item: ScanHistory) => {
    setHistory((currentHistory) => {
      const newHistory = [item, ...currentHistory.slice(0, 49)];
      Storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory)).catch((error) => {
        console.error('Error adding to history:', error);
      });
      return newHistory;
    });
    
    setStats((currentStats) => {
      const updatedStats = {
        ...currentStats,
        totalScans: currentStats.totalScans + 1,
        lastAccessDate: new Date().toISOString(),
      };
      Storage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats)).catch((error) => {
        console.error('Error updating stats:', error);
      });
      return updatedStats;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await Storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, []);

  const isFavorite = useCallback((recipeId: string) => favorites.includes(recipeId), [favorites]);

  const addReaction = useCallback(async (reaction: Omit<ReactionReport, 'id' | 'date'>) => {
    const newReaction: ReactionReport = {
      ...reaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    
    setReactions((currentReactions) => {
      const newReactions = [newReaction, ...currentReactions];
      Storage.setItem(STORAGE_KEYS.REACTIONS, JSON.stringify(newReactions)).catch((error) => {
        console.error('Error adding reaction:', error);
      });
      return newReactions;
    });
  }, []);

  const getReactionPatterns = useCallback(() => {
    if (reactions.length === 0) return null;

    // Analisar produtos mais problemáticos
    const productFrequency: Record<string, number> = {};
    const symptomFrequency: Record<string, number> = {};
    
    reactions.forEach(reaction => {
      productFrequency[reaction.product] = (productFrequency[reaction.product] || 0) + 1;
      reaction.symptoms.forEach(symptom => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
      });
    });

    const mostProblematicProducts = Object.entries(productFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([product, count]) => ({ product, count }));

    const commonSymptoms = Object.entries(symptomFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));

    const avgIntensity = reactions.reduce((sum, r) => sum + r.intensity, 0) / reactions.length;
    const avgTimeToSymptoms = reactions.reduce((sum, r) => sum + r.timeToSymptoms, 0) / reactions.length;

    return {
      mostProblematicProducts,
      commonSymptoms,
      avgIntensity,
      avgTimeToSymptoms,
      totalReactions: reactions.length,
    };
  }, [reactions]);

  const saveQuizProgress = useCallback(async (progress: QuizProgress) => {
    try {
      await Storage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
      setQuizProgress(progress);
      console.log('[Profile] Progresso do quiz salvo:', progress.currentQuestion);
    } catch (error) {
      console.error('[Profile] Erro ao salvar progresso do quiz:', error);
    }
  }, []);

  const clearQuizProgress = useCallback(async () => {
    try {
      await Storage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
      setQuizProgress(null);
      console.log('[Profile] Progresso do quiz limpo');
    } catch (error) {
      console.error('[Profile] Erro ao limpar progresso do quiz:', error);
    }
  }, []);

  const completeQuiz = useCallback(async (name: string, email: string) => {
    try {
      await Promise.all([
        Storage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS),
      ]);

      const updatedProfile = { ...profile, name, email };
      await updateProfile(updatedProfile);

      setQuizProgress(null);

      console.log('[Profile] Quiz completado e perfil atualizado (Aguardando onboarding)');
    } catch (error) {
      console.error('[Profile] Erro ao completar quiz:', error);
    }
  }, [profile, updateProfile]);

  const completeOnboarding = useCallback(async () => {
    try {
      await Promise.all([
        Storage.setItem(STORAGE_KEYS.FIRST_ACCESS, 'false'),
        Storage.setItem(STORAGE_KEYS.QUIZ_COMPLETED, 'true'),
      ]);

      setIsFirstAccess(false);
      setHasCompletedQuiz(true);
      
      console.log('[Profile] Onboarding completado com sucesso');
    } catch (error) {
      console.error('[Profile] Erro ao completar onboarding:', error);
    }
  }, []);

  const setPremiumStatus = useCallback(async (status: boolean) => {
    try {
      await Storage.setItem(STORAGE_KEYS.SUBSCRIPTION, status ? 'true' : 'false');
      setHasSubscription(status);
      setIsPremium(status);
      console.log('[Profile] Status premium atualizado:', status);
    } catch (error) {
      console.error('Error saving premium status:', error);
    }
  }, []);

  const completeSubscription = useCallback(async () => {
    await setPremiumStatus(true);
  }, [setPremiumStatus]);

  const cancelSubscription = useCallback(async () => {
    await setPremiumStatus(false);
  }, [setPremiumStatus]);

  const resetAllData = useCallback(async () => {
    try {
      console.log('[ProfileContext] 🔄 Resetando todos os dados...');
      
      // Limpar todos os dados do storage
      await Promise.all([
        Storage.removeItem(STORAGE_KEYS.FIRST_ACCESS),
        Storage.removeItem(STORAGE_KEYS.QUIZ_COMPLETED),
        Storage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS),
        Storage.removeItem(STORAGE_KEYS.SUBSCRIPTION),
        Storage.removeItem(STORAGE_KEYS.USER_PROGRESS),
      ]);
      
      // Resetar estados
      setIsFirstAccess(true);
      setHasCompletedQuiz(false);
      setHasSubscription(false);
      setIsPremium(false);
      setQuizProgress(null);
      setUserProgress({ stage: 'welcome' });
      
      console.log('[ProfileContext] ✅ Dados resetados com sucesso');
    } catch (error) {
      console.error('[ProfileContext] ❌ Erro ao resetar dados:', error);
    }
  }, []);

  const updateUserProgress = useCallback(async (stage: UserProgressStage) => {
    try {
      const progress: UserProgress = {
        stage,
        completedAt: new Date().toISOString(),
      };
      
      await Storage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
      setUserProgress(progress);
      
      console.log('[ProfileContext] 📍 Progresso atualizado:', stage);
    } catch (error) {
      console.error('[ProfileContext] ❌ Erro ao salvar progresso:', error);
    }
  }, []);

  return useMemo(() => ({
    profile,
    favorites,
    history,
    reactions,
    isLoading,
    isFirstAccess,
    hasCompletedQuiz,
    hasSubscription,
    quizProgress,
    userProgress,
    stats,
    updateProfile,
    toggleFavorite,
    addToHistory,
    clearHistory,
    isFavorite,
    addReaction,
    getReactionPatterns,
    saveQuizProgress,
    clearQuizProgress,
    completeQuiz,
    completeOnboarding,
    isPremium,
    setPremiumStatus,
    completeSubscription,
    cancelSubscription,
    resetAllData,
    updateUserProgress,
  }), [
    profile,
    favorites,
    history,
    reactions,
    isLoading,
    isFirstAccess,
    hasCompletedQuiz,
    hasSubscription,
    quizProgress,
    userProgress,
    stats,
    updateProfile,
    toggleFavorite,
    addToHistory,
    clearHistory,
    isFavorite,
    addReaction,
    getReactionPatterns,
    saveQuizProgress,
    clearQuizProgress,
    completeQuiz,
    isPremium,
    setPremiumStatus,
    completeSubscription,
    cancelSubscription,
    resetAllData,
    updateUserProgress,
  ]);
});
