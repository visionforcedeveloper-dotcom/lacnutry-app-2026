# 🚀 Como Criar o Repositório no GitHub

## 📝 Passo a Passo

### 1️⃣ Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha os dados:
   - **Repository name**: `lacnutry-app`
   - **Description**: `🥛 App completo para gestão de intolerância à lactose com IA`
   - **Visibilidade**: 
     - ✅ **Private** (recomendado para código proprietário)
     - ⬜ Public (se quiser código aberto)
   - **NÃO** marque nenhuma opção de inicialização (README, .gitignore, license)
5. Clique em **"Create repository"**

### 2️⃣ Conectar o Repositório Local

Após criar, o GitHub mostrará comandos. Use estes:

```bash
# Adicionar o remote do GitHub (substitua SEU_USUARIO pelo seu usuário)
git remote add origin https://github.com/SEU_USUARIO/lacnutry-app.git

# Renomear branch para main (padrão do GitHub)
git branch -M main

# Fazer o primeiro push
git push -u origin main
```

**OU** se preferir SSH (mais seguro):

```bash
git remote add origin git@github.com:SEU_USUARIO/lacnutry-app.git
git branch -M main
git push -u origin main
```

### 3️⃣ Verificar o Upload

1. Atualize a página do repositório no GitHub
2. Você deve ver todos os arquivos e o README.md formatado
3. Verifique se os arquivos sensíveis **NÃO** foram enviados:
   - ❌ `*.keystore`
   - ❌ `*.aab`
   - ❌ `*.apk`
   - ❌ `google-services.json`
   - ❌ `keystore.properties`
   - ❌ `.env*`

## 🔐 Configurar Secrets (Importante!)

Para builds automáticas via GitHub Actions (futuro):

1. Vá em **Settings** > **Secrets and variables** > **Actions**
2. Adicione os seguintes secrets:
   - `EXPO_TOKEN` - Token do Expo
   - `GEMINI_API_KEY` - Chave da API Gemini
   - `FIREBASE_CONFIG` - Configuração Firebase (JSON)

## 📋 Próximos Passos

### Adicionar uma branch de desenvolvimento:

```bash
# Criar e mudar para branch dev
git checkout -b develop
git push -u origin develop
```

### Proteger a branch main:

1. Vá em **Settings** > **Branches**
2. Em **Branch protection rules** clique em **Add rule**
3. Configure:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Include administrators

### Adicionar colaboradores:

1. Vá em **Settings** > **Collaborators**
2. Clique em **Add people**
3. Digite o username ou email do colaborador

## 🏷️ Criar Release/Tag

Quando quiser marcar uma versão:

```bash
# Criar tag da versão
git tag -a v3.10.0 -m "Release v3.10.0 - Build AAB concluído"

# Enviar tag para GitHub
git push origin v3.10.0
```

No GitHub, vá em **Releases** > **Create a new release** e:
- Escolha a tag `v3.10.0`
- Adicione título: `v3.10.0 - LacNutry`
- Adicione descrição das mudanças
- Anexe o arquivo `.aab` se quiser

## 🔄 Workflow Diário

```bash
# Sempre antes de começar a trabalhar
git pull origin main

# Fazer mudanças nos arquivos
# ...

# Ver o que mudou
git status

# Adicionar arquivos
git add .

# Commitar com mensagem descritiva
git commit -m "feat: adiciona nova funcionalidade"

# Enviar para GitHub
git push origin main
```

## 📝 Convenção de Commits

Use prefixos semânticos:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Refatoração de código
- `docs:` - Documentação
- `style:` - Formatação
- `test:` - Testes
- `chore:` - Tarefas de build/config

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Remote adicionado localmente
- [ ] Push realizado com sucesso
- [ ] README.md aparecendo corretamente
- [ ] Arquivos sensíveis NÃO estão no repo
- [ ] .gitignore funcionando corretamente
- [ ] Descrição do repositório preenchida
- [ ] Topics/Tags adicionadas (react-native, expo, typescript, firebase)

## 🆘 Problemas Comuns

### "Permission denied (publickey)"
- Configure suas chaves SSH no GitHub
- Ou use HTTPS: `git remote set-url origin https://github.com/SEU_USUARIO/lacnutry-app.git`

### "Repository not found"
- Verifique se o nome do repositório está correto
- Verifique se você tem permissão de acesso

### "Updates were rejected because the tip of your current branch is behind"
```bash
git pull --rebase origin main
git push origin main
```

## 🎉 Pronto!

Seu código agora está no GitHub! 🚀

Para compartilhar: `https://github.com/SEU_USUARIO/lacnutry-app`

