// A page held back by a rate limit keeps the snapshot it
// shows, says once when reading resumes, and asks nothing until then
// (../../dashboard/test-support/limitedReadingJourney.ts).

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { passTimeUntilAsked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  isCheck,
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  openedBeside,
  waitSeconds,
  whileTheLimitStands,
} from "../../dashboard/test-support/limitedReadingJourney.ts";
import {
  failedAt,
  noticedResumeTime,
} from "../../dashboard/test-support/limitNotice.ts";
import {
  files,
  opened,
  plannedSeed,
  repository,
  titles,
} from "../../dashboard/test-support/limitedReadingRecords.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { readUrl } from "../../dashboard/test-support/support/sharedReads.ts";
import { expectEarlierSnapshotKept } from "../../dashboard/test-support/transientRecoveryPage.ts";

test("a standing REST limit holds back checks, keeps the snapshot, and says once when reading resumes", async ({
  page,
}) => {
  const published = publishes({ files });
  const { answers, other } = await openedBeside(page, opened, published);
  await page.goto("/");
  await expectSettledPage(page, titles);
  answers.limit(
    (request) => request.kind === "commit-list" && request.path === plannedSeed,
  );
  const origin = new URL(page.url()).origin;
  const history = readUrl(
    origin,
    `&revision=${published.revision}&path=${encodeURIComponent(plannedSeed)}&committed=last`,
  );
  const limited = await page.request.get(history, {
    headers: { Origin: origin },
  });
  expect(limited.status()).toBe(502);
  expect(await limited.json()).toMatchObject({
    retryAfterSeconds: waitSeconds,
  });
  const otherChecks = await whileNotingChecks(other, async (askedAfter) => {
    const answer = page.waitForResponse((response) => isCheck(response.url()));
    await passTimeUntilAsked(page);
    const check = await answer;
    expect(check.status()).toBe(502);
    await untilPageRequestsAnswered(other);
    const { retryAfterSeconds } = (await check.json()) as {
      retryAfterSeconds: number;
    };
    return { asked: await askedAfter(), retryAfterSeconds };
  });
  expect(otherChecks.asked).toEqual([]);
  const { problem } = parts(page);

  await expect(problem).toContainText(
    `GitHub limited the rate of the local GitHub CLI's requests, so main of ${repository} was not asked of GitHub.`,
  );
  await expect(problem).toContainText("Automatic checks resume then.");
  const resumesAt =
    (await failedAt(page)) + otherChecks.retryAfterSeconds * 1_000;
  expect(await noticedResumeTime(page)).toBe(resumesAt);
  await expect(problem).toHaveCount(1);
  await expectSettledPage(page, titles);
  // Standing limit / failed check: status names no revision; the alert keeps
  // the earlier retrieval time and Board membership proves the snapshot.
  await expectEarlierSnapshotKept(page, opened.toISOString());

  await whileTheLimitStands(page, other, resumesAt, answers.refusedAt());
});
