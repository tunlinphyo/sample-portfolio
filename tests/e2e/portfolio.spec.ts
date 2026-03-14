import { expect, test } from '@playwright/test'

const socialActions = [
  ['GitHub', '#github-popover'],
  ['LinkedIn', '#linkedin-popover'],
  ['Email', '#email-popover'],
] as const

test('opens contact-list on hover for pointer devices', async ({ page }) => {
  await page.goto('/')

  for (const [name, popoverId] of socialActions) {
    const action = page.getByRole('button', { name })
    const popover = page.locator(popoverId)

    await action.hover()
    await expect(popover).toBeVisible()
    await page.locator('body').hover({ position: { x: 0, y: 0 } })
    await expect(popover).not.toBeVisible()
  }
})

test('opens contact-list on click for touch devices', async ({ browser }) => {
  const touchContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const touchPage = await touchContext.newPage()

  await touchPage.goto('/')

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
