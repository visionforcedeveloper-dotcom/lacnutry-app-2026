# 🚀 Instruções para Build do AAB - Versão 2.0.1

## Execute no seu PowerShell:

```bash
eas build --platform android --profile production
```

## O que vai acontecer:

1. ✅ EAS vai perguntar sobre criar o projeto
   - **Responda:** Y (Yes)

2. ✅ EAS vai perguntar sobre keystore
   - **Se já tem keystore anterior:** Ele vai usar automaticamente
   - **Se é primeira vez:** Ele vai criar uma nova

3. ⏳ Upload do código (~2-5 minutos)

4. ⏳ Build na nuvem (~15-20 minutos)

5. ✅ Download do AAB automaticamente

## Acompanhar o Build:

Após iniciar, você verá uma URL como:
```
https://expo.dev/accounts/visionforce1/builds/xxxxx
```

Acesse essa URL para ver o progresso em tempo real.

## Após o Build:

O arquivo AAB será baixado em:
```
C:\Users\joaov\Downloads\lacnutry-app-2.0.1.aab
```

Ou você pode baixar manualmente da URL do build.

## Upload no Google Play Console:

1. Acesse: https://play.google.com/console
2. Seu App → Produção → Criar nova versão
3. Faça upload do AAB
4. Preencha as notas de versão:
   ```
   Versão 2.0.1 - Novidades:
   - Suporte a assinaturas in-app
   - Melhorias de performance
   - Correções de bugs
   ```
5. Enviar para análise

## Comandos Úteis:

```bash
# Ver histórico de builds
eas build:list

# Ver detalhes de um build específico
eas build:view [BUILD_ID]

# Cancelar build em andamento
eas build:cancel
```

## Troubleshooting:

### Erro: "Build failed"
- Verifique a URL do build para ver logs
- Geralmente é erro de configuração no app.json

### Erro: "Keystore mismatch"
- Você está usando keystore diferente da versão anterior
- Contate o suporte ou use a keystore original

### Build muito lento?
- Normal! Builds podem levar 15-30 minutos
- Dependência de fila no servidor EAS

