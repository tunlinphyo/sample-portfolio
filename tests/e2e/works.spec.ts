import { expect, test, type Page } from '@playwright/test'

async function expectProjectImagesForViewport(page: Page, isMobile: boolean) {
  await page.goto('/')

  const projectPictures = page.locator('#navigation .project .content picture')
  await expect(projectPictures).toHaveCount(7)

  const images = await projectPictures.evaluateAll((pictures, mobile) =>
    pictures.map((picture) => {
      const sources = Array.from(picture.querySelectorAll('source'))
      const img = picture.querySelector('img')
      const desktopSrc = sources.find((source) => source.media === '(min-width: 48rem)')?.getAttribute('srcset')
      const mobileSrc = sources.find((source) => source.media === '(max-width: 48rem)')?.getAttribute('srcset')
      const expectedSrc = new URL(mobile ? mobileSrc ?? img?.getAttribute('src') ?? '' : desktopSrc ?? img?.getAttribute('src') ?? '', window.location.href).href

      return {
        alt: img?.getAttribute('alt'),
        complete: img instanceof HTMLImageElement ? img.complete : false,
        currentSrc: img instanceof HTMLImageElement ? img.currentSrc : null,
        expectedSrc,
        naturalWidth: img instanceof HTMLImageElement ? img.naturalWidth : 0,
      }
    }),
  isMobile)

  for (const image of images) {
    expect(image.alt).toBeTruthy()
    expect(image.complete).toBe(true)
    expect(image.naturalWidth).toBeGreaterThan(0)
    expect(image.currentSrc, `Unexpected image source for ${image.alt}`).toBe(image.expectedSrc)
  }
}

test('opens and closes Recent Works dialog', async ({ page }) => {
  await page.goto('/')

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

test('opens a project popup from Recent Works dialog', async ({ page }) => {
  await page.goto('/')

  const recentWorksDialog = page.locator('#navigation')

  await page.getByRole('button', { name: 'Open recent works dialog' }).click()
  await expect(recentWorksDialog).toHaveAttribute('open', '')

  const firstProjectTrigger = recentWorksDialog.locator('.wheel-item button[popovertarget]').first()
  const projectId = await firstProjectTrigger.getAttribute('aria-controls')

  if (!projectId) {
    throw new Error('Missing aria-controls for first Recent Works trigger')
  }

  await firstProjectTrigger.click()
  await expect(recentWorksDialog.locator(`#${projectId}`)).toBeVisible()
})

test('loads each project image for the active viewport', async ({ page, browser }) => {
  await expectProjectImagesForViewport(page, false)

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const mobilePage = await mobileContext.newPage()

  try {
    await expectProjectImagesForViewport(mobilePage, true)
  } finally {
    await mobileContext.close()
  }
})
