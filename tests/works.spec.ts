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
  const projectPopups = recentWorksDialog.locator('.projects > .project[popover]')
  const projectCount = await projectPopups.count()
  await expect(projectTriggers).toHaveCount(projectCount)

  for (let i = 0; i < projectCount; i++) {
    const trigger = projectTriggers.nth(i)
    const projectId = await trigger.getAttribute('aria-controls')

    if (!projectId) {
      throw new Error(`Missing aria-controls for project trigger index ${i}`)
    }

    await trigger.click()
    await expect(recentWorksDialog.locator(`#${projectId}`)).toBeVisible()
  }
})

test('uses sequential wheel item indexes that match the declared count', async ({ page }) => {
  await page.goto('/')

  const recentWorksDialog = page.locator('#navigation')
  const wheel = recentWorksDialog.locator('.wheel')
  const wheelItems = wheel.locator('.wheel-item')
  const declaredCount = await wheel.evaluate((element) =>
    Number.parseInt(element.getAttribute('style')?.match(/--count:\s*(\d+)/)?.[1] ?? '', 10),
  )

  expect(declaredCount).toBeGreaterThan(0)
  await expect(wheelItems).toHaveCount(declaredCount)

  const indexes = await wheelItems.evaluateAll((elements) =>
    elements.map((element) =>
      Number.parseInt(element.getAttribute('style')?.match(/--index:\s*(\d+)/)?.[1] ?? '', 10),
    ),
  )

  expect(indexes).toEqual(Array.from({ length: declaredCount }, (_, index) => index + 1))
})

test('uses matching tech logo and popover avatar images', async ({ page }) => {
  await page.goto('/')

  const logos = page.locator('.projects .project .logo')
  const logoCount = await logos.count()

  for (let i = 0; i < logoCount; i++) {
    const logo = logos.nth(i)
    const techLogo = logo.locator('.tech-logo img')
    const avatarLogo = logo.locator('.logo-avatar img')

    await expect(techLogo).toHaveCount(1)
    await expect(avatarLogo).toHaveCount(1)
    const techLogoSrc = await techLogo.getAttribute('src')
    expect(techLogoSrc).not.toBeNull()
    await expect(avatarLogo).toHaveAttribute('src', techLogoSrc!)
  }
})
