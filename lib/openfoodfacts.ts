export interface OFFProductResponse {
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
  image_url?: string;
  brand?: string;
}

const OFF_API_URL = "https://world.openfoodfacts.org/api/v2/product";

/**
 * Verifica se uma lista de ingredientes contém lactose
 */
function checkLactoseInIngredients(ingredientsText: string): { hasLactose: boolean; risks: string[] } {
  const lactoseKeywords = [
    "leite", "milk", "lactose", "queijo", "cheese", "manteiga", "butter",
    "creme de leite", "cream", "iogurte", "yogurt", "soro de leite", "whey",
    "requeijão", "caseína", "caseina", "lactoalbumina"
  ];

  const lowerIngredients = ingredientsText.toLowerCase();
  const foundRisks = lactoseKeywords.filter(keyword => lowerIngredients.includes(keyword));
  
  // Verificar se tem a menção "sem lactose" ou "zero lactose" para evitar falsos positivos
  const isZeroLactose = lowerIngredients.includes("sem lactose") || 
                        lowerIngredients.includes("zero lactose") || 
                        lowerIngredients.includes("0% lactose");

  if (foundRisks.length > 0 && !isZeroLactose) {
    return {
      hasLactose: true,
      risks: foundRisks.map(r => `Contém ${r}`)
    };
  }

  return {
    hasLactose: false,
    risks: []
  };
}

export async function searchProductByBarcode(barcode: string): Promise<OFFProductResponse | null> {
  try {
    console.log(`[OpenFoodFacts] Buscando produto com código: ${barcode}`);
    const response = await fetch(`${OFF_API_URL}/${barcode}.json`);
    
    if (!response.ok) {
      console.warn(`[OpenFoodFacts] Erro na requisição: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      console.warn("[OpenFoodFacts] Produto não encontrado");
      return null;
    }

    const product = data.product;
    const ingredientsText = product.ingredients_text_pt || product.ingredients_text || "";
    const lactoseCheck = checkLactoseInIngredients(ingredientsText);

    const nutriments = product.nutriments || {};
    
    return {
      productName: product.product_name_pt || product.product_name || "Produto encontrado",
      brand: product.brands,
      hasLactose: lactoseCheck.hasLactose,
      lactoseLevel: lactoseCheck.hasLactose ? "alto" : undefined, // Estimativa conservadora
      ingredients: ingredientsText.split(",").map((i: string) => i.trim()).filter((i: string) => i.length > 0),
      nutritionalInfo: {
        calories: nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0,
        protein: nutriments["proteins_100g"] || nutriments["proteins"] || 0,
        carbs: nutriments["carbohydrates_100g"] || nutriments["carbohydrates"] || 0,
        fat: nutriments["fat_100g"] || nutriments["fat"] || 0,
        lactose: 0 // OFF raramente tem lactose explícita
      },
      risks: lactoseCheck.risks,
      recommendations: lactoseCheck.hasLactose 
        ? ["Evite o consumo se tiver alta sensibilidade."] 
        : ["Produto aparentemente seguro, mas verifique o rótulo para traços."],
      image_url: product.image_url
    };

  } catch (error) {
    console.error("[OpenFoodFacts] Erro ao buscar produto:", error);
    return null;
  }
}
