// A page whose detail read meets GitHub's rate limit keeps the snapshot,
// revision, and retrieval time it shows, labels what the limit withheld with
// the limit and the time it names, says once when reading resumes, and asks
// nothing until then (./limitedReadingJourney.ts).

import { expect, githubFor, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import {
  isContent,
  openedBeside,
  waitSeconds,
  whileTheLimitStands,
} from "./limitedReadingJourney.ts";
import { limitedUntil, noticedResumeTime } from "./limitNotice.ts";
import {
  files,
  opened,
  plannedPlan,
  plannedSeed,
  plannedTitle,
  revision,
  titles,
  withheldSeed,
  withheldTitle,
} from "./limitedReadingRecords.ts";
import { publishes } from "./support/fakeGitHub.ts";

test("limiting a detail read keeps the snapshot, labels what the limit withheld, says once when reading resumes, and asks nothing until then", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const { answers, other } = await openedBeside(
    page,
    opened,
    publishes({ revision, files }),
  );
  // The planned story's record reaches GitHub before the limit; its plan is
  // asked only after.
  answers.limit(isContent(withheldSeed), isContent(plannedSeed));
  await page.goto("/");
  await expectSettledPage(page, titles);
  const resumesAt = opened.getTime() + waitSeconds * 1_000;
  const until = await limitedUntil(page, resumesAt);
  const { backlog, source, problem, status } = parts(page);

  await test.step("the snapshot stays with its revision and retrieval time, each withheld detail is labeled with the limit and its time, and one notice says when reading resumes", async () => {
    await expect(source).toContainText(revision);
    await expect(source.locator("time")).toHaveAttribute(
      "datetime",
      opened.toISOString(),
    );
    await expect(status).toContainText(
      `Published work read at revision ${revision.slice(0, 7)}`,
    );
    const withheldCard = backlog.getByRole("article", { name: withheldTitle });
    await expect(withheldCard.locator(".card-preparation")).toHaveText(
      `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading ${withheldSeed} at ${revision}. GitHub asked to wait ${String(waitSeconds)} seconds before asking again. ${until}`,
    );
    const plannedCard = backlog.getByRole("article", { name: plannedTitle });
    await expect(await inspectedDetail(plannedCard)).toContainText(
      `GitHub limited the rate of the local GitHub CLI's requests, so ${plannedPlan} at ${revision} was not asked of GitHub. ${until}`,
    );
    await expect(page.getByText(/could not be read for/)).toHaveCount(0);
    await expect(problem).toHaveCount(1);
    await expect(problem).toContainText(
      "Detail the limit withheld is labeled where it is shown; this page reads it then, or when it is next seen.",
    );
    expect(await noticedResumeTime(page)).toBe(resumesAt);
    const asked = githubFor(page).calls.map(({ request }) => request);
    expect(asked.some(isContent(plannedPlan))).toBe(false);
    expect(asked.filter(isContent(withheldSeed))).toHaveLength(1);
  });

  await whileTheLimitStands(page, other, resumesAt, answers.refusedAt());
});
