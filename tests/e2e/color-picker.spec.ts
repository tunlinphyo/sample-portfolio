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
  await expect(knob).toHaveAttribute('aria-valuenow', '200')

  await knob.dispatchEvent('keydown', { key: 'ArrowRight' })

  await expect(knob).toHaveAttribute('aria-valuenow', '205')
  await expect(colorPicker).toHaveAttribute('data-hue', '205')

  await knob.dispatchEvent('keydown', { key: 'ArrowLeft' })

  await expect(knob).toHaveAttribute('aria-valuenow', '200')
  await expect(colorPicker).toHaveAttribute('data-hue', '200')

  await knob.dispatchEvent('keydown', { key: 'ArrowUp' })

  await expect(knob).toHaveAttribute('aria-valuenow', '201')
  await expect(colorPicker).toHaveAttribute('data-hue', '201')

  await knob.dispatchEvent('keydown', { key: 'ArrowDown' })

  await expect(knob).toHaveAttribute('aria-valuenow', '200')
  await expect(colorPicker).toHaveAttribute('data-hue', '200')

  await expect
    .poll(() =>
      page.evaluate(() => ({
        hue: document.documentElement.style.getPropertyValue('--palette-hue'),
        storedHue: window.localStorage.getItem('theme-hue'),
      })),
    )
    .toEqual({ hue: '200', storedHue: '200' })
})
