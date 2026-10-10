import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectProblemAndNoSnapshot,
  expectSnapshotButtons,
  expectWholeSnapshot,
  parts,
} from "./dashboardPage.ts";
import {
  commitAnswer,
  noConnection,
  notFoundAnswer,
  pathsRead,
  publishMovingOrigin,
  publishOrigin,
  rateLimitedAnswer,
  rawFileAnswer,
  type Origin,
} from "./publishedOrigin.ts";
import {
  backlogA,
  inspectDashboardStory,
  revisionA,
  titlesOfA,
} from "./refreshJourney.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

const revision = "5e".repeat(20);
const repairEntry =
  "- [Repair the installer's update report](slice-plans/059-installer-update-report/PLAN.md)";
const claimsEntry =
  "- [Publish shared backlog claims](seeds/SEED-040-claims.md#publish-claims) — SEED-040#publish-claims";

function backlogWith(queued: string[], after = ""): string {
  return `# Product backlog\n\n## Near-future direction\n\nShow published work.\n\n## Taken\n\n${repairEntry}\n\n## Backlog list\n\n${queued.join("\n")}\n${after}`;
}

function publishedAs(markdown: string): Origin {
  return {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(markdown) },
  };
}

const failedOpenings: {
  when: string;
  origin: Origin;
  problem: string;
  recovery?: string;
}[] = [
  {
    when: "the connection fails",
    origin: { ref: noConnection },
    problem:
      "The local GitHub CLI could not reach GitHub while reading main of terryyin/open-dough.",
    recovery: "This page reads the published work at",
  },
  {
    when: "GitHub limits the rate with HTTP 429",
    origin: { ref: rateLimitedAnswer(429) },
    problem:
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of terryyin/open-dough. GitHub named no wait, so reading resumes in 60 seconds.",
    recovery:
      "GitHub limited the rate of the local GitHub CLI's requests, so this page asks GitHub nothing until",
  },
  {
    when: "the ref answer names no commit",
    origin: { ref: commitAnswer("main") },
    problem:
      "GitHub's answer for main of terryyin/open-dough did not name a commit.",
  },
  {
    when: "the backlog file is missing at the resolved revision",
    origin: {
      ref: commitAnswer(revision),
      backlog: { revision, answer: notFoundAnswer() },
    },
    problem: `GitHub answered HTTP 404 to the local GitHub CLI while reading .planning/PRODUCT-BACKLOG.md at ${revision}. Check that \`gh auth status\` succeeds and that this login can read terryyin/open-dough, then reload the page.`,
  },
  {
    when: "one entry line among valid ones is malformed",
    origin: publishedAs(
      backlogWith([claimsEntry, "- Queue trunk integration, without a link"]),
    ),
    problem: 'Unsupported entry in "## Backlog list" at line 14',
  },
  {
    when: "the same work is recorded in Taken and again in Backlog",
    origin: publishedAs(backlogWith([claimsEntry, repairEntry])),
    // The reader's words whole, as its report, then the dashboard's own: said
    // once here, while the other refusals are told apart by the reader's words.
    problem:
      "The published backlog could not be interpreted. The shared backlog reader reports: “The backlog already lists the same work twice: lines 9 and 14. Repair it by hand before running this operation.” This dashboard only reads; the project’s backlog needs correcting at its source.",
  },
  {
    when: "an entry carries a field the shared reader does not support",
    origin: publishedAs(backlogWith([`${claimsEntry} (stage: review)`])),
    problem: 'Unsupported entry detail in "## Backlog list" at line 13',
  },
];

for (const { when, origin, problem, recovery } of failedOpenings) {
  test(`read failure and retry shows a read problem and no snapshot when ${when}`, async ({
    page,
  }) => {
    await publishOrigin(page, origin);
    await page.goto("/");
    await expectProblemAndNoSnapshot(page, problem, undefined, recovery);
    if (recovery?.includes("asks GitHub nothing until")) {
      await expect(parts(page).problem).toContainText(
        "This page reads the published work then, or when it is next seen.",
      );
    } else if (recovery?.startsWith("This page reads the published work at")) {
      await expect(parts(page).problem).toContainText(
        "or when it is next seen.",
      );
    }
  });
}

test("read failure and retry is not caused by an unknown section, which adds no stage, card, or control", async ({
  page,
}) => {
  const underReview = "Follow a story on its published branch";
  await publishOrigin(
    page,
    publishedAs(
      backlogWith(
        [claimsEntry],
        `\n## Review\n\n- [${underReview}](seeds/SEED-021-progress.md#follow) — SEED-021#follow\n`,
      ),
    ),
  );
  await page.goto("/");

  await expectMembership(page, {
    taken: ["Repair the installer's update report"],
    backlog: ["Publish shared backlog claims"],
  });
  const { stages, problem } = parts(page);
  await expect(stages.getByRole("region")).toHaveCount(2);
  await expect(page.getByRole("region", { name: /review/i })).toHaveCount(0);
  await expect(page.getByText(underReview)).toHaveCount(0);
  await expect(problem).toHaveCount(0);
  await expectSnapshotButtons(page, { backlogCards: 1, cards: 2 });
});

test("read failure and retry publishes the first snapshot and withdraws the failure when a reload succeeds after failed openings", async ({
  page,
}) => {
  const firstFailure = new Date("2026-09-20T08:30:00.000Z");
  const secondFailure = new Date("2026-09-20T08:30:01.000Z");
  const retrievedA = new Date("2026-09-20T08:30:02.000Z");
  await pausePageClockAt(page, firstFailure);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  const reconnect = origin.answerWith("main", noConnection);
  await page.goto("/");
  const { problem } = parts(page);
  const unreachable =
    "The local GitHub CLI could not reach GitHub while reading main of terryyin/open-dough.";
  const recoversOnItsOwn = "This page reads the published work at";
  await expectProblemAndNoSnapshot(
    page,
    unreachable,
    undefined,
    recoversOnItsOwn,
  );
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
    await expectProblemAndNoSnapshot(
      page,
      unreachable,
      undefined,
      recoversOnItsOwn,
    );
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
  await expectSnapshotButtons(page, { backlogCards: 3, cards: 4 });
  expect(pathsRead(origin)).toHaveLength(4);
});
