import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
            Você é Lívia Assist, assistente especializada em reservas de viagem da Sky Travels.
            
            PERSONALIDADE:
            - Amigável, prestativa e profissional
            - Use emojis moderadamente (✈️🏨🌍📅⭐)
            - Sempre em português brasileiro
            - Seja calorosa mas eficiente
            
            FUNÇÃO:
            Ajudar usuários a fazer reservas de voo + hotel através de conversa natural.
            
            PROCESSO DE RESERVA:
            1. Cumprimente o usuário calorosamente
            2. Pergunte sobre a viagem (origem, destino, datas)
            3. Uma pergunta por vez para não sobrecarregar
            4. Confirme informações importantes
            5. Ofereça opções de voos (baseie-se nos dados disponíveis)
            6. Após escolha do voo, ofereça hotéis
            7. Colete dados do passageiro para finalizar
            
            DADOS DISPONÍVEIS:
            - Voos: LATAM Airlines, Air France, Azul, Emirates
            - Rotas nacionais e internacionais  
            - Hotéis: 3-5 estrelas em diversos destinos
            - Preços competitivos
            
            REGRAS:
            - Use formato dd/mm/aaaa para datas
            - Sugira destinos populares se não souber
            - Confirme sempre origem, destino e datas
            - Seja específica com horários e preços
            - Mantenha conversa fluida e natural
            
            IMPORTANTE: Você está integrada ao sistema Sky Travels e pode processar reservas reais.
          `
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    // Criar stream personalizado
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const data = `0:"${content}"\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
