#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Iniciando build do LacNutry...');

// Verificar se o EAS está instalado
try {
  execSync('npx eas --version', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ EAS CLI não encontrado. Instalando...');
  execSync('npm install -g @expo/eas-cli', { stdio: 'inherit' });
}

// Verificar login
try {
  const whoami = execSync('npx eas whoami', { encoding: 'utf8' });
  console.log(`✅ Logado como: ${whoami.trim()}`);
} catch (error) {
  console.error('❌ Não está logado no EAS. Execute: npx eas login');
  process.exit(1);
}

// Build APK
console.log('\n📱 Gerando APK...');
try {
  execSync('npx eas build --platform android --profile preview --non-interactive', { 
    stdio: 'inherit',
    timeout: 1800000 // 30 minutos
  });
  console.log('✅ APK gerado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao gerar APK:', error.message);
}

// Build AAB
console.log('\n📦 Gerando AAB...');
try {
  execSync('npx eas build --platform android --profile production --non-interactive', { 
    stdio: 'inherit',
    timeout: 1800000 // 30 minutos
  });
  console.log('✅ AAB gerado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao gerar AAB:', error.message);
}

console.log('\n🎉 Build concluído! Verifique os links no output acima.');