import { test, expect } from '@playwright/test'

test.describe('Error Handling and Retry Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should handle network errors with retry', async ({ page }) => {
    // Mock network failures
    await page.route('**/api/**', route => {
      // Simulate 100% failure rate for this test
      route.abort('failed')
    })

    await test.step('Open AI chat and trigger error', async () => {
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.click()
      
      const chatInput = page.locator('[data-testid="chat-input"]')
      await chatInput.fill('buscar voos para São Paulo')
      await chatInput.press('Enter')
    })

    await test.step('Verify error state', async () => {
      // Wait for error component
      await page.waitForSelector('[data-testid="error-component"]', { timeout: 10000 })
      
      const errorComponent = page.locator('[data-testid="error-component"]')
      await expect(errorComponent).toBeVisible()
      
      // Verify error message
      await expect(errorComponent).toContainText('Erro')
      await expect(errorComponent).toContainText('conexão')
      
      // Verify retry button is present
      const retryButton = errorComponent.getByRole('button', { name: /Tentar Novamente/i })
      await expect(retryButton).toBeVisible()
    })

    await test.step('Test retry functionality', async () => {
      // Remove the network failure mock
      await page.unroute('**/api/**')
      
      // Click retry button
      const retryButton = page.getByRole('button', { name: /Tentar Novamente/i })
      await retryButton.click()
      
      // Wait for retry to complete successfully
      await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 })
      
      // Verify flight cards are now displayed
      const flightCards = page.locator('[data-testid="flight-card"]')
      await expect(flightCards).toHaveCount(5)
    })
  })

  test('should handle timeout errors', async ({ page }) => {
    // Mock slow responses
    await page.route('**/api/**', async route => {
      // Simulate very slow response
      await new Promise(resolve => setTimeout(resolve, 5000))
      route.continue()
    })

    await test.step('Trigger timeout scenario', async () => {
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.click()
      
      const chatInput = page.locator('[data-testid="chat-input"]')
      await chatInput.fill('buscar voos')
      await chatInput.press('Enter')
      
      // Wait for loading state
      await expect(page.locator('text=Carregando')).toBeVisible()
    })

    await test.step('Verify timeout handling', async () => {
      // Wait for either success or timeout error
      await Promise.race([
        page.waitForSelector('[data-testid="flight-card"]', { timeout: 3000 }),
        page.waitForSelector('[data-testid="error-component"]', { timeout: 3000 })
      ])
      
      // Check if timeout error occurred
      const errorComponent = page.locator('[data-testid="error-component"]')
      if (await errorComponent.isVisible()) {
        await expect(errorComponent).toContainText('tempo limite')
      }
    })
  })

  test('should handle validation errors', async ({ page }) => {
    await test.step('Test invalid input handling', async () => {
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.click()
      
      const chatInput = page.locator('[data-testid="chat-input"]')
      
      // Test empty input
      await chatInput.fill('')
      await chatInput.press('Enter')
      
      // Should not send empty message
      await expect(page.locator('[data-testid="ai-message"]')).not.toBeVisible()
      
      // Test very long input
      const longMessage = 'a'.repeat(10001) // Exceeds max length
      await chatInput.fill(longMessage)
      await chatInput.press('Enter')
      
      // Should truncate or reject long message
      const sentMessage = page.locator('[data-testid="user-message"]').last()
      if (await sentMessage.isVisible()) {
        const messageText = await sentMessage.textContent()
        expect(messageText?.length).toBeLessThanOrEqual(10000)
      }
    })
  })

  test('should handle payment errors with retry', async ({ page }) => {
    await test.step('Complete booking flow to payment', async () => {
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.click()
      
      // Search and select flight
      const chatInput = page.locator('[data-testid="chat-input"]')
      await chatInput.fill('buscar voos para São Paulo')
      await chatInput.press('Enter')
      
      await page.waitForSelector('[data-testid="flight-card"]', { timeout: 10000 })
      await page.locator('[data-testid="flight-card"]').first().click()
      
      // Search and select hotel
      await chatInput.fill('buscar hotéis no Rio de Janeiro')
      await chatInput.press('Enter')
      
      await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 10000 })
      await page.locator('[data-testid="hotel-card"]').first().click()
    })

    await test.step('Mock payment failure', async () => {
      // Mock payment API to fail
      await page.route('**/api/payment/**', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Payment failed' })
        })
      })
      
      const chatInput = page.locator('[data-testid="chat-input"]')
      await chatInput.fill('reservar viagem')
      await chatInput.press('Enter')
    })

    await test.step('Verify payment error handling', async () => {
      // Wait for error
      await page.waitForSelector('[data-testid="error-component"]', { timeout: 10000 })
      
      const errorComponent = page.locator('[data-testid="error-component"]')
      await expect(errorComponent).toBeVisible()
      await expect(errorComponent).toContainText('pagamento')
      
      // Verify retry button
      const retryButton = errorComponent.getByRole('button', { name: /Tentar Novamente/i })
      await expect(retryButton).toBeVisible()
    })

    await test.step('Test payment retry', async () => {
      // Remove payment failure mock
      await page.unroute('**/api/payment/**')
      
      const retryButton = page.getByRole('button', { name: /Tentar Novamente/i })
      await retryButton.click()
      
      // Wait for successful booking
      await page.waitForSelector('[data-testid="booking-confirmation"]', { timeout: 15000 })
      await expect(page.locator('text=Reserva confirmada')).toBeVisible()
    })
  })

  test('should handle multiple consecutive errors', async ({ page }) => {
    let errorCount = 0
    const maxErrors = 3

    // Mock API to fail multiple times
    await page.route('**/api/**', route => {
      if (errorCount < maxErrors) {
        errorCount++
        route.abort('failed')
      } else {
        route.continue()
      }
    })

    await test.step('Trigger multiple errors', async () => {
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.click()
      
      const chatInput = page.locator('[data-testid="chat-input"]')
      await chatInput.fill('buscar voos')
      await chatInput.press('Enter')
    })

    await test.step('Verify error persistence', async () => {
      // Should show error
      await page.waitForSelector('[data-testid="error-component"]', { timeout: 10000 })
      
      // Retry multiple times
      for (let i = 0; i < maxErrors; i++) {
        const retryButton = page.getByRole('button', { name: /Tentar Novamente/i })
        await retryButton.click()
        
        // Wait for either success or next error
        await Promise.race([
          page.waitForSelector('[data-testid="flight-card"]', { timeout: 5000 }),
          page.waitForSelector('[data-testid="error-component"]', { timeout: 5000 })
        ])
      }
    })

    await test.step('Verify eventual success', async () => {
      // After max errors, should succeed
      await page.waitForSelector('[data-testid="flight-card"]', { timeout: 10000 })
      const flightCards = page.locator('[data-testid="flight-card"]')
      await expect(flightCards).toHaveCount(5)
    })
  })

  test('should handle circuit breaker pattern', async ({ page }) => {
    let requestCount = 0
    const failureThreshold = 5

    // Mock API to fail consistently
    await page.route('**/api/**', route => {
      requestCount++
      if (requestCount <= failureThreshold) {
        route.abort('failed')
      } else {
        // After threshold, return circuit breaker error
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'Service temporarily unavailable',
            circuitBreaker: true 
          })
        })
      }
    })

    await test.step('Trigger circuit breaker', async () => {
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.click()
      
      const chatInput = page.locator('[data-testid="chat-input"]')
      
      // Make multiple requests to trigger circuit breaker
      for (let i = 0; i < failureThreshold + 1; i++) {
        await chatInput.fill(`buscar voos tentativa ${i + 1}`)
        await chatInput.press('Enter')
        
        // Wait for error
        await page.waitForSelector('[data-testid="error-component"]', { timeout: 5000 })
        
        // Retry
        const retryButton = page.getByRole('button', { name: /Tentar Novamente/i })
        await retryButton.click()
      }
    })

    await test.step('Verify circuit breaker message', async () => {
      // Should show circuit breaker error
      const errorComponent = page.locator('[data-testid="error-component"]')
      await expect(errorComponent).toContainText('temporariamente indisponível')
    })
  })
})
