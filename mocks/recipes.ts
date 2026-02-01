export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  category: string;
  tags: string[];
  imageUrl?: string;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const recipes: Recipe[] = [
  {
    id: '1',
    title: 'Bolo de Chocolate Sem Lactose',
    description: 'Um delicioso bolo de chocolate fofinho e sem lactose, perfeito para quem tem intolerância.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    ingredients: [
      '2 xícaras de farinha de trigo',
      '1 xícara de açúcar',
      '1/2 xícara de cacau em pó',
      '1 xícara de leite de amêndoas',
      '1/2 xícara de óleo vegetal',
      '2 ovos',
      '1 colher de sopa de fermento em pó',
      '1 pitada de sal'
    ],
    instructions: [
      'Preaqueça o forno a 180°C',
      'Misture os ingredientes secos em uma tigela',
      'Em outra tigela, bata os ovos, leite de amêndoas e óleo',
      'Combine os ingredientes úmidos com os secos',
      'Despeje na forma untada',
      'Asse por 35-40 minutos'
    ],
    prepTime: 15,
    cookTime: 40,
    servings: 8,
    difficulty: 'Fácil',
    category: 'Sobremesas',
    tags: ['sem lactose', 'chocolate', 'bolo', 'sobremesa'],
    nutritionalInfo: {
      calories: 280,
      protein: 6,
      carbs: 45,
      fat: 12
    }
  },
  {
    id: '2',
    title: 'Lasanha de Berinjela Vegana',
    description: 'Uma lasanha saborosa e nutritiva, completamente livre de lactose e ingredientes de origem animal.',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    ingredients: [
      '3 berinjelas grandes',
      '500g de molho de tomate',
      '300g de ricota de castanha',
      '200g de queijo vegano ralado',
      '1 abobrinha',
      '1 cebola',
      '3 dentes de alho',
      'Manjericão fresco',
      'Azeite de oliva',
      'Sal e pimenta a gosto'
    ],
    instructions: [
      'Corte as berinjelas em fatias e tempere com sal',
      'Deixe descansar por 30 minutos e seque',
      'Grelhe as berinjelas até dourar',
      'Refogue a cebola e alho',
      'Monte a lasanha alternando camadas',
      'Asse por 45 minutos a 180°C'
    ],
    prepTime: 45,
    cookTime: 45,
    servings: 6,
    difficulty: 'Médio',
    category: 'Pratos Principais',
    tags: ['sem lactose', 'vegano', 'berinjela', 'lasanha'],
    nutritionalInfo: {
      calories: 320,
      protein: 15,
      carbs: 25,
      fat: 18
    }
  },
  {
    id: '3',
    title: 'Smoothie de Frutas Vermelhas',
    description: 'Um smoothie refrescante e nutritivo, rico em antioxidantes e completamente sem lactose.',
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
    ingredients: [
      '1 xícara de morangos',
      '1/2 xícara de mirtilos',
      '1 banana',
      '1 xícara de leite de coco',
      '1 colher de sopa de mel',
      '1/2 xícara de gelo'
    ],
    instructions: [
      'Lave bem as frutas vermelhas',
      'Descasque a banana',
      'Coloque todos os ingredientes no liquidificador',
      'Bata até ficar homogêneo',
      'Sirva imediatamente'
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    difficulty: 'Fácil',
    category: 'Bebidas',
    tags: ['sem lactose', 'smoothie', 'frutas', 'saudável'],
    nutritionalInfo: {
      calories: 150,
      protein: 3,
      carbs: 35,
      fat: 2
    }
  },
  {
    id: '4',
    title: 'Pão de Forma Sem Lactose',
    description: 'Um pão de forma macio e saboroso, perfeito para o café da manhã e lanches.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    ingredients: [
      '500g de farinha de trigo',
      '300ml de leite de aveia morno',
      '10g de fermento biológico seco',
      '2 colheres de sopa de açúcar',
      '1 colher de chá de sal',
      '3 colheres de sopa de óleo vegetal'
    ],
    instructions: [
      'Dissolva o fermento no leite morno com açúcar',
      'Misture a farinha e sal em uma tigela',
      'Adicione o fermento dissolvido e o óleo',
      'Sove a massa por 10 minutos',
      'Deixe crescer por 1 hora',
      'Modele e asse por 30 minutos a 180°C'
    ],
    prepTime: 20,
    cookTime: 30,
    servings: 12,
    difficulty: 'Médio',
    category: 'Pães',
    tags: ['sem lactose', 'pão', 'café da manhã'],
    nutritionalInfo: {
      calories: 180,
      protein: 6,
      carbs: 32,
      fat: 4
    }
  },
  {
    id: '5',
    title: 'Sorvete de Banana e Coco',
    description: 'Um sorvete cremoso e natural, feito apenas com frutas e sem nenhum derivado do leite.',
    imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop',
    ingredients: [
      '4 bananas maduras congeladas',
      '1/2 xícara de leite de coco',
      '2 colheres de sopa de mel',
      '1 colher de chá de essência de baunilha',
      'Coco ralado para decorar'
    ],
    instructions: [
      'Corte as bananas em rodelas e congele por 4 horas',
      'Bata as bananas congeladas no processador',
      'Adicione o leite de coco, mel e baunilha',
      'Processe até ficar cremoso',
      'Sirva imediatamente ou congele por mais firmeza'
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 4,
    difficulty: 'Fácil',
    category: 'Sobremesas',
    tags: ['sem lactose', 'sorvete', 'banana', 'coco', 'natural'],
    nutritionalInfo: {
      calories: 120,
      protein: 2,
      carbs: 28,
      fat: 3
    }
  }
];

export default recipes;