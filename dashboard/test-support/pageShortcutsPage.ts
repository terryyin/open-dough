// What became of the page-wide Command shortcuts (`../src/pageShortcuts.ts`)
// a journey presses, and where the keyboard is before and after.

import { expect, type Locator, type Page } from "@playwright/test";

type Taken = Record<string, boolean[]>;

// Whether each press of this Command shortcut, written as for
// `page.keyboard.press` ("Meta+b", "Meta+Shift+Escape"), that reached the
// window had its default prevented, in order. It listens while capturing,
// after the page, which keeps the key from going further.
export async function watchCommandShortcut(page: Page, shortcut: string) {
  const keys = shortcut.split("+");
  if (keys[0] !== "Meta") {
    throw new Error(`Not a Command shortcut: ${shortcut}`);
  }
  const watched = {
    shortcut,
    key: keys[keys.length - 1] ?? "",
    shift: keys.includes("Shift"),
  };
  await page.evaluate(({ shortcut, key, shift }) => {
    const seen: boolean[] = [];
    const holder = window as unknown as { commandShortcuts?: Taken };
    holder.commandShortcuts = { ...holder.commandShortcuts, [shortcut]: seen };
    window.addEventListener(
      "keydown",
      (event) => {
        if (
          event.metaKey &&
          event.shiftKey === shift &&
          event.key.toLowerCase() === key.toLowerCase()
        ) {
          seen.push(event.defaultPrevented);
        }
      },
      true,
    );
  }, watched);
  return () =>
    page.evaluate(
      (shortcut) =>
        (window as unknown as { commandShortcuts: Taken }).commandShortcuts[
          shortcut
        ],
      shortcut,
    );
}

// Marks the element holding the keyboard, so a later check can tell the
// keyboard is still on that very element; answers its tag name, or "" when
// only the page holds the keyboard.
export function markKeyboardPlace(page: Page): Promise<string> {
  return page.evaluate(() => {
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || focused === document.body) {
      return "";
    }
    focused.dataset.keyboardWasHere = "yes";
    return focused.tagName;
  });
}

// The keyboard is still on the element `markKeyboardPlace` marked.
export async function expectKeyboardAtMark(page: Page): Promise<void> {
  expect(
    await page.evaluate(
      () =>
        document.activeElement instanceof HTMLElement &&
        document.activeElement.dataset.keyboardWasHere === "yes",
    ),
    "the keyboard left the element it was on",
  ).toBe(true);
}

// Whether the keyboard is on an element inside this part of the page.
export const keyboardWithin = (scope: Locator) =>
  scope.evaluate((element) => element.contains(document.activeElement));
