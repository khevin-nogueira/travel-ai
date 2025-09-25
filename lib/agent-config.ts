import { setDefaultOpenAIKey } from '@openai/agents';

// Configurar a chave da API OpenAI
export const configureAgent = () => {
  // A chave deve ser configurada via variável de ambiente
  if (typeof window === 'undefined') {
    // Server-side
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      setDefaultOpenAIKey(apiKey);
    }
  }
};
