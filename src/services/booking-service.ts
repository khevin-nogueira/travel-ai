import { v4 as uuidv4 } from 'uuid'
import { FlightRepository } from '../lib/database/repositories/flight-repository'
import { HotelRepository } from '../lib/database/repositories/hotel-repository'
import { ItineraryRepository } from '../lib/database/repositories/itinerary-repository'
import { FlightStatus, HotelStatus, ItineraryStatus } from '../lib/database/schema'

// Tipos para o serviço de booking
export interface BookingRequest {
  userId: string
  passengerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  flightData: {
    airline: string
    flightNumber: string
    origin: string
    destination: string
    departureTime: string
    arrivalTime: string
    duration: string
    price: number
    aircraft: string
    class: string
    stops: number
  }
  hotelData?: {
    name: string
    category: string
    location: string
    price: number
    rating: number
    checkin: string
    checkout: string
  }
  paymentInfo: {
    method: 'credit_card' | 'pix' | 'boleto'
    cardNumber?: string
    expiryDate?: string
    cvv?: string
  }
}

export interface BookingResponse {
  success: boolean
  itineraryId?: string
  flightId?: string
  hotelId?: string
  pnr?: string
  reservationId?: string
  totalAmount: number
  currency: string
  error?: string
}

export class BookingService {
  // Gerar PNR (Passenger Name Record)
  private static generatePNR(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Gerar Reservation ID para hotel
  private static generateReservationId(): string {
    return `HTL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  // Processar booking completo
  static async processBooking(request: BookingRequest): Promise<BookingResponse> {
    try {
      // 1. Criar itinerário
      const itineraryId = uuidv4()
      const itinerary = await ItineraryRepository.create({
        id: itineraryId,
        userId: request.userId,
        status: ItineraryStatus.ACTIVE,
        totalAmount: request.flightData.price + (request.hotelData?.price || 0),
        currency: 'BRL',
        origin: request.flightData.origin,
        destination: request.flightData.destination,
        departureDate: request.flightData.departureTime.split(' ')[0], // Extrair data
        returnDate: null, // Para viagens de ida e volta
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // 2. Criar voo
      const flightId = uuidv4()
      const pnr = this.generatePNR()
      const flight = await FlightRepository.create({
        id: flightId,
        pnr,
        status: FlightStatus.TICKETED,
        total: request.flightData.price,
        currency: 'BRL',
        passengerName: `${request.passengerInfo.firstName} ${request.passengerInfo.lastName}`,
        passengerEmail: request.passengerInfo.email,
        itineraryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // 3. Adicionar voo ao itinerário
      await ItineraryRepository.addFlight(itineraryId, flightId)

      let hotelId: string | undefined
      let reservationId: string | undefined

      // 4. Criar hotel (se fornecido)
      if (request.hotelData) {
        hotelId = uuidv4()
        reservationId = this.generateReservationId()
        
        const hotel = await HotelRepository.create({
          id: hotelId,
          reservationId,
          status: HotelStatus.BOOKED,
          total: request.hotelData.price,
          currency: 'BRL',
          guestName: `${request.passengerInfo.firstName} ${request.passengerInfo.lastName}`,
          guestEmail: request.passengerInfo.email,
          hotelId: request.hotelData.name, // Em produção, seria um ID real do hotel
          checkin: request.hotelData.checkin,
          checkout: request.hotelData.checkout,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

        // Adicionar hotel ao itinerário
        await ItineraryRepository.addHotel(itineraryId, hotelId)
      }

      return {
        success: true,
        itineraryId,
        flightId,
        hotelId,
        pnr,
        reservationId,
        totalAmount: itinerary.totalAmount,
        currency: itinerary.currency
      }

    } catch (error) {
      console.error('Booking error:', error)
      return {
        success: false,
        totalAmount: 0,
        currency: 'BRL',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Buscar booking por PNR
  static async getBookingByPNR(pnr: string) {
    try {
      const flight = await FlightRepository.findByPNR(pnr)
      if (!flight) {
        return { success: false, error: 'Booking not found' }
      }

      const completeItinerary = await ItineraryRepository.getCompleteItinerary(flight.itineraryId)
      if (!completeItinerary) {
        return { success: false, error: 'Itinerary not found' }
      }

      return {
        success: true,
        itinerary: completeItinerary.itinerary,
        flight: completeItinerary.flights[0],
        hotel: completeItinerary.hotels[0] || null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Cancelar booking
  static async cancelBooking(itineraryId: string) {
    try {
      // Cancelar itinerário
      const itinerary = await ItineraryRepository.cancel(itineraryId)
      if (!itinerary) {
        return { success: false, error: 'Itinerary not found' }
      }

      // Cancelar voos
      const flights = await FlightRepository.findByItineraryId(itineraryId)
      for (const flight of flights) {
        await FlightRepository.cancel(flight.id)
      }

      // Cancelar hotéis
      const hotels = await HotelRepository.findByHotelId(itineraryId) // Simplificado
      for (const hotel of hotels) {
        await HotelRepository.cancel(hotel.id)
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Buscar bookings do usuário
  static async getUserBookings(userId: string) {
    try {
      const itineraries = await ItineraryRepository.findByUserId(userId)
      const bookings = []

      for (const itinerary of itineraries) {
        const completeItinerary = await ItineraryRepository.getCompleteItinerary(itinerary.id)
        if (completeItinerary) {
          bookings.push({
            itinerary: completeItinerary.itinerary,
            flight: completeItinerary.flights[0] || null,
            hotel: completeItinerary.hotels[0] || null
          })
        }
      }

      return { success: true, bookings }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Estatísticas de booking
  static async getBookingStats() {
    try {
      const flightStats = await FlightRepository.getStats()
      const hotelStats = await HotelRepository.getStats()
      const itineraryStats = await ItineraryRepository.getStats()

      return {
        success: true,
        stats: {
          flights: flightStats,
          hotels: hotelStats,
          itineraries: itineraryStats
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Buscar booking por ID do itinerário
  static async getBookingById(itineraryId: string) {
    try {
      const completeItinerary = await ItineraryRepository.getCompleteItinerary(itineraryId)
      if (!completeItinerary) {
        return { success: false, error: 'Booking not found' }
      }

      return {
        success: true,
        itinerary: completeItinerary.itinerary,
        flight: completeItinerary.flights[0] || null,
        hotel: completeItinerary.hotels[0] || null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
