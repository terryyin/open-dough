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

export type RelativeFigure = {
  readonly identity: {
    readonly row: string | null;
    readonly column: number | null;
    readonly overallWall: boolean;
  };
  readonly words: string;
  readonly marks: readonly MarkGeometry[];
  readonly percentages: readonly string[];
};

type RelativeObservation = {
  readonly figures: readonly RelativeFigure[];
  readonly percentages: readonly string[];
};

// The same layout calculation serves mark.evaluate and selected.evaluateAll.
function observeRelativeFigures(
  nodes: Element | Element[],
): MarkGeometry | RelativeObservation {
  const words = (element: Element) =>
    element.textContent
      .replace(/[\u200b\u00ad]/g, "")
      .trim()
      .replace(/\s+/g, " ");
  const geometry = (element: Element): MarkGeometry => {
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
  };
  if (!Array.isArray(nodes)) return geometry(nodes);
  return {
    figures: nodes
      .filter((node) => !node.matches(".intent-ci-time-percent"))
      .map((node): RelativeFigure => {
        const row = node.closest("tr");
        return {
          identity: {
            row:
              row === null
                ? null
                : (row.querySelector("th")?.textContent ?? "").trim(),
            column:
              row === null ? null : Array.from(row.children).indexOf(node),
            overallWall: node.matches(".intent-ci-comparison-overall-wall"),
          },
          words: words(node),
          marks: Array.from(
            node.querySelectorAll(".intent-ci-time-mark"),
            geometry,
          ),
          percentages: Array.from(
            node.querySelectorAll(".intent-ci-time-percent"),
            (percent) => percent.textContent,
          ),
        };
      }),
    percentages: nodes
      .filter((node) => node.matches(".intent-ci-time-percent"))
      .map((percent) => percent.textContent),
  };
}

// TARGETS are the actual selected cells/figures. Arrays preserve DOM order and
// duplicate cardinality; percentages also retain every result in the scope.
export async function relativeFigures(
  targets: Locator,
  percentScope?: Locator,
) {
  const selected =
    percentScope === undefined
      ? targets
      : targets.or(percentages(percentScope));
  const actual = await selected.evaluateAll(observeRelativeFigures);
  if ("figures" in actual) return actual;
  throw new Error("Expected selected relative figures.");
}

export async function markGeometry(cell: Locator): Promise<MarkGeometry> {
  const mark = cell.locator(".intent-ci-time-mark");
  await expect(mark).toHaveCount(1);
  const actual = await mark.evaluate(observeRelativeFigures);
  if ("direction" in actual) return actual;
  throw new Error("Expected a single relative mark.");
}

// The cell shows its words and a mark whose zero is centred, extending in
// DIRECTION to REACH of one side.
export async function expectMark(
  cell: Locator,
  direction: "faster" | "slower" | "none",
  reach: number,
) {
  return expectMarkGeometry(await markGeometry(cell), direction, reach);
}

export function expectMarkGeometry(
  geometry: MarkGeometry,
  direction: "faster" | "slower" | "none",
  reach: number,
) {
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
