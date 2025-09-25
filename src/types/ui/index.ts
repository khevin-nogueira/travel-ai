// UI Component Types
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

export interface ErrorState {
  hasError: boolean
  message?: string
  code?: string
  retry?: () => void
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'number'
  required: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
}

// Navigation Types
export interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: React.ComponentType
  badge?: number
  children?: NavigationItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  accentColor: string
  fontFamily: string
}

// Accessibility Types
export interface A11yConfig {
  skipLinks: boolean
  focusVisible: boolean
  reducedMotion: boolean
  highContrast: boolean
}

// Internationalization Types
export interface I18nConfig {
  locale: 'pt-BR' | 'en-US'
  fallbackLocale: 'pt-BR' | 'en-US'
  messages: Record<string, string>
}

export interface TranslationKey {
  key: string
  params?: Record<string, string | number>
  count?: number
}
