import { expect, test } from '@playwright/test'

test('opens and closes What People Say dialog', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Open testimonials dialog' })).toBeVisible()

  const testimonialsDialog = page.locator('#testimonial')

  await page.getByRole('button', { name: 'Open testimonials dialog' }).click()
  await expect(testimonialsDialog).toHaveAttribute('open', '')
  await expect(
    testimonialsDialog.getByRole('heading', { level: 2, name: 'What People Say' }),
  ).toBeVisible()

  await testimonialsDialog.locator('[dialogclose]').click()
  await expect(testimonialsDialog).not.toHaveAttribute('open', '')
})

test('opens each testimonial message from What People Say dialog', async ({ page }) => {
  await page.goto('/')

  const testimonialsDialog = page.locator('#testimonial')

  await page.getByRole('button', { name: 'Open testimonials dialog' }).click()
  await expect(testimonialsDialog).toHaveAttribute('open', '')

  const messageTriggers = testimonialsDialog.locator('.peoples button[popovertarget]')
  const messageCount = await messageTriggers.count()
  expect(messageCount).toBeGreaterThan(0)

  for (let i = 0; i < messageCount; i++) {
    const trigger = messageTriggers.nth(i)
    const messageId = await trigger.getAttribute('popovertarget')

    if (!messageId) {
      throw new Error(`Missing popovertarget for testimonial trigger index ${i}`)
    }

    await trigger.click()
    const message = testimonialsDialog.locator(`#${messageId}`)
    await expect(message).toBeVisible()
  }
})
