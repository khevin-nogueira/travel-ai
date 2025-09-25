import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/src/services/booking-service-prisma'

// POST /api/bookings - Criar novo booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados obrigatórios
    if (!body.userId || !body.passengerInfo || !body.flightData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Processar booking
    const result = await BookingService.processBooking(body)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/bookings?userId=xxx - Buscar bookings do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const pnr = searchParams.get('pnr')
    const itineraryId = searchParams.get('itineraryId')

    if (pnr) {
      // Buscar por PNR
      const result = await BookingService.getBookingByPNR(pnr)
      return NextResponse.json(result)
    }

    if (itineraryId) {
      // Buscar por ID do itinerário
      const result = await BookingService.getBookingById(itineraryId)
      return NextResponse.json(result)
    }

    if (userId) {
      // Buscar bookings do usuário
      const result = await BookingService.getUserBookings(userId)
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { success: false, error: 'Missing userId, pnr, or itineraryId parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Get bookings API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
