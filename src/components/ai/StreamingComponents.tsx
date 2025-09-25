'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StreamingComponent } from '../../lib/agents/streaming'
import { I18nService } from '../../config/i18n'
import { A11yService, AriaHelper } from '../../utils/accessibility'

// Flight Card Component
interface FlightCardProps {
  flight: any
  index: number
  selectable: boolean
  showPrice: boolean
  showDuration: boolean
  showStops: boolean
  onSelect?: (flight: any) => void
}

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  index,
  selectable,
  showPrice,
  showDuration,
  showStops,
  onSelect
}) => {
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(flight)
      A11yService.announce(`Voo ${flight.flightNumber} selecionado`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${
        selectable ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...AriaHelper.createButtonProps(
        `Voo ${flight.flightNumber} da ${flight.airline}`,
        false,
        false
      )}
      tabIndex={selectable ? 0 : -1}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{flight.airline}</h3>
            <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
          </div>
        </div>
        {showPrice && (
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              R$ {flight.price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">{flight.class}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Partida</p>
            <p className="font-semibold">{flight.departureTime}</p>
            <p className="text-sm">{flight.origin}</p>
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center">
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className="mx-2 w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            {showDuration && (
              <p className="text-center text-xs text-muted-foreground mt-1">
                {flight.duration}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Chegada</p>
            <p className="font-semibold">{flight.arrivalTime}</p>
            <p className="text-sm">{flight.destination}</p>
          </div>
        </div>

        {showStops && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Aeronave: {flight.aircraft}</span>
            <span className="text-muted-foreground">
              {flight.stops === 0 ? 'Voo direto' : `${flight.stops} escala(s)`}
            </span>
          </div>
        )}

        {selectable && (
          <div className="pt-3 border-t border-border">
            <p className="text-center text-sm text-blue-600 font-medium">
              ✈️ Clique para selecionar este voo
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Hotel Card Component
interface HotelCardProps {
  hotel: any
  index: number
  selectable: boolean
  showRating: boolean
  showAmenities: boolean
  showPrice: boolean
  onSelect?: (hotel: any) => void
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  index,
  selectable,
  showRating,
  showAmenities,
  showPrice,
  onSelect
}) => {
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(hotel)
      A11yService.announce(`Hotel ${hotel.name} selecionado`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${
        selectable ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...AriaHelper.createButtonProps(
        `Hotel ${hotel.name} - ${hotel.category}`,
        false,
        false
      )}
      tabIndex={selectable ? 0 : -1}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{hotel.name}</h3>
            <p className="text-sm text-muted-foreground">{hotel.category}</p>
            <p className="text-sm text-muted-foreground">{hotel.location}</p>
          </div>
        </div>
        {showPrice && (
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              R$ {hotel.price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">por noite</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {showRating && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(hotel.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {hotel.rating.toFixed(1)}/5
            </span>
          </div>
        )}

        {showAmenities && hotel.amenities && (
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 4).map((amenity: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-muted text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground">{hotel.description}</p>

        {selectable && (
          <div className="pt-3 border-t border-border">
            <p className="text-center text-sm text-blue-600 font-medium">
              🏨 Clique para selecionar este hotel
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Price Breakdown Component
interface PriceBreakdownProps {
  breakdown: any
  showDetails: boolean
  showTotal: boolean
  currency: string
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  breakdown,
  showDetails,
  showTotal,
  currency
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-card border border-border rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Resumo da Viagem</h3>
      
      {showDetails && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Voos</span>
            <span>R$ {breakdown.flights?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hotéis</span>
            <span>R$ {breakdown.hotels?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Extras</span>
            <span>R$ {breakdown.extras?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxas</span>
            <span>R$ {breakdown.taxes?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxa de serviço</span>
            <span>R$ {breakdown.fees?.toLocaleString() || '0'}</span>
          </div>
        </div>
      )}

      {showTotal && (
        <div className="border-t border-border pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>R$ {breakdown.total?.toLocaleString() || '0'}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Loading Component
interface LoadingProps {
  message: string
  progress?: number
  showSpinner: boolean
}

export const LoadingComponent: React.FC<LoadingProps> = ({
  message,
  progress,
  showSpinner
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center p-8"
    >
      {showSpinner && (
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      )}
      
      <p className="text-lg font-medium mb-2">{message}</p>
      
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {progress}% concluído
          </p>
        </div>
      )}
    </motion.div>
  )
}

// Error Component
interface ErrorProps {
  message: string
  retry?: () => void
  showIcon: boolean
}

export const ErrorComponent: React.FC<ErrorProps> = ({
  message,
  retry,
  showIcon
}) => {
  const handleRetry = () => {
    if (retry) {
      retry()
      A11yService.announce('Tentando novamente...')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
      {showIcon && (
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-red-800 mb-2">Ops! Algo deu errado</h3>
      <p className="text-red-600 mb-4">{message}</p>
      
      {retry && (
        <motion.button
          onClick={handleRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          {...AriaHelper.createButtonProps('Tentar novamente')}
        >
          Tentar Novamente
        </motion.button>
      )}
    </motion.div>
  )
}

// Main Streaming Renderer
interface StreamingRendererProps {
  components: StreamingComponent[]
  onFlightSelect?: (flight: any) => void
  onHotelSelect?: (hotel: any) => void
  onConfirmReservation?: (data: any) => void
}

export const StreamingRenderer: React.FC<StreamingRendererProps> = ({
  components,
  onFlightSelect,
  onHotelSelect,
  onConfirmReservation
}) => {
  const renderComponent = (component: StreamingComponent) => {
    switch (component.type) {
      case 'flight_card':
        return (
          <FlightCard
            key={component.id}
            {...component.props}
            onSelect={onFlightSelect}
          />
        )
      
      case 'hotel_card':
        return (
          <HotelCard
            key={component.id}
            {...component.props}
            onSelect={onHotelSelect}
          />
        )
      
      case 'price_breakdown':
        return (
          <PriceBreakdown
            key={component.id}
            {...component.props}
          />
        )
      
      case 'loading':
        return (
          <LoadingComponent
            key={component.id}
            {...component.props}
          />
        )
      
      case 'error':
        return (
          <ErrorComponent
            key={component.id}
            {...component.props}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {components.map(renderComponent)}
      </AnimatePresence>
    </div>
  )
}
