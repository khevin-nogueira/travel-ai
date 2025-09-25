import { z } from 'zod'
import { 
  SearchFlightsToolSchema, 
  SearchHotelsToolSchema, 
  BookFlightToolSchema, 
  BookHotelToolSchema 
} from '../validation/schemas'

// Streaming Component Types
export interface StreamingComponent {
  id: string
  type: 'flight_card' | 'hotel_card' | 'price_breakdown' | 'confirmation' | 'error' | 'loading'
  props: any
  priority: number
  timestamp: Date
}

export interface StreamingResponse {
  components: StreamingComponent[]
  isComplete: boolean
  error?: string
}

// Component Generators
export class ComponentGenerator {
  private static generateId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static createFlightCard(flight: any, index: number): StreamingComponent {
    return {
      id: this.generateId(),
      type: 'flight_card',
      props: {
        flight,
        index,
        selectable: true,
        showPrice: true,
        showDuration: true,
        showStops: true
      },
      priority: 1,
      timestamp: new Date()
    }
  }

  static createHotelCard(hotel: any, index: number): StreamingComponent {
    return {
      id: this.generateId(),
      type: 'hotel_card',
      props: {
        hotel,
        index,
        selectable: true,
        showRating: true,
        showAmenities: true,
        showPrice: true
      },
      priority: 1,
      timestamp: new Date()
    }
  }

  static createPriceBreakdown(breakdown: any): StreamingComponent {
    return {
      id: this.generateId(),
      type: 'price_breakdown',
      props: {
        breakdown,
        showDetails: true,
        showTotal: true,
        currency: 'BRL'
      },
      priority: 2,
      timestamp: new Date()
    }
  }

  static createConfirmation(booking: any): StreamingComponent {
    return {
      id: this.generateId(),
      type: 'confirmation',
      props: {
        booking,
        showCode: true,
        showDetails: true,
        showActions: true
      },
      priority: 3,
      timestamp: new Date()
    }
  }

  static createError(error: string, retry?: () => void): StreamingComponent {
    return {
      id: this.generateId(),
      type: 'error',
      props: {
        message: error,
        retry,
        showIcon: true
      },
      priority: 0,
      timestamp: new Date()
    }
  }

  static createLoading(message: string, progress?: number): StreamingComponent {
    return {
      id: this.generateId(),
      type: 'loading',
      props: {
        message,
        progress,
        showSpinner: true
      },
      priority: 0,
      timestamp: new Date()
    }
  }
}

// Streaming Service
export class StreamingService {
  private static simulateLatency(): Promise<void> {
    const delay = Math.random() * 900 + 300 // 300-1200ms
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  private static shouldSimulateError(): boolean {
    return Math.random() < 0.15 // 15% chance of error
  }

  static async *streamFlights(searchCriteria: any): AsyncGenerator<StreamingComponent> {
    // Simulate latency
    await this.simulateLatency()

    // Simulate error
    if (this.shouldSimulateError()) {
      yield ComponentGenerator.createError(
        'Erro ao buscar voos. Tente novamente.',
        () => this.streamFlights(searchCriteria)
      )
      return
    }

    // Generate loading component
    yield ComponentGenerator.createLoading('Buscando voos disponíveis...', 0)

    // Simulate progressive loading
    const flights = this.generateMockFlights(searchCriteria)
    
    for (let i = 0; i < flights.length; i++) {
      await this.simulateLatency()
      yield ComponentGenerator.createFlightCard(flights[i], i)
    }

    // Generate price breakdown
    const breakdown = this.calculatePriceBreakdown(flights)
    yield ComponentGenerator.createPriceBreakdown(breakdown)
  }

  static async *streamHotels(searchCriteria: any): AsyncGenerator<StreamingComponent> {
    await this.simulateLatency()

    if (this.shouldSimulateError()) {
      yield ComponentGenerator.createError(
        'Erro ao buscar hotéis. Tente novamente.',
        () => this.streamHotels(searchCriteria)
      )
      return
    }

    yield ComponentGenerator.createLoading('Buscando hotéis disponíveis...', 0)

    const hotels = this.generateMockHotels(searchCriteria)
    
    for (let i = 0; i < hotels.length; i++) {
      await this.simulateLatency()
      yield ComponentGenerator.createHotelCard(hotels[i], i)
    }
  }

  static async *streamBooking(bookingData: any): AsyncGenerator<StreamingComponent> {
    await this.simulateLatency()

    if (this.shouldSimulateError()) {
      yield ComponentGenerator.createError(
        'Erro ao processar reserva. Tente novamente.',
        () => this.streamBooking(bookingData)
      )
      return
    }

    yield ComponentGenerator.createLoading('Processando reserva...', 50)
    await this.simulateLatency()
    yield ComponentGenerator.createLoading('Confirmando pagamento...', 80)
    await this.simulateLatency()

    const confirmation = this.generateBookingConfirmation(bookingData)
    yield ComponentGenerator.createConfirmation(confirmation)
  }

  private static generateMockFlights(searchCriteria: any): any[] {
    const airlines = ['LATAM', 'Azul', 'Gol', 'Avianca']
    const aircraft = ['Boeing 737', 'Airbus A320', 'Embraer E195']
    
    return Array.from({ length: 5 }, (_, i) => ({
      id: `flight_${i + 1}`,
      airline: airlines[i % airlines.length],
      flightNumber: `${airlines[i % airlines.length].substr(0, 2)}${1000 + i}`,
      origin: searchCriteria.origin,
      destination: searchCriteria.destination,
      departureTime: `${8 + i * 2}:00`,
      arrivalTime: `${9 + i * 2}:15`,
      duration: '1h 15min',
      price: 200 + i * 50,
      aircraft: aircraft[i % aircraft.length],
      class: searchCriteria.class,
      stops: i % 3 === 0 ? 0 : 1
    }))
  }

  private static generateMockHotels(searchCriteria: any): any[] {
    const hotelNames = [
      'Hotel Plaza', 'Resort Paradise', 'Boutique Inn', 'Business Hotel', 'Luxury Suites'
    ]
    const categories = ['3 estrelas', '4 estrelas', '5 estrelas', 'Boutique', 'Resort']
    
    return Array.from({ length: 4 }, (_, i) => ({
      id: `hotel_${i + 1}`,
      name: hotelNames[i],
      category: categories[i],
      location: searchCriteria.destination,
      price: 150 + i * 100,
      rating: 4 + Math.random(),
      amenities: ['Wi-Fi', 'Piscina', 'Academia', 'Restaurante'],
      images: [`/images/hotel_${i + 1}.jpg`],
      description: `Hotel confortável no centro de ${searchCriteria.destination}`
    }))
  }

  private static calculatePriceBreakdown(flights: any[]): any {
    const basePrice = flights.reduce((sum, flight) => sum + flight.price, 0)
    const taxes = basePrice * 0.15
    const fees = 50
    const total = basePrice + taxes + fees

    return {
      basePrice,
      taxes,
      fees,
      total,
      currency: 'BRL'
    }
  }

  private static generateBookingConfirmation(bookingData: any): any {
    return {
      bookingId: `BK${Date.now()}`,
      confirmationCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
      status: 'confirmed',
      totalPrice: bookingData.totalPrice,
      flight: bookingData.flight,
      hotel: bookingData.hotel,
      createdAt: new Date()
    }
  }
}
