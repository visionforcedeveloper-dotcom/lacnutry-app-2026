/**
 * Configuração do Expo com plugin customizado para In-App Purchases
 * Baseado em: https://www.doabledanny.com/react-native-iap-example-android
 */

const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = {
  expo: {
    name: IS_DEV ? 'LacNutry (DEV)' : 'LacNutry',
    slug: 'lacnutry-app',
    version: IS_DEV ? '3.9.0' : '3.10.1',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'rork-app',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'app.rork.lacnutry-app',
      infoPlist: {
        NSCameraUsageDescription: 'Allow $(PRODUCT_NAME) to access your camera',
        NSMicrophoneUsageDescription: 'Allow $(PRODUCT_NAME) to access your microphone',
        NSPhotoLibraryUsageDescription: 'Allow $(PRODUCT_NAME) to access your photos',
      },
    },
    android: {
      versionCode: 44,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.lacnutry.app',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        // 🔥 PERMISSÃO ESSENCIAL PARA IN-APP PURCHASES
        'com.android.vending.BILLING',
        // 🎯 PERMISSÕES PARA FACEBOOK ADS
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
      ],
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      [
        'expo-router',
        {
          origin: 'https://rork.com/',
        },
      ],
      'expo-font',
      'expo-web-browser',
      [
        'expo-camera',
        {
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
          microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
          recordAudioAndroid: true,
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with your friends.',
        },
      ],
      [
        'expo-notifications',
        {
          color: '#ffffff',
          defaultChannel: 'default',
          enableBackgroundRemoteNotifications: false,
        },
      ],
      // 🔥 PLUGIN CUSTOMIZADO PARA GARANTIR BILLING PERMISSION
      './plugins/withAndroidBillingPermission.js',
      // 🎯 FACEBOOK ADS SDK - Temporariamente desabilitado para build
      // Descomente após configurar o Facebook App ID
      // [
      //   'expo-ads-facebook',
      //   {
      //     androidAppId: 'YOUR_FACEBOOK_APP_ID_HERE',
      //     iosAppId: 'YOUR_FACEBOOK_APP_ID_HERE',
      //     isAutoLogAppEventsEnabled: false,
      //     isAdvertiserIDCollectionEnabled: false,
      //     userTrackingPermission: 'Este app usa seus dados para fins publicitários e personalização de conteúdo.',
      //   },
      // ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: 'https://rork.com/',
      },
      eas: {
        projectId: 'd66982fc-28b0-490e-a41d-2c5e66441d36',
      },
    },
    owner: 'visionforce1',
  },
};

