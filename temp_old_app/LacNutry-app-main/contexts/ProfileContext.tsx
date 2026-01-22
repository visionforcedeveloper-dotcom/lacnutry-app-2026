import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Storage } from '@/lib/asyncStorage';

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  allergies: string[];
  preferences: string[];
}

export interface ScanHistory {
  id: string;
  productName: string;
  date: string;
  hasLactose: boolean;
  imageUri?: string;
}

export interface StatsData {
  totalScans: number;
  streakDays: number;
  lastAccessDate: string;
}

export interface QuizProgress {
  currentQuestion: number;
  answers: Record<string, number>;
  userName?: string;
  userEmail?: string;
}

const STORAGE_KEYS = {
  PROFILE: '@lacnutry_profile',
  FAVORITES: '@lacnutry_favorites',
  HISTORY: '@lacnutry_history',
  FIRST_ACCESS: '@lacnutry_first_access',
  QUIZ_COMPLETED: '@lacnutry_quiz_completed',
  QUIZ_PROGRESS: '@lacnutry_quiz_progress',
  SUBSCRIPTION: '@lacnutry_subscription',
  STATS: '@lacnutry_stats',
};

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
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstAccess, setIsFirstAccess] = useState(true);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [quizProgress, setQuizProgress] = useState<QuizProgress | null>(null);
  const [stats, setStats] = useState<StatsData>({
    totalScans: 0,
    streakDays: 0,
    lastAccessDate: new Date().toISOString(),
  });

  const loadData = useCallback(async () => {
    try {
      const [profileData, favoritesData, historyData, firstAccessData, quizData, quizProgressData, subscriptionData, statsData] = await Promise.all([
        Storage.getItem(STORAGE_KEYS.PROFILE),
        Storage.getItem(STORAGE_KEYS.FAVORITES),
        Storage.getItem(STORAGE_KEYS.HISTORY),
        Storage.getItem(STORAGE_KEYS.FIRST_ACCESS),
        Storage.getItem(STORAGE_KEYS.QUIZ_COMPLETED),
        Storage.getItem(STORAGE_KEYS.QUIZ_PROGRESS),
        Storage.getItem(STORAGE_KEYS.SUBSCRIPTION),
        Storage.getItem(STORAGE_KEYS.STATS),
      ]);

      if (profileData) {
        setProfile(JSON.parse(profileData));
      }
      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }
      if (historyData) {
        setHistory(JSON.parse(historyData));
      }
      
      setIsFirstAccess(firstAccessData === null);
      setHasCompletedQuiz(quizData === 'true');
      setHasSubscription(subscriptionData === 'true');
      
      if (quizProgressData) {
        setQuizProgress(JSON.parse(quizProgressData));
      }
      
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
      console.error('Error loading profile data:', error);
    } finally {
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
        Storage.setItem(STORAGE_KEYS.FIRST_ACCESS, 'false'),
        Storage.setItem(STORAGE_KEYS.QUIZ_COMPLETED, 'true'),
        Storage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS), // Limpar progresso ao completar
      ]);
      
      const updatedProfile = { ...profile, name, email };
      await updateProfile(updatedProfile);
      
      setIsFirstAccess(false);
      setHasCompletedQuiz(true);
      setQuizProgress(null);
      
      console.log('[Profile] Quiz completado e perfil atualizado');
    } catch (error) {
      console.error('[Profile] Erro ao completar quiz:', error);
    }
  }, [profile, updateProfile]);

  const completeSubscription = useCallback(async () => {
    try {
      await Storage.setItem(STORAGE_KEYS.SUBSCRIPTION, 'true');
      setHasSubscription(true);
      console.log('[Profile] Assinatura ativada');
    } catch (error) {
      console.error('[Profile] Erro ao ativar assinatura:', error);
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    try {
      await Storage.setItem(STORAGE_KEYS.SUBSCRIPTION, 'false');
      setHasSubscription(false);
      console.log('[Profile] Assinatura cancelada/expirada');
    } catch (error) {
      console.error('[Profile] Erro ao cancelar assinatura:', error);
    }
  }, []);

  return useMemo(() => ({
    profile,
    favorites,
    history,
    isLoading,
    isFirstAccess,
    hasCompletedQuiz,
    hasSubscription,
    quizProgress,
    stats,
    updateProfile,
    toggleFavorite,
    addToHistory,
    clearHistory,
    isFavorite,
    saveQuizProgress,
    clearQuizProgress,
    completeQuiz,
    completeSubscription,
    cancelSubscription,
  }), [profile, favorites, history, isLoading, isFirstAccess, hasCompletedQuiz, hasSubscription, quizProgress, stats, updateProfile, toggleFavorite, addToHistory, clearHistory, isFavorite, saveQuizProgress, clearQuizProgress, completeQuiz, completeSubscription, cancelSubscription]);
});
