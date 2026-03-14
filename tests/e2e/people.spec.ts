import { expect, test } from '@playwright/test'


test('opens What People Say dialog, opens each message, and closes it', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Open testimonials dialog' })).toBeVisible()

  const testimonialsDialog = page.locator('#testimonial')

  await page.getByRole('button', { name: 'Open testimonials dialog' }).click()
  await expect(testimonialsDialog).toHaveAttribute('open', '')
  await expect(
    testimonialsDialog.getByRole('heading', { level: 2, name: 'What People Say' }),
  ).toBeVisible()

  const messageTriggers = testimonialsDialog.locator('.peoples button[popovertarget]')
  const messageCount = await messageTriggers.count()
  expect(messageCount).toBeGreaterThan(0)

  for await (const [i, trigger] of Array.from({ length: messageCount }, (_, index) => [
    index,
    messageTriggers.nth(index),
  ] as const)) {
    await page.waitForTimeout(1200)
    const messageId = await trigger.getAttribute('popovertarget')

    if (!messageId) {
      throw new Error(`Missing popovertarget for testimonial trigger index ${i}`)
    }

    await trigger.click()
    const message = testimonialsDialog.locator(`#${messageId}`)
    await expect(message).toBeVisible()
  }

  await page.waitForTimeout(1200)
  await testimonialsDialog.locator('[dialogclose]').click()
  await expect(testimonialsDialog).not.toHaveAttribute('open', '')
})
