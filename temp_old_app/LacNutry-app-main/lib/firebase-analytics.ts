import analytics from '@react-native-firebase/analytics';

export class FirebaseAnalyticsService {
  /**
   * Registra o início do quiz
   */
  static async logQuizStart() {
    try {
      await analytics().logEvent('quiz_start', {
        timestamp: new Date().toISOString(),
      });
      console.log('📊 Analytics: Quiz iniciado');
    } catch (error) {
      console.error('❌ Erro ao registrar início do quiz:', error);
    }
  }

  /**
   * Registra cada resposta do quiz
   */
  static async logQuizAnswer(questionId: number, answerIndex: number, questionText: string) {
    try {
      await analytics().logEvent('quiz_answer', {
        question_id: questionId,
        answer_index: answerIndex,
        question_text: questionText.substring(0, 100), // Limitar tamanho
        timestamp: new Date().toISOString(),
      });
      console.log(`📊 Analytics: Resposta registrada - Q${questionId}`);
    } catch (error) {
      console.error('❌ Erro ao registrar resposta:', error);
    }
  }

  /**
   * Registra conclusão do quiz com dados completos
   */
  static async logQuizComplete(
    name: string,
    email: string,
    answers: Record<string, number>,
    score: number
  ) {
    try {
      // Evento principal de conclusão
      await analytics().logEvent('quiz_complete', {
        total_questions: Object.keys(answers).length,
        score: score,
        timestamp: new Date().toISOString(),
        has_name: !!name,
        has_email: !!email,
      });

      // Definir propriedades do usuário
      await analytics().setUserId(email); // Email como ID único
      await analytics().setUserProperty('quiz_completed', 'true');
      await analytics().setUserProperty('user_name', name);
      await analytics().setUserProperty('intolerance_level', this.calculateIntoleranceLevel(answers));

      console.log('📊 Analytics: Quiz completado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao registrar conclusão do quiz:', error);
    }
  }

  /**
   * Registra navegação entre perguntas
   */
  static async logQuizProgress(currentQuestion: number, totalQuestions: number) {
    try {
      const progress = Math.round((currentQuestion / totalQuestions) * 100);
      await analytics().logEvent('quiz_progress', {
        current_question: currentQuestion,
        total_questions: totalQuestions,
        progress_percentage: progress,
      });
    } catch (error) {
      console.error('❌ Erro ao registrar progresso:', error);
    }
  }

  /**
   * Registra abandono do quiz
   */
  static async logQuizAbandoned(currentQuestion: number, totalQuestions: number) {
    try {
      await analytics().logEvent('quiz_abandoned', {
        abandoned_at_question: currentQuestion,
        total_questions: totalQuestions,
        completion_percentage: Math.round((currentQuestion / totalQuestions) * 100),
      });
      console.log('📊 Analytics: Quiz abandonado registrado');
    } catch (error) {
      console.error('❌ Erro ao registrar abandono:', error);
    }
  }

  /**
   * Calcula nível de intolerância baseado nas respostas
   */
  private static calculateIntoleranceLevel(answers: Record<string, number>): string {
    // Pergunta 1: frequência de desconforto
    const q1 = answers['1'] || 0;
    
    if (q1 === 0) return 'severa'; // Sempre
    if (q1 === 1) return 'moderada'; // Às vezes
    if (q1 === 2) return 'leve'; // Raramente
    return 'nenhuma'; // Nunca
  }

  /**
   * Registra visualização de tela motivacional
   */
  static async logMotivationalScreen(screenType: string, screenIndex: number) {
    try {
      await analytics().logEvent('motivational_screen_view', {
        screen_type: screenType,
        screen_index: screenIndex,
      });
    } catch (error) {
      console.error('❌ Erro ao registrar tela motivacional:', error);
    }
  }

  /**
   * Registra interação com input de texto
   */
  static async logTextInputSubmit(questionId: number, inputType: string) {
    try {
      await analytics().logEvent('quiz_text_input', {
        question_id: questionId,
        input_type: inputType, // 'name' ou 'email'
      });
    } catch (error) {
      console.error('❌ Erro ao registrar input de texto:', error);
    }
  }
}







