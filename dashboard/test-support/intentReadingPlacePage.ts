// What a journey expects of the place Intent's reading pane scrolls to
// (../src/pageIntentReading.tsx): the pane, its offset, and a developer
// scrolling it.
import { expect, type Locator } from "@playwright/test";

// The pane that scrolls the selected file's reading.
export const intentReadingPane = (intent: Locator) =>
  intent.locator(".intent-reading");

export const intentReadingScroll = (intent: Locator) =>
  intentReadingPane(intent).evaluate((element) => element.scrollTop);

// The caller's independently observed place remains after the transition.
export async function expectReadingOffset(intent: Locator, offset: number) {
  expect(await intentReadingScroll(intent)).toBe(offset);
}

// Scrolls the reading pane back to its start with the mouse wheel, as the
// developer reading away would; a reader's scroll also ends the restoring of
// a kept reading place (../src/pageIntentReading.tsx).
export async function scrollIntentReadingToStart(intent: Locator) {
  const pane = intentReadingPane(intent);
  await pane.hover();
  await pane.page().mouse.wheel(0, -(await intentReadingScroll(intent)) - 100);
  await expect.poll(() => intentReadingScroll(intent)).toBe(0);
}

// Scrolls the reading pane halfway, as the developer reading would, and
// returns the offset it came to rest at.
export async function scrollIntentReadingHalfway(intent: Locator) {
  const offset = await intentReadingPane(intent).evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        const most = element.scrollHeight - element.clientHeight;
        if (most < 40) {
          resolve(0);
          return;
        }
        element.addEventListener(
          "scroll",
          () => {
            resolve(element.scrollTop);
          },
          { once: true },
        );
        element.scrollTo({ top: Math.floor(most / 2) });
      }),
  );
  expect(offset).toBeGreaterThan(20);
  return offset;
}
