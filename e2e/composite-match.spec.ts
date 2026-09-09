import { expect, test } from '@playwright/test';

test('组合体找不同：参照与四个选项渲染，选答显示反馈', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/cases/composite-match/present');
  await expect(page.getByText('参照', { exact: true })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(5);
  const first = page.getByRole('radio', { name: '选项 A' });
  await expect(first).toBeVisible();
  await first.click();
  await expect(page.getByRole('status')).not.toHaveText('');
});

test('带参数链接还原难度与种子', async ({ page }) => {
  await page.goto('/cases/composite-match/present?level=3&seed=42');
  await expect(page.getByRole('combobox')).toHaveValue('3');
  await expect(page).toHaveURL(/[?&]level=3/);
  await expect(page).toHaveURL(/[?&]seed=42/);
});

test('换一题写回新种子', async ({ page }) => {
  await page.goto('/cases/composite-match/present');
  await page.getByRole('button', { name: '换一题' }).click();
  await expect(page).toHaveURL(/[?&]seed=\d+/);
});

test('案例库展示三维案例并进入演示', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('listitem')
    .filter({ hasText: '组合体找不同' })
    .getByRole('link', { name: '查看详情' })
    .click();
  await expect(page).toHaveURL(/\/cases\/composite-match$/);
  await page.getByRole('link', { name: '进入演示' }).click();
  await expect(page.locator('canvas').first()).toBeVisible();
});
