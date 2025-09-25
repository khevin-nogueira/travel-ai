import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStreamingAgent } from '../useStreamingAgent'

// Mock the streaming service
vi.mock('../../lib/agents/streaming', () => ({
  StreamingService: {
    streamFlights: vi.fn(),
    streamHotels: vi.fn(),
    streamBooking: vi.fn(),
  },
}))

// Mock the tool executor
vi.mock('../../lib/agents/tools', () => ({
  ToolExecutor: {
    execute: vi.fn(),
  },
}))

// Mock resilience service
vi.mock('../../services/api/resilience', () => ({
  ResilienceService: {
    withRetry: vi.fn((fn) => fn()),
    simulateLatency: vi.fn(() => Promise.resolve()),
  },
  ErrorHandler: {
    handle: vi.fn((error) => ({
      userMessage: error.message,
      retryable: true,
    })),
  },
}))

// Mock i18n service
vi.mock('../../config/i18n', () => ({
  I18nService: {
    t: vi.fn((key) => key),
  },
}))

// Mock security utils
vi.mock('../../utils/security', () => ({
  AIContentSanitizer: {
    sanitizeAIResponse: vi.fn((text) => text),
    sanitizeStructuredData: vi.fn((data) => data),
  },
}))

// Mock accessibility service
vi.mock('../../utils/accessibility', () => ({
  A11yService: {
    announce: vi.fn(),
    announceError: vi.fn(),
  },
}))

