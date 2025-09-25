// Internationalization Configuration
export type Locale = 'pt-BR' | 'en-US'

export interface I18nConfig {
  locale: Locale
  fallbackLocale: Locale
  messages: Record<string, Record<Locale, string>>
}

// Translation Keys
export const translationKeys = {
  // Navigation
  NAV_HOME: 'nav.home',
  NAV_MY_TRIPS: 'nav.my_trips',
  
  // Common
  COMMON_LOADING: 'common.loading',
  COMMON_ERROR: 'common.error',
  COMMON_RETRY: 'common.retry',
  COMMON_CANCEL: 'common.cancel',
  COMMON_CONFIRM: 'common.confirm',
  COMMON_SAVE: 'common.save',
  COMMON_DELETE: 'common.delete',
  COMMON_EDIT: 'common.edit',
  COMMON_CLOSE: 'common.close',
  
  // Trip Planning
  TRIP_ORIGIN: 'trip.origin',
  TRIP_DESTINATION: 'trip.destination',
  TRIP_DEPARTURE_DATE: 'trip.departure_date',
  TRIP_RETURN_DATE: 'trip.return_date',
  TRIP_PASSENGERS: 'trip.passengers',
  TRIP_CLASS: 'trip.class',
  
  // Flights
  FLIGHT_AIRLINE: 'flight.airline',
  FLIGHT_NUMBER: 'flight.number',
  FLIGHT_DEPARTURE: 'flight.departure',
  FLIGHT_ARRIVAL: 'flight.arrival',
  FLIGHT_DURATION: 'flight.duration',
  FLIGHT_PRICE: 'flight.price',
  FLIGHT_STOPS: 'flight.stops',
  FLIGHT_SELECT: 'flight.select',
  
  // Hotels
  HOTEL_NAME: 'hotel.name',
  HOTEL_CATEGORY: 'hotel.category',
  HOTEL_LOCATION: 'hotel.location',
  HOTEL_RATING: 'hotel.rating',
  HOTEL_AMENITIES: 'hotel.amenities',
  HOTEL_PRICE: 'hotel.price',
  HOTEL_SELECT: 'hotel.select',
  
  // Booking
  BOOKING_CONFIRM: 'booking.confirm',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_PENDING: 'booking.pending',
  BOOKING_CONFIRMATION_CODE: 'booking.confirmation_code',
  BOOKING_TOTAL_PRICE: 'booking.total_price',
  
  // Errors
  ERROR_NETWORK: 'error.network',
  ERROR_TIMEOUT: 'error.timeout',
  ERROR_VALIDATION: 'error.validation',
  ERROR_PAYMENT: 'error.payment',
  ERROR_SERVER: 'error.server',
  
  // Success
  SUCCESS_BOOKING: 'success.booking',
  SUCCESS_SAVED: 'success.saved',
  SUCCESS_UPDATED: 'success.updated',
  
  // AI Assistant
  AI_WELCOME: 'ai.welcome',
  AI_ASK_DESTINATION: 'ai.ask_destination',
  AI_ASK_ORIGIN: 'ai.ask_origin',
  AI_ASK_DATES: 'ai.ask_dates',
  AI_SEARCHING_FLIGHTS: 'ai.searching_flights',
  AI_SEARCHING_HOTELS: 'ai.searching_hotels',
  AI_BOOKING_CONFIRMED: 'ai.booking_confirmed'
} as const

