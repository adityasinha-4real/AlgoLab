import { expect, test } from '@playwright/test'

test('runs BFS on a preset graph and reaches a finished result', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page
    .getByRole('combobox')
    .filter({ hasText: 'Load preset' })
    .selectOption('simple-path')

  await expect(page.getByText('A', { exact: true })).toBeVisible()
  await expect(page.getByText('D', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Run BFS' }).click()

  const timeline = page.getByRole('slider', { name: 'Execution timeline' })
  await expect(timeline).toHaveAttribute('aria-valuenow', '0')

  await page.getByRole('button', { name: 'Jump to end' }).click()

  const maxSteps = await timeline.getAttribute('aria-valuemax')
  await expect(timeline).toHaveAttribute('aria-valuenow', maxSteps ?? '')

  await expect(page.getByText(/path reconstructed/i)).toBeVisible()
  await expect(page.getByText('A → B → C → D')).toBeVisible()
})