describe('useStreamingAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useStreamingAgent())

    expect(result.current.components).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.conversationState).toBe('idle')
  })

  it('should add component when addComponent is called', () => {
    const { result } = renderHook(() => useStreamingAgent())

    const component = {
      id: 'test-component',
      type: 'loading' as const,
      props: { message: 'Test message' },
      priority: 1,
      timestamp: new Date(),
    }

    act(() => {
      result.current.addComponent(component)
    })

    expect(result.current.components).toHaveLength(1)
    expect(result.current.components[0]).toEqual(component)
  })

  it('should remove component when removeComponent is called', () => {
    const { result } = renderHook(() => useStreamingAgent())

    const component = {
      id: 'test-component',
      type: 'loading' as const,
      props: { message: 'Test message' },
      priority: 1,
      timestamp: new Date(),
    }

    act(() => {
      result.current.addComponent(component)
    })

    expect(result.current.components).toHaveLength(1)

    act(() => {
      result.current.removeComponent('test-component')
    })

    expect(result.current.components).toHaveLength(0)
  })

  it('should clear all components when clearComponents is called', () => {
    const { result } = renderHook(() => useStreamingAgent())

    const component1 = {
      id: 'component-1',
      type: 'loading' as const,
      props: { message: 'Test 1' },
      priority: 1,
      timestamp: new Date(),
    }

    const component2 = {
      id: 'component-2',
      type: 'loading' as const,
      props: { message: 'Test 2' },
      priority: 1,
      timestamp: new Date(),
    }

    act(() => {
      result.current.addComponent(component1)
      result.current.addComponent(component2)
    })

    expect(result.current.components).toHaveLength(2)

    act(() => {
      result.current.clearComponents()
    })

    expect(result.current.components).toHaveLength(0)
    expect(result.current.error).toBe(null)
    expect(result.current.conversationState).toBe('idle')
  })

  it('should handle sendMessage with flight search', async () => {
    const { result } = renderHook(() => useStreamingAgent())

    // Mock tool execution
    const mockExecute = vi.fn().mockResolvedValue({
      success: true,
      result: {
        type: 'streaming',
        generator: (async function* () {
          yield {
            id: 'flight-1',
            type: 'flight_card',
            props: { flight: { id: '1', airline: 'LATAM' } },
            priority: 1,
            timestamp: new Date(),
          }
        })(),
      },
    })

    vi.mocked(require('../../lib/agents/tools').ToolExecutor.execute).mockImplementation(mockExecute)

    await act(async () => {
      await result.current.sendMessage('buscar voos para São Paulo')
    })

    expect(mockExecute).toHaveBeenCalledWith('search_flights', expect.any(Object))
    expect(result.current.conversationState).toBe('completed')
  })

  it('should handle sendMessage with hotel search', async () => {
    const { result } = renderHook(() => useStreamingAgent())

    const mockExecute = vi.fn().mockResolvedValue({
      success: true,
      result: {
        type: 'streaming',
        generator: (async function* () {
          yield {
            id: 'hotel-1',
            type: 'hotel_card',
            props: { hotel: { id: '1', name: 'Hotel Plaza' } },
            priority: 1,
            timestamp: new Date(),
          }
        })(),
      },
    })

    vi.mocked(require('../../lib/agents/tools').ToolExecutor.execute).mockImplementation(mockExecute)

    await act(async () => {
      await result.current.sendMessage('buscar hotéis no Rio de Janeiro')
    })

    expect(mockExecute).toHaveBeenCalledWith('search_hotels', expect.any(Object))
    expect(result.current.conversationState).toBe('completed')
  })

  it('should handle sendMessage with booking', async () => {
    const { result } = renderHook(() => useStreamingAgent())

    const mockExecute = vi.fn().mockResolvedValue({
      success: true,
      result: {
        type: 'streaming',
        generator: (async function* () {
          yield {
            id: 'booking-1',
            type: 'confirmation',
            props: { booking: { id: '1', status: 'confirmed' } },
            priority: 1,
            timestamp: new Date(),
          }
        })(),
      },
    })

    vi.mocked(require('../../lib/agents/tools').ToolExecutor.execute).mockImplementation(mockExecute)

    await act(async () => {
      await result.current.sendMessage('reservar voo')
    })

    expect(mockExecute).toHaveBeenCalledWith('book_flight', expect.any(Object))
    expect(result.current.conversationState).toBe('completed')
  })

  it('should handle tool execution errors', async () => {
    const { result } = renderHook(() => useStreamingAgent())

    const mockExecute = vi.fn().mockRejectedValue(new Error('Tool execution failed'))

    vi.mocked(require('../../lib/agents/tools').ToolExecutor.execute).mockImplementation(mockExecute)

    await act(async () => {
      await result.current.sendMessage('buscar voos')
    })

    expect(result.current.error).toBe('Tool execution failed')
    expect(result.current.conversationState).toBe('error')
    expect(result.current.components).toHaveLength(1)
    expect(result.current.components[0].type).toBe('error')
  })

  it('should handle executeTool with streaming response', async () => {
    const { result } = renderHook(() => useStreamingAgent())

    const mockExecute = vi.fn().mockResolvedValue({
      success: true,
      result: {
        type: 'streaming',
        generator: (async function* () {
          yield {
            id: 'component-1',
            type: 'flight_card',
            props: { flight: { id: '1' } },
            priority: 1,
            timestamp: new Date(),
          }
        })(),
      },
    })

    vi.mocked(require('../../lib/agents/tools').ToolExecutor.execute).mockImplementation(mockExecute)

    await act(async () => {
      await result.current.executeTool('search_flights', { searchCriteria: {} })
    })

    expect(mockExecute).toHaveBeenCalledWith('search_flights', {})
    expect(result.current.components).toHaveLength(1)
    expect(result.current.components[0].type).toBe('flight_card')
  })

  it('should handle executeTool with non-streaming response', async () => {
    const { result } = renderHook(() => useStreamingAgent())

    const mockExecute = vi.fn().mockResolvedValue({
      success: true,
      result: {
        type: 'data',
        data: { flights: [] },
      },
    })

    vi.mocked(require('../../lib/agents/tools').ToolExecutor.execute).mockImplementation(mockExecute)

    await act(async () => {
      await result.current.executeTool('get_destination_info', { destination: 'Rio' })
    })

    expect(mockExecute).toHaveBeenCalledWith('get_destination_info', { destination: 'Rio' })
    expect(result.current.conversationState).toBe('completed')
  })

  it('should retry last operation when retryLastOperation is called', async () => {
    const { result } = renderHook(() => useStreamingAgent())

    const mockExecute = vi.fn().mockResolvedValue({
      success: true,
      result: { type: 'data', data: {} },
    })

    vi.mocked(require('../../lib/agents/tools').ToolExecutor.execute).mockImplementation(mockExecute)

    // First, execute a tool to set up the last operation
    await act(async () => {
      await result.current.executeTool('search_flights', { searchCriteria: {} })
    })

    // Then retry
    await act(async () => {
      await result.current.retryLastOperation()
    })

    expect(mockExecute).toHaveBeenCalledTimes(2)
    expect(mockExecute).toHaveBeenNthCalledWith(2, 'search_flights', { searchCriteria: {} })
  })
})
