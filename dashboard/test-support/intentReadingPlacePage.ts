// What a journey expects of the place Intent's reading pane scrolls to
// (../src/pageIntentReading.tsx): the pane, its offset, and a developer
// scrolling it.
import { expect, type Locator } from "@playwright/test";
import { fileReadingTab } from "./intentPerspectivePage.ts";

// The pane that scrolls the selected file's reading.
export const intentReadingPane = (intent: Locator) =>
  intent.locator(".intent-reading");

export const intentReadingScroll = (intent: Locator) =>
  intentReadingPane(intent).evaluate((element) => element.scrollTop);

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

// Chooses Purpose or Proof where the developer is reading. A located click
// would first scroll the pane to bring the sticky tab fully into view, moving
// the very place a return should restore.
export async function chooseReadingTabInPlace(
  intent: Locator,
  name: "Purpose" | "Proof",
) {
  await fileReadingTab(intent, name).dispatchEvent("click");
  await expect(fileReadingTab(intent, name)).toHaveAttribute(
    "aria-selected",
    "true",
  );
}
