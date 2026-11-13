// Boundary-classified settings and listing failures recover through Intent's
// existing locations Retry path at the same published revision.

import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/tests/dashboardTest.ts";
import {
  doughnut,
  doughnutSettings,
} from "../../dashboard/tests/intentCodeBrowseFixtures.ts";
import {
  countLocationsReads,
  intentLocationName,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import {
  advanceRecoveryClock,
  locationFiles,
  openDoughnut,
  opened,
  settingsPath,
  readFailure,
} from "../../dashboard/tests/intentReadRecoveryPage.ts";
import {
  httpErrorAnswer,
  noConnection,
} from "../../dashboard/tests/originAnswers.ts";
import { publishes } from "../../dashboard/tests/support/fakeGitHub.ts";
import { intentSettingsText } from "../../dashboard/tests/support/intentSettingsFile.ts";

for (const failure of ["settings", "listing"] as const) {
  test(`a boundary-classified transient Intent ${failure} failure recovers at the same revision`, async ({
    page,
  }) => {
    await pausePageClockAt(page, opened);
    const published = publishes({
      revision: doughnut.revision,
      files: {
        ...doughnut.files,
        [settingsPath]: intentSettingsText(doughnutSettings),
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
    await expect(readFailure(intent)).toContainText(
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
    await expect(readFailure(intent)).toHaveCount(0);
  });
}
