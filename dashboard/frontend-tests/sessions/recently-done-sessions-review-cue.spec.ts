// At narrow touch width a long-titled row keeps its Needs review cue and its
// separate Select and Open usable (moves with slice 9's touch proof). Story
// rows' review cue: ./recently-done-review-cue-mount.spec.ts.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { expectSessionReviewCue } from "../../test-support/recentlyDoneSessionsSidebarPage.ts";
import {
  cueSession,
  longSessionTitle,
  openFrontendReviewCueSessions,
} from "../../test-support/support/frontendRecentlyDoneReviewCue.ts";
import { box, tapWhereShown } from "../../test-support/pageLayout.ts";
import { phoneLaunchTouchViewport } from "../../test-support/touchLaunchPage.ts";
import {
  finalReportPanel,
  finalReportText,
} from "../../test-support/finalReportPages.ts";

test.describe("narrow touch review cue", () => {
  test.use({ viewport: phoneLaunchTouchViewport.portrait, hasTouch: true });
  test("a long title leaves Needs review and separate Select and Open usable", async ({
    page,
    frontendServices,
  }) => {
    const { shown } = await openFrontendReviewCueSessions(
      page,
      frontendServices,
      {
        extra: [cueSession(longSessionTitle, 0)],
        tap: tapWhereShown,
      },
    );
    await expectSessionReviewCue(shown.row(longSessionTitle), true);
    const cue = shown.reviewCue(longSessionTitle);
    const bounds = await box(shown.row(longSessionTitle));
    const warning = await box(cue);
    expect(warning.x).toBeGreaterThanOrEqual(bounds.x);
    expect(warning.x + warning.width).toBeLessThanOrEqual(
      bounds.x + bounds.width,
    );
    for (const control of [
      shown.select(longSessionTitle),
      shown.open(longSessionTitle),
    ])
      expect((await box(control)).height).toBeGreaterThanOrEqual(44);
    await tapWhereShown(shown.select(longSessionTitle));
    await expect(shown.select(longSessionTitle)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectSessionReviewCue(shown.row(longSessionTitle), true);
    await expect(finalReportPanel(page)).toHaveCount(0);
    await tapWhereShown(shown.open(longSessionTitle));
    await expect(finalReportText(page)).toHaveText(
      `Report for ${longSessionTitle}.`,
    );
  });
});
