// What a story CI comparison's relative timing marks show
// (../../src/IntentCiTimeChange.tsx): where a mark's zero sits, which way its
// bar extends and how far, read from layout rather than screenshots; and the
// Show % choice with the percentages it reveals.

import { expect, type Locator } from "@playwright/test";

export type MarkGeometry = {
  readonly direction: string;
  // Bar extent as a fraction of one side of the mark.
  readonly reach: number;
  // Distance of the zero tick's centre from the mark's centre, in pixels.
  readonly zeroOffset: number;
  // The bar's edge that meets the zero tick, from the mark's centre.
  readonly barStartOffset: number;
  readonly barWidth: number;
};

export async function markGeometry(cell: Locator): Promise<MarkGeometry> {
  const mark = cell.locator(".intent-ci-time-mark");
  await expect(mark).toHaveCount(1);
  return mark.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const centre = box.left + box.width / 2;
    const zero = element.querySelector(".intent-ci-time-zero");
    const bar = element.querySelector(".intent-ci-time-bar");
    if (zero === null || bar === null) throw new Error("Mark not drawn.");
    const zeroBox = zero.getBoundingClientRect();
    const barBox = bar.getBoundingClientRect();
    const direction = element.getAttribute("data-direction") ?? "";
    return {
      direction,
      reach: barBox.width / (box.width / 2),
      zeroOffset: zeroBox.left + zeroBox.width / 2 - centre,
      barStartOffset:
        direction === "faster" ? barBox.right - centre : barBox.left - centre,
      barWidth: barBox.width,
    };
  });
}

// The cell shows its words and a mark whose zero is centred, extending in
// DIRECTION to REACH of one side.
export async function expectMark(
  cell: Locator,
  direction: "faster" | "slower" | "none",
  reach: number,
) {
  const geometry = await markGeometry(cell);
  expect(geometry.direction).toBe(direction);
  expect(Math.abs(geometry.zeroOffset)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.barStartOffset)).toBeLessThanOrEqual(1);
  expect(geometry.reach).toBeCloseTo(reach, 1);
  return geometry;
}

export const showPercent = (panel: Locator) =>
  panel.getByRole("checkbox", { name: "Show %", exact: true });

export const percentages = (panel: Locator) =>
  panel.locator(".intent-ci-time-percent");
