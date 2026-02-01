/**
 * Arquivo para testar as APIs do Gemini
 * Execute este arquivo para verificar se todas as chaves estão funcionando
 */

const GEMINI_API_KEYS = [
  "AIzaSyDl_kBj9H3WyFxJQ7YxAbh6CplMWVbfxXQ",
  "AIzaSyCD5SXuosDo0izX1Cg57krwRRuHdQ1Aw0A", 
  "AIzaSyDhNEpJJaqN6at6yInw5sn57bKdx_JUbzY"
];

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const CLOUD_VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";

export async function testGeminiAPIs() {
  console.log('🧪 Testando APIs do Gemini...');
  
  const results = {
    workingKeys: [] as string[],
    failedKeys: [] as string[],
    quotaExceededKeys: [] as string[],
  };

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = GEMINI_API_KEYS[i];
    const keyLabel = `Chave ${i + 1} (${apiKey.substring(0, 20)}...)`;
    
    try {
      console.log(`\n🔑 Testando ${keyLabel}`);
      
      // Teste simples com texto
      const response = await fetch(
        `${GEMINI_API_URL}/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Responda apenas 'OK' se você está funcionando corretamente.",
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 10,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        console.log(`✅ ${keyLabel}: FUNCIONANDO`);
        console.log(`   Resposta: ${textResponse}`);
        results.workingKeys.push(apiKey);
      } else if (response.status === 429) {
        console.log(`⚠️ ${keyLabel}: QUOTA EXCEDIDA`);
        results.quotaExceededKeys.push(apiKey);
      } else {
        const errorText = await response.text();
        console.log(`❌ ${keyLabel}: ERRO ${response.status}`);
        console.log(`   Detalhes: ${errorText.substring(0, 200)}`);
        results.failedKeys.push(apiKey);
      }
    } catch (error: any) {
      console.log(`❌ ${keyLabel}: ERRO DE CONEXÃO`);
      console.log(`   Detalhes: ${error.message}`);
      results.failedKeys.push(apiKey);
    }
  }

  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log(`✅ Chaves funcionando: ${results.workingKeys.length}`);
  console.log(`⚠️ Chaves com quota excedida: ${results.quotaExceededKeys.length}`);
  console.log(`❌ Chaves com erro: ${results.failedKeys.length}`);
  
  if (results.workingKeys.length > 0) {
    console.log('\n🎉 Pelo menos uma chave está funcionando! O scanner deve funcionar normalmente.');
  } else if (results.quotaExceededKeys.length > 0) {
    console.log('\n⏰ Todas as chaves atingiram a quota. Tente novamente mais tarde ou adicione mais chaves.');
  } else {
    console.log('\n🚨 Nenhuma chave está funcionando. Verifique as configurações das APIs no Google Cloud Console.');
  }

  return results;
}

// Teste específico para Cloud Vision API
export async function testCloudVisionAPI() {
  console.log('\n👁️ Testando Cloud Vision API...');
  
  const apiKey = GEMINI_API_KEYS[0]; // Usar primeira chave
  
  // Imagem de teste simples (1x1 pixel branco em base64)
  const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
  
  try {
    const response = await fetch(`${CLOUD_VISION_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: testImage,
            },
            features: [
              { type: "LABEL_DETECTION", maxResults: 1 },
            ],
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cloud Vision API: FUNCIONANDO');
      console.log('   Resposta:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Cloud Vision API: ERRO', response.status);
      console.log('   Detalhes:', errorText.substring(0, 200));
    }
  } catch (error: any) {
    console.log('❌ Cloud Vision API: ERRO DE CONEXÃO');
    console.log('   Detalhes:', error.message);
  }
}

// Função para executar todos os testes
export async function runAllTests() {
  await testGeminiAPIs();
  await testCloudVisionAPI();
}