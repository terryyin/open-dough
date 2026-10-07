// A page whose detail read meets GitHub's rate limit keeps the snapshot,
// revision, and retrieval time it shows, labels what the limit withheld one
// way, naming what was withheld and the time the limit ends, says once when
// reading resumes, and asks nothing until then (./limitedReadingJourney.ts).

import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import {
  isContent,
  limiting,
  openedBeside,
  waitSeconds,
  whileTheLimitStands,
} from "./limitedReadingJourney.ts";
import {
  expectSameResumeTime,
  limitedUntil,
  noticedResumeTime,
} from "./limitNotice.ts";
import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";
import {
  files,
  opened,
  plannedPlan,
  plannedSeed,
  plannedTitle,
  repository,
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

  await test.step("the snapshot stays with its revision and retrieval time, each withheld detail is labeled one way with what was withheld and the limit's time, and one notice says when reading resumes", async () => {
    await expect(source).toContainText(revision);
    await expect(source.locator("time")).toHaveAttribute(
      "datetime",
      opened.toISOString(),
    );
    await expect(status).toContainText(
      `Published work read at revision ${revision.slice(0, 7)}`,
    );
    const withheldCard = backlog.getByRole("article", { name: withheldTitle });
    // GitHub refused the seed; the page did not ask for the plan. Both are
    // labeled the same way, with the same time.
    await expect(withheldCard.locator(".card-preparation")).toHaveText(
      `GitHub's rate limit withheld ${withheldSeed} at ${revision}. ${until}`,
    );
    const plannedCard = backlog.getByRole("article", { name: plannedTitle });
    await expect(await inspectedDetail(plannedCard)).toContainText(
      `GitHub's rate limit withheld ${plannedPlan} at ${revision}. ${until}`,
    );
    for (const text of await backlog.getByRole("article").allTextContents()) {
      expect(text).not.toMatch(/\d+ seconds/);
    }
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

test("a limit naming a time already passed waits as one naming none: the page says reading resumes a minute later and asks GitHub for the withheld detail once", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  // GitHub refuses the withheld record with `Retry-After: 0`, and never lifts
  // the refusal.
  const answers = limiting(page, publishes({ revision, files }), 0);
  githubFor(page).serve(repository, answers.answer);
  answers.limit(isContent(withheldSeed), isContent(plannedSeed));
  await page.goto("/");
  await expectSettledPage(page, titles);
  // The process's own first wait, 60 seconds from the page's opening time.
  await expectSameResumeTime(
    page,
    opened.getTime() + 60_000,
    answers.refusedAt(),
  );

  // A few seconds of real time pass with page time standing still.
  await new Promise((resolve) => setTimeout(resolve, 3_000));
  await untilPageRequestsAnswered(page);
  const asked = githubFor(page).calls.map(({ request }) => request);
  expect(asked.filter(isContent(withheldSeed))).toHaveLength(1);
});
