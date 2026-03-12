import { expect, test } from '@playwright/test'

test('opens contact-list on hover for pointer devices and on click for touch devices', async ({
  page,
  browser,
}) => {
  await page.goto('/')

  const touchContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const touchPage = await touchContext.newPage()

  await touchPage.goto('/')

  const socialActions = [
    ['GitHub', '#github-popover'],
    ['LinkedIn', '#linkedin-popover'],
    ['Email', '#email-popover'],
  ] as const

  for (const [name, popoverId] of socialActions) {
    const action = page.getByRole('button', { name })
    const popover = page.locator(popoverId)
    const labelledBy = await popover.getAttribute('aria-labelledby')

    if (!labelledBy) {
      throw new Error(`Missing aria-labelledby for ${popoverId}`)
    }

    const popoverLabel = page.locator(`#${labelledBy}`)

    await expect(action).toHaveAttribute('aria-label', name)
    await expect(popoverLabel).toHaveText(name)
  }

  for (const [name, popoverId] of socialActions) {
    const action = page.getByRole('button', { name })
    const popover = page.locator(popoverId)

    await action.hover()
    await expect(popover).toBeVisible()
    await page.locator('body').hover({ position: { x: 0, y: 0 } })
    await expect(popover).not.toBeVisible()
  }

  for (const { action, popover } of socialActions.map(([name, popoverId]) => ({
    action: touchPage.getByRole('button', { name }),
    popover: touchPage.locator(popoverId),
  }))) {
    await action.dispatchEvent('mouseenter')
    await expect(popover).not.toBeVisible()

    await action.click()
    await expect(popover).toBeVisible()
    await touchPage.locator('body').click({ position: { x: 0, y: 0 } })
    await expect(popover).not.toBeVisible()
  }

  await touchContext.close()
})

test('applies text-hover effect when hovering the data-effect-parent wrapper', async ({ page }) => {
  await page.goto('/')

  const effectParent = page.locator('em[data-effect-parent]')
  const firstEffectLetter = page.locator('em[data-effect-parent] [data-effect="text-hover"] > *').first()

  const beforeHover = await firstEffectLetter.boundingBox()

  await effectParent.hover()

  expect(beforeHover).not.toBeNull()

  await expect
    .poll(async () => {
      const afterHover = await firstEffectLetter.boundingBox()
      return afterHover?.y ?? null
    })
    .toBeLessThan(beforeHover!.y)
})
