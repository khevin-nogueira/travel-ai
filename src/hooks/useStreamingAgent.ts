'use client'

import { useState, useCallback, useRef } from 'react'
import { StreamingComponent } from '../lib/agents/streaming'
import { ToolExecutor } from '../lib/agents/tools'
import { ResilienceService, ErrorHandler } from '../services/api/resilience'
import { I18nService } from '../config/i18n'
import { AIContentSanitizer } from '../utils/security'
import { A11yService } from '../utils/accessibility'
import { BookingIntegration } from '../lib/agents/booking-integration'

export interface UseStreamingAgentReturn {
  // State
  components: StreamingComponent[]
  isLoading: boolean
  error: string | null
  conversationState: string
  
  // Actions
  sendMessage: (message: string) => Promise<void>
  executeTool: (toolName: string, args: any) => Promise<void>
  clearComponents: () => void
  retryLastOperation: () => Promise<void>
  
  // Utilities
  addComponent: (component: StreamingComponent) => void
  removeComponent: (componentId: string) => void
}

export const useStreamingAgent = (): UseStreamingAgentReturn => {
  const [components, setComponents] = useState<StreamingComponent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationState, setConversationState] = useState('idle')
  
  const lastOperationRef = useRef<{ toolName: string; args: any } | null>(null)

  // Add component to the stream
  const addComponent = useCallback((component: StreamingComponent) => {
    setComponents(prev => [...prev, component])
  }, [])

  // Remove component from the stream
  const removeComponent = useCallback((componentId: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId))
  }, [])

  // Clear all components
  const clearComponents = useCallback(() => {
    setComponents([])
    setError(null)
    setConversationState('idle')
  }, [])

  // Execute tool with resilience
  const executeTool = useCallback(async (toolName: string, args: any) => {
    setIsLoading(true)
    setError(null)
    setConversationState('processing')
    
    // Store for retry
    lastOperationRef.current = { toolName, args }

    try {
      // Sanitize input
      const sanitizedArgs = AIContentSanitizer.sanitizeStructuredData(args)
      
      // Execute with retry mechanism
      const result = await ResilienceService.withRetry(async () => {
        return await ToolExecutor.execute(toolName, sanitizedArgs)
      })

      if (!result.success) {
        throw new Error(result.error || 'Tool execution failed')
      }

      // Handle streaming response
      if (result.result.type === 'streaming') {
        const generator = result.result.generator
        
        for await (const component of generator) {
          addComponent(component)
          
          // Announce progress for accessibility
          if (component.type === 'flight_card') {
            A11yService.announce('Novo voo encontrado')
          } else if (component.type === 'hotel_card') {
            A11yService.announce('Novo hotel encontrado')
          } else if (component.type === 'confirmation') {
            A11yService.announce('Reserva confirmada com sucesso!')
          }
        }
      } else {
        // Handle non-streaming response
        const data = result.result.data
        console.log('Tool result:', data)
      }

      setConversationState('completed')
      
    } catch (err) {
      const error = err as Error
      const errorInfo = ErrorHandler.handle(error, 'Tool Execution')
      
      setError(errorInfo.userMessage)
      setConversationState('error')
      
      // Add error component
      addComponent({
        id: `error_${Date.now()}`,
        type: 'error',
        props: {
          message: errorInfo.userMessage,
          retry: errorInfo.retryable ? () => executeTool(toolName, args) : undefined,
          showIcon: true
        },
        priority: 0,
        timestamp: new Date()
      })

      // Announce error for accessibility
      A11yService.announceError(errorInfo.userMessage)
      
    } finally {
      setIsLoading(false)
    }
  }, [addComponent])

  // Send message and process with AI
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    setIsLoading(true)
    setError(null)
    setConversationState('processing')

    try {
      // Sanitize user input
      const sanitizedMessage = AIContentSanitizer.sanitizeAIResponse(message)
      
      // Add user message component
      addComponent({
        id: `user_${Date.now()}`,
        type: 'loading',
        props: {
          message: I18nService.t('ai.processing_message'),
          showSpinner: true
        },
        priority: 0,
        timestamp: new Date()
      })

      // Simulate AI processing with resilience
      await ResilienceService.withRetry(async () => {
        // Simulate processing delay
        await ResilienceService.simulateLatency()
        
        // Determine which tool to call based on message content
        const lowerMessage = sanitizedMessage.toLowerCase()
        
        if (lowerMessage.includes('voos') || lowerMessage.includes('flights')) {
          // Search flights
          const searchCriteria = {
            origin: 'São Paulo',
            destination: 'Rio de Janeiro',
            departureDate: '2024-12-01',
            passengers: 1,
            class: 'economy'
          }
          
          await executeTool('search_flights', { searchCriteria })
          
        } else if (lowerMessage.includes('hotéis') || lowerMessage.includes('hotels')) {
          // Search hotels
          const searchCriteria = {
            destination: 'Rio de Janeiro',
            checkIn: '2024-12-01',
            checkOut: '2024-12-03',
            guests: 2,
            rooms: 1
          }
          
          await executeTool('search_hotels', { searchCriteria })
          
        } else if (lowerMessage.includes('reservar') || lowerMessage.includes('book')) {
          // Book flight/hotel with persistence
          const flightData = {
            airline: 'LATAM',
            flightNumber: 'LA1234',
            origin: 'São Paulo',
            destination: 'Rio de Janeiro',
            departureTime: new Date().toISOString(),
            arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            duration: '2h 00min',
            price: 250,
            aircraft: 'Boeing 737',
            class: 'economy',
            stops: 0
          }

          const hotelData = {
            name: 'Hotel Plaza',
            category: '4 estrelas',
            location: 'Rio de Janeiro',
            price: 300,
            rating: 4.5,
            checkin: new Date().toISOString().split('T')[0],
            checkout: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }

          const passengerInfo = {
            firstName: 'João',
            lastName: 'Silva',
            email: 'joao@email.com',
            phone: '(11) 99999-9999'
          }

          const paymentInfo = {
            method: 'credit_card',
            cardNumber: '1234567890123456',
            expiryDate: '12/25',
            cvv: '123'
          }

          // Processar reserva com persistência
          const confirmationComponent = await BookingIntegration.processReservationConfirmation(
            flightData,
            hotelData,
            passengerInfo,
            paymentInfo,
            'default-user'
          )

          addComponent(confirmationComponent)
          
        } else {
          // Default response
          addComponent({
            id: `ai_${Date.now()}`,
            type: 'loading',
            props: {
              message: I18nService.t('ai.thinking'),
              showSpinner: true
            },
            priority: 0,
            timestamp: new Date()
          })
          
          // Simulate thinking time
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Remove thinking component
          removeComponent(`ai_${Date.now()}`)
          
          // Add response component
          addComponent({
            id: `response_${Date.now()}`,
            type: 'loading',
            props: {
              message: I18nService.t('ai.ask_destination'),
              showSpinner: false
            },
            priority: 1,
            timestamp: new Date()
          })
        }
      })

      setConversationState('completed')
      
    } catch (err) {
      const error = err as Error
      const errorInfo = ErrorHandler.handle(error, 'Message Processing')
      
      setError(errorInfo.userMessage)
      setConversationState('error')
      
      A11yService.announceError(errorInfo.userMessage)
      
    } finally {
      setIsLoading(false)
    }
  }, [executeTool, addComponent, removeComponent])

  // Retry last operation
  const retryLastOperation = useCallback(async () => {
    if (lastOperationRef.current) {
      const { toolName, args } = lastOperationRef.current
      await executeTool(toolName, args)
    }
  }, [executeTool])

  return {
    // State
    components,
    isLoading,
    error,
    conversationState,
    
    // Actions
    sendMessage,
    executeTool,
    clearComponents,
    retryLastOperation,
    
    // Utilities
    addComponent,
    removeComponent
  }
}
