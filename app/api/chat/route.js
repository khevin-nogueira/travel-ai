import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função para buscar dados de viagem
async function searchTravelData(type, params) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/travel-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...params })
    });
    
    if (!response.ok) throw new Error('Erro na busca');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é Lívia Assist, assistente de viagens da Sky Travels. Seja amigável e profissional. Use emojis moderadamente. SEMPRE em português brasileiro. UMA PERGUNTA POR VEZ.

FLUXO OBRIGATÓRIO:
1. Cumprimente e pergunte DESTINO
2. Pergunte EXATAMENTE: "Ótimo destino! E de onde você estará saindo? 🏙️"
3. Pergunte EXATAMENTE: "Perfeito! Agora, qual a data de ida da sua viagem? 📅"
4. Pergunte EXATAMENTE: "Você gostaria de fazer uma viagem de ida e volta ou apenas ida?"
5. Se ida e volta, pergunte data de volta
6. Após ter todas as datas, SEMPRE retorne voos
7. Quando usuário escolher voo, confirme e ofereça hotéis
8. Quando usuário escolher hotel, confirme e peça dados do passageiro
9. Finalize a reserva

FORMATO EXATO DE VOOS:
**VOOS_SUGESTOES**
{"flights":[{"airline":"LATAM Airlines","flightNumber":"LA1234","origin":"CNF","destination":"SAO","departureTime":"08:00","arrivalTime":"09:15","duration":"1h 15min","price":250,"aircraft":"Boeing 737"},{"airline":"Azul","flightNumber":"AD5678","origin":"CNF","destination":"SAO","departureTime":"10:30","arrivalTime":"11:45","duration":"1h 15min","price":280,"aircraft":"Airbus A320"},{"airline":"LATAM Airlines","flightNumber":"LA9876","origin":"CNF","destination":"SAO","departureTime":"14:00","arrivalTime":"15:15","duration":"1h 15min","price":275,"aircraft":"Boeing 737"},{"airline":"Azul","flightNumber":"AD3456","origin":"CNF","destination":"SAO","departureTime":"16:30","arrivalTime":"17:45","duration":"1h 15min","price":290,"aircraft":"Embraer E195"},{"airline":"LATAM Airlines","flightNumber":"LA7777","origin":"CNF","destination":"SAO","departureTime":"19:00","arrivalTime":"20:15","duration":"1h 15min","price":260,"aircraft":"Boeing 737"}]}
**FIM_VOOS_SUGESTOES**

FORMATO EXATO DE HOTÉIS (quando solicitar):
**HOTEIS_SUGESTOES**
{"hotels":[{"name":"Hotel Luxo São Paulo","stars":5,"rating":4.8,"location":{"district":"Jardins","city":"São Paulo"},"prices":{"total":600,"currency":"BRL","nights":2},"amenities":["Wi-Fi Grátis","Piscina","Spa","Academia"],"category":"Luxo","cancellation":"Cancelamento grátis","breakfast":"Incluído"}]}
**FIM_HOTEIS_SUGESTOES**

REGRAS CRÍTICAS:
- JSON deve ser UMA LINHA só, sem quebras
- Use ASPAS DUPLAS sempre
- CNF = Belo Horizonte, SAO = São Paulo, RIO = Rio de Janeiro
- Preços nacionais: voos R$250-350, hotéis R$200-800
- SEMPRE 5 voos exatos, 4 hotéis
- Quando usuário escolher voo/hotel, confirme com detalhes e avance no fluxo`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 800,
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
