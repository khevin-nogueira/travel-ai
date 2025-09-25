import { useState, useCallback } from 'react';
import { Agent, tool, run } from '@openai/agents';
import { z } from 'zod';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    name: string;
    arguments: any;
    result?: string;
  }>;
}

export interface AgentResponse {
  message: string;
  toolCalls?: Array<{
    name: string;
    arguments: any;
    result?: string;
  }>;
  structuredData?: any;
}

export const useTravelAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationState, setConversationState] = useState({
    step: 'destination', // destination, origin, departureDate, returnDate, searchFlights, searchHotels, summary
    destination: '',
    origin: '',
    departureDate: '',
    returnDate: ''
  });

  // Criar um agente simples para teste
  const createSimpleAgent = useCallback(() => {
    const simpleTool = tool({
      name: 'search_flights',
      description: 'Busca voos disponíveis entre duas cidades',
      parameters: z.object({
        origin: z.string().describe('Código IATA do aeroporto de origem'),
        destination: z.string().describe('Código IATA do aeroporto de destino'),
        departureDate: z.string().describe('Data de partida no formato YYYY-MM-DD')
      }),
      async execute({ origin, destination, departureDate }) {
        return JSON.stringify({
          flights: [
            {
              airline: "LATAM Airlines",
              flightNumber: "LA1234",
              origin,
              destination,
              departureTime: "08:00",
              arrivalTime: "09:15",
              duration: "1h 15min",
              price: 250,
              aircraft: "Boeing 737"
            }
          ]
        });
      }
    });

    return new Agent({
      name: 'Lívia Assist - Agente de Viagens',
      instructions: 'Você é a Lívia Assist, uma assistente especializada em viagens da Sky Travels. Ajude os clientes a planejar viagens perfeitas.',
      tools: [simpleTool]
    });
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<AgentResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 800));

      let response = '';
      let structuredData = null;
      let nextStep = conversationState.step;

      // Processar resposta baseada no estado atual da conversa
      switch (conversationState.step) {
        case 'destination':
          // Capturar destino
          const destination = message.trim();
          setConversationState(prev => ({ ...prev, destination, step: 'origin' }));
          response = `Perfeito! Você quer viajar para **${destination}** 🌍\n\nAgora me diga: **de onde você está partindo?** (ex: São Paulo, Rio de Janeiro, Belo Horizonte)`;
          break;

        case 'origin':
          // Capturar origem
          const origin = message.trim();
          setConversationState(prev => ({ ...prev, origin, step: 'departureDate' }));
          response = `Ótimo! Você está partindo de **${origin}** ✈️\n\nAgora preciso saber: **qual a data de ida?** (formato: DD/MM/AAAA ou apenas o dia, ex: 15/03/2025)`;
          break;

        case 'departureDate':
          // Capturar data de ida
          const departureDate = message.trim();
          setConversationState(prev => ({ ...prev, departureDate, step: 'returnDate' }));
          response = `Perfeito! Data de ida: **${departureDate}** 📅\n\nE qual será a **data de volta?** (formato: DD/MM/AAAA ou apenas o dia, ex: 22/03/2025)`;
          break;

        case 'returnDate':
          // Capturar data de volta e buscar voos
          const returnDate = message.trim();
          setConversationState(prev => ({ ...prev, returnDate, step: 'searchFlights' }));
          
          response = `Excelente! Vou buscar voos para você! 🔍\n\n**Resumo da sua viagem:**\n• Origem: ${conversationState.origin}\n• Destino: ${conversationState.destination}\n• Ida: ${conversationState.departureDate}\n• Volta: ${returnDate}\n\nBuscando as melhores opções...`;

          // Simular busca de voos
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Dados estruturados dos voos
          structuredData = [{
            tool: 'search_flights',
            data: {
              searchCriteria: {
                origin: conversationState.origin,
                destination: conversationState.destination,
                departureDate: conversationState.departureDate,
                returnDate: returnDate,
                passengers: 1,
                class: 'economy'
              },
              outboundFlights: [
                {
                  id: 'LA1234',
                  airline: 'LATAM Airlines',
                  flightNumber: 'LA1234',
                  origin: conversationState.origin,
                  destination: conversationState.destination,
                  departureTime: '08:00',
                  arrivalTime: '09:15',
                  duration: '1h 15min',
                  price: 250,
                  aircraft: 'Boeing 737',
                  class: 'economy'
                },
                {
                  id: 'AD5678',
                  airline: 'Azul',
                  flightNumber: 'AD5678',
                  origin: conversationState.origin,
                  destination: conversationState.destination,
                  departureTime: '10:30',
                  arrivalTime: '11:45',
                  duration: '1h 15min',
                  price: 280,
                  aircraft: 'Airbus A320',
                  class: 'economy'
                },
                {
                  id: 'LA9876',
                  airline: 'LATAM Airlines',
                  flightNumber: 'LA9876',
                  origin: conversationState.origin,
                  destination: conversationState.destination,
                  departureTime: '14:00',
                  arrivalTime: '15:15',
                  duration: '1h 15min',
                  price: 275,
                  aircraft: 'Boeing 737',
                  class: 'economy'
                },
                {
                  id: 'AD3456',
                  airline: 'Azul',
                  flightNumber: 'AD3456',
                  origin: conversationState.origin,
                  destination: conversationState.destination,
                  departureTime: '16:30',
                  arrivalTime: '17:45',
                  duration: '1h 15min',
                  price: 290,
                  aircraft: 'Embraer E195',
                  class: 'economy'
                },
                {
                  id: 'LA7777',
                  airline: 'LATAM Airlines',
                  flightNumber: 'LA7777',
                  origin: conversationState.origin,
                  destination: conversationState.destination,
                  departureTime: '19:00',
                  arrivalTime: '20:15',
                  duration: '1h 15min',
                  price: 260,
                  aircraft: 'Boeing 737',
                  class: 'economy'
                }
              ],
              returnFlights: [
                {
                  id: 'LA1235',
                  airline: 'LATAM Airlines',
                  flightNumber: 'LA1235',
                  origin: conversationState.destination,
                  destination: conversationState.origin,
                  departureTime: '08:00',
                  arrivalTime: '09:15',
                  duration: '1h 15min',
                  price: 250,
                  aircraft: 'Boeing 737',
                  class: 'economy'
                },
                {
                  id: 'AD5679',
                  airline: 'Azul',
                  flightNumber: 'AD5679',
                  origin: conversationState.destination,
                  destination: conversationState.origin,
                  departureTime: '10:30',
                  arrivalTime: '11:45',
                  duration: '1h 15min',
                  price: 280,
                  aircraft: 'Airbus A320',
                  class: 'economy'
                },
                {
                  id: 'LA9877',
                  airline: 'LATAM Airlines',
                  flightNumber: 'LA9877',
                  origin: conversationState.destination,
                  destination: conversationState.origin,
                  departureTime: '14:00',
                  arrivalTime: '15:15',
                  duration: '1h 15min',
                  price: 275,
                  aircraft: 'Boeing 737',
                  class: 'economy'
                }
              ],
              totalFound: 8,
              priceRange: {
                min: 250,
                max: 290
              }
            }
          }];

          response = `Encontrei **8 voos** disponíveis para sua viagem! ✈️\n\n**Faixa de preços:** R$ 250 - R$ 290\n\nSelecione o voo de ida que mais te agrada:`;
          break;

        case 'searchFlights':
          // Usuário já selecionou voos, perguntar sobre hotéis
          setConversationState(prev => ({ ...prev, step: 'searchHotels' }));
          response = `Ótimo! Agora vou buscar opções de hospedagem em **${conversationState.destination}** 🏨\n\nBuscando hotéis...`;
          
          // Simular busca de hotéis
          await new Promise(resolve => setTimeout(resolve, 1200));

          structuredData = [{
            tool: 'search_hotels',
            data: {
              searchCriteria: {
                city: conversationState.destination,
                checkIn: conversationState.departureDate,
                checkOut: conversationState.returnDate,
                guests: 2,
                rooms: 1
              },
              hotels: [
                {
                  id: 'hotel1',
                  name: 'Hotel Marriott ' + conversationState.destination,
                  category: '5 estrelas',
                  location: 'Centro de ' + conversationState.destination,
                  amenities: 'Wi-Fi, Piscina, Academia, Restaurante, Bar',
                  price: 450,
                  rating: 9.2,
                  reviews: 1247,
                  checkIn: '15:00',
                  checkOut: '12:00'
                },
                {
                  id: 'hotel2',
                  name: 'Hotel Boutique Arte',
                  category: '4 estrelas',
                  location: 'Distrito histórico',
                  amenities: 'Wi-Fi, Restaurante, Bar, Terraço',
                  price: 320,
                  rating: 8.9,
                  reviews: 892,
                  checkIn: '14:00',
                  checkOut: '11:00'
                },
                {
                  id: 'hotel3',
                  name: 'Sky Business Hotel',
                  category: '4 estrelas',
                  location: 'Área financeira',
                  amenities: 'Wi-Fi, Centro de negócios, Academia',
                  price: 380,
                  rating: 8.7,
                  reviews: 654,
                  checkIn: '15:00',
                  checkOut: '12:00'
                }
              ],
              totalFound: 3,
              priceRange: {
                min: 320,
                max: 450
              }
            }
          }];

          response = `Encontrei **3 hotéis** disponíveis em **${conversationState.destination}**! 🏨\n\n**Faixa de preços:** R$ 320 - R$ 450 por noite\n\nSelecione o hotel que mais te agrada:`;
          break;

        case 'searchHotels':
          // Usuário já selecionou hotel, mostrar resumo final
          setConversationState(prev => ({ ...prev, step: 'summary' }));
          response = `Perfeito! Sua viagem está quase pronta! 🎉\n\n**Resumo da sua viagem:**\n• Origem: ${conversationState.origin}\n• Destino: ${conversationState.destination}\n• Data de ida: ${conversationState.departureDate}\n• Data de volta: ${conversationState.returnDate}\n\nAgora vou calcular o preço total da sua viagem...`;
          
          // Simular cálculo de preços
          await new Promise(resolve => setTimeout(resolve, 1000));

          structuredData = [{
            tool: 'calculate_trip_price',
            data: {
              breakdown: {
                flights: 250,
                hotels: 320,
                extras: 150,
                taxes: 72,
                total: 792
              },
              summary: 'Preço total estimado: R$ 792,00'
            }
          }];

          response = `**Resumo Final da sua viagem:** ✈️🏨\n\n**Custos estimados:**\n• Voos: R$ 250,00\n• Hospedagem: R$ 320,00\n• Extras: R$ 150,00\n• Impostos: R$ 72,00\n\n**💰 Total: R$ 792,00**\n\nSua viagem está pronta! Gostaria de fazer alguma alteração ou confirmar a reserva?`;
          break;

        default:
          response = `Olá! Sou a Lívia Assist, sua assistente de viagens! ✈️\n\nVou te ajudar a planejar sua viagem perfeita. Para começar, me diga: **para onde você gostaria de viajar?** 🌍`;
      }

      return {
        message: response,
        toolCalls: [],
        structuredData
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return {
        message: `Desculpe, ocorreu um erro: ${errorMessage}`,
        toolCalls: [],
        structuredData: null
      };
    } finally {
      setIsLoading(false);
    }
  }, [conversationState]);

  const processStructuredData = useCallback((structuredData: any) => {
    console.log('🔍 Processando dados estruturados:', structuredData);
    
    if (!structuredData || !Array.isArray(structuredData)) {
      console.log('❌ Dados inválidos ou não é array');
      return null;
    }

    // Processar dados de voos
    const flightData = structuredData.find(item => item.tool === 'search_flights');
    if (flightData) {
      console.log('✈️ Dados de voos encontrados:', flightData.data);
      return {
        type: 'flights',
        data: flightData.data
      };
    }

    // Processar dados de hotéis
    const hotelData = structuredData.find(item => item.tool === 'search_hotels');
    if (hotelData) {
      console.log('🏨 Dados de hotéis encontrados:', hotelData.data);
      return {
        type: 'hotels',
        data: hotelData.data
      };
    }

    // Processar informações de destino
    const destinationData = structuredData.find(item => item.tool === 'get_destination_info');
    if (destinationData) {
      console.log('🌍 Dados de destino encontrados:', destinationData.data);
      return {
        type: 'destination_info',
        data: destinationData.data
      };
    }

    // Processar cálculo de preços
    const priceData = structuredData.find(item => item.tool === 'calculate_trip_price');
    if (priceData) {
      console.log('💰 Dados de preço encontrados:', priceData.data);
      return {
        type: 'price_calculation',
        data: priceData.data
      };
    }

    console.log('❌ Nenhum tipo de dados reconhecido');
    return null;
  }, []);

  return {
    sendMessage,
    processStructuredData,
    isLoading,
    error
  };
};
