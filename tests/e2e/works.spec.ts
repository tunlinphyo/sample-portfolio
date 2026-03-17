import { expect, test, type Page } from '@playwright/test'

async function expectRecentWorksDialogFlow(page: Page) {
  await page.goto('/')

  const openDialogButton = page.getByRole('button', { name: 'Open recent works dialog' })
  await expect(openDialogButton).toBeVisible()

  const recentWorksDialog = page.locator('#navigation')

  await openDialogButton.click()
  await expect(recentWorksDialog).toHaveAttribute('open', '')
  await expect(
    recentWorksDialog.getByRole('heading', { level: 2, name: 'Recent Works' }),
  ).toBeVisible()

  const projectTriggers = recentWorksDialog.locator('.wheel-item button[popovertarget]')
  const projectCount = await projectTriggers.count()
  expect(projectCount).toBeGreaterThan(0)

  for await (const i of Array.from({ length: projectCount }, (_, index) => index)) {
    const trigger = projectTriggers.nth(i)
    const projectId = await trigger.getAttribute('popovertarget')

    if (!projectId) {
      throw new Error(`Missing popovertarget for Recent Works trigger index ${i}`)
    }

    await page.waitForTimeout(1000)
    await trigger.click()

    const project = recentWorksDialog.locator(`#${projectId}`)
    await expect(project).toBeVisible()
  }

  await page.waitForTimeout(1000)
  await recentWorksDialog.locator('[dialogclose]').click()
  await expect(recentWorksDialog).not.toHaveAttribute('open', '')
}

test('opens Recent Works dialog, opens each project, and closes it', async ({ page, browser }) => {
  await expectRecentWorksDialogFlow(page)
})

test('opens a project popup from Recent Works dialog', async ({ page }) => {
  await page.goto('/')

  const recentWorksDialog = page.locator('#navigation')

  await page.getByRole('button', { name: 'Open recent works dialog' }).click()
  await expect(recentWorksDialog).toHaveAttribute('open', '')

  const projectTriggers = recentWorksDialog.locator('.wheel-item button[popovertarget]')
  const projectCount = await projectTriggers.count()
  expect(projectCount).toBeGreaterThan(0)

  for (let i = 0; i < projectCount; i++) {
    const trigger = projectTriggers.nth(i)
    const projectId = await trigger.getAttribute('popovertarget')

    if (!projectId) {
      throw new Error(`Missing popovertarget for Recent Works trigger index ${i}`)
    }

    await trigger.click()
    await expect(recentWorksDialog.locator(`#${projectId}`)).toBeVisible()
  }
})
