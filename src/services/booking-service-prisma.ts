import { prisma } from '../lib/prisma'
import { v4 as uuidv4 } from 'uuid'

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
      const itinerary = await prisma.itinerary.create({
        data: {
          userId: request.userId,
          status: 'ACTIVE',
          totalAmount: request.flightData.price + (request.hotelData?.price || 0),
          currency: 'BRL',
          origin: request.flightData.origin,
          destination: request.flightData.destination,
          departureDate: request.flightData.departureTime.split(' ')[0], // Extrair data
          returnDate: null, // Para viagens de ida e volta
        }
      })

      // 2. Criar voo
      const pnr = this.generatePNR()
      const flight = await prisma.flight.create({
        data: {
          pnr,
          status: 'TICKETED',
          total: request.flightData.price,
          currency: 'BRL',
          passengerName: `${request.passengerInfo.firstName} ${request.passengerInfo.lastName}`,
          passengerEmail: request.passengerInfo.email,
          departureTime: request.flightData.departureTime,
          arrivalTime: request.flightData.arrivalTime,
          origin: request.flightData.origin,
          destination: request.flightData.destination,
          flightNumber: request.flightData.flightNumber,
          airline: request.flightData.airline,
        }
      })

      // 3. Adicionar voo ao itinerário
      await prisma.itineraryFlight.create({
        data: {
          itineraryId: itinerary.id,
          flightId: flight.id,
        }
      })

      let hotelId: string | undefined
      let reservationId: string | undefined

      // 4. Criar hotel (se fornecido)
      if (request.hotelData) {
        reservationId = this.generateReservationId()
        
        const hotel = await prisma.hotel.create({
          data: {
            reservationId,
            status: 'BOOKED',
            total: request.hotelData.price,
            currency: 'BRL',
            guestName: `${request.passengerInfo.firstName} ${request.passengerInfo.lastName}`,
            guestEmail: request.passengerInfo.email,
            hotelId: request.hotelData.name, // Em produção, seria um ID real do hotel
            hotelName: request.hotelData.name,
            checkin: request.hotelData.checkin,
            checkout: request.hotelData.checkout,
          }
        })

        hotelId = hotel.id

        // Adicionar hotel ao itinerário
        await prisma.itineraryHotel.create({
          data: {
            itineraryId: itinerary.id,
            hotelId: hotel.id,
          }
        })
      }

      return {
        success: true,
        itineraryId: itinerary.id,
        flightId: flight.id,
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
      const flight = await prisma.flight.findUnique({
        where: { pnr },
        include: {
          itineraries: {
            include: {
              itinerary: {
                include: {
                  flights: {
                    include: {
                      flight: true
                    }
                  },
                  hotels: {
                    include: {
                      hotel: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!flight) {
        return { success: false, error: 'Booking not found' }
      }

      const itinerary = flight.itineraries[0]?.itinerary
      if (!itinerary) {
        return { success: false, error: 'Itinerary not found' }
      }

      return {
        success: true,
        itinerary,
        flight,
        hotel: itinerary.hotels[0]?.hotel || null
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
      const itinerary = await prisma.itinerary.update({
        where: { id: itineraryId },
        data: { status: 'CANCELLED' }
      })

      if (!itinerary) {
        return { success: false, error: 'Itinerary not found' }
      }

      // Cancelar voos
      await prisma.flight.updateMany({
        where: {
          itineraries: {
            some: {
              itineraryId: itineraryId
            }
          }
        },
        data: { status: 'CANCELED' }
      })

      // Cancelar hotéis
      await prisma.hotel.updateMany({
        where: {
          itineraries: {
            some: {
              itineraryId: itineraryId
            }
          }
        },
        data: { status: 'CANCELED' }
      })

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
      const itineraries = await prisma.itinerary.findMany({
        where: { userId },
        include: {
          flights: {
            include: {
              flight: true
            }
          },
          hotels: {
            include: {
              hotel: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const bookings = itineraries.map(itinerary => ({
        itinerary,
        flight: itinerary.flights[0]?.flight || null,
        hotel: itinerary.hotels[0]?.hotel || null
      }))

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
      const [flightCount, hotelCount, itineraryCount, flightRevenue, hotelRevenue] = await Promise.all([
        prisma.flight.count(),
        prisma.hotel.count(),
        prisma.itinerary.count(),
        prisma.flight.aggregate({
          _sum: { total: true }
        }),
        prisma.hotel.aggregate({
          _sum: { total: true }
        })
      ])

      return {
        success: true,
        stats: {
          flights: {
            count: flightCount,
            revenue: flightRevenue._sum.total || 0
          },
          hotels: {
            count: hotelCount,
            revenue: hotelRevenue._sum.total || 0
          },
          itineraries: {
            count: itineraryCount
          }
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
      const itinerary = await prisma.itinerary.findUnique({
        where: { id: itineraryId },
        include: {
          flights: {
            include: {
              flight: true
            }
          },
          hotels: {
            include: {
              hotel: true
            }
          }
        }
      })

      if (!itinerary) {
        return { success: false, error: 'Booking not found' }
      }

      return {
        success: true,
        itinerary,
        flight: itinerary.flights[0]?.flight || null,
        hotel: itinerary.hotels[0]?.hotel || null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
