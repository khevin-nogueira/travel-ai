import { Agent, tool } from '@openai/agents';
import { z } from 'zod';

// Schemas para validação de dados
const FlightSearchSchema = z.object({
  origin: z.string().min(3).describe('Código IATA do aeroporto de origem (ex: CNF, SAO)'),
  destination: z.string().min(3).describe('Código IATA do aeroporto de destino (ex: SAO, RIO)'),
  departureDate: z.string().describe('Data de partida no formato YYYY-MM-DD'),
  returnDate: z.string().nullable().describe('Data de retorno no formato YYYY-MM-DD (opcional)'),
  passengers: z.number().min(1).max(9).default(1).describe('Número de passageiros'),
  class: z.enum(['economy', 'business', 'first']).default('economy').describe('Classe da passagem')
});

const HotelSearchSchema = z.object({
  city: z.string().min(2).describe('Nome da cidade'),
  checkIn: z.string().describe('Data de check-in no formato YYYY-MM-DD'),
  checkOut: z.string().describe('Data de check-out no formato YYYY-MM-DD'),
  guests: z.number().min(1).max(8).default(2).describe('Número de hóspedes'),
  rooms: z.number().min(1).max(4).default(1).describe('Número de quartos')
});

const DestinationInfoSchema = z.object({
  destination: z.string().min(2).describe('Nome do destino ou cidade'),
  infoType: z.enum(['weather', 'attractions', 'culture', 'safety', 'transport', 'all']).default('all').describe('Tipo de informação desejada')
});

// Dados mock para demonstração
const mockFlights = [
  {
    id: 'LA1234',
    airline: 'LATAM Airlines',
    flightNumber: 'LA1234',
    origin: 'CNF',
    destination: 'SAO',
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
    origin: 'CNF',
    destination: 'SAO',
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
    origin: 'CNF',
    destination: 'SAO',
    departureTime: '14:00',
    arrivalTime: '15:15',
    duration: '1h 15min',
    price: 275,
    aircraft: 'Boeing 737',
    class: 'economy'
  }
];

