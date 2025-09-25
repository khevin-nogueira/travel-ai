// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Flight Search API
export interface FlightSearchRequest {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  class: string
}

export interface FlightSearchResponse {
  outboundFlights: Flight[]
  returnFlights?: Flight[]
  totalFound: number
  priceRange: {
    min: number
    max: number
  }
}

// Hotel Search API
export interface HotelSearchRequest {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
  rooms: number
}

export interface HotelSearchResponse {
  hotels: Hotel[]
  totalFound: number
  priceRange: {
    min: number
    max: number
  }
}

// Booking API
export interface BookingRequest {
  flightId: string
  hotelId?: string
  passengerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  paymentInfo: {
    method: 'credit_card' | 'pix' | 'boleto'
    cardNumber?: string
    expiryDate?: string
    cvv?: string
  }
}

export interface BookingResponse {
  bookingId: string
  confirmationCode: string
  status: 'confirmed' | 'pending' | 'failed'
  totalPrice: number
  flight: Flight
  hotel?: Hotel
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Re-export from agent types
export type { Flight, Hotel, BookingConfirmation } from '../agent'
