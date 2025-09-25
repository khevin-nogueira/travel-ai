import React from 'react';
import { motion } from 'framer-motion';

interface FlightData {
  searchCriteria: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    class: string;
  };
  outboundFlights: Array<{
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    aircraft: string;
    class: string;
  }>;
  returnFlights: Array<{
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    aircraft: string;
    class: string;
  }>;
  totalFound: number;
  priceRange: {
    min: number;
    max: number;
  };
}

interface HotelData {
  searchCriteria: {
    city: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
  };
  hotels: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    amenities: string;
    price: number;
    rating: number;
    reviews: number;
    checkIn: string;
    checkOut: string;
  }>;
  totalFound: number;
  priceRange: {
    min: number;
    max: number;
  };
}

interface DestinationInfo {
  destination: string;
  info: {
    weather: string;
    attractions: string;
    culture: string;
    safety: string;
    transport: string;
  };
}

interface PriceCalculation {
  breakdown: {
    flights: number;
    hotels: number;
    extras: number;
    taxes: number;
    total: number;
  };
  summary: string;
}

interface StructuredDataDisplayProps {
  data: {
    type: string;
    data: any;
  };
  onFlightSelect?: (flight: any) => void;
  onHotelSelect?: (hotel: any) => void;
}

export const StructuredDataDisplay: React.FC<StructuredDataDisplayProps> = ({ data, onFlightSelect, onHotelSelect }) => {
  const renderFlights = (flightData: FlightData) => (
    <motion.div
      className="mt-4 w-full max-w-[450px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Voos Encontrados</h3>
            <p className="text-white/80 text-sm">
              {flightData.totalFound} opções • R$ {flightData.priceRange.min} - R$ {flightData.priceRange.max}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          {flightData.outboundFlights.map((flight, index) => (
            <motion.div
              key={flight.id}
              className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onFlightSelect?.(flight)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {flight.airline.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {flight.airline}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Voo {flight.flightNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    R$ {flight.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {flight.duration}
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  ✈️ Clique para selecionar este voo
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {flight.departureTime}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {flight.origin}
                    </div>
                  </div>
                  
                  <div className="flex-1 mx-4 relative">
                    <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {flight.aircraft}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {flight.arrivalTime}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {flight.destination}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderHotels = (hotelData: HotelData) => (
    <motion.div
      className="mt-4 w-full max-w-[450px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-t-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Hotéis Encontrados</h3>
            <p className="text-white/80 text-sm">
              {hotelData.totalFound} opções • R$ {hotelData.priceRange.min} - R$ {hotelData.priceRange.max}/noite
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          {hotelData.hotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onHotelSelect?.(hotel)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                      {hotel.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {hotel.category} • {hotel.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>⭐ {hotel.rating}</span>
                      <span>•</span>
                      <span>{hotel.reviews} avaliações</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    R$ {hotel.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    por noite
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  🏨 Clique para selecionar este hotel
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="mb-1">
                  <strong>Comodidades:</strong> {hotel.amenities}
                </div>
                <div>
                  <strong>Check-in:</strong> {hotel.checkIn} • <strong>Check-out:</strong> {hotel.checkOut}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderDestinationInfo = (destInfo: DestinationInfo) => (
    <motion.div
      className="mt-4 w-full max-w-[450px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-t-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Informações sobre {destInfo.destination}</h3>
            <p className="text-white/80 text-sm">Dados atualizados para sua viagem</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              🌤️ Clima
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{destInfo.info.weather}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              🏛️ Principais Atrações
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{destInfo.info.attractions}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              🎭 Cultura
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{destInfo.info.culture}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              🛡️ Segurança
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{destInfo.info.safety}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              🚌 Transporte
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{destInfo.info.transport}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderPriceCalculation = (priceData: PriceCalculation) => (
    <motion.div
      className="mt-4 w-full max-w-[450px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-t-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Cálculo de Preços</h3>
            <p className="text-white/80 text-sm">Resumo detalhado dos custos</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Voos:</span>
            <span className="font-medium">R$ {priceData.breakdown.flights.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Hospedagem:</span>
            <span className="font-medium">R$ {priceData.breakdown.hotels.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Extras:</span>
            <span className="font-medium">R$ {priceData.breakdown.extras.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Impostos:</span>
            <span className="font-medium">R$ {priceData.breakdown.taxes.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                R$ {priceData.breakdown.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  switch (data.type) {
    case 'flights':
      return renderFlights(data.data as FlightData);
    case 'hotels':
      return renderHotels(data.data as HotelData);
    case 'destination_info':
      return renderDestinationInfo(data.data as DestinationInfo);
    case 'price_calculation':
      return renderPriceCalculation(data.data as PriceCalculation);
    default:
      return null;
  }
};
