// Refusal, a missing trunk, an unreadable or invalid backlog stay actionable
// without an automatic recovery loop or a REST membership read. Switching
// project cancels an unresolved empty-page wait. Eligible recovery timing
// lives in ./transient-read-recovery.spec.ts.

import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import { backlogPath } from "../../dashboard/test-support/publishedOriginBasics.ts";
import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  expectProblemAndNoSnapshot,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRepository,
  doughnutSharedTitle,
} from "../../dashboard/test-support/doughnutProject.ts";
import { describedBacklog } from "../../dashboard/test-support/describedRevisions.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  publishCommittedBacklog,
  publishGitOriginFailure,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { restMembershipAsked } from "../../dashboard/test-support/originObservation.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  noteColdOpens,
  originUnreachable,
  transientRecovery,
} from "../../dashboard/test-support/transientRecoveryPage.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");
const openDough = "open-dough";
const checkAccess =
  "Check that `gh auth status` succeeds and that this login can read terryyin/open-dough, then reload the page.";

for (const { failure, problem } of [
  {
    failure: "refused 403",
    problem: `GitHub answered HTTP 403 to the local GitHub CLI while reading main of terryyin/open-dough. ${checkAccess}`,
  },
  {
    failure: "refused 401",
    problem: `GitHub answered HTTP 401 to the local GitHub CLI while reading main of terryyin/open-dough. ${checkAccess}`,
  },
  {
    failure: "missing trunk",
    problem:
      "The published trunk is unavailable: origin has no branch for main of terryyin/open-dough.",
  },
] as const) {
  test(`refusal and missing trunk stay actionable without a loop or REST membership when ${failure}`, async ({
    page,
  }) => {
    await pausePageClockAt(page, opened);
    publishGitOriginFailure(page, failure);
    await page.goto("/");
    await expectProblemAndNoSnapshot(page, problem);
    await untilPageReadsAnswered(page);
    await page.clock.runFor(20_000);
    await expect(parts(page).problem).toContainText(
      "Reload the page to read again.",
    );
    expect(restMembershipAsked(githubFor(page).calls)).toEqual([]);
  });
}

test("an unreadable backlog stays actionable without a loop or REST membership", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  publishCommittedBacklog(page, null);
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "The published backlog (.planning/PRODUCT-BACKLOG.md) is unavailable at the verified trunk of Open Dough.",
  );
  await untilPageReadsAnswered(page);
  await page.clock.runFor(20_000);
  await expect(parts(page).problem).toContainText(
    "Reload the page to read again.",
  );
  expect(restMembershipAsked(githubFor(page).calls)).toEqual([]);
});

test("a malformed backlog stays a reload problem and is not asked again", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  // An empty valid backlog followed by the literal malformed entry.
  publishCommittedBacklog(
    page,
    `${describedBacklog(makeMe.aRepository.please())}- Queue trunk integration, without a link\n`,
  );
  const opens = noteColdOpens(page, openDough);
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    'Unsupported entry in "## Backlog list" at line 7',
  );
  await untilPageReadsAnswered(page);
  expect(opens).toHaveLength(1);
  await page.clock.runFor(20_000);
  expect(opens).toHaveLength(1);
  await expect(parts(page).problem).toContainText(
    "Reload the page to read again.",
  );
  // Nothing more will be read, so a membership check fails at once, naming
  // the titles, before an expectation started first reaches its bound.
  const titles = { taken: ["A taken story"], backlog: ["A queued story"] };
  const bound = expect(parts(page).board)
    .toHaveCount(1)
    .then(
      () => "the bound",
      () => "the bound",
    );
  const failure = expectMembership(page, titles).then(
    () => new Error("the membership check passed"),
    (error: unknown) => error as Error,
  );
  expect(
    await Promise.race([failure.then(() => "the membership check"), bound]),
  ).toBe("the membership check");
  expect((await failure).message).toContain("A taken story");
  expect((await failure).message).toContain("A queued story");
  await bound;
});

test("switching project cancels the unresolved recovery wait", async ({
  page,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  await publishMovingHistory(
    page,
    makeMe.aRepository
      .withRevision("published", {
        files: { [backlogPath]: doughnutBacklog },
      })
      .please(),
    "published",
    afterGitHubStops,
    doughnutRepository,
  );
  publishGitOriginFailure(page, "unreachable origin");
  const openDoughOpens = noteColdOpens(page, openDough);
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    originUnreachable(),
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  expect(openDoughOpens).toHaveLength(1);

  await projectTab(page, "Doughnut").check();
  await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
  await page.clock.runFor(20_000);
  expect(openDoughOpens).toHaveLength(1);
  await expect(parts(page).problem).toHaveCount(0);
  expect(restMembershipAsked(githubFor(page).calls)).toEqual([]);
});
