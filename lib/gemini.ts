import { searchProductByBarcode } from "./openfoodfacts";

const GEMINI_API_KEYS = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(k => k.length > 0);
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Modelos disponíveis
export const GEMINI_MODELS = {
  GEMINI_PRO: "gemini-pro", // Apenas texto (legado)
  GEMINI_PRO_VISION: "gemini-pro-vision", // Visão + Texto (legado)
  GEMINI_1_5_PRO: "gemini-1.5-pro", // Multimodal avançado
  GEMINI_2_0_FLASH: "gemini-2.0-flash", // Multimodal rápido (recomendado)
};

// Modelo padrão atual
const DEFAULT_MODEL = GEMINI_MODELS.GEMINI_2_0_FLASH;

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
  barcode?: string; // Novo campo para código de barras
}

export interface GeminiChatResponse {
  response: string;
}

function getApiKey(): string {
  if (GEMINI_API_KEYS.length > 0) {
    // Retorna uma chave aleatória para distribuir a carga (load balancing simples)
    const randomIndex = Math.floor(Math.random() * GEMINI_API_KEYS.length);
    return GEMINI_API_KEYS[randomIndex];
  }

  console.warn(
    "[Gemini] Chave da API não configurada. Defina EXPO_PUBLIC_GEMINI_API_KEY no seu .env (pode separar múltiplas por vírgula)."
  );

  return "";
}

function getFallbackAnalysis(additionalInfo?: string): GeminiVisionResponse {
  const name = additionalInfo?.trim() || "Alimento analisado";
  return {
    productName: name,
    hasLactose: false,
    ingredients: [],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      lactose: 0,
    },
    risks: [
      "Não foi possível analisar a imagem com o serviço de IA no momento.",
      "Considere verificar o rótulo manualmente para identificar lactose e derivados.",
    ],
    recommendations: [
      "Use seu Perfil de Intolerância para decidir se o consumo é seguro.",
      "Em caso de dúvida, prefira opções claramente sem lactose.",
    ],
    alternativeRecipes: [],
    improvements: [],
  };
}

/**
 * Chama a Cloud Vision API para extração robusta de OCR e Labels
 */
