import { expect, test } from '@playwright/test'
import { mockBillingStatus } from './utils/mock-api'

test.describe('@smoke pricing', () => {
  test('@smoke inicia checkout Pro', async ({ page }) => {
    await mockBillingStatus(page, 'free')

    await page.route('**/api/billing/create-checkout', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://checkout.stripe.com/mock-session',
        }),
      })
    })

    await page.goto('/pricing')

    const proButton = page.locator('[data-plan="pro"]')
    await expect(proButton).toBeEnabled()
    await proButton.click()

    await page.waitForURL('https://checkout.stripe.com/**', { timeout: 10_000 })
    expect(page.url()).toContain('https://checkout.stripe.com/')
  })
})

