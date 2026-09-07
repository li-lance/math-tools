import { expect, test } from '@playwright/test';

test('案例库 → 详情 → 演示的完整链路', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '查看详情' }).click();
  await expect(page).toHaveURL(/\/cases\/number-line$/);
  await expect(page.getByRole('heading', { name: '可拖动数轴' })).toBeVisible();

  await page.getByRole('link', { name: '进入演示' }).click();
  await expect(page).toHaveURL(/\/cases\/number-line\/present$/);
  await expect(page.getByRole('slider', { name: '数轴上的点' })).toBeVisible();
});

test('键盘移动点并写回 URL', async ({ page }) => {
  await page.goto('/cases/number-line/present');
  const slider = page.getByRole('slider', { name: '数轴上的点' });
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '1');
  await expect(page).toHaveURL(/[?&]value=1/);
});

test('带参数的链接还原教学状态', async ({ page }) => {
  await page.goto('/cases/number-line/present?value=5&min=-20&max=20');
  const slider = page.getByRole('slider', { name: '数轴上的点' });
  await expect(slider).toHaveAttribute('aria-valuenow', '5');
  await expect(slider).toHaveAttribute('aria-valuemin', '-20');
  await expect(slider).toHaveAttribute('aria-valuemax', '20');
});

test('无效参数恢复默认并提示，不进入数学逻辑', async ({ page }) => {
  await page.goto('/cases/number-line/present?value=abc');
  await expect(page.getByRole('status').filter({ hasText: '已调整' })).toBeVisible();
  await expect(page.getByRole('slider', { name: '数轴上的点' })).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
});

test('未知案例显示中文恢复页并可返回案例库', async ({ page }) => {
  await page.goto('/cases/no-such-case/present');
  await expect(page.getByRole('alert')).toContainText('没有找到这个案例');
  await page.getByRole('link', { name: '返回案例库' }).click();
  await expect(page.getByRole('heading', { name: '案例库' })).toBeVisible();
});

test('重置恢复文档化默认值', async ({ page }) => {
  await page.goto('/cases/number-line/present?value=7');
  const slider = page.getByRole('slider', { name: '数轴上的点' });
  await expect(slider).toHaveAttribute('aria-valuenow', '7');
  await page.getByRole('button', { name: '重置' }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', '0');
  await expect(page).not.toHaveURL(/value=/);
});