const mockHotels = [
  {
    id: 'hotel1',
    name: 'Hotel Marriott São Paulo',
    category: '5 estrelas',
    location: 'Centro de São Paulo',
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
];

// Ferramenta para busca de voos
const flightSearchTool = tool({
  name: 'search_flights',
  description: 'Busca voos disponíveis entre duas cidades com base nos critérios fornecidos',
  parameters: FlightSearchSchema,
  async execute({ origin, destination, departureDate, returnDate, passengers, class: flightClass }) {
    // Simular busca de voos
    const flights = mockFlights.filter(flight => 
      flight.origin === origin.toUpperCase() && 
      flight.destination === destination.toUpperCase()
    );

    if (flights.length === 0) {
      return `Nenhum voo encontrado entre ${origin} e ${destination} para a data ${departureDate}`;
    }

    const returnFlights = returnDate ? mockFlights.filter(flight => 
      flight.origin === destination.toUpperCase() && 
      flight.destination === origin.toUpperCase()
    ) : [];

    const result = {
      searchCriteria: {
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
        class: flightClass
      },
      outboundFlights: flights,
      returnFlights: returnFlights,
      totalFound: flights.length + returnFlights.length,
      priceRange: {
        min: Math.min(...flights.map(f => f.price)),
        max: Math.max(...flights.map(f => f.price))
      }
    };

    return JSON.stringify(result, null, 2);
  }
});

// Ferramenta para busca de hotéis
const hotelSearchTool = tool({
  name: 'search_hotels',
  description: 'Busca hotéis disponíveis em uma cidade específica com base nos critérios fornecidos',
  parameters: HotelSearchSchema,
  async execute({ city, checkIn, checkOut, guests, rooms }) {
    // Simular busca de hotéis
    const hotels = mockHotels.filter(hotel => 
      hotel.location.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes('são paulo') ||
      city.toLowerCase().includes('sao paulo')
    );

    if (hotels.length === 0) {
      return `Nenhum hotel encontrado em ${city} para as datas ${checkIn} a ${checkOut}`;
    }

    const result = {
      searchCriteria: {
        city,
        checkIn,
        checkOut,
        guests,
        rooms
      },
      hotels: hotels,
      totalFound: hotels.length,
      priceRange: {
        min: Math.min(...hotels.map(h => h.price)),
        max: Math.max(...hotels.map(h => h.price))
      }
    };

    return JSON.stringify(result, null, 2);
  }
});

// Ferramenta para informações de destino
const destinationInfoTool = tool({
  name: 'get_destination_info',
  description: 'Obtém informações detalhadas sobre um destino (clima, atrações, cultura, segurança, transporte)',
  parameters: DestinationInfoSchema,
  async execute({ destination, infoType }) {
    const destinationData = {
      'são paulo': {
        weather: 'Clima subtropical úmido. Verão quente e úmido (dez-mar), inverno ameno (jun-ago). Temperatura média: 20-25°C',
        attractions: 'Paulista Avenue, Ibirapuera Park, Municipal Market, Vila Madalena, Pinacoteca, MASP',
        culture: 'Centro cultural do Brasil. Diversidade étnica, gastronomia variada, vida noturna vibrante',
        safety: 'Cidade grande com áreas seguras e outras que requerem cuidado. Evite áreas isoladas à noite',
        transport: 'Metrô extenso, ônibus, Uber/Taxi, aeroportos GRU e CGH'
      },
      'rio de janeiro': {
        weather: 'Clima tropical atlântico. Verão quente e úmido, inverno ameno. Temperatura média: 22-28°C',
        attractions: 'Cristo Redentor, Pão de Açúcar, Copacabana, Ipanema, Jardim Botânico, Lapa',
        culture: 'Capital cultural do Brasil. Samba, bossa nova, carnaval, praias icônicas',
        safety: 'Cuidado com pertences na praia. Evite áreas de risco, especialmente à noite',
        transport: 'Metrô limitado, ônibus, VLT, Uber/Taxi, aeroporto GIG'
      }
    };

    const cityData = destinationData[destination.toLowerCase() as keyof typeof destinationData] || destinationData['são paulo'];
    
    if (infoType === 'all') {
      return JSON.stringify({
        destination,
        info: cityData
      }, null, 2);
    }

    return JSON.stringify({
      destination,
      infoType,
      data: cityData[infoType]
    }, null, 2);
  }
});

// Ferramenta para cálculo de preços
const priceCalculatorTool = tool({
  name: 'calculate_trip_price',
  description: 'Calcula o preço total estimado de uma viagem incluindo voos, hospedagem e extras',
  parameters: z.object({
    flights: z.array(z.object({
      price: z.number(),
      passengers: z.number()
    })),
    hotels: z.array(z.object({
      price: z.number(),
      nights: z.number()
    })),
    extras: z.object({
      meals: z.number().default(0),
      transport: z.number().default(0),
      activities: z.number().default(0)
    }).nullable()
  }),
  async execute({ flights, hotels, extras = { meals: 0, transport: 0, activities: 0 } }) {
    const flightTotal = flights.reduce((sum, flight) => sum + (flight.price * flight.passengers), 0);
    const hotelTotal = hotels.reduce((sum, hotel) => sum + (hotel.price * hotel.nights), 0);
    const extrasTotal = extras ? extras.meals + extras.transport + extras.activities : 0;
    
    const subtotal = flightTotal + hotelTotal + extrasTotal;
    const taxes = subtotal * 0.1; // 10% de impostos
    const total = subtotal + taxes;

    return JSON.stringify({
      breakdown: {
        flights: flightTotal,
        hotels: hotelTotal,
        extras: extrasTotal,
        taxes: taxes,
        total: total
      },
      summary: `Preço total estimado: R$ ${total.toFixed(2)}`
    }, null, 2);
  }
});

// Agente principal de viagens
export const travelAgent = new Agent({
  name: 'Lívia Assist - Agente de Viagens',
  instructions: `Você é a Lívia Assist, uma assistente especializada em viagens da Sky Travels. 

Sua missão é ajudar os clientes a planejar viagens perfeitas, oferecendo:

1. **Busca inteligente de voos** - Encontre as melhores opções de voo com base no orçamento e preferências
2. **Recomendações de hospedagem** - Sugira hotéis que atendam às necessidades específicas
3. **Informações de destino** - Forneça dados sobre clima, atrações, cultura e segurança
4. **Cálculos de preço** - Estime custos totais da viagem
5. **Dicas personalizadas** - Ofereça conselhos baseados no perfil do viajante

Sempre seja:
- Amigável e profissional
- Detalhada nas informações
- Prática nas sugestões
- Transparente sobre preços e condições
- Proativa em oferecer alternativas

Use as ferramentas disponíveis para fornecer informações precisas e atualizadas. Quando não tiver certeza sobre algo, seja honesta e sugira como obter a informação.`,
  tools: [flightSearchTool, hotelSearchTool, destinationInfoTool, priceCalculatorTool]
});

// Agente especializado em voos
export const flightAgent = new Agent({
  name: 'Especialista em Voos',
  instructions: 'Especialista em busca e análise de voos. Foque em encontrar as melhores opções de voo considerando preço, horário, companhia aérea e conveniência.',
  tools: [flightSearchTool, priceCalculatorTool]
});

// Agente especializado em hospedagem
export const hotelAgent = new Agent({
  name: 'Especialista em Hospedagem',
  instructions: 'Especialista em busca e análise de hotéis. Foque em encontrar acomodações que atendam às necessidades específicas do cliente considerando localização, comodidades e orçamento.',
  tools: [hotelSearchTool, priceCalculatorTool]
});

// Agente de informações de destino
export const destinationAgent = new Agent({
  name: 'Especialista em Destinos',
  instructions: 'Especialista em informações de destinos. Forneça dados detalhados sobre clima, atrações, cultura, segurança e transporte para ajudar na decisão de viagem.',
  tools: [destinationInfoTool]
});

export { flightSearchTool, hotelSearchTool, destinationInfoTool, priceCalculatorTool };
