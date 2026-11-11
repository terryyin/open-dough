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

// The lines the paused text holds, as a copy of all of it gives them.
export async function pausedLines(panel: Locator): Promise<string[]> {
  return ((await pausedText(panel).textContent()) ?? "").split("\n");
}

// Every row the terminal draws is what the paused text shows at that row's
// place: the same characters, from where the row begins to where the paused
// text's own row ends, in columns of one width. The text at a place is read
// as a finger there would find it.
export async function expectPausedShowsDrawnRowsInPlace(panel: Locator) {
  await expect(pausedText(panel)).toBeVisible();
  await expect
    .poll(() =>
      pausedText(panel).evaluate((text) => {
        const drawn = text
          .closest(".side-panel")
          ?.querySelectorAll(".xterm-rows > div");
        if (!drawn?.length) return ["no terminal rows in the panel"];
        const edge = text.getBoundingClientRect().right - 1;
        const faults: string[] = [];
        const columns: number[] = [];
        drawn.forEach((row, index) => {
          const live = row.getBoundingClientRect();
          const middle = live.top + live.height / 2;
          const start = document.caretPositionFromPoint(live.left + 1, middle);
          const end = document.caretPositionFromPoint(edge, middle);
          if (
            !start ||
            !end ||
            !text.contains(start.offsetNode) ||
            !text.contains(end.offsetNode)
          ) {
            faults.push(`row ${String(index)} is not paused text`);
            return;
          }
          const shown = document.createRange();
          shown.setStart(start.offsetNode, start.offset);
          shown.setEnd(end.offsetNode, end.offset);
          const characters = shown.toString().trimEnd();
          if (characters !== row.textContent.trimEnd())
            faults.push(`row ${String(index)} shows "${characters}"`);
          if (characters === "") return;
          const paused = shown.getBoundingClientRect();
          if (
            Math.abs(paused.left - live.left) > 1 ||
            Math.abs(paused.top - live.top) > 1
          )
            faults.push(
              `row ${String(index)} lies at ${String(paused.left)},${String(paused.top)}, drawn at ${String(live.left)},${String(live.top)}`,
            );
          columns.push(paused.width / shown.toString().length);
        });
        if (Math.max(...columns) - Math.min(...columns) > 0.05)
          faults.push(`columns of widths ${columns.join(", ")}`);
        return faults;
      }),
    )
    .toEqual([]);
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
        if (look.overscrollBehaviorY !== "contain")
          faults.push("hands a stroke at its end to the page");
        if (screen.contains(text)) faults.push("inside the terminal screen");
        return faults;
      }),
    )
    .toEqual([]);
}

// Selects the paused text from the first `from` to the end of the next `to`,
// the range a device's handles would give, and returns what the page then
// holds selected. No dashboard control takes part.
export function selectPausedRange(panel: Locator, from: string, to: string) {
  return pausedText(panel).evaluate(
    (text, { from: first, to: last }) => {
      const content = text.textContent;
      const start = content.indexOf(first);
      const end = content.indexOf(last, start);
      // The place in the text's own nodes `offset` characters into it: where
      // a range ends, or else where it begins.
      const place = (offset: number, ends: boolean) => {
        const nodes = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
        let left = offset;
        for (let node = nodes.nextNode(); node; node = nodes.nextNode()) {
          const length = node.textContent?.length ?? 0;
          if (left < length || (ends && left === length))
            return [node, left] as const;
          left -= length;
        }
        throw new Error("The paused text does not hold that range.");
      };
      if (start < 0 || end < 0)
        throw new Error("The paused text does not hold that range.");
      const range = document.createRange();
      range.setStart(...place(start, false));
      range.setEnd(...place(end + last.length, true));
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
