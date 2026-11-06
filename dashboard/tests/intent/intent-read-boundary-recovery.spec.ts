// Boundary-classified settings and listing failures recover through Intent's
// existing locations Retry path at the same published revision.

import { filesOf } from "../catalogProjectRecords.ts";
import { expect, githubFor, pausePageClockAt, test } from "../dashboardTest.ts";
import { doughnut, doughnutSettings } from "../intentCodeBrowseFixtures.ts";
import {
  countLocationsReads,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import {
  advanceRecoveryClock,
  locationFiles,
  openDoughnut,
  opened,
  settingsPath,
} from "../intentReadRecoveryPage.ts";
import { httpErrorAnswer, noConnection } from "../originAnswers.ts";
import { publishes } from "../support/fakeGitHub.ts";

for (const failure of ["settings", "listing"] as const) {
  test(`a boundary-classified transient Intent ${failure} failure recovers at the same revision`, async ({
    page,
  }) => {
    await pausePageClockAt(page, opened);
    const published = publishes({
      revision: doughnut.revision,
      files: {
        ...filesOf(doughnut),
        [settingsPath]: doughnutSettings,
        ...locationFiles,
      },
    });
    let unavailable = true;
    githubFor(page).serve(doughnut.repository, async (call) => {
      const { request } = call;
      if (unavailable) {
        if (
          failure === "settings" &&
          request.kind === "content" &&
          request.path === settingsPath
        ) {
          return noConnection;
        }
        if (
          failure === "listing" &&
          request.kind === "tree" &&
          request.path === "scripts"
        ) {
          return httpErrorAnswer(503);
        }
      }
      return published(call);
    });
    const reads = countLocationsReads(page);
    const intent = await openDoughnut(page);
    await expect(intent.getByRole("alert")).toContainText(
      failure === "settings"
        ? `${settingsPath} could not be read`
        : "GitHub answered HTTP 503",
    );
    unavailable = false;

    await advanceRecoveryClock(page, 14_999);
    expect(reads()).toBe(1);
    await advanceRecoveryClock(page, 251);
    expect(reads()).toBe(2);
    await expect(intentLocationName(intent, "scripts")).toBeVisible();
    await expect(intent.getByRole("alert")).toHaveCount(0);
  });
}
