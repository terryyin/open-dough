import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  expectMembership,
  expectProblemAndNoSnapshot,
  expectSnapshotButtons,
  expectWholeSnapshot,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  publishCommittedBacklog,
  publishGitOriginFailure,
  type GitOriginFailure,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { restMembershipAsked } from "../../dashboard/test-support/originObservation.ts";
import { originUnreachable } from "../../dashboard/test-support/transientRecoveryPage.ts";
import {
  inspectDashboardStory,
  refreshHistory,
  titlesOfA,
} from "../../dashboard/test-support/refreshJourney.ts";
import { reloadUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { describedBacklog } from "../../dashboard/test-support/describedRevisions.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { BacklogEntry } from "../../Distribution/tests/support/makeMe.mjs";

const repairPlan = "slice-plans/059-installer-update-report/PLAN.md";
const repair = makeMe.aBacklogEntry
  .with({
    identity: repairPlan,
    title: "Repair the installer's update report",
    href: repairPlan,
  })
  .please();
const claims = makeMe.aBacklogEntry
  .with({
    identity: "SEED-040#publish-claims",
    title: "Publish shared backlog claims",
    href: "seeds/SEED-040-claims.md#publish-claims",
  })
  .please();
// The exact entry lines a refused backlog adds after its valid ones.
const repairLine = `- [${repair.title}](${repairPlan})`;
const claimsLine = `- [${claims.title}](${claims.href}) — ${claims.identity}`;

// A backlog with a direction, the repair taken and `queued` in the Backlog,
// followed by the literal `tail` the case reads.
function backlogWith(queued: BacklogEntry[], tail = ""): string {
  const valid = describedBacklog(
    makeMe.aRepository
      .withRevision("base", {
        backlog: { direction: "Show published work.", taken: [repair], queued },
      })
      .please(),
  );
  return `${valid}${tail}`;
}

const unreachable = originUnreachable();

const failedOpenings: {
  when: string;
  origin: GitOriginFailure | { readonly backlog: string };
  problem: string;
  recovery?: string;
}[] = [
  {
    when: "Git cannot reach origin though GitHub REST would answer",
    origin: "unreachable origin",
    problem: unreachable,
    recovery: "This page reads the published work at",
  },
  {
    when: "one entry line among valid ones is malformed",
    origin: {
      backlog: backlogWith(
        [claims],
        "- Queue trunk integration, without a link\n",
      ),
    },
    problem: 'Unsupported entry in "## Backlog list" at line 14',
  },
  {
    when: "the same work is recorded in Taken and again in Backlog",
    origin: { backlog: backlogWith([claims], `${repairLine}\n`) },
    // The reader's words whole, as its report, then the dashboard's own: said
    // once here, while the other refusals are told apart by the reader's words.
    problem:
      "The published backlog could not be interpreted. The shared backlog reader reports: “The backlog already lists the same work twice: lines 9 and 14. Repair it by hand before running this operation.” This dashboard only reads; the project’s backlog needs correcting at its source.",
  },
  {
    when: "an entry carries a field the shared reader does not support",
    origin: { backlog: backlogWith([], `${claimsLine} (column: review)\n`) },
    problem: 'Unsupported entry detail in "## Backlog list" at line 13',
  },
];

for (const { when, origin, problem, recovery } of failedOpenings) {
  test(`read failure and retry shows a read problem and no snapshot when ${when}`, async ({
    page,
  }) => {
    if (typeof origin === "string") publishGitOriginFailure(page, origin);
    else publishCommittedBacklog(page, origin.backlog);
    await page.goto("/");
    await expectProblemAndNoSnapshot(page, problem, recovery);
    if (recovery !== undefined) {
      await expect(parts(page).problem).toContainText(
        "or when it is next seen.",
      );
    }
    expect(restMembershipAsked(githubFor(page).calls)).toEqual([]);
  });
}

test("read failure names an unreadable published backlog concisely and keeps project switching available", async ({
  page,
}) => {
  publishCommittedBacklog(page, null);
  await page.goto("/");
  const message =
    "The published backlog (.planning/PRODUCT-BACKLOG.md) is unavailable at the verified trunk of Open Dough.";
  await expectProblemAndNoSnapshot(page, message);
  const { problem } = parts(page);
  await expect(problem.locator("p").first()).toHaveText(message);
  await expect(projectTab(page, "Doughnut")).toBeEnabled();
});

test("read failure and retry is not caused by an unknown section, which adds no column, card, or control", async ({
  page,
}) => {
  const underReview = "Follow a story on its published branch";
  publishCommittedBacklog(
    page,
    backlogWith(
      [claims],
      `\n## Review\n\n- [${underReview}](seeds/SEED-021-progress.md#follow) — SEED-021#follow\n`,
    ),
  );
  await page.goto("/");

  await expectMembership(page, {
    taken: ["Repair the installer's update report"],
    backlog: ["Publish shared backlog claims"],
  });
  const { board, problem } = parts(page);
  await expect(board.getByRole("region")).toHaveCount(3);
  await expect(page.getByRole("region", { name: /review/i })).toHaveCount(0);
  await expect(page.getByText(underReview)).toHaveCount(0);
  await expect(problem).toHaveCount(0);
  await expectSnapshotButtons(page, {
    backlogCards: 1,
    takenCards: 1,
    cards: 2,
  });
});

test("read failure and retry publishes the first snapshot and withdraws the failure when a reload succeeds after failed openings", async ({
  page,
  afterGitHubStops,
}) => {
  const firstFailure = new Date("2026-09-20T08:30:00.000Z");
  const secondFailure = new Date("2026-09-20T08:30:01.000Z");
  const retrievedA = new Date("2026-09-20T08:30:02.000Z");
  await pausePageClockAt(page, firstFailure);
  const origin = await publishMovingHistory(
    page,
    refreshHistory({ filesAtA: {} }),
    "A",
    afterGitHubStops,
  );
  const { A: revisionA } = origin.revisions;
  const reconnect = origin.disconnectGit();
  await page.goto("/");
  const { problem } = parts(page);
  const recoversOnItsOwn = "This page reads the published work at";
  await expectProblemAndNoSnapshot(page, unreachable, recoversOnItsOwn);
  await expect(problem.locator("time").nth(0)).toHaveAttribute(
    "datetime",
    firstFailure.toISOString(),
  );

  await test.step("a reload that fails too reports that attempt, still with no snapshot", async () => {
    await page.clock.setFixedTime(secondFailure);
    await reloadUntilRead(page);
    await expect(problem.locator("time").nth(0)).toHaveAttribute(
      "datetime",
      secondFailure.toISOString(),
    );
    await expectProblemAndNoSnapshot(page, unreachable, recoversOnItsOwn);
  });

  reconnect();
  await page.clock.setFixedTime(retrievedA);
  await page.reload();
  await inspectDashboardStory(page);
  await expectWholeSnapshot(
    page,
    { revision: revisionA, titles: titlesOfA, retrievedAt: retrievedA },
    [],
  );
  await expect(problem).toHaveCount(0);
  await expect(parts(page).reading).toHaveCount(0);
  await expectSnapshotButtons(page, {
    backlogCards: 3,
    takenCards: 1,
    cards: 4,
  });
  expect(restMembershipAsked(origin.requests)).toEqual([]);
});
