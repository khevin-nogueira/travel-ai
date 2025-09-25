import { BookingService } from '../../services/booking-service'
import { ComponentGenerator } from './streaming'

// Integração entre streaming e persistência
export class BookingIntegration {
  // Processar confirmação de reserva e salvar no banco
  static async processReservationConfirmation(
    flightData: any,
    hotelData: any,
    passengerInfo: any,
    paymentInfo: any,
    userId: string = 'default-user' // Em produção, viria da autenticação
  ) {
    try {
      // Criar request de booking
      const bookingRequest = {
        userId,
        passengerInfo: {
          firstName: passengerInfo.firstName || 'João',
          lastName: passengerInfo.lastName || 'Silva',
          email: passengerInfo.email || 'joao@email.com',
          phone: passengerInfo.phone || '(11) 99999-9999'
        },
        flightData: {
          airline: flightData.airline || 'LATAM',
          flightNumber: flightData.flightNumber || 'LA1234',
          origin: flightData.origin || 'São Paulo',
          destination: flightData.destination || 'Rio de Janeiro',
          departureTime: flightData.departureTime || new Date().toISOString(),
          arrivalTime: flightData.arrivalTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          duration: flightData.duration || '2h 00min',
          price: flightData.price || 250,
          aircraft: flightData.aircraft || 'Boeing 737',
          class: flightData.class || 'economy',
          stops: flightData.stops || 0
        },
        hotelData: hotelData ? {
          name: hotelData.name || 'Hotel Plaza',
          category: hotelData.category || '4 estrelas',
          location: hotelData.location || 'Rio de Janeiro',
          price: hotelData.price || 300,
          rating: hotelData.rating || 4.5,
          checkin: hotelData.checkin || new Date().toISOString().split('T')[0],
          checkout: hotelData.checkout || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        } : undefined,
        paymentInfo: {
          method: paymentInfo.method || 'credit_card',
          cardNumber: paymentInfo.cardNumber,
          expiryDate: paymentInfo.expiryDate,
          cvv: paymentInfo.cvv
        }
      }

      // Processar booking
      const bookingResult = await BookingService.processBooking(bookingRequest)

      if (bookingResult.success) {
        // Criar componente de confirmação com dados persistidos
        return ComponentGenerator.createConfirmation({
          bookingId: bookingResult.itineraryId,
          confirmationCode: bookingResult.pnr,
          status: 'confirmed',
          totalPrice: bookingResult.totalAmount,
          flight: {
            ...flightData,
            pnr: bookingResult.pnr,
            id: bookingResult.flightId
          },
          hotel: hotelData ? {
            ...hotelData,
            reservationId: bookingResult.reservationId,
            id: bookingResult.hotelId
          } : null,
          createdAt: new Date(),
          details: {
            passenger: bookingRequest.passengerInfo,
            payment: bookingRequest.paymentInfo
          }
        })
      } else {
        // Criar componente de erro
        return ComponentGenerator.createError(
          bookingResult.error || 'Failed to process booking',
          () => this.processReservationConfirmation(flightData, hotelData, passengerInfo, paymentInfo, userId)
        )
      }
    } catch (error) {
      console.error('Booking integration error:', error)
      return ComponentGenerator.createError(
        'Failed to process reservation. Please try again.',
        () => this.processReservationConfirmation(flightData, hotelData, passengerInfo, paymentInfo, userId)
      )
    }
  }

  // Buscar bookings do usuário e criar componentes
  static async getUserBookingsComponents(userId: string) {
    try {
      const result = await BookingService.getUserBookings(userId)

      if (!result.success) {
        return [ComponentGenerator.createError(result.error || 'Failed to fetch bookings')]
      }

      const components = []

      if (result.bookings.length === 0) {
        components.push(ComponentGenerator.createLoading('Nenhuma viagem encontrada'))
      } else {
        // Criar componentes para cada booking
        for (const booking of result.bookings) {
          if (booking.flight) {
            components.push(ComponentGenerator.createFlightCard(booking.flight, 0))
          }
          if (booking.hotel) {
            components.push(ComponentGenerator.createHotelCard(booking.hotel, 0))
          }
        }
      }

      return components
    } catch (error) {
      console.error('Get user bookings error:', error)
      return [ComponentGenerator.createError('Failed to fetch your bookings')]
    }
  }

  // Cancelar booking e criar componente de confirmação
  static async cancelBookingComponent(itineraryId: string) {
    try {
      const result = await BookingService.cancelBooking(itineraryId)

      if (result.success) {
        return ComponentGenerator.createConfirmation({
          bookingId: itineraryId,
          status: 'cancelled',
          message: 'Booking cancelled successfully',
          createdAt: new Date()
        })
      } else {
        return ComponentGenerator.createError(
          result.error || 'Failed to cancel booking',
          () => this.cancelBookingComponent(itineraryId)
        )
      }
    } catch (error) {
      console.error('Cancel booking error:', error)
      return ComponentGenerator.createError('Failed to cancel booking. Please try again.')
    }
  }

  // Buscar booking por PNR e criar componentes
  static async getBookingByPNRComponents(pnr: string) {
    try {
      const result = await BookingService.getBookingByPNR(pnr)

      if (!result.success) {
        return [ComponentGenerator.createError(result.error || 'Booking not found')]
      }

      const components = []

      if (result.flight) {
        components.push(ComponentGenerator.createFlightCard(result.flight, 0))
      }

      if (result.hotel) {
        components.push(ComponentGenerator.createHotelCard(result.hotel, 0))
      }

      if (result.itinerary) {
        components.push(ComponentGenerator.createConfirmation({
          bookingId: result.itinerary.id,
          status: result.itinerary.status,
          totalPrice: result.itinerary.totalAmount,
          createdAt: new Date(result.itinerary.createdAt)
        }))
      }

      return components
    } catch (error) {
      console.error('Get booking by PNR error:', error)
      return [ComponentGenerator.createError('Failed to fetch booking details')]
    }
  }

  // Estatísticas de booking
  static async getBookingStatsComponents() {
    try {
      const result = await BookingService.getBookingStats()

      if (!result.success) {
        return [ComponentGenerator.createError(result.error || 'Failed to fetch stats')]
      }

      const stats = result.stats
      const components = []

      // Criar componente de estatísticas
      components.push(ComponentGenerator.createConfirmation({
        bookingId: 'stats',
        status: 'stats',
        message: 'Booking Statistics',
        stats: {
          flights: stats.flights,
          hotels: stats.hotels,
          itineraries: stats.itineraries
        },
        createdAt: new Date()
      }))

      return components
    } catch (error) {
      console.error('Get booking stats error:', error)
      return [ComponentGenerator.createError('Failed to fetch booking statistics')]
    }
  }
}
