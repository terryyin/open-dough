// The one Side panel as a fluent page object for the Side panel journeys
// (./sidePanelPages.ts): its frame, shared by whatever content it shows, and
// which content that is. It reaches its content, a Story review
// (./storyReviewPages.ts) or a Final report (./finalReportPages.ts), through
// the phase's page-object set. Each method writes one named cue on the
// phase's cue sheet (./support/cueSheet.ts) and returns the page object the
// reader is then at (./fluentPageObject.ts).

import { parts } from "./dashboardParts.ts";
import { expectFrameIconControl } from "./frameIconControl.ts";
import { PageObject } from "./fluentPageObject.ts";
import { expectFills, type Room } from "./pageLayout.ts";
import {
  control,
  maximizeSidePanel,
  restoreSidePanel,
} from "./sidePanelFrame.ts";
import { expect } from "./support/preparationPage.ts";
import { sidePanelContents } from "./support/sidePanelContents.ts";

// The Side panel's content kinds, by the name each region gives itself.
type SidePanelContent = "Terminal" | "Final report" | "Story review";

// The Side panel's frame is its shown content's header controls, the same
// for every content, and the room the content fills: the split beside the
// Board, or the page's when maximized, without the banner.
export class SidePanel extends PageObject {
  #control(name: string) {
    return control(sidePanelContents(this.page), name);
  }

  #frame(name: string, run: () => Promise<void>) {
    return this.cueHere(`Side panel: ${name}`, run);
  }

  // Presses Maximize with the mouse where it shows.
  maximize() {
    return this.#frame("Maximize", () =>
      maximizeSidePanel(sidePanelContents(this.page)),
    );
  }

  restore() {
    return this.#frame("Restore", () =>
      restoreSidePanel(sidePanelContents(this.page)),
    );
  }

  expectMaximized() {
    return this.#frame("maximized, the banner hidden", () =>
      expect(parts(this.page).banner).toBeHidden(),
    );
  }

  // Beside the Board, with Maximize offered and the banner shown.
  expectInSplit() {
    return this.#frame("in the normal split", async () => {
      await expect(this.#control("Maximize")).toBeVisible();
      await expect(parts(this.page).banner).toBeVisible();
    });
  }

  // The shown content fills `room`, as measured earlier.
  expectFills(room: Room) {
    const { x, y, width, height } = room;
    return this.#frame(`fills ${String([x, y, width, height])}`, () =>
      expectFills(sidePanelContents(this.page), room),
    );
  }

  // The header's `name` control is a frame icon control
  // (./frameIconControl.ts), its tooltip saying `tooltip`.
  expectFrameIconControl(name: string, tooltip = name) {
    return this.#frame(`${name} is a frame icon control`, () =>
      expectFrameIconControl(this.#control(name), name, tooltip),
    );
  }

  get storyReview() {
    return this.pages.storyReview;
  }

  get finalReport() {
    return this.pages.finalReport;
  }

  // How many contents the one Side panel shows: none or one.
  expectItems(count: number) {
    return this.cueHere(
      `Side panel: shows ${String(count)} ${count === 1 ? "item" : "items"}`,
      () => expect(sidePanelContents(this.page)).toHaveCount(count),
    );
  }

  expectNotShowing(content: SidePanelContent) {
    return this.cueHere(`Side panel: shows no ${content}`, () =>
      expect(
        this.page.getByRole("region", { name: content, exact: true }),
      ).toHaveCount(0),
    );
  }
}
