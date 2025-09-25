// Accessibility Utilities
export class A11yService {
  // Focus management
  static focusElement(element: HTMLElement | null) {
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Skip links
  static createSkipLink(targetId: string, label: string): HTMLElement {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = label
    skipLink.className = 'skip-link'
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      border-radius: 4px;
      transition: top 0.3s;
    `
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px'
    })
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px'
    })
    
    return skipLink
  }

  // ARIA live regions for announcements
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const liveRegion = document.getElementById('a11y-live-region') || this.createLiveRegion()
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = ''
    }, 1000)
  }

  private static createLiveRegion(): HTMLElement {
    const liveRegion = document.createElement('div')
    liveRegion.id = 'a11y-live-region'
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(liveRegion)
    return liveRegion
  }

  // Keyboard navigation
  static handleKeyboardNavigation(
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number
  ): number {
    const { key } = event
    
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        return Math.min(currentIndex + 1, elements.length - 1)
      
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        return Math.max(currentIndex - 1, 0)
      
      case 'Home':
        event.preventDefault()
        return 0
      
      case 'End':
        event.preventDefault()
        return elements.length - 1
      
      case 'Enter':
      case ' ':
        event.preventDefault()
        elements[currentIndex]?.click()
        return currentIndex
      
      default:
        return currentIndex
    }
  }

  // Screen reader announcements
  static announcePageChange(pageTitle: string) {
    this.announce(`Navegando para ${pageTitle}`)
    document.title = `${pageTitle} - Sky Travels`
  }

  static announceError(errorMessage: string) {
    this.announce(`Erro: ${errorMessage}`, 'assertive')
  }

  static announceSuccess(successMessage: string) {
    this.announce(`Sucesso: ${successMessage}`, 'polite')
  }

  // Form validation announcements
  static announceFieldError(fieldName: string, errorMessage: string) {
    this.announce(`Erro no campo ${fieldName}: ${errorMessage}`, 'assertive')
  }

  static announceFieldSuccess(fieldName: string) {
    this.announce(`Campo ${fieldName} preenchido corretamente`, 'polite')
  }
}

// ARIA attributes helper
export class AriaHelper {
  static createButtonProps(
    label: string,
    pressed?: boolean,
    expanded?: boolean,
    controls?: string
  ) {
    return {
      'aria-label': label,
      'aria-pressed': pressed,
      'aria-expanded': expanded,
      'aria-controls': controls,
      role: 'button',
      tabIndex: 0
    }
  }

  static createDialogProps(title: string, description?: string) {
    return {
      'aria-labelledby': title,
      'aria-describedby': description,
      role: 'dialog',
      'aria-modal': 'true'
    }
  }

  static createListProps(label: string, multiSelectable = false) {
    return {
      'aria-label': label,
      'aria-multiselectable': multiSelectable,
      role: 'listbox'
    }
  }

  static createOptionProps(
    label: string,
    selected = false,
    disabled = false
  ) {
    return {
      'aria-label': label,
      'aria-selected': selected,
      'aria-disabled': disabled,
      role: 'option',
      tabIndex: selected ? 0 : -1
    }
  }

  static createProgressProps(
    value: number,
    max: number,
    label: string
  ) {
    return {
      'aria-valuenow': value,
      'aria-valuemax': max,
      'aria-valuemin': 0,
      'aria-label': label,
      role: 'progressbar'
    }
  }
}

// Focus trap for modals
export class FocusTrap {
  private static activeTrap: FocusTrap | null = null
  private container: HTMLElement
  private firstFocusable: HTMLElement | null = null
  private lastFocusable: HTMLElement | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.setup()
  }

  private setup() {
    // Find focusable elements
    const focusableElements = this.container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    this.firstFocusable = focusableElements[0] || null
    this.lastFocusable = focusableElements[focusableElements.length - 1] || null

    // Add event listeners
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this))
    
    // Focus first element
    if (this.firstFocusable) {
      this.firstFocusable.focus()
    }

    // Set as active trap
    FocusTrap.activeTrap = this
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === this.firstFocusable) {
          event.preventDefault()
          this.lastFocusable?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === this.lastFocusable) {
          event.preventDefault()
          this.firstFocusable?.focus()
        }
      }
    }
  }

  destroy() {
    this.container.removeEventListener('keydown', this.handleKeyDown.bind(this))
    if (FocusTrap.activeTrap === this) {
      FocusTrap.activeTrap = null
    }
  }
}

// High contrast mode detection
export class HighContrastDetector {
  static isHighContrast(): boolean {
    // Check for high contrast mode
    if (window.matchMedia) {
      return window.matchMedia('(prefers-contrast: high)').matches
    }
    return false
  }

  static addHighContrastStyles() {
    if (this.isHighContrast()) {
      const style = document.createElement('style')
      style.textContent = `
        .high-contrast {
          border: 2px solid currentColor !important;
          background: transparent !important;
        }
        .high-contrast:focus {
          outline: 3px solid currentColor !important;
          outline-offset: 2px !important;
        }
      `
      document.head.appendChild(style)
    }
  }
}

// Reduced motion detection
export class MotionDetector {
  static prefersReducedMotion(): boolean {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  }

  static getAnimationConfig() {
    return {
      duration: this.prefersReducedMotion() ? 0 : 0.3,
      ease: this.prefersReducedMotion() ? 'linear' : 'easeInOut'
    }
  }
}
