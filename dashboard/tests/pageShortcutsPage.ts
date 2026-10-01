// What became of the page-wide Command shortcuts (`../src/pageShortcuts.ts`)
// a journey presses.

import type { Page } from "@playwright/test";

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
