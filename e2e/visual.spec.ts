import { expect, test } from '@playwright/test';

// 关键场景截图回归。基线按操作系统生成，需在 macOS 上更新：
// pnpm test:e2e -- --update-snapshots
test.use({ viewport: { width: 1600, height: 900 } });

test('案例库首页', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('library.png', { animations: 'disabled' });
});

test('案例详情页', async ({ page }) => {
  await page.goto('/cases/number-line');
  await expect(page).toHaveScreenshot('detail.png', { animations: 'disabled' });
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
    maxDiffPixelRatio: 0.02,
  });
});
