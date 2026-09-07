import { expect, test } from '@playwright/test';

test('案例库展示三维案例并进入演示', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('listitem')
    .filter({ hasText: '正方体展开图' })
    .getByRole('link', { name: '查看详情' })
    .click();
  await expect(page).toHaveURL(/\/cases\/cube-net$/);
  await page.getByRole('link', { name: '进入演示' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: '重置视角' })).toBeVisible();
});

test('展开程度滑杆写回 URL', async ({ page }) => {
  await page.goto('/cases/cube-net/present');
  const slider = page.getByRole('slider', { name: '展开程度' });
  await expect(slider).toBeVisible();
  await slider.fill('60');
  await expect(page).toHaveURL(/[?&]unfold=60/);
  await expect(page.getByText('60%')).toBeVisible();
});

test('展开与折叠按钮', async ({ page }) => {
  await page.goto('/cases/cube-net/present');
  await page.getByRole('button', { name: '展开', exact: true }).click();
  await expect(page).toHaveURL(/[?&]unfold=100/);
  await page.getByRole('button', { name: '折叠' }).click();
  await expect(page).not.toHaveURL(/unfold=/);
});

test('带参数的链接还原展开程度', async ({ page }) => {
  await page.goto('/cases/cube-net/present?unfold=45');
  await expect(page.getByRole('slider', { name: '展开程度' })).toHaveValue('45');
  await expect(page.getByText('45%')).toBeVisible();
});

test('无效展开程度恢复默认并提示', async ({ page }) => {
  await page.goto('/cases/cube-net/present?unfold=abc');
  await expect(page.getByRole('status').filter({ hasText: '已恢复默认值' })).toBeVisible();
  await expect(page.getByRole('slider', { name: '展开程度' })).toHaveValue('0');
});
