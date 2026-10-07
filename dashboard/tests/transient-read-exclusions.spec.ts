// Access, missing, invalid, and unknown failures stay actionable without an
// automatic recovery loop. Switching project cancels an unresolved empty-page
// wait. Eligible recovery timing lives in ./transient-read-recovery.spec.ts.

import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectProblemAndNoSnapshot,
  parts,
} from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import {
  commitAnswer,
  httpErrorAnswer,
  notFoundAnswer,
  pathsRead,
  publishMovingOrigin,
  publishOrigin,
  type ObservedRequest,
} from "./publishedOrigin.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { backlogA, revisionA } from "./refreshJourney.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");
const transientRecovery = "This page reads the published work at";
const unexplainedFailure = {
  exitCode: 1,
  stderr: "gh: unexplained failure\n",
};

function mainReads(origin: {
  readonly requests: readonly ObservedRequest[];
}): number {
  return pathsRead(origin).filter((path) => path === "main").length;
}

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
    origin: {
      ref: commitAnswer(revisionA),
      backlog: { revision: revisionA, answer: notFoundAnswer() },
    },
    problem: `GitHub answered HTTP 404 to the local GitHub CLI while reading .planning/PRODUCT-BACKLOG.md at ${revisionA}. Check that \`gh auth status\` succeeds and that this login can read terryyin/open-dough, then reload the page.`,
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
    const requested = await publishOrigin(page, origin);
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
    ).toHaveLength(origin.backlog === undefined ? asked : 1);
  });
}

test("a malformed backlog stays a reload problem and is not asked again", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingOrigin(page);
  origin.push(
    revisionA,
    `# Product backlog\n\n## Taken\n\n## Backlog list\n\n- Queue trunk integration, without a link\n`,
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
});

test("switching project cancels the unresolved recovery wait", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  doughnut.push(revisionDoughnut, doughnutBacklog);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  origin.answerWith("main", httpErrorAnswer(503));
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    undefined,
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  expect(mainReads(origin)).toBe(1);

  await parts(page)
    .project.getByRole("radio", { name: "Doughnut", exact: true })
    .check();
  await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
  await page.clock.runFor(20_000);
  expect(mainReads(origin)).toBe(1);
  await expect(parts(page).problem).toHaveCount(0);
});
