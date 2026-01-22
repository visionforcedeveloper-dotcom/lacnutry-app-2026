# 🥛 LacNutry - App de Gestão de Intolerância à Lactose

[![Expo](https://img.shields.io/badge/Expo-54.0-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-green.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Analytics-orange.svg)](https://firebase.google.com/)

> Aplicativo mobile completo para pessoas com intolerância à lactose, com scanner de produtos IA, gerador de receitas, nutricionista virtual e muito mais.

## 📱 Sobre o App

LacNutry é uma solução completa para pessoas que convivem com intolerância à lactose. O app oferece:

- 🔍 **Scanner de Produtos**: Analise rótulos com IA para detectar lactose
- 👨‍⚕️ **Nutricionista Virtual**: Consultas 24/7 com IA especializada
- 📖 **Gerador de Receitas**: Receitas personalizadas sem lactose
- 📊 **Quiz Personalizado**: Avaliação completa do perfil alimentar
- 📈 **Histórico**: Acompanhe suas análises e progresso
- ⭐ **Favoritos**: Salve receitas e produtos preferidos

## 🚀 Tecnologias

### Core
- **React Native 0.81** - Framework mobile
- **Expo 54** - Desenvolvimento e build
- **TypeScript** - Type safety
- **Expo Router** - Navegação file-based

### Backend & APIs
- **tRPC** - Type-safe APIs
- **Hono** - Backend server
- **TanStack Query** - Data fetching
- **Gemini AI** - Análise de imagens e chat

### Firebase
- **Firebase Analytics** - Rastreamento de eventos
- **Firebase Remote Config** - Configuração remota

### Pagamentos & Monetização
- **React Native IAP** - In-App Purchases
- **Google Play Billing** - Assinaturas Android

### UI/UX
- **NativeWind** - Tailwind CSS para React Native
- **Lucide Icons** - Ícones modernos
- **React Native Reanimated** - Animações fluidas
- **Expo Linear Gradient** - Gradientes lindos

### Desenvolvimento
- **Bun** - Package manager rápido
- **ESLint** - Linting
- **EAS Build** - Builds na nuvem

## 📋 Pré-requisitos

- Node.js 20+
- Bun (ou npm/yarn)
- Expo CLI
- Android Studio (para emulador Android)
- Conta Expo EAS (para builds)

## 🛠️ Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/lacnutry-app.git
cd lacnutry-app

# Instale as dependências
bun install
# ou
npm install

# Inicie o servidor de desenvolvimento
bun start
# ou
npx expo start
```

## 🔧 Configuração

### 1. Firebase

Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e baixe o arquivo `google-services.json`:

```bash
# Coloque o arquivo em:
android/app/google-services.json
```

### 2. Google Play Billing

Configure o Google Play Console e adicione os produtos IAP.

### 3. Gemini AI

Configure a API do Google Gemini em `lib/gemini.ts`.

### 4. Variáveis de Ambiente

Crie um arquivo `.env.local` (não comitar):

```env
GEMINI_API_KEY=sua_api_key_aqui
```

## 📱 Executar no Dispositivo

### Android

```bash
# Modo desenvolvimento
npx expo run:android

# Build de produção (EAS)
npx eas-cli build --platform android --profile production
```

### iOS (futuro)

```bash
npx expo run:ios
```

## 🏗️ Build para Produção

O app usa EAS Build para gerar builds de produção:

```bash
# Android App Bundle (AAB) para Google Play
npx eas-cli build --platform android --profile production

# APK para testes
npx eas-cli build --platform android --profile preview
```

## 📊 Estrutura do Projeto

```
lacnutry-app/
├── app/                          # Telas (Expo Router)
│   ├── (tabs)/                   # Telas com tabs
│   │   ├── index.tsx            # Home
│   │   ├── receitas.tsx         # Receitas
│   │   ├── scanner.tsx          # Scanner
│   │   ├── ferramentas.tsx      # Ferramentas
│   │   └── perfil.tsx           # Perfil
│   ├── welcome.tsx              # Onboarding
│   ├── quiz-lactose.tsx         # Quiz personalizado
│   ├── testimonials.tsx         # Depoimentos
│   ├── paywall.tsx              # Tela de assinatura
│   └── _layout.tsx              # Layout raiz
├── components/                   # Componentes reutilizáveis
├── contexts/                     # Context API
│   ├── ProfileContext.tsx       # Estado do usuário
│   └── NotificationContext.tsx  # Notificações
├── hooks/                        # Custom hooks
│   └── useInAppPurchase.ts     # IAP hook
├── lib/                          # Bibliotecas e utilidades
│   ├── gemini.ts                # Integração Gemini AI
│   ├── firebase-analytics.ts    # Firebase Analytics
│   ├── trpc.ts                  # tRPC client
│   └── asyncStorage.ts          # Storage local
├── backend/                      # Backend tRPC
│   ├── hono.ts                  # Servidor Hono
│   └── trpc/                    # Rotas tRPC
├── android/                      # Projeto Android nativo
├── assets/                       # Imagens e recursos
├── app.config.js                # Configuração Expo
├── eas.json                     # Configuração EAS Build
└── package.json                 # Dependências

```

## 🎯 Funcionalidades Principais

### Scanner de Produtos IA
- Análise de rótulos com Gemini Vision AI
- Detecção automática de lactose e derivados
- Histórico de análises
- Recomendações personalizadas

### Nutricionista Virtual
- Chat 24/7 com IA especializada
- Respostas contextualizadas sobre intolerância
- Planos alimentares personalizados

### Gerador de Receitas
- Receitas sem lactose personalizadas
- Filtros por categoria e dificuldade
- Favoritar receitas
- Informações nutricionais

### Sistema de Assinatura
- Trial de 3 dias grátis
- Assinatura mensal/anual via Google Play
- Bloqueio automático ao expirar
- Gerenciamento via Google Play

## 📈 Analytics

O app rastreia eventos importantes usando Firebase Analytics:

- `quiz_start` - Início do quiz
- `quiz_complete` - Conclusão do quiz
- `quiz_abandoned` - Abandono do quiz
- `product_scan` - Scanner usado
- `recipe_view` - Visualização de receita
- `subscription_started` - Assinatura iniciada

## 🔐 Segurança

- Todas as APIs usam autenticação
- Dados sensíveis não são logados
- Keystore de produção não está no repositório
- Variáveis de ambiente para chaves de API

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

## 👨‍💻 Autor

**LacNutry Team**

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@lacnutry.app

---

Feito com ❤️ para pessoas com intolerância à lactose
