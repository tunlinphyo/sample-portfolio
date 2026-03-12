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

test('opens each testimonial message from What People Say dialog with matching avatar styling', async ({
  page,
}) => {
  await page.goto('/')

  const testimonialsDialog = page.locator('#testimonial')

  await page.getByRole('button', { name: 'Open testimonials dialog' }).click()
  await expect(testimonialsDialog).toHaveAttribute('open', '')

  const messageTriggers = testimonialsDialog.locator('.peoples button[popovertarget]')
  const messages = testimonialsDialog.locator('.messages > .message[popover]')
  const messageCount = await messages.count()
  await expect(messageTriggers).toHaveCount(messageCount)

  for (let i = 0; i < messageCount; i++) {
    const trigger = messageTriggers.nth(i)
    const messageId = await trigger.getAttribute('popovertarget')

    if (!messageId) {
      throw new Error(`Missing popovertarget for testimonial trigger index ${i}`)
    }

    await trigger.click()
    const message = testimonialsDialog.locator(`#${messageId}`)
    await expect(message).toBeVisible()

    const triggerImageSrc = await trigger.locator('img').getAttribute('src')
    if (!triggerImageSrc) {
      throw new Error(`Missing trigger image src for testimonial trigger index ${i}`)
    }

    await expect(message.locator('.avatar img')).toHaveAttribute('src', triggerImageSrc)

    const triggerBorder = await trigger.evaluate((element) => element.style.getPropertyValue('--border').trim())
    if (!triggerBorder) {
      throw new Error(`Missing --border for testimonial trigger index ${i}`)
    }

    const avatarBorder = await message
      .locator('.avatar')
      .evaluate((element) => element.style.getPropertyValue('--border').trim())

    expect(avatarBorder).toBe(triggerBorder)
  }
})

test('uses sequential testimonial indexes that match the declared count', async ({ page }) => {
  await page.goto('/')

  const testimonialsDialog = page.locator('#testimonial')
  const peopleRing = testimonialsDialog.locator('.peoples')
  const peopleItems = peopleRing.locator('.people')
  const declaredCount = await peopleRing.evaluate((element) =>
    Number.parseInt(element.getAttribute('style')?.match(/--count:\s*(\d+)/)?.[1] ?? '', 10),
  )

  expect(declaredCount).toBeGreaterThan(0)
  await expect(peopleItems).toHaveCount(declaredCount)

  const indexes = await peopleItems.evaluateAll((elements) =>
    elements.map((element) =>
      Number.parseInt(element.getAttribute('style')?.match(/--index:\s*(\d+)/)?.[1] ?? '', 10),
    ),
  )

  expect(indexes).toEqual(Array.from({ length: declaredCount }, (_, index) => index + 1))
})