// Messages
export const messages: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    // Navigation
    [translationKeys.NAV_HOME]: 'Início',
    [translationKeys.NAV_MY_TRIPS]: 'Minhas Viagens',
    
    // Common
    [translationKeys.COMMON_LOADING]: 'Carregando...',
    [translationKeys.COMMON_ERROR]: 'Erro',
    [translationKeys.COMMON_RETRY]: 'Tentar Novamente',
    [translationKeys.COMMON_CANCEL]: 'Cancelar',
    [translationKeys.COMMON_CONFIRM]: 'Confirmar',
    [translationKeys.COMMON_SAVE]: 'Salvar',
    [translationKeys.COMMON_DELETE]: 'Excluir',
    [translationKeys.COMMON_EDIT]: 'Editar',
    [translationKeys.COMMON_CLOSE]: 'Fechar',
    
    // Trip Planning
    [translationKeys.TRIP_ORIGIN]: 'Origem',
    [translationKeys.TRIP_DESTINATION]: 'Destino',
    [translationKeys.TRIP_DEPARTURE_DATE]: 'Data de Ida',
    [translationKeys.TRIP_RETURN_DATE]: 'Data de Volta',
    [translationKeys.TRIP_PASSENGERS]: 'Passageiros',
    [translationKeys.TRIP_CLASS]: 'Classe',
    
    // Flights
    [translationKeys.FLIGHT_AIRLINE]: 'Companhia',
    [translationKeys.FLIGHT_NUMBER]: 'Número do Voo',
    [translationKeys.FLIGHT_DEPARTURE]: 'Partida',
    [translationKeys.FLIGHT_ARRIVAL]: 'Chegada',
    [translationKeys.FLIGHT_DURATION]: 'Duração',
    [translationKeys.FLIGHT_PRICE]: 'Preço',
    [translationKeys.FLIGHT_STOPS]: 'Escalas',
    [translationKeys.FLIGHT_SELECT]: 'Selecionar Voo',
    
    // Hotels
    [translationKeys.HOTEL_NAME]: 'Nome do Hotel',
    [translationKeys.HOTEL_CATEGORY]: 'Categoria',
    [translationKeys.HOTEL_LOCATION]: 'Localização',
    [translationKeys.HOTEL_RATING]: 'Avaliação',
    [translationKeys.HOTEL_AMENITIES]: 'Comodidades',
    [translationKeys.HOTEL_PRICE]: 'Preço',
    [translationKeys.HOTEL_SELECT]: 'Selecionar Hotel',
    
    // Booking
    [translationKeys.BOOKING_CONFIRM]: 'Confirmar Reserva',
    [translationKeys.BOOKING_CANCELLED]: 'Cancelada',
    [translationKeys.BOOKING_PENDING]: 'Pendente',
    [translationKeys.BOOKING_CONFIRMATION_CODE]: 'Código de Confirmação',
    [translationKeys.BOOKING_TOTAL_PRICE]: 'Preço Total',
    
    // Errors
    [translationKeys.ERROR_NETWORK]: 'Erro de conexão. Verifique sua internet.',
    [translationKeys.ERROR_TIMEOUT]: 'Tempo limite excedido. Tente novamente.',
    [translationKeys.ERROR_VALIDATION]: 'Dados inválidos. Verifique as informações.',
    [translationKeys.ERROR_PAYMENT]: 'Erro no pagamento. Verifique os dados do cartão.',
    [translationKeys.ERROR_SERVER]: 'Erro interno. Tente novamente em alguns minutos.',
    
    // Success
    [translationKeys.SUCCESS_BOOKING]: 'Reserva confirmada com sucesso!',
    [translationKeys.SUCCESS_SAVED]: 'Salvo com sucesso!',
    [translationKeys.SUCCESS_UPDATED]: 'Atualizado com sucesso!',
    
    // AI Assistant
    [translationKeys.AI_WELCOME]: 'Olá! Sou a Lívia Assist, sua assistente pessoal de viagem da Sky Travels! ✈️',
    [translationKeys.AI_ASK_DESTINATION]: 'Para onde você gostaria de viajar? 🌍',
    [translationKeys.AI_ASK_ORIGIN]: 'De onde você está partindo? ✈️',
    [translationKeys.AI_ASK_DATES]: 'Quando você quer viajar? 📅',
    [translationKeys.AI_SEARCHING_FLIGHTS]: 'Buscando voos disponíveis... 🔍',
    [translationKeys.AI_SEARCHING_HOTELS]: 'Buscando hotéis disponíveis... 🏨',
    [translationKeys.AI_BOOKING_CONFIRMED]: 'Reserva confirmada! Você receberá todas as informações por WhatsApp. 🎉'
  },
  
  'en-US': {
    // Navigation
    [translationKeys.NAV_HOME]: 'Home',
    [translationKeys.NAV_MY_TRIPS]: 'My Trips',
    
    // Common
    [translationKeys.COMMON_LOADING]: 'Loading...',
    [translationKeys.COMMON_ERROR]: 'Error',
    [translationKeys.COMMON_RETRY]: 'Try Again',
    [translationKeys.COMMON_CANCEL]: 'Cancel',
    [translationKeys.COMMON_CONFIRM]: 'Confirm',
    [translationKeys.COMMON_SAVE]: 'Save',
    [translationKeys.COMMON_DELETE]: 'Delete',
    [translationKeys.COMMON_EDIT]: 'Edit',
    [translationKeys.COMMON_CLOSE]: 'Close',
    
    // Trip Planning
    [translationKeys.TRIP_ORIGIN]: 'Origin',
    [translationKeys.TRIP_DESTINATION]: 'Destination',
    [translationKeys.TRIP_DEPARTURE_DATE]: 'Departure Date',
    [translationKeys.TRIP_RETURN_DATE]: 'Return Date',
    [translationKeys.TRIP_PASSENGERS]: 'Passengers',
    [translationKeys.TRIP_CLASS]: 'Class',
    
    // Flights
    [translationKeys.FLIGHT_AIRLINE]: 'Airline',
    [translationKeys.FLIGHT_NUMBER]: 'Flight Number',
    [translationKeys.FLIGHT_DEPARTURE]: 'Departure',
    [translationKeys.FLIGHT_ARRIVAL]: 'Arrival',
    [translationKeys.FLIGHT_DURATION]: 'Duration',
    [translationKeys.FLIGHT_PRICE]: 'Price',
    [translationKeys.FLIGHT_STOPS]: 'Stops',
    [translationKeys.FLIGHT_SELECT]: 'Select Flight',
    
    // Hotels
    [translationKeys.HOTEL_NAME]: 'Hotel Name',
    [translationKeys.HOTEL_CATEGORY]: 'Category',
    [translationKeys.HOTEL_LOCATION]: 'Location',
    [translationKeys.HOTEL_RATING]: 'Rating',
    [translationKeys.HOTEL_AMENITIES]: 'Amenities',
    [translationKeys.HOTEL_PRICE]: 'Price',
    [translationKeys.HOTEL_SELECT]: 'Select Hotel',
    
    // Booking
    [translationKeys.BOOKING_CONFIRM]: 'Confirm Booking',
    [translationKeys.BOOKING_CANCELLED]: 'Cancelled',
    [translationKeys.BOOKING_PENDING]: 'Pending',
    [translationKeys.BOOKING_CONFIRMATION_CODE]: 'Confirmation Code',
    [translationKeys.BOOKING_TOTAL_PRICE]: 'Total Price',
    
    // Errors
    [translationKeys.ERROR_NETWORK]: 'Connection error. Check your internet.',
    [translationKeys.ERROR_TIMEOUT]: 'Timeout exceeded. Try again.',
    [translationKeys.ERROR_VALIDATION]: 'Invalid data. Check the information.',
    [translationKeys.ERROR_PAYMENT]: 'Payment error. Check your card details.',
    [translationKeys.ERROR_SERVER]: 'Internal error. Try again in a few minutes.',
    
    // Success
    [translationKeys.SUCCESS_BOOKING]: 'Booking confirmed successfully!',
    [translationKeys.SUCCESS_SAVED]: 'Saved successfully!',
    [translationKeys.SUCCESS_UPDATED]: 'Updated successfully!',
    
    // AI Assistant
    [translationKeys.AI_WELCOME]: 'Hello! I\'m Lívia Assist, your personal travel assistant from Sky Travels! ✈️',
    [translationKeys.AI_ASK_DESTINATION]: 'Where would you like to travel? 🌍',
    [translationKeys.AI_ASK_ORIGIN]: 'Where are you departing from? ✈️',
    [translationKeys.AI_ASK_DATES]: 'When do you want to travel? 📅',
    [translationKeys.AI_SEARCHING_FLIGHTS]: 'Searching available flights... 🔍',
    [translationKeys.AI_SEARCHING_HOTELS]: 'Searching available hotels... 🏨',
    [translationKeys.AI_BOOKING_CONFIRMED]: 'Booking confirmed! You\'ll receive all information via WhatsApp. 🎉'
  }
}

// I18n Hook
export class I18nService {
  private static currentLocale: Locale = 'pt-BR'
  
  static setLocale(locale: Locale) {
    this.currentLocale = locale
    localStorage.setItem('sky-travels-locale', locale)
  }
  
  static getLocale(): Locale {
    const saved = localStorage.getItem('sky-travels-locale') as Locale
    return saved || this.currentLocale
  }
  
  static t(key: string, params?: Record<string, string | number>): string {
    const locale = this.getLocale()
    const message = messages[locale]?.[key] || messages['pt-BR'][key] || key
    
    if (params) {
      return message.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return String(params[param] || match)
      })
    }
    
    return message
  }
  
  static formatCurrency(amount: number, currency: string = 'BRL'): string {
    const locale = this.getLocale()
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }
  
  static formatDate(date: Date): string {
    const locale = this.getLocale()
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }
}
