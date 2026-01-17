import { Platform } from 'react-native';

// Mock do analytics para quando o módulo nativo não estiver disponível (Expo Go)
const mockAnalytics = {
  logEvent: async (name: string, params?: any) => {
    console.log(`[MOCK Analytics] Event: ${name}`, params);
    return Promise.resolve();
  },
  setUserId: async (id: string | null) => {
    console.log(`[MOCK Analytics] Set User ID: ${id}`);
    return Promise.resolve();
  },
  setUserProperties: async (props: any) => {
    console.log(`[MOCK Analytics] Set User Properties:`, props);
    return Promise.resolve();
  },
  logScreenView: async (params: any) => {
    console.log(`[MOCK Analytics] Log Screen View:`, params);
    return Promise.resolve();
  }
};

let analytics: any;

try {
  // Tenta importar o módulo nativo
  // Se falhar (como no Expo Go), cai no catch
  analytics = require('@react-native-firebase/analytics').default;
} catch (error) {
  console.warn('⚠️ Firebase Analytics nativo não encontrado. Usando mock.');
  analytics = () => mockAnalytics;
}

export class FirebaseAnalyticsService {
  /**
   * Registra uso do scanner de produtos
   */
  static async logProductScan(hasLactose: boolean, productName?: string) {
    try {
      await analytics().logEvent('produto_escaneado', {
        tem_lactose: hasLactose,
        nome_produto: productName?.substring(0, 50) || 'desconhecido',
        timestamp: new Date().toISOString(),
      });
      console.log('📊 Analytics: Produto escaneado registrado');
    } catch (error) {
      console.error('❌ Erro ao registrar scan:', error);
    }
  }

  /**
   * Registra análise de produto com IA
   */
  static async logProductAnalysis(
    hasLactose: boolean,
    lactoseLevel?: string,
    hasPersonalizedRisk?: boolean
  ) {
    try {
      await analytics().logEvent('analise_produto_ia', {
        tem_lactose: hasLactose,
        nivel_lactose: lactoseLevel || 'nenhum',
        risco_personalizado: hasPersonalizedRisk || false,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar análise:', error);
    }
  }

  /**
   * Registra registro de reação
   */
  static async logReactionRegistered(intensity: number, symptomsCount: number) {
    try {
      await analytics().logEvent('reacao_registrada', {
        intensidade: intensity,
        total_sintomas: symptomsCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar reação:', error);
    }
  }

  /**
   * Registra visualização de receita
   */
  static async logRecipeView(recipeId: string, recipeName: string) {
    try {
      await analytics().logEvent('receita_visualizada', {
        receita_id: recipeId,
        nome_receita: recipeName.substring(0, 50),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar visualização de receita:', error);
    }
  }

  /**
   * Registra geração de receita com IA
   */
  static async logRecipeGenerated(hasPreferences: boolean) {
    try {
      await analytics().logEvent('receita_gerada_ia', {
        tem_preferencias: hasPreferences,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar geração de receita:', error);
    }
  }

  /**
   * Registra acesso a funcionalidade
   */
  static async logFeatureAccess(featureName: string) {
    try {
      await analytics().logEvent('funcionalidade_acessada', {
        nome_funcionalidade: featureName,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar acesso:', error);
    }
  }

  /**
   * Registra o início do quiz
   */
  static async logQuizStart() {
    try {
      await analytics().logEvent('quiz_started', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar início do quiz:', error);
    }
  }

  /**
   * Registra progresso do quiz
   */
  static async logQuizProgress(currentQuestion: number, totalQuestions: number) {
    try {
      const progress = Math.round((currentQuestion / totalQuestions) * 100);
      await analytics().logEvent('quiz_progress', {
        current_question: currentQuestion,
        total_questions: totalQuestions,
        progress_percentage: progress,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar progresso:', error);
    }
  }

  /**
   * Registra resposta do quiz
   */
  static async logQuizAnswer(questionId: number, answerIndex: number, questionText?: string) {
    try {
      await analytics().logEvent('quiz_answer', {
        question_id: questionId,
        answer_index: answerIndex,
        question_text: questionText?.substring(0, 50),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar resposta:', error);
    }
  }

  /**
   * Registra visualização de tela motivacional
   */
  static async logMotivationalScreen(type: string, index: number) {
    try {
      await analytics().logEvent('motivational_screen_view', {
        screen_type: type,
        screen_index: index,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar tela motivacional:', error);
    }
  }

  /**
   * Registra envio de input de texto (nome, email, etc)
   */
  static async logTextInputSubmit(questionId: number, inputType: string) {
    try {
      await analytics().logEvent('quiz_text_input', {
        question_id: questionId,
        input_type: inputType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar input de texto:', error);
    }
  }

  /**
   * Registra conclusão do quiz
   */
  static async logQuizComplete(
    userName: string,
    email: string,
    answers: Record<string, number>,
    score: number
  ) {
    try {
      await analytics().logEvent('quiz_completed', {
        user_name: userName, // Cuidado com PII em produção real
        answers_count: Object.keys(answers).length,
        score: score,
        timestamp: new Date().toISOString(),
      });
      
      // Opcional: Identificar usuário se permitido
      // await analytics().setUserId(email);
    } catch (error) {
      console.error('❌ Erro ao registrar conclusão do quiz:', error);
    }
  }

  /**
   * Registra abandono do quiz
   */
  static async logQuizAbandoned(lastQuestion: number) {
    try {
      await analytics().logEvent('quiz_abandoned', {
        last_question: lastQuestion,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar abandono do quiz:', error);
    }
  }
}
