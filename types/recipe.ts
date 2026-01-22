export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  servings: number;
  difficulty: "fácil" | "médio" | "difícil";
  ingredients: string[];
  instructions: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  isLactoseFree: boolean;
}

export interface RecipeCategory {
  id: string;
  name: string;
  icon: string;
}
