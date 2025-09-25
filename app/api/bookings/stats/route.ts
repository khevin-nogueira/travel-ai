import { NextResponse } from 'next/server'
import { BookingService } from '@/src/services/booking-service-prisma'

// GET /api/bookings/stats - Estatísticas de bookings
export async function GET() {
  try {
    const result = await BookingService.getBookingStats()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
