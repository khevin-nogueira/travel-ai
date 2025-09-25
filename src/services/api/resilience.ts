// Resilience Service for handling latency and errors
export class ResilienceService {
  private static readonly MIN_LATENCY = 300
  private static readonly MAX_LATENCY = 1200
  private static readonly ERROR_RATE = 0.15 // 15%

  // Simulate network latency
  static async simulateLatency(): Promise<void> {
    const delay = Math.random() * (this.MAX_LATENCY - this.MIN_LATENCY) + this.MIN_LATENCY
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  // Simulate random errors
  static shouldSimulateError(): boolean {
    return Math.random() < this.ERROR_RATE
  }

  // Generate random error types
  static generateRandomError(): {
    type: 'network' | 'timeout' | 'server' | 'validation' | 'payment'
    message: string
    retryable: boolean
  } {
    const errors = [
      {
        type: 'network' as const,
        message: 'Erro de conexão. Verifique sua internet.',
        retryable: true
      },
      {
        type: 'timeout' as const,
        message: 'Tempo limite excedido. Tente novamente.',
        retryable: true
      },
      {
        type: 'server' as const,
        message: 'Erro interno do servidor. Tente novamente em alguns minutos.',
        retryable: true
      },
      {
        type: 'validation' as const,
        message: 'Dados inválidos. Verifique as informações.',
        retryable: false
      },
      {
        type: 'payment' as const,
        message: 'Erro no processamento do pagamento. Verifique os dados do cartão.',
        retryable: true
      }
    ]

    return errors[Math.floor(Math.random() * errors.length)]
  }

  // Retry mechanism with exponential backoff
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Simulate latency
        await this.simulateLatency()

        // Simulate error
        if (this.shouldSimulateError() && attempt < maxRetries) {
          const error = this.generateRandomError()
          throw new Error(`${error.type}: ${error.message}`)
        }

        // Execute operation
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (attempt === maxRetries) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  // Circuit breaker pattern
  static createCircuitBreaker(
    operation: () => Promise<any>,
    failureThreshold: number = 5,
    timeout: number = 60000
  ) {
    let failures = 0
    let lastFailureTime = 0
    let state: 'closed' | 'open' | 'half-open' = 'closed'

    return async () => {
      const now = Date.now()

      // Check if circuit should be reset
      if (state === 'open' && now - lastFailureTime > timeout) {
        state = 'half-open'
      }

      // If circuit is open, reject immediately
      if (state === 'open') {
        throw new Error('Circuit breaker is open. Service temporarily unavailable.')
      }

      try {
        const result = await operation()
        
        // Reset on success
        if (state === 'half-open') {
          state = 'closed'
          failures = 0
        }
        
        return result
      } catch (error) {
        failures++
        lastFailureTime = now

        if (failures >= failureThreshold) {
          state = 'open'
        }

        throw error
      }
    }
  }

  // Health check
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    latency: number
    errorRate: number
  }> {
    const start = Date.now()
    
    try {
      await this.simulateLatency()
      const latency = Date.now() - start
      
      return {
        status: 'healthy',
        latency,
        errorRate: 0
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        errorRate: 1
      }
    }
  }
}

// Error Handler
export class ErrorHandler {
  static handle(error: Error, context: string): {
    userMessage: string
    technicalMessage: string
    retryable: boolean
    action?: string
  } {
    console.error(`[${context}] Error:`, error)

    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        userMessage: 'Problema de conexão. Verifique sua internet e tente novamente.',
        technicalMessage: error.message,
        retryable: true,
        action: 'retry'
      }
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return {
        userMessage: 'A operação demorou muito para responder. Tente novamente.',
        technicalMessage: error.message,
        retryable: true,
        action: 'retry'
      }
    }

    // Validation errors
    if (error.message.includes('validation')) {
      return {
        userMessage: 'Dados inválidos. Verifique as informações e tente novamente.',
        technicalMessage: error.message,
        retryable: false,
        action: 'fix_data'
      }
    }

    // Payment errors
    if (error.message.includes('payment')) {
      return {
        userMessage: 'Erro no pagamento. Verifique os dados do cartão.',
        technicalMessage: error.message,
        retryable: true,
        action: 'retry_payment'
      }
    }

    // Server errors
    if (error.message.includes('server') || error.message.includes('500')) {
      return {
        userMessage: 'Erro interno. Tente novamente em alguns minutos.',
        technicalMessage: error.message,
        retryable: true,
        action: 'retry_later'
      }
    }

    // Default error
    return {
      userMessage: 'Ocorreu um erro inesperado. Tente novamente.',
      technicalMessage: error.message,
      retryable: true,
      action: 'retry'
    }
  }
}

// Loading States
export class LoadingStates {
  static createSkeleton(type: 'flight' | 'hotel' | 'price' | 'confirmation') {
    const skeletons = {
      flight: {
        height: '200px',
        elements: ['header', 'content', 'price']
      },
      hotel: {
        height: '250px',
        elements: ['image', 'content', 'rating', 'price']
      },
      price: {
        height: '150px',
        elements: ['breakdown', 'total']
      },
      confirmation: {
        height: '300px',
        elements: ['header', 'details', 'actions']
      }
    }

    return skeletons[type]
  }

  static createProgressSteps(steps: string[], currentStep: number) {
    return steps.map((step, index) => ({
      step,
      completed: index < currentStep,
      current: index === currentStep,
      pending: index > currentStep
    }))
  }
}
