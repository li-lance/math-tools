/// <reference lib="dom" />
import { expect, test } from '@playwright/test';

test('输入框消费边框、留白、占位文字和状态 token', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('searchbox', { name: '搜索案例' });
  await page.evaluate(() => {
    const style = document.documentElement.style;
    style.setProperty('--control-border', '#335577');
    style.setProperty('--input-padding-inline', '20px');
    style.setProperty('--input-placeholder-color', '#556677');
    style.setProperty('--input-focus-border', '#442266');
    style.setProperty('--control-disabled-opacity', '0.4');
  });
  await expect(input).toHaveCSS('border-color', 'rgb(51, 85, 119)');
  await expect(input).toHaveCSS('padding-right', '20px');
  expect(await input.evaluate((element) => getComputedStyle(element, '::placeholder').color)).toBe('rgb(85, 102, 119)');
  await input.focus();
  await expect(input).toHaveCSS('border-color', 'rgb(68, 34, 102)');
  await input.evaluate((element: HTMLInputElement) => { element.disabled = true; });
  await expect(input).toHaveCSS('opacity', '0.4');
});

test('公共控件消费主操作、焦点和禁用 token', async ({ page }) => {
  await page.goto('/cases/number-line/present');
  const button = page.getByRole('button', { name: '全屏', exact: true });
  await expect(button).toBeVisible();
  await page.evaluate(() => {
    const style = document.documentElement.style;
    style.setProperty('--control-primary-surface', '#315577');
    style.setProperty('--control-height', '56px');
    style.setProperty('--control-focus-color', '#554488');
    style.setProperty('--control-focus-width', '4px');
    style.setProperty('--control-disabled-opacity', '0.33');
  });
  await expect(button).toHaveCSS('background-color', 'rgb(49, 85, 119)');
  await expect(button).toHaveCSS('min-height', '56px');
  await button.focus();
  await expect(button).toHaveCSS('outline-color', 'rgb(85, 68, 136)');
  await expect(button).toHaveCSS('outline-width', '4px');
  await button.evaluate((element: HTMLButtonElement) => { element.disabled = true; });
  await expect(button).toHaveCSS('opacity', '0.33');
});

test('参考网格选中态消费公共状态 token', async ({ page }) => {
  await page.goto('/cases/cube-net/present');
  const grid = page.getByRole('button', { name: '参考网格' });
  await expect(grid).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => {
    const style = document.documentElement.style;
    style.setProperty('--control-selected-surface', '#ddeeff');
    style.setProperty('--control-selected-text', '#224466');
    style.setProperty('--control-selected-border', '#335577');
  });
  await expect(grid).toHaveCSS('background-color', 'rgb(221, 238, 255)');
  await expect(grid).toHaveCSS('color', 'rgb(34, 68, 102)');
  await expect(grid).toHaveCSS('border-color', 'rgb(51, 85, 119)');
  await grid.focus();
  await page.keyboard.press('Space');
  await expect(grid).toHaveAttribute('aria-pressed', 'false');
  await expect(grid).not.toHaveCSS('background-color', 'rgb(221, 238, 255)');
});

test('三维挂载读取真实 CSS token，非法数值进入案例恢复', async ({ page }) => {
  await page.goto('/cases/cube-net');
  await page.evaluate(() => document.documentElement.style.setProperty('--viz-3d-material-opacity', 'bad-value'));
  await page.getByRole('link', { name: '进入演示' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: '重试', exact: true })).toBeVisible();
  await page.evaluate(() => document.documentElement.style.removeProperty('--viz-3d-material-opacity'));
  await page.getByRole('button', { name: '重试', exact: true }).click();
  await expect(page.getByText('前', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('合法三维透明度 token 改变画布，挂载快照只在重新进入时更新', async ({ page }) => {
  await page.goto('/cases/cube-net/present');
  await expect(page.getByText('前', { exact: true })).toBeVisible();
  const canvas = page.locator('.cube-net__viewport canvas');
  const before = await canvas.screenshot();
  await page.evaluate(() => document.documentElement.style.setProperty('--viz-3d-material-opacity', '0'));
  const sameMount = await canvas.screenshot();
  await page.getByRole('link', { name: '返回', exact: true }).click();
  await page.getByRole('link', { name: '进入演示' }).click();
  await expect(page.getByText('前', { exact: true })).toBeVisible();
  const remounted = await canvas.screenshot();

  // 用浏览器自身解码截图；只计明显色差，忽略抗锯齿噪声，不添加截图基线。
  const changedFraction = (first: Buffer, second: Buffer) => page.evaluate(async ([a, b]) => {
    const pixels = async (encoded: string) => {
      const image = new Image();
      image.src = `data:image/png;base64,${encoded}`;
      await image.decode();
      const surface = document.createElement('canvas');
      surface.width = image.width;
      surface.height = image.height;
      const context = surface.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, surface.width, surface.height).data;
    };
    const left = await pixels(a);
    const right = await pixels(b);
    if (left.length !== right.length) throw new Error('Canvas dimensions changed');
    let changed = 0;
    for (let index = 0; index < left.length; index += 4) {
      if ([0, 1, 2].some((channel) => Math.abs(left[index + channel]! - right[index + channel]!) > 20)) changed++;
    }
    return changed / (left.length / 4);
  }, [first.toString('base64'), second.toString('base64')] as const);

  expect(await changedFraction(before, sameMount)).toBeLessThan(0.001);
  expect(await changedFraction(before, remounted)).toBeGreaterThan(0.02);
});
