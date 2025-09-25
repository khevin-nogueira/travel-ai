// Security and Sanitization Utilities
import DOMPurify from 'isomorphic-dompurify'

export class SecurityService {
  // HTML sanitization
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span'],
      ALLOWED_ATTR: ['class', 'id'],
      ALLOW_DATA_ATTR: false
    })
  }

  // Text sanitization (remove potentially dangerous characters)
  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }

  // URL validation
  static isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    return phoneRegex.test(phone)
  }

  // Credit card validation (Luhn algorithm)
  static isValidCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '')
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false
    }

    let sum = 0
    let isEven = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  // XSS prevention
  static preventXSS(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // SQL injection prevention (basic)
  static preventSQLInjection(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
  }

  // Input validation
  static validateInput(input: any, type: 'string' | 'number' | 'email' | 'phone' | 'url'): boolean {
    switch (type) {
      case 'string':
        return typeof input === 'string' && input.length > 0
      case 'number':
        return typeof input === 'number' && !isNaN(input)
      case 'email':
        return this.isValidEmail(input)
      case 'phone':
        return this.isValidPhone(input)
      case 'url':
        return this.isValidURL(input)
      default:
        return false
    }
  }

  // Rate limiting (client-side)
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests: number[] = []

    return (): boolean => {
      const now = Date.now()
      const windowStart = now - windowMs

      // Remove old requests
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift()
      }

      // Check if limit exceeded
      if (requests.length >= maxRequests) {
        return false
      }

      // Add current request
      requests.push(now)
      return true
    }
  }

  // Content Security Policy
  static generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }

  // Secure headers
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': this.generateCSP(),
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
}

// Input sanitizer for forms
export class InputSanitizer {
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = SecurityService.sanitizeText(value)
      } else if (typeof value === 'number') {
        sanitized[key] = value
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? SecurityService.sanitizeText(item) : item
        )
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeFormData(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  static validateFormData(data: Record<string, any>, schema: Record<string, string>): {
    isValid: boolean
    errors: Record<string, string>
  } {
    const errors: Record<string, string> = {}

    for (const [field, type] of Object.entries(schema)) {
      const value = data[field]

      if (!SecurityService.validateInput(value, type as any)) {
        errors[field] = `Campo ${field} é inválido`
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// Content sanitizer for AI responses
export class AIContentSanitizer {
  static sanitizeAIResponse(response: string): string {
    // Remove potentially dangerous HTML
    let sanitized = SecurityService.sanitizeHTML(response)

    // Remove script tags and event handlers
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    sanitized = sanitized.replace(/on\w+\s*=/gi, '')

    // Remove data URIs that could be dangerous
    sanitized = sanitized.replace(/data:(?!image\/[png|jpg|jpeg|gif|webp])/gi, '')

    // Limit length to prevent DoS
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000) + '...'
    }

    return sanitized
  }

  static sanitizeStructuredData(data: any): any {
    if (typeof data === 'string') {
      return SecurityService.sanitizeText(data)
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeStructuredData(item))
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeStructuredData(value)
      }
      return sanitized
    }

    return data
  }
}

// File upload security
export class FileSecurity {
  static allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  static maxFileSize = 5 * 1024 * 1024 // 5MB

  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!this.allowedImageTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP.'
      }
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: 'Arquivo muito grande. Máximo 5MB.'
      }
    }

    return { isValid: true }
  }

  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase()
  }
}
