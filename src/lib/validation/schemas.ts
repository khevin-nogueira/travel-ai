import { z } from 'zod'

// Base schemas
export const FlightClassSchema = z.enum(['economy', 'business', 'first'])
export const PaymentMethodSchema = z.enum(['credit_card', 'pix', 'boleto'])

// Trip Request Schema
export const TripRequestSchema = z.object({
  origin: z.string().min(2, 'Origem deve ter pelo menos 2 caracteres'),
  destination: z.string().min(2, 'Destino deve ter pelo menos 2 caracteres'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  passengers: z.number().min(1, 'Deve ter pelo menos 1 passageiro').max(9, 'Máximo 9 passageiros'),
  class: FlightClassSchema
})

// Flight Search Schema
export const FlightSearchSchema = z.object({
  origin: z.string().min(2, 'Origem é obrigatória'),
  destination: z.string().min(2, 'Destino é obrigatório'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable(),
  passengers: z.number().min(1).max(9),
  class: FlightClassSchema
})

// Hotel Search Schema
export const HotelSearchSchema = z.object({
  destination: z.string().min(2, 'Destino é obrigatório'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de check-in inválida'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de check-out inválida'),
  guests: z.number().min(1, 'Mínimo 1 hóspede').max(8, 'Máximo 8 hóspedes'),
  rooms: z.number().min(1, 'Mínimo 1 quarto').max(5, 'Máximo 5 quartos')
})

// Passenger Info Schema
export const PassengerInfoSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
})

// Payment Info Schema
export const PaymentInfoSchema = z.object({
  method: PaymentMethodSchema,
  cardNumber: z.string().regex(/^\d{16}$/, 'Número do cartão deve ter 16 dígitos').optional(),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Data deve estar no formato MM/AA').optional(),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV deve ter 3 ou 4 dígitos').optional()
}).refine((data) => {
  if (data.method === 'credit_card') {
    return data.cardNumber && data.expiryDate && data.cvv
  }
  return true
}, {
  message: 'Informações do cartão são obrigatórias para pagamento com cartão',
  path: ['cardNumber']
})

// Booking Request Schema
export const BookingRequestSchema = z.object({
  flightId: z.string().min(1, 'ID do voo é obrigatório'),
  hotelId: z.string().optional(),
  passengerInfo: PassengerInfoSchema,
  paymentInfo: PaymentInfoSchema
})

// Agent Tool Schemas
export const SearchFlightsToolSchema = z.object({
  searchCriteria: FlightSearchSchema,
  outboundFlights: z.array(z.object({
    id: z.string(),
    airline: z.string(),
    flightNumber: z.string(),
    origin: z.string(),
    destination: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    duration: z.string(),
    price: z.number(),
    aircraft: z.string(),
    class: z.string(),
    stops: z.number()
  })),
  returnFlights: z.array(z.object({
    id: z.string(),
    airline: z.string(),
    flightNumber: z.string(),
    origin: z.string(),
    destination: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    duration: z.string(),
    price: z.number(),
    aircraft: z.string(),
    class: z.string(),
    stops: z.number()
  })).optional(),
  totalFound: z.number(),
  priceRange: z.object({
    min: z.number(),
    max: z.number()
  })
})

export const SearchHotelsToolSchema = z.object({
  searchCriteria: HotelSearchSchema,
  hotels: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    location: z.string(),
    price: z.number(),
    rating: z.number(),
    amenities: z.array(z.string()),
    images: z.array(z.string()),
    description: z.string()
  })),
  totalFound: z.number(),
  priceRange: z.object({
    min: z.number(),
    max: z.number()
  })
})

export const BookFlightToolSchema = z.object({
  flightId: z.string(),
  passengerInfo: PassengerInfoSchema,
  paymentInfo: PaymentInfoSchema
})

export const BookHotelToolSchema = z.object({
  hotelId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number(),
  rooms: z.number(),
  guestInfo: PassengerInfoSchema,
  paymentInfo: PaymentInfoSchema
})

// Type exports
export type TripRequest = z.infer<typeof TripRequestSchema>
export type FlightSearch = z.infer<typeof FlightSearchSchema>
export type HotelSearch = z.infer<typeof HotelSearchSchema>
export type PassengerInfo = z.infer<typeof PassengerInfoSchema>
export type PaymentInfo = z.infer<typeof PaymentInfoSchema>
export type BookingRequest = z.infer<typeof BookingRequestSchema>
export type SearchFlightsTool = z.infer<typeof SearchFlightsToolSchema>
export type SearchHotelsTool = z.infer<typeof SearchHotelsToolSchema>
export type BookFlightTool = z.infer<typeof BookFlightToolSchema>
export type BookHotelTool = z.infer<typeof BookHotelToolSchema>
