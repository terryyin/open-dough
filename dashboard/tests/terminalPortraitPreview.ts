// Observe the terminal portrait's real enlarged hover layer at window/panel edges.

import { expect, type Locator } from "@playwright/test";
import { box } from "./pageLayout.ts";

export async function expectTerminalPreviewFits(
  portrait: Locator,
  panel: Locator,
) {
  const page = portrait.page();
  await portrait.hover();
  // Read the rendered pseudo-element, including its transform, rather than
  // assuming that the placement variables imply a visible, unclipped preview.
  const previewBox = () =>
    portrait.evaluate((element) => {
      const anchor = element.getBoundingClientRect();
      const css = getComputedStyle(element, "::after");
      const transform = new DOMMatrixReadOnly(css.transform);
      return {
        x: anchor.x + element.clientLeft + parseFloat(css.left) + transform.e,
        y: anchor.y + element.clientTop + parseFloat(css.top) + transform.f,
        width: parseFloat(css.width) * transform.a,
        height: parseFloat(css.height) * transform.d,
        opacity: css.opacity,
      };
    });
  await expect.poll(async () => (await previewBox()).opacity).toBe("1");
  const expectPreviewContained = async () => {
    await expect(async () => {
      const preview = await previewBox();
      const bounds = await box(panel);
      const viewport = page.viewportSize();
      if (!viewport) throw new Error("Preview proof requires a fixed viewport");
      expect(
        preview.x,
        "preview left within panel/window",
      ).toBeGreaterThanOrEqual(Math.max(0, bounds.x));
      expect(
        preview.y,
        "preview top within panel/window",
      ).toBeGreaterThanOrEqual(Math.max(0, bounds.y));
      expect(
        preview.x + preview.width,
        "preview right within panel/window",
      ).toBeLessThanOrEqual(Math.min(viewport.width, bounds.x + bounds.width));
      expect(
        preview.y + preview.height,
        "preview bottom within panel/window",
      ).toBeLessThanOrEqual(
        Math.min(viewport.height, bounds.y + bounds.height),
      );
    }).toPass();
  };
  await expectPreviewContained();
  expect((await previewBox()).y).toBeGreaterThanOrEqual(
    (await box(portrait)).y + (await box(portrait)).height,
  );
  await page.setViewportSize({ width: 800, height: 220 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await portrait.hover();
  await expectPreviewContained();
  // Move the real portrait to the panel's right edge, preserving its hover
  // and preview rendering; the test supplies only the anchor's geometry.
  await portrait.evaluate((element) => {
    const terminal = element.closest(".side-panel");
    if (!terminal)
      throw new Error("Portrait must belong to the terminal panel");
    const panel = terminal.getBoundingClientRect();
    const shown = element as HTMLElement;
    const anchor = element.getBoundingClientRect();
    shown.style.transform = `translateX(${panel.right - anchor.right - 2}px)`;
  });
  await page.mouse.move(0, 0);
  await portrait.hover();
  await expectPreviewContained();
  // Resize while still hovered; the preview must remain within the now
  // shorter panel, even when its usual triple-size circle cannot fit.
  await page.setViewportSize({ width: 800, height: 160 });
  await expectPreviewContained();
  // End the previous hover before supplying a new anchor position. Otherwise
  // the browser can keep the same hover target and its old placement values.
  await page.mouse.move(0, 0);
  await page.setViewportSize({ width: 800, height: 600 });
  await portrait.evaluate((element) => {
    const shown = element as HTMLElement;
    shown.style.transform = "translateY(200px)";
    shown.style.zIndex = "2";
  });
  await portrait.hover();
  await expectPreviewContained();
  expect(
    (await previewBox()).y + (await previewBox()).height,
  ).toBeLessThanOrEqual((await box(portrait)).y);
  await expect(portrait).toHaveCSS("animation-name", "none");
  expect(
    await portrait.evaluate(
      (element) => getComputedStyle(element, "::after").animationName,
    ),
  ).toBe("portrait-gesture");
  await page.setViewportSize({ width: 1280, height: 720 });
  await portrait.evaluate((element) =>
    (element as HTMLElement).style.removeProperty("transform"),
  );
}
