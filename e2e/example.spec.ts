import { test, expect } from '@playwright/test'

// Exemplo de teste E2E básico
test.describe('Sky Travels - Exemplo de Teste', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se a página carregou
    await expect(page).toHaveTitle(/Sky Travels/)
    
    // Verificar elementos principais
    await expect(page.getByText('Sky Travels')).toBeVisible()
    await expect(page.getByRole('button', { name: /Travel AI/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Começar/i })).toBeVisible()
  })

  test('deve abrir o chat AI', async ({ page }) => {
    await page.goto('/')
    
    // Clicar no botão Travel AI
    await page.getByRole('button', { name: /Travel AI/i }).click()
    
    // Verificar se o chat abriu
    await expect(page.locator('[data-testid="chat-container"]')).toBeVisible()
    
    // Verificar se há input de chat
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible()
  })

  test('deve navegar para Minhas Viagens', async ({ page }) => {
    await page.goto('/')
    
    // Clicar em Minhas Viagens
    await page.getByRole('button', { name: /Minhas Viagens/i }).click()
    
    // Verificar se a página carregou
    await expect(page.getByText('Minhas Viagens')).toBeVisible()
    
    // Verificar estado vazio
    await expect(page.getByText('Nenhuma viagem salva')).toBeVisible()
  })
})