async function callCloudVisionAPI(base64Image: string, apiKey: string): Promise<CloudVisionResult> {
  try {
    console.log("[Cloud Vision] Iniciando chamada à API de Visão...");
    const response = await fetch(`${CLOUD_VISION_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              { type: "TEXT_DETECTION" },
              { type: "LABEL_DETECTION" },
              { type: "LOGO_DETECTION" },
              { type: "WEB_DETECTION" },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn("[Cloud Vision] Falha na chamada:", response.status);
      return {};
    }

    const data = await response.json();
    const result = data.responses?.[0];

    if (!result) return {};

    const text = result.fullTextAnnotation?.text;
    const labels = result.labelAnnotations?.map((l: any) => l.description);
    const logos = result.logoAnnotations?.map((l: any) => l.description);
    const webEntities = result.webDetection?.webEntities?.map((w: any) => w.description);

    console.log("[Cloud Vision] Sucesso! Texto detectado:", text ? "Sim" : "Não");
    console.log("[Cloud Vision] Labels:", labels?.slice(0, 3));

    return { text, labels, logos, webEntities };
  } catch (error) {
    console.error("[Cloud Vision] Erro:", error);
    return {};
  }
}

/**
 * Analisa uma imagem de produto alimentício usando Gemini Vision e Cloud Vision
 * Identifica presença de lactose e informações nutricionais
 */
export async function analyzeProductImage(
  base64Image: string,
  additionalInfo?: string,
  modelId: string = DEFAULT_MODEL
): Promise<GeminiVisionResponse> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return getFallbackAnalysis(additionalInfo);
    }

    // Validação de compatibilidade de modelo
    if (modelId === GEMINI_MODELS.GEMINI_PRO) {
      console.warn("[Gemini] Modelo 'gemini-pro' não suporta imagens. Alternando para 'gemini-pro-vision'.");
      modelId = GEMINI_MODELS.GEMINI_PRO_VISION;
    }

    // Remove o prefixo data:image se houver e limpa caracteres inválidos
    let imageData = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    // Remove espaços em branco e quebras de linha que podem corromper o base64
    imageData = imageData.replace(/\s/g, "");
    
    // Validar se é um base64 válido
    if (!imageData || imageData.length === 0) {
      throw new Error("Imagem base64 vazia ou inválida");
    }
    
    console.log("[Gemini] Tamanho da imagem base64:", imageData.length, "caracteres");

    // 1. Chamar Cloud Vision API em paralelo ou antes (vamos chamar antes para enriquecer o prompt)
    // Isso atende ao pedido de "chamar cada api"
    const cloudVisionResult = await callCloudVisionAPI(imageData, apiKey);
    
    console.log("[Gemini] Iniciando chamada para API Gemini (Generative Language)...");

    // Criar controller para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 segundos timeout (aumentado para 2 APIs)

    // Construir contexto do Cloud Vision
    let visionContext = "";
    if (cloudVisionResult.text) visionContext += `\n[OCR - TEXTO EXTRAÍDO DA EMBALAGEM]: ${cloudVisionResult.text}`;
    if (cloudVisionResult.labels?.length) visionContext += `\n[DETECTADO POR VISÃO COMPUTACIONAL]: ${cloudVisionResult.labels.join(", ")}`;
    if (cloudVisionResult.logos?.length) visionContext += `\n[MARCAS IDENTIFICADAS]: ${cloudVisionResult.logos.join(", ")}`;
    if (cloudVisionResult.webEntities?.length) visionContext += `\n[ENTIDADES WEB RELACIONADAS]: ${cloudVisionResult.webEntities.join(", ")}`;

    const prompt = `Você é um especialista em análise de alimentos e nutrição, focado em identificar lactose e derivados do leite.
    
    CAPACIDADES DE VISÃO E ANÁLISE (ATIVAS):
    - Uso integrado da Generative Language API (Gemini)
    - Uso integrado da Cloud Vision API (OCR e Labels já extraídos abaixo)
    - Uso integrado de conhecimentos do Vertex AI (Modelos de linguagem)

    DADOS BRUTOS DA CLOUD VISION API (USE ISTO PARA MÁXIMA PRECISÃO):
    ${visionContext}

    Analise esta imagem de produto alimentício ou prato de comida e forneça informações PRECISAS e DETALHADAS.
    
    IMPORTANTE:
- A imagem pode ser de QUALQUER alimento: prato pronto, sobremesa, bolo, lanche, refeição caseira ou produto industrializado, com ou sem código de barras.
- Mesmo que não exista rótulo visível ou código de barras, você deve analisar o alimento pela aparência, formato, textura e contexto e estimar ingredientes e presença de lactose usando seu conhecimento de receitas típicas.
- Nunca peça código de barras, nunca diga que precisa ler o rótulo para responder. Sempre dê uma estimativa útil e bem explicada.

${additionalInfo ? `Informações adicionais sobre o produto: ${additionalInfo}\n\n` : ""}

INSTRUÇÕES IMPORTANTES:
1. Identifique TODOS os ingredientes visíveis e, quando necessário, estime ingredientes comuns daquele tipo de alimento (ex: bolo, pizza, lasanha).
2. Detecte presença de lactose com ALTA PRECISÃO, considerando ingredientes típicos (leite, manteiga, queijo, creme de leite etc.).
3. Classifique o nível de lactose: baixo (<5g), médio (5-12g), alto (>12g).
4. Forneça informações nutricionais estimadas realistas.
5. Liste TODOS os riscos para intolerantes à lactose.
6. Sugira alternativas sem lactose específicas.

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
  "improvements": ["sugestões", "de", "substituições", "específicas"],
  "barcode": "números do código de barras se visível (apenas números)"
}`;

    let response: Response;
    try {
      response = await fetch(
        `${GEMINI_API_URL}/${modelId}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
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
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("[Gemini] ❌ Erro de conexão:", fetchError);
      
      if (fetchError.name === 'AbortError') {
        throw new Error("Tempo limite excedido. Verifique sua conexão e tente novamente.");
      }
      
      throw new Error("Erro de conexão. Verifique sua internet e tente novamente.");
    }
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Gemini] API Error Status:", response.status);
      console.error("[Gemini] API Error Response:", errorText);

      try {
        const errorJson = JSON.parse(errorText);
        const message: string = errorJson?.error?.message || "";

        if (response.status === 429) {
          throw new Error(
            "Limite de uso da API do Gemini foi atingido. Acesse o painel da Google AI/Cloud, ative billing ou use outra chave com crédito para continuar usando o scanner."
          );
        }

        if (message) {
          throw new Error(message);
        }
      } catch {
        // Se não conseguir fazer parse do JSON, cai no fallback genérico
      }

      console.warn("[Gemini] Usando análise padrão por falha na API");
      return getFallbackAnalysis(additionalInfo);
    }

    const data = await response.json();
    console.log("[Gemini] ✅ Resposta recebida com sucesso");
    console.log("[Gemini] Candidatos:", data.candidates?.length || 0);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("[Gemini] ❌ Resposta inválida:", JSON.stringify(data).substring(0, 500));
      
      // Verificar se foi bloqueado por safety
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Conteúdo bloqueado: ${data.promptFeedback.blockReason}`);
      }
      
      throw new Error("Resposta inválida da API do Gemini");
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    console.log("[Gemini] Resposta texto (primeiros 200 chars):", textResponse.substring(0, 200));
    
    // Limpar a resposta removendo markdown se houver
    const cleanedResponse = textResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    console.log("[Gemini] JSON limpo (primeiros 200 chars):", cleanedResponse.substring(0, 200));

    // Parse do JSON
    let analysisResult: GeminiVisionResponse;
    try {
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("[Gemini] ❌ Erro ao fazer parse do JSON:", parseError);
      console.error("[Gemini] Resposta recebida:", cleanedResponse);
      console.warn("[Gemini] Usando análise padrão por erro de parse");
      return getFallbackAnalysis(additionalInfo);
    }

    if (typeof analysisResult.hasLactose !== "boolean") {
      console.error("[Gemini] ❌ Campo hasLactose ausente ou inválido");
      console.warn("[Gemini] Usando análise padrão por resposta inválida");
      return getFallbackAnalysis(additionalInfo);
    }

    // Integração com Open Food Facts se houver código de barras
    if (analysisResult.barcode && analysisResult.barcode.length >= 8) {
      console.log("[Gemini] Código de barras detectado:", analysisResult.barcode);
      const offData = await searchProductByBarcode(analysisResult.barcode);
      
      if (offData) {
        console.log("[Gemini] ✅ Dados enriquecidos com Open Food Facts");
        // Mesclar dados do Gemini com dados oficiais do OFF
        // Priorizamos dados factuais do OFF (nutrição, ingredientes, nome)
        // Mantemos recomendações inteligentes do Gemini
        analysisResult = {
          ...analysisResult,
          productName: offData.productName,
          ingredients: offData.ingredients.length > 0 ? offData.ingredients : analysisResult.ingredients,
          nutritionalInfo: offData.nutritionalInfo, // OFF é mais preciso aqui
          hasLactose: offData.hasLactose || analysisResult.hasLactose, // Se um dos dois disser que tem, tem.
          lactoseLevel: offData.hasLactose ? "alto" : analysisResult.lactoseLevel, // Conservador
          risks: [...new Set([...analysisResult.risks, ...offData.risks])], // Unir riscos únicos
        };
      }
    }

    console.log("[Gemini] ✅ Análise concluída:", analysisResult.productName);
    console.log("[Gemini] ✅ Tem lactose:", analysisResult.hasLactose);

    return analysisResult;
  } catch (error) {
    console.error("[Gemini] ❌ Erro ao analisar imagem:", error);
    console.warn("[Gemini] Usando análise padrão por erro inesperado");
    return getFallbackAnalysis(additionalInfo);
  }
}







