import { expect, test } from '@playwright/test';

// 关键场景截图回归。基线按操作系统生成，需在 macOS 上更新：
// pnpm test:e2e -- --update-snapshots
test.use({ viewport: { width: 1600, height: 900 } });

test('案例库首页', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('library.png', { animations: 'disabled', fullPage: true });
});

test('案例详情页', async ({ page }) => {
  await page.goto('/cases/number-line');
  await expect(page).toHaveScreenshot('detail.png', { animations: 'disabled', fullPage: true });
});

test('窄屏数轴演示页', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/cases/number-line/present');
  await expect(page.getByRole('slider', { name: '数轴上的点' })).toBeVisible();
  await expect(page).toHaveScreenshot('presentation-mobile.png', { animations: 'disabled' });
});

test('数轴演示页默认状态', async ({ page }) => {
  await page.goto('/cases/number-line/present');
  const slider = page.getByRole('slider', { name: '数轴上的点' });
  await expect(slider).toBeVisible();
  await expect(page).toHaveScreenshot('presentation.png', { animations: 'disabled' });
});

test('正方体展开图演示页（半展开）', async ({ page }) => {
  await page.goto('/cases/cube-net/present?unfold=50');
  // 等待场景挂载（面标注出现在 DOM 覆盖层中）
  await expect(page.getByText('前', { exact: true })).toBeVisible();
  // WebGL 软渲染存在抗锯齿噪声，放宽少量像素容差。
  await expect(page).toHaveScreenshot('cube-net.png', {
    animations: 'disabled',
    threshold: 0.05,
    maxDiffPixelRatio: 0.02,
  });
});

for (const unfold of [0, 100]) {
  test(`正方体 ${unfold}% 展开状态`, async ({ page }) => {
    await page.goto(`/cases/cube-net/present?unfold=${unfold}`);
    await expect(page.getByText('前', { exact: true })).toBeVisible();
    if (unfold === 0) await expect(page.getByText('后', { exact: true })).toBeHidden();
    else await expect(page.getByText('后', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot(`cube-net-${unfold}.png`, { animations: 'disabled', threshold: 0.05, maxDiffPixelRatio: 0.02 });
  });
}

test('窄屏正方体默认视角', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/cases/cube-net/present');
  await expect(page.getByText('前', { exact: true })).toBeVisible();
  await expect(page.getByText('后', { exact: true })).toBeHidden();
  await expect(page).toHaveScreenshot('cube-net-mobile.png', { animations: 'disabled', threshold: 0.05, maxDiffPixelRatio: 0.02 });
});

test('组合体找不同演示页默认状态', async ({ page }) => {
  await page.goto('/cases/composite-match/present');
  await expect(page.getByText('参照', { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('composite-match.png', {
    animations: 'disabled',
    threshold: 0.05,
    maxDiffPixelRatio: 0.02,
  });
});
