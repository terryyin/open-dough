// Observations of the phone terminal's Select control and the paused text it
// shows over the terminal screen, for either tier's journeys.
import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { terminalKey } from "./touchTerminalPage.ts";

export function selectKey(panel: Locator) {
  return terminalKey(panel, "Select");
}

export function pausedText(panel: Locator) {
  return panel.locator(".terminal-paused-text");
}

export async function pausedLines(panel: Locator): Promise<string[]> {
  return ((await pausedText(panel).textContent()) ?? "").split("\n");
}

// The lines the terminal itself draws, row by row, without the blank cells
// that end a row.
async function drawnRows(panel: Locator): Promise<string[]> {
  const rows = await panel.locator(".xterm-rows > div").allTextContents();
  return rows.map((row) => row.trimEnd());
}

// The paused text holds exactly the rows the terminal draws.
export async function expectPausedHoldsDrawnRows(panel: Locator) {
  await expect(pausedText(panel)).toBeVisible();
  const lines = (await pausedLines(panel)).map((line) => line.trimEnd());
  await expect.poll(() => drawnRows(panel)).toEqual(lines);
}

// The paused text lies over the terminal screen's whole box, opaque in the
// screen's own colour and on top at its middle and corners, so nothing of the
// live screen shows. It is ordinary selectable text outside the screen
// element, whose one-finger movement the terminal takes.
export async function expectPausedOverScreen(panel: Locator) {
  await expect(pausedText(panel)).toBeVisible();
  await expect
    .poll(() =>
      pausedText(panel).evaluate((text) => {
        const screen = text
          .closest(".side-panel")
          ?.querySelector(".terminal-screen");
        if (!screen) return ["no terminal screen in the panel"];
        const over = text.getBoundingClientRect();
        const under = screen.getBoundingClientRect();
        const look = getComputedStyle(text);
        const faults: string[] = [];
        for (const side of ["left", "top", "right", "bottom"] as const)
          if (Math.abs(over[side] - under[side]) > 0.5)
            faults.push(
              `${side} ${String(over[side])} / ${String(under[side])}`,
            );
        for (const [across, down] of [
          [0.5, 0.5],
          [0.02, 0.02],
          [0.98, 0.02],
          [0.02, 0.98],
          [0.98, 0.98],
        ] as const) {
          const top = document.elementFromPoint(
            under.left + under.width * across,
            under.top + under.height * down,
          );
          if (top !== text)
            faults.push(`${String(across)},${String(down)} shows the screen`);
        }
        if (look.backgroundColor !== getComputedStyle(screen).backgroundColor)
          faults.push(`background ${look.backgroundColor}`);
        if (look.backgroundColor.startsWith("rgba")) faults.push("see-through");
        if (look.userSelect !== "text") faults.push("not selectable");
        if (look.touchAction !== "auto") faults.push("takes touches itself");
        if (screen.contains(text)) faults.push("inside the terminal screen");
        return faults;
      }),
    )
    .toEqual([]);
}

// Paused line `row` lies where the terminal draws its row `row`.
export async function expectPausedLineInPlace(panel: Locator, row: number) {
  const places = await pausedText(panel).evaluate((text, line) => {
    const node = text.firstChild;
    const drawn = text
      .closest(".side-panel")
      ?.querySelectorAll(".xterm-rows > div");
    const lines = text.textContent.split("\n");
    if (node === null || drawn === undefined) return undefined;
    const start = lines.slice(0, line).join("\n").length + (line > 0 ? 1 : 0);
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + (lines[line]?.length ?? 0));
    const paused = range.getBoundingClientRect();
    const live = drawn[line]?.getBoundingClientRect();
    return live && { paused: [paused.x, paused.y], live: [live.x, live.y] };
  }, row);
  expect(places, "a paused line and its terminal row").toBeDefined();
  for (const axis of [0, 1]) {
    expect(
      Math.abs((places?.paused[axis] ?? 0) - (places?.live[axis] ?? 0)),
      `paused line ${String(row)} lies on its terminal row`,
    ).toBeLessThanOrEqual(1);
  }
}

// Selects the paused text from the first `from` to the end of the next `to`,
// the range a device's handles would give, and returns what the page then
// holds selected. No dashboard control takes part.
export function selectPausedRange(panel: Locator, from: string, to: string) {
  return pausedText(panel).evaluate(
    (text, { from: first, to: last }) => {
      const node = text.firstChild;
      const content = text.textContent;
      const start = content.indexOf(first);
      const end = content.indexOf(last, start);
      if (node === null || start < 0 || end < 0)
        throw new Error("The paused text does not hold that range.");
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end + last.length);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return selection?.toString() ?? "";
    },
    { from, to },
  );
}

// What the page holds selected now.
export function selectedText(panel: Locator) {
  return panel.evaluate(() => window.getSelection()?.toString() ?? "");
}

// Select reads as on and the paused text is shown.
export async function expectPaused(panel: Locator) {
  await expect(selectKey(panel)).toHaveAttribute("aria-pressed", "true");
  await expect(pausedText(panel)).toBeVisible();
}

// Select reads as off and the live terminal is what the screen's box shows.
export async function expectLive(panel: Locator) {
  await expect(selectKey(panel)).toHaveAttribute("aria-pressed", "false");
  await expect(pausedText(panel)).toHaveCount(0);
  expect(
    await panel.locator(".terminal-screen").evaluate((screen) => {
      const { left, top, width, height } = screen.getBoundingClientRect();
      return screen.contains(
        document.elementFromPoint(left + width / 2, top + height / 2),
      );
    }),
    "the terminal screen is on top of its own box",
  ).toBe(true);
}
