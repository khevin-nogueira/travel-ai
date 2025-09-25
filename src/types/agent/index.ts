// Agent Types
export interface AgentMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  structuredData?: StructuredData
}

export interface ToolCall {
  name: string
  arguments: any
  result?: string
}

export interface StructuredData {
  type: 'flights' | 'hotels' | 'destination_info' | 'price_calculation' | 'booking_confirmation'
  data: any
}

// Trip Planning Types
export interface TripRequest {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  class: 'economy' | 'business' | 'first'
}

export interface Flight {
  id: string
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

export interface Hotel {
  id: string
  name: string
  category: string
  location: string
  price: number
  rating: number
  amenities: string[]
  images: string[]
  description: string
}

export interface BookingConfirmation {
  bookingId: string
  flight: Flight
  hotel?: Hotel
  totalPrice: number
  status: 'confirmed' | 'pending' | 'cancelled'
  confirmationCode: string
  createdAt: Date
}

// Conversation State
export interface ConversationState {
  step: 'destination' | 'origin' | 'departure_date' | 'return_date' | 'search_flights' | 'search_hotels' | 'summary'
  data: Partial<TripRequest>
  selectedFlight?: Flight
  selectedHotel?: Hotel
  bookingConfirmation?: BookingConfirmation
}
