// Boundary-classified settings and listing failures recover through Intent's
// existing locations Retry path at the same published revision.

import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  doughnut,
  doughnutSettings,
} from "../../dashboard/test-support/intentCodeBrowseFixtures.ts";
import {
  countLocationsReads,
  intentLocationName,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  advanceRecoveryClock,
  locationFiles,
  openDoughnut,
  opened,
  settingsPath,
  readFailure,
} from "../../dashboard/test-support/intentReadRecoveryPage.ts";
import {
  httpErrorAnswer,
  noConnection,
} from "../../dashboard/test-support/originAnswers.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { limiting } from "../../dashboard/test-support/limitedReadingJourney.ts";
import { noticedResumeTime } from "../../dashboard/test-support/limitNotice.ts";
import { untilReported } from "../../dashboard/test-support/support/directedWait.ts";
import { headsChecks } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { intentSettingsText } from "../../dashboard/test-support/support/intentSettingsFile.ts";

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
    const checksBefore = headsChecks(githubFor(page).calls).length;
    unavailable = false;

    await advanceRecoveryClock(page, 14_999);
    expect(reads()).toBe(1);
    await advanceRecoveryClock(page, 251);
    expect(reads()).toBe(2);
    expect(headsChecks(githubFor(page).calls)).toHaveLength(checksBefore + 1);
    await expect(intentLocationName(intent, "scripts")).toBeVisible();
    await expect(readFailure(intent)).toHaveCount(0);
  });
}

test("rate-limited Intent locations reread when the standing limit ends", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const published = publishes({
    revision: doughnut.revision,
    files: {
      ...doughnut.files,
      ".planning/open-dough.json": intentSettingsText(doughnutSettings),
      ...locationFiles,
    },
  });
  const directedSeconds = 2;
  const answers = limiting(page, published, directedSeconds);
  answers.limit(
    (request) => request.kind === "tree" && request.path === "scripts",
  );
  githubFor(page).serve(doughnut.repository, answers.answer);
  const reads = countLocationsReads(page);

  const intent = await openDoughnut(page);
  await expect(readFailure(intent)).toContainText("GitHub limited the rate");
  const resumesAt = await noticedResumeTime(page);
  const limitSeenAt = answers.lift();

  await advanceRecoveryClock(page, resumesAt - opened.getTime() - 1);
  expect(reads()).toBe(1);
  await untilReported(limitSeenAt, directedSeconds);
  await advanceRecoveryClock(page, 251);
  expect(reads()).toBe(2);
  await expect(intentLocationName(intent, "scripts")).toBeVisible();
});
