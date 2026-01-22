import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  console.log('🔍 Checking EXPO_PUBLIC_RORK_API_BASE_URL:', baseUrl);
  
  if (!baseUrl) {
    console.warn('⚠️ EXPO_PUBLIC_RORK_API_BASE_URL is not set!');
    console.log('ℹ️ Backend features will be unavailable until the environment variable is set');
    return '';
  }
  
  return baseUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      async fetch(url, options) {
        const baseUrl = getBaseUrl();
        if (!baseUrl) {
          console.warn('⚠️ Backend not configured - skipping tRPC request');
          // Return a mock response instead of throwing
          return new Response(
            JSON.stringify({ result: { data: null } }),
            { 
              status: 200, 
              headers: { 'content-type': 'application/json' } 
            }
          );
        }
        
        console.log(`🚀 tRPC Request: ${url}`);
        console.log(`📤 Request method: ${options?.method}`);
        
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              'content-type': 'application/json',
            },
          });
          
          console.log(`✅ Response status: ${response.status}`);
          
          if (!response.ok) {
            const text = await response.clone().text();
            
            if (response.status === 404) {
              console.warn('⚠️ Backend endpoint not found (404)');
              console.warn('ℹ️ Make sure your backend is deployed and EXPO_PUBLIC_RORK_API_BASE_URL is correct');
              console.warn('ℹ️ Current URL:', baseUrl);
            } else {
              console.error(`❌ Response not OK: ${response.status}`);
              console.error(`❌ Response body:`, text.substring(0, 500));
            }
          }
          
          return response;
        } catch (error) {
          console.error(`❌ Fetch error:`, error);
          // Return mock response instead of throwing
          return new Response(
            JSON.stringify({ result: { data: null } }),
            { 
              status: 200, 
              headers: { 'content-type': 'application/json' } 
            }
          );
        }
      },
    }),
  ],
});
