import { test, expect } from '@playwright/test'

test.describe('Travel Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should complete full booking flow: search flights → book → view summary → cancel', async ({ page }) => {
    // Step 1: Open AI chat
    await test.step('Open AI chat', async () => {
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await expect(travelAIButton).toBeVisible()
      await travelAIButton.click()
      
      // Wait for chat to open
      await expect(page.locator('[data-testid="chat-container"]')).toBeVisible()
    })

    // Step 2: Search for flights
    await test.step('Search for flights', async () => {
      const chatInput = page.locator('[data-testid="chat-input"]')
      await expect(chatInput).toBeVisible()
      
      // Type message to search flights
      await chatInput.fill('buscar voos para São Paulo')
      await chatInput.press('Enter')
      
      // Wait for AI response and flight cards to appear
      await expect(page.locator('[data-testid="ai-message"]')).toBeVisible()
      
      // Wait for flight cards to load (with timeout for streaming)
      await page.waitForSelector('[data-testid="flight-card"]', { timeout: 10000 })
      
      // Verify flight cards are displayed
      const flightCards = page.locator('[data-testid="flight-card"]')
      await expect(flightCards).toHaveCount(5) // Should have 5 mock flights
      
      // Verify flight information is displayed
      await expect(page.locator('text=LATAM')).toBeVisible()
      await expect(page.locator('text=R$')).toBeVisible()
    })

    // Step 3: Select a flight
    await test.step('Select a flight', async () => {
      const firstFlightCard = page.locator('[data-testid="flight-card"]').first()
      await expect(firstFlightCard).toBeVisible()
      
      // Click on the first flight card
      await firstFlightCard.click()
      
      // Wait for selection confirmation
      await expect(page.locator('text=Voo selecionado')).toBeVisible()
    })

    // Step 4: Search for hotels
    await test.step('Search for hotels', async () => {
      const chatInput = page.locator('[data-testid="chat-input"]')
      
      // Type message to search hotels
      await chatInput.fill('buscar hotéis no Rio de Janeiro')
      await chatInput.press('Enter')
      
      // Wait for hotel cards to load
      await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 10000 })
      
      // Verify hotel cards are displayed
      const hotelCards = page.locator('[data-testid="hotel-card"]')
      await expect(hotelCards).toHaveCount(4) // Should have 4 mock hotels
      
      // Verify hotel information is displayed
      await expect(page.locator('text=Hotel Plaza')).toBeVisible()
      await expect(page.locator('text=estrelas')).toBeVisible()
    })

    // Step 5: Select a hotel
    await test.step('Select a hotel', async () => {
      const firstHotelCard = page.locator('[data-testid="hotel-card"]').first()
      await expect(firstHotelCard).toBeVisible()
      
      // Click on the first hotel card
      await firstHotelCard.click()
      
      // Wait for selection confirmation
      await expect(page.locator('text=Hotel selecionado')).toBeVisible()
    })

    // Step 6: Book the trip
    await test.step('Book the trip', async () => {
      const chatInput = page.locator('[data-testid="chat-input"]')
      
      // Type message to book
      await chatInput.fill('reservar viagem')
      await chatInput.press('Enter')
      
      // Wait for booking confirmation
      await page.waitForSelector('[data-testid="booking-confirmation"]', { timeout: 15000 })
      
      // Verify booking confirmation is displayed
      await expect(page.locator('text=Reserva confirmada')).toBeVisible()
      await expect(page.locator('text=Código de confirmação')).toBeVisible()
    })

    // Step 7: View booking summary
    await test.step('View booking summary', async () => {
      // Navigate to "Minhas Viagens" to see the booking
      const myTripsButton = page.getByRole('button', { name: /Minhas Viagens/i })
      await expect(myTripsButton).toBeVisible()
      await myTripsButton.click()
      
      // Wait for trips page to load
      await expect(page.locator('h1:has-text("Minhas Viagens")')).toBeVisible()
      
      // Verify booking appears in the list
      await expect(page.locator('[data-testid="trip-card"]')).toBeVisible()
      await expect(page.locator('text=São Paulo → Rio de Janeiro')).toBeVisible()
    })

    // Step 8: Cancel the booking
    await test.step('Cancel the booking', async () => {
      const tripCard = page.locator('[data-testid="trip-card"]').first()
      await expect(tripCard).toBeVisible()
      
      // Find and click the delete button
      const deleteButton = tripCard.locator('[data-testid="delete-trip"]')
      await expect(deleteButton).toBeVisible()
      await deleteButton.click()
      
      // Confirm deletion (if there's a confirmation dialog)
      const confirmButton = page.getByRole('button', { name: /Confirmar|Sim|Delete/i })
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }
      
      // Verify trip is removed
      await expect(page.locator('[data-testid="trip-card"]')).not.toBeVisible()
      await expect(page.locator('text=Nenhuma viagem salva')).toBeVisible()
    })
  })

  test('should handle error scenarios with retry functionality', async ({ page }) => {
    // This test simulates error scenarios and verifies retry functionality
    
    await test.step('Open AI chat', async () => {
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.click()
      await expect(page.locator('[data-testid="chat-container"]')).toBeVisible()
    })

    await test.step('Trigger error scenario', async () => {
      // Mock network failure by intercepting requests
      await page.route('**/api/**', route => {
        // Simulate 15% error rate
        if (Math.random() < 0.15) {
          route.abort('failed')
        } else {
          route.continue()
        }
      })

      const chatInput = page.locator('[data-testid="chat-input"]')
      await chatInput.fill('buscar voos para São Paulo')
      await chatInput.press('Enter')

      // Wait for either success or error
      await Promise.race([
        page.waitForSelector('[data-testid="flight-card"]', { timeout: 5000 }),
        page.waitForSelector('[data-testid="error-component"]', { timeout: 5000 })
      ])

      // Check if error occurred
      const errorComponent = page.locator('[data-testid="error-component"]')
      if (await errorComponent.isVisible()) {
        // Verify error message is displayed
        await expect(errorComponent).toContainText('Erro')
        
        // Verify retry button is present
        const retryButton = errorComponent.getByRole('button', { name: /Tentar Novamente/i })
        await expect(retryButton).toBeVisible()
        
        // Click retry button
        await retryButton.click()
        
        // Wait for retry to complete
        await page.waitForSelector('[data-testid="flight-card"]', { timeout: 10000 })
        
        // Verify flight cards are now displayed
        const flightCards = page.locator('[data-testid="flight-card"]')
        await expect(flightCards).toHaveCount(5)
      } else {
        // If no error occurred, verify normal flow
        const flightCards = page.locator('[data-testid="flight-card"]')
        await expect(flightCards).toHaveCount(5)
      }
    })
  })

  test('should handle accessibility features', async ({ page }) => {
    await test.step('Test keyboard navigation', async () => {
      // Test skip links
      await page.keyboard.press('Tab')
      const skipLink = page.getByRole('link', { name: /Pular para o conteúdo principal/i })
      await expect(skipLink).toBeVisible()
      
      // Test keyboard navigation in chat
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.focus()
      await page.keyboard.press('Enter')
      
      // Test chat input accessibility
      const chatInput = page.locator('[data-testid="chat-input"]')
      await expect(chatInput).toHaveAttribute('aria-label')
    })

    await test.step('Test screen reader announcements', async () => {
      // Open chat
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.click()
      
      // Check for live region
      const liveRegion = page.locator('[aria-live]')
      await expect(liveRegion).toBeVisible()
      
      // Send message and check for announcements
      const chatInput = page.locator('[data-testid="chat-input"]')
      await chatInput.fill('buscar voos')
      await chatInput.press('Enter')
      
      // Wait for processing announcement
      await expect(page.locator('text=Processando')).toBeVisible()
    })

    await test.step('Test high contrast mode', async () => {
      // Simulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' })
      
      // Verify components are still visible and accessible
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await expect(travelAIButton).toBeVisible()
      
      // Test focus indicators
      await travelAIButton.focus()
      await expect(travelAIButton).toHaveCSS('outline', /none|2px/)
    })
  })

  test('should handle internationalization', async ({ page }) => {
    await test.step('Test language switching', async () => {
      // Check if language switcher exists
      const languageButton = page.getByRole('button', { name: /English|Português/i })
      
      if (await languageButton.isVisible()) {
        // Switch to English
        await languageButton.click()
        
        // Verify text changes
        await expect(page.locator('text=Home')).toBeVisible()
        await expect(page.locator('text=My Trips')).toBeVisible()
        
        // Switch back to Portuguese
        await languageButton.click()
        await expect(page.locator('text=Início')).toBeVisible()
        await expect(page.locator('text=Minhas Viagens')).toBeVisible()
      }
    })

    await test.step('Test currency formatting', async () => {
      // Open chat and search for flights
      const travelAIButton = page.getByRole('button', { name: /Travel AI/i })
      await travelAIButton.click()
      
      const chatInput = page.locator('[data-testid="chat-input"]')
      await chatInput.fill('buscar voos')
      await chatInput.press('Enter')
      
      // Wait for flight cards
      await page.waitForSelector('[data-testid="flight-card"]', { timeout: 10000 })
      
      // Verify currency formatting (Brazilian Real)
      await expect(page.locator('text=R$')).toBeVisible()
    })
  })
})
