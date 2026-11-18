// How one configured Intent location's header reads in the locations column
// (../src/IntentLocationGroup.tsx): its background, change mark, width, and
// label weight.

import { expect, type Locator } from "@playwright/test";
import { intentGroupToggle } from "./intentPerspectivePage.ts";

// One configured Intent location's header: its toggle and selectable name.
export function intentLocationHeader(intent: Locator, locationPath: string) {
  return intentGroupToggle(intent, locationPath).locator("xpath=..");
}

// How a location header reads: its own background, its change mark, whether
// its toggle and name let that background through, whether it spans the
// locations column edge to edge, and its label's font weight.
export function locationHeaderLook(header: Locator) {
  return header.evaluate((element) => {
    const style = getComputedStyle(element);
    const column = element.closest(".intent-locations") ?? element;
    const columnLeft = column.getBoundingClientRect().left + column.clientLeft;
    const box = element.getBoundingClientRect();
    const label = element.querySelector(".intent-location-name > *");
    return {
      background: style.backgroundColor,
      mark: style.boxShadow,
      controlsShowHeader: [...element.children].every(
        (child) =>
          getComputedStyle(child).backgroundColor === "rgba(0, 0, 0, 0)",
      ),
      fullWidth:
        Math.abs(box.left - columnLeft) < 1 &&
        Math.abs(box.width - column.clientWidth) < 1,
      labelWeight: Number(getComputedStyle(label ?? element).fontWeight),
    };
  });
}

// How the header of the configured location at `locationPath` reads.
export const locationHeaderLookAt = (intent: Locator, locationPath: string) =>
  locationHeaderLook(intentLocationHeader(intent, locationPath));

// A location containing changes: its header has a background of its own,
// unlike a changed folder's row (`folderBackground`), and a change mark, and
// spans the column with its label bold. Returns that look.
export async function expectChangedLocationHeader(
  intent: Locator,
  locationPath: string,
  folderBackground: string,
) {
  const look = await locationHeaderLookAt(intent, locationPath);
  expect(look.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(look.background).not.toBe(folderBackground);
  expect(look.mark).not.toBe("none");
  expect(look.fullWidth).toBe(true);
  expect(look.labelWeight).toBeGreaterThanOrEqual(600);
  return look;
}
