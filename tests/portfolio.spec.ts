import { expect, test } from '@playwright/test'

test('opens and closes Recent Works dialog', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Tun Lin Phyo')
  await expect(page.getByRole('button', { name: 'Open recent works dialog' })).toBeVisible()

  const recentWorksDialog = page.locator('#navigation')

  await page.getByRole('button', { name: 'Open recent works dialog' }).click()
  await expect(recentWorksDialog).toHaveAttribute('open', '')
  await expect(
    recentWorksDialog.getByRole('heading', { level: 2, name: 'Recent Works' }),
  ).toBeVisible()

  await recentWorksDialog.locator('[dialogclose]').click()
  await expect(recentWorksDialog).not.toHaveAttribute('open', '')
})

test('opens each project popup from Recent Works dialog', async ({ page }) => {
  await page.goto('/')

  const recentWorksDialog = page.locator('#navigation')

  await page.getByRole('button', { name: 'Open recent works dialog' }).click()
  await expect(recentWorksDialog).toHaveAttribute('open', '')

  const projectTriggers = recentWorksDialog.locator('.wheel-item button[popovertarget]')
  await expect(projectTriggers).toHaveCount(7)

  for (let i = 0; i < 7; i++) {
    const trigger = projectTriggers.nth(i)
    const projectId = await trigger.getAttribute('aria-controls')

    if (!projectId) {
      throw new Error(`Missing aria-controls for project trigger index ${i}`)
    }

    await trigger.click()
    await expect(recentWorksDialog.locator(`#${projectId}`)).toBeVisible()
  }
})

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
  await expect(messageTriggers).toHaveCount(6)

  for (let i = 0; i < 6; i++) {
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
  }
})
