import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FlightCard, HotelCard, LoadingComponent, ErrorComponent } from '../StreamingComponents'

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock accessibility service
vi.mock('../../../utils/accessibility', () => ({
  A11yService: {
    announce: vi.fn(),
    announceError: vi.fn(),
  },
  AriaHelper: {
    createButtonProps: (label: string) => ({
      'aria-label': label,
      role: 'button',
      tabIndex: 0,
    }),
  },
}))

describe('StreamingComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FlightCard', () => {
    const mockFlight = {
      id: 'flight_1',
      airline: 'LATAM',
      flightNumber: 'LA1234',
      origin: 'São Paulo',
      destination: 'Rio de Janeiro',
      departureTime: '08:00',
      arrivalTime: '09:15',
      duration: '1h 15min',
      price: 250,
      aircraft: 'Boeing 737',
      class: 'economy',
      stops: 0
    }

    it('should render flight card with all information', () => {
      render(
        <FlightCard
          flight={mockFlight}
          index={0}
          selectable={true}
          showPrice={true}
          showDuration={true}
          showStops={true}
        />
      )

      expect(screen.getByText('LATAM')).toBeInTheDocument()
      expect(screen.getByText('LA1234')).toBeInTheDocument()
      expect(screen.getByText('São Paulo')).toBeInTheDocument()
      expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument()
      expect(screen.getByText('08:00')).toBeInTheDocument()
      expect(screen.getByText('09:15')).toBeInTheDocument()
      expect(screen.getByText('1h 15min')).toBeInTheDocument()
      expect(screen.getByText('R$ 250')).toBeInTheDocument()
      expect(screen.getByText('Voo direto')).toBeInTheDocument()
    })

    it('should call onSelect when clicked', () => {
      const onSelect = vi.fn()
      
      render(
        <FlightCard
          flight={mockFlight}
          index={0}
          selectable={true}
          showPrice={true}
          showDuration={true}
          showStops={true}
          onSelect={onSelect}
        />
      )

      const card = screen.getByRole('button')
      fireEvent.click(card)

      expect(onSelect).toHaveBeenCalledWith(mockFlight)
    })

    it('should call onSelect when Enter key is pressed', () => {
      const onSelect = vi.fn()
      
      render(
        <FlightCard
          flight={mockFlight}
          index={0}
          selectable={true}
          showPrice={true}
          showDuration={true}
          showStops={true}
          onSelect={onSelect}
        />
      )

      const card = screen.getByRole('button')
      fireEvent.keyDown(card, { key: 'Enter' })

      expect(onSelect).toHaveBeenCalledWith(mockFlight)
    })

    it('should not be selectable when selectable is false', () => {
      render(
        <FlightCard
          flight={mockFlight}
          index={0}
          selectable={false}
          showPrice={true}
          showDuration={true}
          showStops={true}
        />
      )

      const card = screen.getByRole('button')
      expect(card).toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('HotelCard', () => {
    const mockHotel = {
      id: 'hotel_1',
      name: 'Hotel Plaza',
      category: '4 estrelas',
      location: 'Rio de Janeiro',
      price: 300,
      rating: 4.5,
      amenities: ['Wi-Fi', 'Piscina', 'Academia'],
      description: 'Hotel confortável no centro'
    }

    it('should render hotel card with all information', () => {
      render(
        <HotelCard
          hotel={mockHotel}
          index={0}
          selectable={true}
          showRating={true}
          showAmenities={true}
          showPrice={true}
        />
      )

      expect(screen.getByText('Hotel Plaza')).toBeInTheDocument()
      expect(screen.getByText('4 estrelas')).toBeInTheDocument()
      expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument()
      expect(screen.getByText('R$ 300')).toBeInTheDocument()
      expect(screen.getByText('4.5/5')).toBeInTheDocument()
      expect(screen.getByText('Wi-Fi')).toBeInTheDocument()
      expect(screen.getByText('Piscina')).toBeInTheDocument()
      expect(screen.getByText('Academia')).toBeInTheDocument()
      expect(screen.getByText('Hotel confortável no centro')).toBeInTheDocument()
    })

    it('should call onSelect when clicked', () => {
      const onSelect = vi.fn()
      
      render(
        <HotelCard
          hotel={mockHotel}
          index={0}
          selectable={true}
          showRating={true}
          showAmenities={true}
          showPrice={true}
          onSelect={onSelect}
        />
      )

      const card = screen.getByRole('button')
      fireEvent.click(card)

      expect(onSelect).toHaveBeenCalledWith(mockHotel)
    })
  })

  describe('LoadingComponent', () => {
    it('should render loading message', () => {
      render(
        <LoadingComponent
          message="Buscando voos disponíveis..."
          showSpinner={true}
        />
      )

      expect(screen.getByText('Buscando voos disponíveis...')).toBeInTheDocument()
    })

    it('should render progress bar when progress is provided', () => {
      render(
        <LoadingComponent
          message="Processando..."
          progress={50}
          showSpinner={true}
        />
      )

      expect(screen.getByText('50% concluído')).toBeInTheDocument()
    })

    it('should not render spinner when showSpinner is false', () => {
      render(
        <LoadingComponent
          message="Processando..."
          showSpinner={false}
        />
      )

      // Spinner should not be present
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('ErrorComponent', () => {
    it('should render error message', () => {
      render(
        <ErrorComponent
          message="Erro ao buscar voos. Tente novamente."
          showIcon={true}
        />
      )

      expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument()
      expect(screen.getByText('Erro ao buscar voos. Tente novamente.')).toBeInTheDocument()
    })

    it('should render retry button when retry function is provided', () => {
      const retry = vi.fn()
      
      render(
        <ErrorComponent
          message="Erro ao buscar voos. Tente novamente."
          retry={retry}
          showIcon={true}
        />
      )

      const retryButton = screen.getByText('Tentar Novamente')
      expect(retryButton).toBeInTheDocument()

      fireEvent.click(retryButton)
      expect(retry).toHaveBeenCalled()
    })

    it('should not render retry button when retry function is not provided', () => {
      render(
        <ErrorComponent
          message="Erro ao buscar voos. Tente novamente."
          showIcon={true}
        />
      )

      expect(screen.queryByText('Tentar Novamente')).not.toBeInTheDocument()
    })

    it('should not render icon when showIcon is false', () => {
      render(
        <ErrorComponent
          message="Erro ao buscar voos. Tente novamente."
          showIcon={false}
        />
      )

      // Icon should not be present
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })
})
