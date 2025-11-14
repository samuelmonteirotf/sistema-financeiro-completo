import { expect, test } from '@playwright/test'
import { mockBillingStatus } from './utils/mock-api'

test.describe('@smoke paywall', () => {
  test('@smoke bloqueia criação quando limite atingido e mostra CTA 402', async ({ page }) => {
    const mock = await mockBillingStatus(page, 'free', {
      limits: { cards: 2 },
      usage: { cards: 2 },
    })

    await page.route('**/api/cards', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
        return
      }

      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 402,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'limit_exceeded',
            message: 'Limite do seu plano foi atingido.',
            resource: 'cards',
            requiredPlan: 'pro',
            used: 2,
            limit: 2,
            upgradeUrl: '/pricing?highlight=pro',
          }),
        })
        return
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    })

    await page.goto('/cartoes')

    const addButton = page.getByRole('button', { name: 'Adicionar Cartão' })
    await expect(addButton).toBeDisabled()
    await addButton.hover()
    await expect(
      page.getByText('Seu plano atual atingiu o limite de cartões. Faça upgrade para adicionar mais.')
    ).toBeVisible()

    mock.update('free', {
      limits: { cards: 2 },
      usage: { cards: 1 },
    })

    await page.reload()

    const enabledButton = page.getByRole('button', { name: 'Adicionar Cartão' })
    await expect(enabledButton).toBeEnabled()
    await enabledButton.click()

    await page.getByLabel('Nome do Cartão').fill('Cartão Teste')
    await page.getByLabel('Últimos 4 Dígitos').fill('1234')
    await page.getByLabel('Limite (R$)').fill('5000')
    await page.getByLabel('Dia do Fechamento').fill('5')
    await page.getByLabel('Dia do Vencimento').fill('12')

    await page.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByText('Limite do seu plano foi atingido.')).toBeVisible()
    const upgradeCta = page.getByRole('button', { name: 'Ver planos' })
    await expect(upgradeCta).toBeVisible()

    await Promise.all([
      page.waitForURL('**/pricing?highlight=pro'),
      upgradeCta.click(),
    ])
  })
})
