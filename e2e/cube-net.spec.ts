import { expect, test } from '@playwright/test';

test('默认视角不透出背面标签，展开后显示六个面', async ({ page }) => {
  await page.goto('/cases/cube-net/present');
  for (const label of ['前', '上', '右']) await expect(page.getByText(label, { exact: true })).toBeVisible();
  for (const label of ['后', '左', '下']) await expect(page.getByText(label, { exact: true })).toBeHidden();
  await page.getByRole('button', { name: '展开', exact: true }).click();
  for (const label of ['前', '上', '右', '后', '左', '下']) await expect(page.getByText(label, { exact: true })).toBeVisible();
});

test('参考网格可用键盘切换且不改变分享参数', async ({ page }) => {
  await page.goto('/cases/cube-net/present?unfold=50');
  const grid = page.getByRole('button', { name: '参考网格', exact: true });
  await expect(grid).toHaveAttribute('aria-pressed', 'true');
  await grid.focus();
  await page.keyboard.press('Space');
  await expect(grid).toHaveAttribute('aria-pressed', 'false');
  await expect(page).toHaveURL(/unfold=50$/);
  await page.getByRole('button', { name: '重置视角' }).click();
  await expect(page.getByRole('slider', { name: '展开程度' })).toHaveValue('50');
});

test('旋转后显示对应面的固定名称，重置恢复默认方向', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/cases/cube-net/present');
  await expect(page.getByText('前', { exact: true })).toBeVisible();
  const canvas = (await page.locator('canvas').boundingBox())!;
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width / 2 + canvas.height / 2, canvas.y + canvas.height / 2, { steps: 20 });
  await page.mouse.up();
  for (const label of ['后', '左', '上']) await expect(page.getByText(label, { exact: true })).toBeVisible();
  for (const label of ['前', '右', '下']) await expect(page.getByText(label, { exact: true })).toBeHidden();
  await page.getByRole('button', { name: '重置视角' }).click();
  for (const label of ['前', '右', '上']) await expect(page.getByText(label, { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/present$/);
});

test('课堂屏幕三个展开状态均保留完整控制栏', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  for (const unfold of [0, 50, 100]) {
    await page.goto(`/cases/cube-net/present?unfold=${unfold}`);
    await expect(page.getByText('前', { exact: true })).toBeVisible();
    const bar = (await page.locator('.presentation__bar').boundingBox())!;
    expect(bar.y + bar.height).toBeLessThanOrEqual(900);
  }
});

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
