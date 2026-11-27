// Access, missing, invalid, and unknown failures stay actionable without an
// automatic recovery loop. Switching project cancels an unresolved empty-page
// wait. Eligible recovery timing lives in ./transient-read-recovery.spec.ts.

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
  httpErrorAnswer,
  publishCommittedBacklog,
  publishOrigin,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import { refreshHistory } from "../../dashboard/test-support/refreshJourney.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  mainReads,
  transientRecovery,
} from "../../dashboard/test-support/transientRecoveryPage.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");
const unexplainedFailure = {
  exitCode: 1,
  stderr: "gh: unexplained failure\n",
};

for (const { when, origin, problem } of [
  {
    when: "an unmarked 403",
    origin: {
      ref: httpErrorAnswer(403, "Resource not accessible by integration"),
    },
    problem:
      "GitHub answered HTTP 403 to the local GitHub CLI while reading main of terryyin/open-dough. Check that `gh auth status` succeeds and that this login can read terryyin/open-dough, then reload the page.",
  },
  {
    when: "HTTP 401",
    origin: { ref: httpErrorAnswer(401) },
    problem:
      "GitHub answered HTTP 401 to the local GitHub CLI while reading main of terryyin/open-dough. Check that `gh auth status` succeeds and that this login can read terryyin/open-dough, then reload the page.",
  },
  {
    when: "HTTP 404",
    origin: null,
    problem:
      "The published backlog (.planning/PRODUCT-BACKLOG.md) is missing or inaccessible in Open Dough (HTTP 404).",
  },
  {
    when: "an unknown CLI failure",
    origin: { ref: unexplainedFailure },
    problem:
      "The local authenticated read failed while reading main of terryyin/open-dough. Check that `gh auth status` succeeds and that this login can read terryyin/open-dough, then reload the page.",
  },
]) {
  test(`access, missing, and unknown failures stay actionable without a loop when ${when}`, async ({
    page,
  }) => {
    await pausePageClockAt(page, opened);
    const requested =
      origin === null
        ? publishCommittedBacklog(page, null).requests
        : await publishOrigin(page, origin);
    await page.goto("/");
    await expectProblemAndNoSnapshot(page, problem);
    await untilPageReadsAnswered(page);
    const asked = requested.length;
    await page.clock.runFor(20_000);
    expect(requested).toHaveLength(asked);
    await expect(parts(page).problem).toContainText(
      "Reload the page to read again.",
    );
    expect(
      githubFor(page).calls.filter((call) => call.request.kind === "ref"),
    ).toHaveLength(origin === null ? 1 : asked);
  });
}

test("a malformed backlog stays a reload problem and is not asked again", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  // An empty valid backlog followed by the literal malformed entry.
  const origin = publishCommittedBacklog(
    page,
    `${describedBacklog(makeMe.aRepository.please())}- Queue trunk integration, without a link\n`,
  );
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    'Unsupported entry in "## Backlog list" at line 7',
  );
  await untilPageReadsAnswered(page);
  const asked = mainReads(origin);
  await page.clock.runFor(20_000);
  expect(mainReads(origin)).toBe(asked);
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
  const origin = await publishMovingHistory(
    page,
    refreshHistory({ filesAtA: {} }),
    "A",
    afterGitHubStops,
  );
  origin.answerWith("main", httpErrorAnswer(503));
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  expect(mainReads(origin)).toBe(1);

  await projectTab(page, "Doughnut").check();
  await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
  await page.clock.runFor(20_000);
  expect(mainReads(origin)).toBe(1);
  await expect(parts(page).problem).toHaveCount(0);
});
