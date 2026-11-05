// How one configured Intent location's header reads in the locations column
// (../src/IntentLocationGroup.tsx): its background, change mark, and width.

import type { Locator } from "@playwright/test";
import { intentGroupToggle } from "./intentPerspectivePage.ts";

// One configured Intent location's header: its toggle and selectable name.
export function intentLocationHeader(intent: Locator, locationPath: string) {
  return intentGroupToggle(intent, locationPath).locator("xpath=..");
}

// How a location header reads: its own background, its change mark, whether
// its toggle and name let that background through, and whether it spans its
// group's full width.
export function locationHeaderLook(header: Locator) {
  return header.evaluate((element) => {
    const style = getComputedStyle(element);
    const group = element.parentElement ?? element;
    const groupStyle = getComputedStyle(group);
    const inner =
      group.clientWidth -
      Number.parseFloat(groupStyle.paddingLeft) -
      Number.parseFloat(groupStyle.paddingRight);
    return {
      background: style.backgroundColor,
      mark: style.boxShadow,
      controlsShowHeader: [...element.children].every(
        (child) =>
          getComputedStyle(child).backgroundColor === "rgba(0, 0, 0, 0)",
      ),
      fullWidth: Math.abs(element.getBoundingClientRect().width - inner) < 1,
    };
  });
}
