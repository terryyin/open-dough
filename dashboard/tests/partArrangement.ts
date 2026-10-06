// Where parts a journey found lie against one another, compared by their
// boxes: side by side, stacked, on one line, in reading order, or inside.

import { expect, type Locator } from "@playwright/test";

export async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) {
    throw new Error(`No visible box for ${locator.toString()}`);
  }
  return found;
}

// Relative placement needs one browser turn: independent boundingBox calls can
// straddle a scroll or a snapshot update even when the parts never overlap.
async function boxesTogether(parts: Locator[]) {
  const first = parts[0];
  if (first === undefined) return [];
  const handles = await Promise.all(parts.map((part) => part.elementHandle()));
  try {
    return await first.page().evaluate(
      (nodes) =>
        nodes.map((node) => {
          if (node.getClientRects().length === 0)
            throw new Error("No visible box for a measured part");
          const { x, y, width, height } = node.getBoundingClientRect();
          return { x, y, width, height };
        }),
      handles,
    );
  } finally {
    await Promise.all(handles.map((handle) => handle.dispose()));
  }
}

// Each part ends before the next begins, across the page or down it.
function expectEachEndsBeforeNext(
  boxes: Awaited<ReturnType<typeof boxesTogether>>,
  start: "x" | "y",
  extent: "width" | "height",
) {
  boxes.slice(1).forEach((next, index) => {
    const previous = boxes[index];
    expect(
      (previous?.[start] ?? 0) + (previous?.[extent] ?? 0),
      `part ${index + 1} ends before part ${index + 2} begins`,
    ).toBeLessThanOrEqual(next[start] + 0.5);
  });
}

export async function expectSideBySideInOrder(partsInOrder: Locator[]) {
  expectEachEndsBeforeNext(await boxesTogether(partsInOrder), "x", "width");
}

export async function expectStackedInOrder(partsInOrder: Locator[]) {
  expectEachEndsBeforeNext(await boxesTogether(partsInOrder), "y", "height");
}

// The controls share one line, side by side in their order.
export async function expectOnOneLine(controls: Locator[]) {
  const boxes = await boxesTogether(controls);
  for (const each of boxes)
    expect(Math.abs(each.y - (boxes[0]?.y ?? 0))).toBeLessThanOrEqual(1);
  expectEachEndsBeforeNext(boxes, "x", "width");
}

// Whether everything in the wrapping group fits on its line at once: the
// group's widest single line, measured with this platform's text, against the
// width the group has.
async function groupLineHasRoom(group: Locator) {
  return group.evaluate((node) => {
    const element = node as HTMLElement;
    const room = element.getBoundingClientRect().width;
    const { width, flexWrap } = element.style;
    element.style.width = "max-content";
    element.style.flexWrap = "nowrap";
    const needed = element.getBoundingClientRect().width;
    element.style.width = width;
    element.style.flexWrap = flexWrap;
    return needed <= room + 0.5;
  });
}

// The group's controls share its line when it has room for all of them, and
// otherwise read in order within it.
export async function expectOnOneLineWhenRoom(
  group: Locator,
  controls: Locator[],
) {
  if (await groupLineHasRoom(group)) await expectOnOneLine(controls);
  else await expectInReadingOrder(group, controls);
}

// The parts read in their order: each follows the one before it on the same
// line or starts on a later line, never reaching beyond the area.
export async function expectInReadingOrder(area: Locator, parts: Locator[]) {
  const [around, ...boxes] = await boxesTogether([area, ...parts]);
  if (around === undefined)
    throw new Error("No visible box for the measured area");
  boxes.forEach((each, index) => {
    expect(each.x, `part ${index + 1} inside`).toBeGreaterThanOrEqual(around.x);
    expect(each.x + each.width, `part ${index + 1} inside`).toBeLessThanOrEqual(
      around.x + around.width,
    );
  });
  boxes.slice(1).forEach((next, index) => {
    const previous = boxes[index];
    if (previous === undefined) return;
    // Parts whose heights overlap share a line, as a note does its control.
    const sameLine =
      next.y < previous.y + previous.height - 1 &&
      next.y + next.height > previous.y + 1;
    if (sameLine)
      expect(
        previous.x + previous.width,
        `part ${index + 2} follows on its line`,
      ).toBeLessThanOrEqual(next.x);
    else
      expect(
        next.y,
        `part ${index + 2} on a later line`,
      ).toBeGreaterThanOrEqual(previous.y + previous.height - 1);
  });
}

export async function expectInside(inner: Locator, outer: Locator) {
  const [inside, around] = await boxesTogether([inner, outer]);
  if (inside === undefined || around === undefined)
    throw new Error("No visible box for the measured containment");
  expect(inside.x).toBeGreaterThanOrEqual(around.x - 0.5);
  expect(inside.x + inside.width).toBeLessThanOrEqual(
    around.x + around.width + 0.5,
  );
  expect(inside.y).toBeGreaterThanOrEqual(around.y - 0.5);
  expect(inside.y + inside.height).toBeLessThanOrEqual(
    around.y + around.height + 0.5,
  );
}
