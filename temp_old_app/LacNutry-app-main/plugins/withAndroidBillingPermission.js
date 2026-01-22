/**
 * Plugin Expo Config para adicionar permissão BILLING no AndroidManifest.xml
 * Necessário para In-App Purchases (Google Play Billing)
 * 
 * Baseado em: https://www.doabledanny.com/react-native-iap-example-android
 */

const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * @param {import('@expo/config-plugins').ExportedConfig} config
 */
const withAndroidBillingPermission = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest;

    // Verificar se já existe a permissão
    if (!mainApplication['uses-permission']) {
      mainApplication['uses-permission'] = [];
    }

    const permissions = mainApplication['uses-permission'];
    const billingPermission = 'com.android.vending.BILLING';
    
    // Verificar se a permissão já existe
    const hasBillingPermission = permissions.some((perm) => {
      return perm.$?.['android:name'] === billingPermission;
    });

    // Adicionar permissão se não existir
    if (!hasBillingPermission) {
      console.log('✅ [Plugin] Adicionando permissão BILLING ao AndroidManifest');
      mainApplication['uses-permission'].push({
        $: {
          'android:name': billingPermission,
        },
      });
    } else {
      console.log('✅ [Plugin] Permissão BILLING já existe no AndroidManifest');
    }

    return config;
  });
};

module.exports = withAndroidBillingPermission;

