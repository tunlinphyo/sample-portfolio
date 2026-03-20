import { expect, test } from '@playwright/test'

test('lazy-loads the color picker and updates hue state from keyboard input', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
  })

  await page.goto('/')

  const opener = page.locator('.ring-opener')
  const colorPicker = page.locator('#colorpicker')
  const knob = page.locator('.nob')

  await expect(opener).toHaveAttribute('aria-label', 'Open color picker')
  await expect(knob).toHaveAttribute('role', 'slider')
  await expect(knob).toHaveAttribute('aria-valuenow', '0')

  await knob.dispatchEvent('keydown', { key: 'ArrowRight' })

  await expect(knob).toHaveAttribute('aria-valuenow', '5')
  await expect(colorPicker).toHaveAttribute('data-hue', '5')

  await expect
    .poll(() =>
      page.evaluate(() => ({
        hue: document.documentElement.style.getPropertyValue('--palette-hue'),
        storedHue: window.localStorage.getItem('theme-hue'),
      })),
    )
    .toEqual({ hue: '5', storedHue: '5' })
})
