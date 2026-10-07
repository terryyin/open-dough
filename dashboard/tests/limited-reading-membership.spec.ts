// A page whose membership read meets GitHub's rate limit shows that nothing
// has been read, says once when reading resumes, and asks nothing until then
// (./limitedReadingJourney.ts).

import { expect, test } from "./dashboardTest.ts";
import { expectProblemAndNoSnapshot, parts } from "./dashboardPage.ts";
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
} from "./limitedReadingRecords.ts";
import { publishes } from "./support/fakeGitHub.ts";

test("limiting the membership read shows that nothing has been read, says once when reading resumes, and asks nothing until then", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const { answers, other } = await openedBeside(
    page,
    opened,
    publishes({ revision, files }),
  );
  answers.limit((request) => request.kind === "ref");
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of ${repository}. GitHub asked to wait ${String(waitSeconds)} seconds before asking again.`,
    repository,
    "Reload the page after that time to read again.",
  );
  const resumesAt = (await failedAt(page)) + waitSeconds * 1_000;
  expect(await noticedResumeTime(page)).toBe(resumesAt);
  await expect(parts(page).problem).toHaveCount(1);

  await whileTheLimitStands(page, other, resumesAt, answers.refusedAt());
});
