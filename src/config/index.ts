// Main Configuration Export
export * from './i18n'

// Re-export all utilities
export { A11yService, AriaHelper, FocusTrap, HighContrastDetector, MotionDetector } from '../utils/accessibility'
export { SecurityService, InputSanitizer, AIContentSanitizer, FileSecurity } from '../utils/security'

// Re-export services
export { ResilienceService, ErrorHandler, LoadingStates } from '../services/api/resilience'

// Re-export agents
export { ToolExecutor, toolRegistry } from '../lib/agents/tools'
export { StreamingService, ComponentGenerator } from '../lib/agents/streaming'

// Re-export types
export * from '../types/agent'
export * from '../types/api'
export * from '../types/ui'

// Re-export validation
export * from '../lib/validation/schemas'

// App Configuration
export const APP_CONFIG = {
  name: 'Sky Travels',
  version: '1.0.0',
  description: 'AI-powered travel planning platform',
  
  // Features
  features: {
    streaming: true,
    resilience: true,
    accessibility: true,
    i18n: true,
    security: true
  },
  
  // Limits
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxMessageLength: 10000,
    maxComponentsPerStream: 50,
    maxRetries: 3
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    retryDelay: 1000
  },
  
  // UI Configuration
  ui: {
    theme: 'system',
    locale: 'pt-BR',
    animations: true,
    reducedMotion: false
  }
} as const

// Environment Configuration
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Feature flags
  features: {
    enableStreaming: process.env.NEXT_PUBLIC_ENABLE_STREAMING !== 'false',
    enableResilience: process.env.NEXT_PUBLIC_ENABLE_RESILIENCE !== 'false',
    enableAccessibility: process.env.NEXT_PUBLIC_ENABLE_ACCESSIBILITY !== 'false',
    enableI18n: process.env.NEXT_PUBLIC_ENABLE_I18N !== 'false',
    enableSecurity: process.env.NEXT_PUBLIC_ENABLE_SECURITY !== 'false'
  }
} as const

// Initialize app
export const initializeApp = () => {
  // Initialize accessibility
  if (typeof window !== 'undefined') {
    // Add skip links
    const skipLink = A11yService.createSkipLink('main-content', 'Pular para o conteúdo principal')
    document.body.insertBefore(skipLink, document.body.firstChild)
    
    // Add live region for announcements
    A11yService.announce('Aplicação carregada com sucesso')
    
    // Initialize high contrast detection
    HighContrastDetector.addHighContrastStyles()
    
    // Set up reduced motion detection
    const motionConfig = MotionDetector.getAnimationConfig()
    document.documentElement.style.setProperty('--animation-duration', `${motionConfig.duration}s`)
    document.documentElement.style.setProperty('--animation-ease', motionConfig.ease)
  }
  
  // Initialize i18n
  I18nService.setLocale(I18nService.getLocale())
  
  console.log('🚀 Sky Travels initialized with features:', APP_CONFIG.features)
}

// Error boundary configuration
export const ERROR_BOUNDARY_CONFIG = {
  fallback: {
    title: 'Algo deu errado',
    description: 'Ocorreu um erro inesperado. Tente recarregar a página.',
    retryText: 'Tentar Novamente'
  },
  
  // Error reporting
  reportError: (error: Error, errorInfo: any) => {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // In production, you might want to send this to an error reporting service
    if (ENV_CONFIG.isProduction) {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }
} as const

// Performance monitoring
export const PERFORMANCE_CONFIG = {
  // Web Vitals thresholds
  thresholds: {
    FCP: 1.8, // First Contentful Paint
    LCP: 2.5, // Largest Contentful Paint
    FID: 100, // First Input Delay
    CLS: 0.1, // Cumulative Layout Shift
    TTFB: 600 // Time to First Byte
  },
  
  // Performance observers
  observe: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Observe Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('Performance metric:', entry.name, entry.value)
        }
      })
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
    }
  }
} as const

// Security headers
export const SECURITY_HEADERS = SecurityService.getSecurityHeaders()

// Export everything
export default {
  APP_CONFIG,
  ENV_CONFIG,
  ERROR_BOUNDARY_CONFIG,
  PERFORMANCE_CONFIG,
  SECURITY_HEADERS,
  initializeApp
}
