// Phone terminal input, action layout and closure. Capture belongs to terminalVoicePage.
import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { closeSidePanel, control } from "../sidePanelFrame.ts";
import { box } from "../pageLayout.ts";
import { focusByTouch } from "../touchTerminalPage.ts";
import { insertTerminalText } from "../terminalScreenPage.ts";

export async function writeTouchTerminalInput(panel: Locator, text: string) {
  await focusByTouch(panel);
  await insertTerminalText(panel.page(), text);
}

export async function expectTerminalActionsOrder(
  panel: Locator,
  names: readonly string[],
) {
  const bounds = await Promise.all(
    names.map((name) => box(control(panel, name))),
  );
  for (const [index, current] of bounds.entries()) {
    const next = bounds[index + 1];
    if (next === undefined) continue;
    expect(
      current.x,
      `${names[index]} precedes ${names[index + 1]}`,
    ).toBeLessThan(next.x);
  }
}

export async function expectTerminalActionsFit(
  panel: Locator,
  names: readonly string[],
  minimumSize: number,
) {
  for (const name of names) {
    const action = control(panel, name);
    await expect(action).toBeInViewport({ ratio: 1 });
    const bounds = await box(action);
    expect(bounds.width, `${name} width`).toBeGreaterThanOrEqual(minimumSize);
    expect(bounds.height, `${name} height`).toBeGreaterThanOrEqual(minimumSize);
  }
}

export async function closeTouchTerminal(panel: Locator) {
  await closeSidePanel(panel, { using: "touch" });
  await expect(panel).toHaveCount(0);
}
