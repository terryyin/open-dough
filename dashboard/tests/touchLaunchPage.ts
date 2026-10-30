import type { Locator } from "@playwright/test";

export const phoneLaunchTouchViewport = {
  name: "phone",
  portrait: { width: 390, height: 844 },
  landscape: { width: 844, height: 390 },
};

export const tabletLaunchTouchViewport = {
  name: "tablet",
  portrait: { width: 768, height: 1024 },
  landscape: { width: 1024, height: 768 },
};

export const launchTouchViewports = [
  phoneLaunchTouchViewport,
  tabletLaunchTouchViewport,
];

// A touch chooses the caret. Enter and typed text must preserve the draft on
// both sides of that actual selection, including a selected range.
export async function typeInstructionLine(
  instruction: Locator,
  draft: string,
  line: string,
): Promise<string> {
  const caret = await instruction.evaluate((field: HTMLTextAreaElement) => ({
    start: field.selectionStart,
    end: field.selectionEnd,
  }));
  await instruction.press("Enter");
  await instruction.pressSequentially(line);
  return `${draft.slice(0, caret.start)}\n${line}${draft.slice(caret.end)}`;
}
