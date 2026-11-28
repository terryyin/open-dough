// Boundary-classified settings and listing failures recover through Intent's
// existing locations Retry path at the same published revision.

import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { serveCommitted } from "../../dashboard/test-support/committedFiles.ts";
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
import { whileNotingChecks } from "../../dashboard/test-support/pageRequestNotes.ts";
import { intentSettingsText } from "../../dashboard/test-support/support/intentSettingsFile.ts";

const publishedLocations = () =>
  publishes({
    files: {
      ...doughnut.files,
      [settingsPath]: intentSettingsText(doughnutSettings),
      ...locationFiles,
    },
  });

for (const failure of ["settings", "listing"] as const) {
  test(`a boundary-classified transient Intent ${failure} failure recovers at the same revision`, async ({
    page,
  }) => {
    await pausePageClockAt(page, opened);
    const published = publishedLocations();
    let unavailable = true;
    const revision = serveCommitted(
      page,
      doughnut.repository,
      published,
      async (call) => {
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
      },
    );
    const reads = countLocationsReads(page);
    const intent = await openDoughnut(page, revision);
    await expect(readFailure(intent)).toContainText(
      failure === "settings"
        ? `${settingsPath} could not be read`
        : "GitHub answered HTTP 503",
    );
    unavailable = false;
    await whileNotingChecks(page, async (askedAfter) => {
      await advanceRecoveryClock(page, 14_999);
      expect(reads()).toBe(1);
      expect(await askedAfter()).toEqual([]);
      await advanceRecoveryClock(page, 251);
      expect(reads()).toBe(2);
      expect(await askedAfter()).toHaveLength(1);
    });
    await expect(intentLocationName(intent, "scripts")).toBeVisible();
    await expect(readFailure(intent)).toHaveCount(0);
  });
}

test("rate-limited Intent locations reread when the standing limit ends", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const published = publishedLocations();
  const directedSeconds = 2;
  const answers = limiting(page, published, directedSeconds);
  answers.limit(
    (request) => request.kind === "tree" && request.path === "scripts",
  );
  const revision = serveCommitted(
    page,
    doughnut.repository,
    published,
    answers.answer,
  );
  const reads = countLocationsReads(page);

  const intent = await openDoughnut(page, revision);
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
