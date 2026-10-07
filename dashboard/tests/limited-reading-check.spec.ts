// A page whose revision check meets GitHub's rate limit keeps the snapshot it
// shows, says once when reading resumes, and asks nothing until then
// (./limitedReadingJourney.ts).

import { expect, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { passTimeUntilAsked } from "./autoRefreshJourney.ts";
import { isCheck } from "./pageRequestNotes.ts";
import {
  openedBeside,
  waitSeconds,
  whileTheLimitStands,
} from "./limitedReadingJourney.ts";
import { failedAt, noticedResumeTime } from "./limitNotice.ts";
import {
  files,
  opened,
  repository,
  revision,
  titles,
} from "./limitedReadingRecords.ts";
import { publishes } from "./support/fakeGitHub.ts";

test("limiting a revision check keeps the snapshot, says once when reading resumes, and asks nothing until then", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const { answers, other } = await openedBeside(
    page,
    opened,
    publishes({ revision, files }),
  );
  await page.goto("/");
  await expectSettledPage(page, titles);
  answers.limit((request) => request.kind === "matching-refs");
  const answer = page.waitForResponse((response) => isCheck(response.url()));
  await passTimeUntilAsked(page);
  expect((await answer).status()).toBe(502);
  const { source, problem } = parts(page);

  await expect(problem).toContainText(
    `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of ${repository}. GitHub asked to wait ${String(waitSeconds)} seconds before asking again.`,
  );
  await expect(problem).toContainText("Automatic checks resume then.");
  const resumesAt = (await failedAt(page)) + waitSeconds * 1_000;
  expect(await noticedResumeTime(page)).toBe(resumesAt);
  await expect(problem).toHaveCount(1);
  await expectSettledPage(page, titles);
  await expect(source).toContainText(revision);
  await expect(source.locator("time")).toHaveAttribute(
    "datetime",
    opened.toISOString(),
  );

  await whileTheLimitStands(page, other, resumesAt, answers.refusedAt());
});
