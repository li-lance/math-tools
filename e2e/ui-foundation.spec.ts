import { expect, test } from '@playwright/test';

test('窄屏数轴保留清晰标注和触控尺寸，拖动映射正确', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/cases/number-line/present');
  const handle = page.getByRole('slider', { name: '数轴上的点' });
  await expect(handle).toBeVisible();
  // ResizeObserver 在首帧后更新坐标；等待真实尺寸，不依赖机器调度速度。
  await expect.poll(async () => (await handle.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(47);
  expect((await page.locator('.number-line__tick-label').first().boundingBox())!.height).toBeGreaterThanOrEqual(20);
  await handle.focus();
  await page.keyboard.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '1');
  const axis = (await page.locator('line.number-line__axis').boundingBox())!;
  await page.mouse.click(axis.x + axis.width * 0.75, axis.y);
  await expect(handle).toHaveAttribute('aria-valuenow', '5');
});

test('筛选无结果后可以清除条件并恢复案例', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: '搜索案例' }).fill('不存在的案例');
  await expect(page.getByRole('status')).toHaveText('0 个案例');
  await page.getByRole('button', { name: '清除筛选' }).click();
  await expect(page.getByRole('heading', { name: '可拖动数轴' })).toBeVisible();
  await page.getByRole('combobox', { name: '按年级筛选' }).selectOption('5');
  await expect(page.getByRole('heading', { name: '正方体展开图' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '可拖动数轴' })).toHaveCount(0);
});

test('教学评审可展开且保留真实评审状态', async ({ page }) => {
  await page.goto('/cases/number-line');
  await expect(page.getByText('待评审', { exact: true })).toBeVisible();
  await page.locator('.review-panel summary').click();
  await expect(page.getByText('使用术语：', { exact: true })).toBeVisible();
});

test('控制栏收起恢复与帮助对话框键盘关闭', async ({ page }) => {
  await page.goto('/cases/number-line/present');
  await page.getByRole('button', { name: '收起控制栏' }).click();
  await page.getByRole('button', { name: '展开控制栏' }).click();
  await page.getByRole('button', { name: '帮助', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: '帮助', exact: true })).toBeFocused();
});

for (const width of [360, 768]) {
  test(`页面在 ${width}px 宽度下保持可操作且无横向溢出`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/cases/number-line', '/cases/number-line/present', '/cases/cube-net/present']) {
      await page.goto(path);
      if (!path.endsWith('/present')) {
        const brand = page.getByRole('link', { name: 'Math Tools · 返回案例库' });
        expect((await brand.boundingBox())!.height).toBeGreaterThanOrEqual(48);
      }
      if (path.endsWith('/present')) {
        await expect(page.getByRole('button', { name: '帮助', exact: true })).toBeVisible();
        if (path.includes('cube-net')) {
          await expect(page.getByRole('slider', { name: '展开程度' })).toBeVisible();
        } else {
          await expect(page.getByRole('slider', { name: '数轴上的点' })).toBeVisible();
        }
      }
      const overflow = await page.evaluate<boolean>('document.documentElement.scrollWidth > window.innerWidth');
      expect(overflow, path).toBe(false);
    }
  });
}
