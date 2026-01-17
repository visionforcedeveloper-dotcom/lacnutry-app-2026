// Serviço de integração com Google Gemini API
const GEMINI_API_KEY = "AIzaSyAa7-GBpUIbcox5xAUP8gJUk27-oLhlfY4";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export interface GeminiVisionResponse {
  productName: string;
  hasLactose: boolean;
  lactoseLevel?: "baixo" | "médio" | "alto";
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    lactose: number;
  };
  risks: string[];
  recommendations: string[];
  alternativeRecipes?: string[];
  improvements?: string[];
}

export interface GeminiChatResponse {
  response: string;
}

/**
 * Analisa uma imagem de produto alimentício usando Gemini Vision
 * Identifica presença de lactose e informações nutricionais
 */
export async function analyzeProductImage(
  base64Image: string,
  additionalInfo?: string
): Promise<GeminiVisionResponse> {
  try {
    // Remove o prefixo data:image se houver
    const imageData = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `Você é um especialista em análise de alimentos e nutrição, focado em identificar lactose e derivados do leite.

Analise esta imagem de produto alimentício ou prato de comida e forneça informações PRECISAS e DETALHADAS.

${additionalInfo ? `Informações adicionais sobre o produto: ${additionalInfo}\n\n` : ""}

INSTRUÇÕES IMPORTANTES:
1. Identifique TODOS os ingredientes visíveis
2. Detecte presença de lactose com ALTA PRECISÃO
3. Classifique o nível de lactose: baixo (<5g), médio (5-12g), alto (>12g)
4. Forneça informações nutricionais estimadas realistas
5. Liste TODOS os riscos para intolerantes à lactose
6. Sugira alternativas sem lactose específicas

INGREDIENTES QUE CONTÊM LACTOSE:
- Leite (integral, desnatado, em pó)
- Queijo (todos os tipos)
- Manteiga, ghee
- Creme de leite, nata
- Iogurte, coalhada
- Soro de leite (whey)
- Requeijão
- Leite condensado
- Doce de leite
- Sorvete tradicional
- Chocolate ao leite
- Qualquer derivado lácteo

Responda OBRIGATORIAMENTE em formato JSON válido (sem markdown):
{
  "productName": "nome específico do produto ou prato",
  "hasLactose": true ou false,
  "lactoseLevel": "baixo", "médio" ou "alto" (apenas se hasLactose for true),
  "ingredients": ["lista", "detalhada", "de", "ingredientes"],
  "nutritionalInfo": {
    "calories": número,
    "protein": número em gramas,
    "carbs": número em gramas,
    "fat": número em gramas,
    "lactose": número em gramas (0 se não tiver)
  },
  "risks": ["liste", "todos", "os", "riscos", "para", "intolerantes"],
  "recommendations": ["sugestões", "específicas", "de", "alternativas", "sem", "lactose"],
  "alternativeRecipes": ["receitas", "alternativas", "sem", "lactose"],
  "improvements": ["sugestões", "de", "substituições", "específicas"]
}`;

    const response = await fetch(
      `${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageData,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Resposta inválida da API do Gemini");
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Limpar a resposta removendo markdown se houver
    const cleanedResponse = textResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse do JSON
    const analysisResult: GeminiVisionResponse = JSON.parse(cleanedResponse);

    // Validação básica
    if (typeof analysisResult.hasLactose !== "boolean") {
      throw new Error("Resposta inválida: campo hasLactose ausente");
    }

    return analysisResult;
  } catch (error) {
    console.error("Erro ao analisar imagem com Gemini:", error);
    throw error;
  }
}

/**
 * Envia uma mensagem para o nutricionista virtual do Gemini
 * Especializado em dietas sem lactose
 */
export async function chatWithNutritionist(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "model"; text: string }> = []
): Promise<string> {
  try {
    const systemPrompt = `Você é uma nutricionista virtual especializada em dietas sem lactose.

ESPECIALIDADES:
- Intolerância à lactose e APLV
- Nutrição esportiva sem lactose
- Cardápios personalizados sem lactose
- Substituições de ingredientes
- Saúde digestiva
- Ganho/perda de peso
- Alimentação vegetariana/vegana sem lactose
- Meal prep e rotinas alimentares

ESTILO DE COMUNICAÇÃO:
- Amigável, acolhedora e empática
- Use emojis para tornar a conversa mais agradável
- Seja específica e prática
- Forneça informações detalhadas quando solicitado
- Adapte-se ao contexto e necessidade do usuário
- Crie cardápios completos quando o usuário descrever sua rotina

REGRAS IMPORTANTES:
1. SEMPRE pergunte sobre a rotina do usuário quando ele mencionar: "estou com fome", "o que comer", "dieta", "cardápio"
2. Quando o usuário descrever sua rotina (acordar, trabalho, treino, etc), CRIE um cardápio COMPLETO e DETALHADO
3. Inclua horários, porções, e detalhes práticos
4. Sugira receitas e alternativas sem lactose específicas
5. Se o usuário pedir receitas, forneça ingredientes e modo de preparo
6. Seja proativa em oferecer soluções completas

EXEMPLOS DE FONTES SEM LACTOSE:
- Leites vegetais: aveia, amêndoas, coco, soja, arroz
- Proteínas: carnes, peixes, ovos, leguminosas, tofu
- Queijos veganos: castanha de caju, amêndoas
- Iogurtes: coco, soja, amêndoas
- Manteiga: óleo de coco, margarina vegana, azeite

SEMPRE forneça respostas práticas, detalhadas e personalizadas!`;

    // Construir o histórico de conversa
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Entendido! Sou sua nutricionista especializada em dietas sem lactose. Estou pronta para ajudar com cardápios personalizados, substituições, receitas e orientações nutricionais. Como posso ajudar você hoje? 😊",
          },
        ],
      },
    ];

    // Adicionar histórico de conversa
    conversationHistory.forEach((msg) => {
      contents.push({
        role: msg.role,
        parts: [{ text: msg.text }],
      });
    });

    // Adicionar mensagem atual do usuário
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const response = await fetch(
      `${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Resposta inválida da API do Gemini");
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    return textResponse;
  } catch (error) {
    console.error("Erro ao conversar com nutricionista Gemini:", error);
    throw error;
  }
}








