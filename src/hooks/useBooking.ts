'use client'

import { useState, useCallback } from 'react'
import { BookingRequest, BookingResponse } from '../services/booking-service-prisma'

export interface UseBookingReturn {
  // State
  isLoading: boolean
  error: string | null
  bookings: any[]
  stats: any | null

  // Actions
  createBooking: (request: BookingRequest) => Promise<BookingResponse>
  getBookingByPNR: (pnr: string) => Promise<any>
  getUserBookings: (userId: string) => Promise<any>
  cancelBooking: (itineraryId: string) => Promise<any>
  getStats: () => Promise<any>
  clearError: () => void
}

export const useBooking = (): UseBookingReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState<any | null>(null)

  // Criar booking
  const createBooking = useCallback(async (request: BookingRequest): Promise<BookingResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to create booking')
        return result
      }

      // Atualizar lista de bookings se tivermos userId
      if (request.userId) {
        await getUserBookings(request.userId)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return {
        success: false,
        totalAmount: 0,
        currency: 'BRL',
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Buscar booking por PNR
  const getBookingByPNR = useCallback(async (pnr: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings?pnr=${encodeURIComponent(pnr)}`)
      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Booking not found')
        return null
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Buscar bookings do usuário
  const getUserBookings = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings?userId=${encodeURIComponent(userId)}`)
      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to fetch bookings')
        return []
      }

      setBookings(result.bookings || [])
      return result.bookings || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cancelar booking
  const cancelBooking = useCallback(async (itineraryId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${itineraryId}/cancel`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to cancel booking')
        return result
      }

      // Atualizar lista de bookings
      setBookings(prev => prev.filter(booking => booking.itinerary.id !== itineraryId))

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Buscar estatísticas
  const getStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings/stats')
      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to fetch stats')
        return null
      }

      setStats(result.stats)
      return result.stats
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isLoading,
    error,
    bookings,
    stats,

    // Actions
    createBooking,
    getBookingByPNR,
    getUserBookings,
    cancelBooking,
    getStats,
    clearError
  }
}
