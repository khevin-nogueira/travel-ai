import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/src/services/booking-service-prisma'

// POST /api/bookings/[id]/cancel - Cancelar booking
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itineraryId = params.id

    if (!itineraryId) {
      return NextResponse.json(
        { success: false, error: 'Itinerary ID is required' },
        { status: 400 }
      )
    }

    const result = await BookingService.cancelBooking(itineraryId)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Cancel booking API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
