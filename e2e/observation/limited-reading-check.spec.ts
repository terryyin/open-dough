// A page whose revision check meets GitHub's rate limit keeps the snapshot it
// shows, says once when reading resumes, and asks nothing until then
// (../../dashboard/tests/limitedReadingJourney.ts).

import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  expectSettledPage,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import { passTimeUntilAsked } from "../../dashboard/tests/autoRefreshJourney.ts";
import {
  isCheck,
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "../../dashboard/tests/pageRequestNotes.ts";
import {
  openedBeside,
  waitSeconds,
  whileTheLimitStands,
} from "../../dashboard/tests/limitedReadingJourney.ts";
import {
  failedAt,
  noticedResumeTime,
} from "../../dashboard/tests/limitNotice.ts";
import {
  files,
  opened,
  repository,
  revision,
  titles,
} from "../../dashboard/tests/limitedReadingRecords.ts";
import { publishes } from "../../dashboard/tests/support/fakeGitHub.ts";
import { expectEarlierSnapshotKept } from "../../dashboard/tests/transientRecoveryPage.ts";

test("limiting a revision check keeps the snapshot, says once when reading resumes, and asks nothing until then", async ({
  page,
}) => {
  const { answers, other } = await openedBeside(
    page,
    opened,
    publishes({ revision, files }),
  );
  await page.goto("/");
  await expectSettledPage(page, titles);
  answers.limit((request) => request.kind === "matching-refs");
  const otherChecks = await whileNotingChecks(other, async (askedAfter) => {
    const answer = page.waitForResponse((response) => isCheck(response.url()));
    await passTimeUntilAsked(page);
    expect((await answer).status()).toBe(502);
    await untilPageRequestsAnswered(other);
    return askedAfter();
  });
  expect(otherChecks).toEqual([]);
  const { problem } = parts(page);

  await expect(problem).toContainText(
    `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of ${repository}. GitHub asked to wait ${String(waitSeconds)} seconds before asking again.`,
  );
  await expect(problem).toContainText("Automatic checks resume then.");
  const resumesAt = (await failedAt(page)) + waitSeconds * 1_000;
  expect(await noticedResumeTime(page)).toBe(resumesAt);
  await expect(problem).toHaveCount(1);
  await expectSettledPage(page, titles);
  // Standing limit / failed check: status names no revision; the alert keeps
  // the earlier retrieval time and Board membership proves the snapshot.
  await expectEarlierSnapshotKept(page, opened.toISOString());

  await whileTheLimitStands(page, other, resumesAt, answers.refusedAt());
});
