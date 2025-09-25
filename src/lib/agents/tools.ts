import { z } from 'zod'
import { 
  SearchFlightsToolSchema, 
  SearchHotelsToolSchema, 
  BookFlightToolSchema, 
  BookHotelToolSchema 
} from '../validation/schemas'
import { StreamingService } from './streaming'

// Tool Definition Interface
export interface ToolDefinition {
  name: string
  description: string
  parameters: z.ZodSchema
  execute: (args: any) => Promise<any>
  streaming?: boolean
}

// Flight Search Tool
export const flightSearchTool: ToolDefinition = {
  name: 'search_flights',
  description: 'Busca voos disponíveis baseado nos critérios de pesquisa',
  parameters: SearchFlightsToolSchema,
  streaming: true,
  async execute(args: z.infer<typeof SearchFlightsToolSchema>) {
    console.log('🔍 Executando busca de voos:', args.searchCriteria)
    
    // Validate input
    const validatedArgs = SearchFlightsToolSchema.parse(args)
    
    // Return streaming generator
    return {
      type: 'streaming',
      generator: StreamingService.streamFlights(validatedArgs.searchCriteria)
    }
  }
}

// Hotel Search Tool
export const hotelSearchTool: ToolDefinition = {
  name: 'search_hotels',
  description: 'Busca hotéis disponíveis baseado nos critérios de pesquisa',
  parameters: SearchHotelsToolSchema,
  streaming: true,
  async execute(args: z.infer<typeof SearchHotelsToolSchema>) {
    console.log('🏨 Executando busca de hotéis:', args.searchCriteria)
    
    const validatedArgs = SearchHotelsToolSchema.parse(args)
    
    return {
      type: 'streaming',
      generator: StreamingService.streamHotels(validatedArgs.searchCriteria)
    }
  }
}

// Book Flight Tool
export const bookFlightTool: ToolDefinition = {
  name: 'book_flight',
  description: 'Reserva um voo específico com informações do passageiro e pagamento',
  parameters: BookFlightToolSchema,
  streaming: true,
  async execute(args: z.infer<typeof BookFlightToolSchema>) {
    console.log('✈️ Processando reserva de voo:', args.flightId)
    
    const validatedArgs = BookFlightToolSchema.parse(args)
    
    // Simulate booking process
    const bookingData = {
      flightId: validatedArgs.flightId,
      passengerInfo: validatedArgs.passengerInfo,
      paymentInfo: validatedArgs.paymentInfo,
      totalPrice: 250 // Mock price
    }
    
    return {
      type: 'streaming',
      generator: StreamingService.streamBooking(bookingData)
    }
  }
}

// Book Hotel Tool
export const bookHotelTool: ToolDefinition = {
  name: 'book_hotel',
  description: 'Reserva um hotel específico com informações do hóspede e pagamento',
  parameters: BookHotelToolSchema,
  streaming: true,
  async execute(args: z.infer<typeof BookHotelToolSchema>) {
    console.log('🏨 Processando reserva de hotel:', args.hotelId)
    
    const validatedArgs = BookHotelToolSchema.parse(args)
    
    const bookingData = {
      hotelId: validatedArgs.hotelId,
      guestInfo: validatedArgs.guestInfo,
      paymentInfo: validatedArgs.paymentInfo,
      totalPrice: 300 // Mock price
    }
    
    return {
      type: 'streaming',
      generator: StreamingService.streamBooking(bookingData)
    }
  }
}

// Destination Info Tool
export const destinationInfoTool: ToolDefinition = {
  name: 'get_destination_info',
  description: 'Obtém informações sobre um destino específico',
  parameters: z.object({
    destination: z.string().min(2, 'Destino é obrigatório')
  }),
  streaming: false,
  async execute(args: { destination: string }) {
    console.log('🌍 Obtendo informações do destino:', args.destination)
    
    // Mock destination data
    const destinationData = {
      destination: args.destination,
      weather: 'Ensolarado, 25°C',
      attractions: ['Praia', 'Centro histórico', 'Museus'],
      culture: 'Cultura local rica em tradições',
      safety: 'Destino seguro para turistas',
      transport: 'Transporte público eficiente'
    }
    
    return {
      type: 'data',
      data: destinationData
    }
  }
}

// Price Calculator Tool
export const priceCalculatorTool: ToolDefinition = {
  name: 'calculate_trip_price',
  description: 'Calcula o preço total de uma viagem incluindo voos, hotéis e extras',
  parameters: z.object({
    flights: z.array(z.object({
      id: z.string(),
      price: z.number()
    })),
    hotels: z.array(z.object({
      id: z.string(),
      price: z.number(),
      nights: z.number()
    })),
    extras: z.object({
      meals: z.number().default(0),
      transport: z.number().default(0),
      activities: z.number().default(0)
    }).nullable()
  }),
  streaming: false,
  async execute(args: any) {
    console.log('💰 Calculando preço da viagem')
    
    const flightsTotal = args.flights.reduce((sum: number, flight: any) => sum + flight.price, 0)
    const hotelsTotal = args.hotels.reduce((sum: number, hotel: any) => sum + (hotel.price * hotel.nights), 0)
    const extrasTotal = args.extras ? args.extras.meals + args.extras.transport + args.extras.activities : 0
    
    const subtotal = flightsTotal + hotelsTotal + extrasTotal
    const taxes = subtotal * 0.15
    const fees = 50
    const total = subtotal + taxes + fees
    
    return {
      type: 'data',
      data: {
        breakdown: {
          flights: flightsTotal,
          hotels: hotelsTotal,
          extras: extrasTotal,
          subtotal,
          taxes,
          fees,
          total
        },
        currency: 'BRL'
      }
    }
  }
}

// Tool Registry
export const toolRegistry = {
  [flightSearchTool.name]: flightSearchTool,
  [hotelSearchTool.name]: hotelSearchTool,
  [bookFlightTool.name]: bookFlightTool,
  [bookHotelTool.name]: bookHotelTool,
  [destinationInfoTool.name]: destinationInfoTool,
  [priceCalculatorTool.name]: priceCalculatorTool
}

// Tool Executor
export class ToolExecutor {
  static async execute(toolName: string, args: any): Promise<any> {
    const tool = toolRegistry[toolName]
    
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`)
    }
    
    try {
      // Validate arguments against schema
      const validatedArgs = tool.parameters.parse(args)
      
      // Execute tool
      const result = await tool.execute(validatedArgs)
      
      return {
        success: true,
        tool: toolName,
        result
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error)
      
      return {
        success: false,
        tool: toolName,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  static getAvailableTools(): string[] {
    return Object.keys(toolRegistry)
  }
  
  static getToolDefinition(toolName: string): ToolDefinition | undefined {
    return toolRegistry[toolName]
  }
}
