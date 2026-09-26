import { expect, githubFor, test } from "./dashboardTest.ts";
import { headsChecks } from "./autoRefreshJourney.ts";
import {
  expectMembership,
  expectProblemAndNoSnapshot,
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
import { backlogA, revisionA, titlesOfA } from "./refreshJourney.ts";

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

const failedOpenings: { when: string; origin: Origin; problem: string }[] = [
  {
    when: "the connection fails",
    origin: { ref: noConnection },
    problem:
      "The local GitHub CLI could not reach GitHub while reading main of terryyin/open-dough.",
  },
  {
    when: "GitHub limits the rate with HTTP 429",
    origin: { ref: rateLimitedAnswer(429) },
    problem:
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of terryyin/open-dough. Wait before pressing Retry.",
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
    problem: `GitHub answered HTTP 404 to the local GitHub CLI while reading .planning/PRODUCT-BACKLOG.md at ${revision}. Check that \`gh auth status\` succeeds and that this login can read terryyin/open-dough, then press Retry.`,
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

for (const { when, origin, problem } of failedOpenings) {
  test(`read failure and retry shows a read problem and no snapshot when ${when}`, async ({
    page,
  }) => {
    await publishOrigin(page, origin);
    await page.goto("/");
    await expectProblemAndNoSnapshot(page, problem);
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
  await expect(page.getByRole("button")).toHaveCount(4);
  await expect(parts(page).preparationHelp).toHaveCount(1);
  await expect(parts(page).refresh).toHaveAccessibleName("Refresh");
  await expect(page.getByRole("button", { name: "Inspect story" })).toHaveCount(
    2,
  );
});

test("read failure and retry ends a stalled read as a read problem at the wait bound and reads again only when asked", async ({
  page,
}) => {
  const opened = new Date("2026-09-20T08:30:00.000Z");
  await page.clock.install({ time: opened });
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  const releaseRef = origin.hold("main");
  await page.goto("/");
  const { retry, problem, status } = parts(page);
  await expect(status).toHaveText("Reading published work…");
  // The held ref request has reached GitHub through the local `gh`.
  await expect.poll(() => pathsRead(origin)).toEqual(["main"]);
  await page.clock.pauseAt(new Date(opened.getTime() + 5_000));

  await test.step("before the bound the read is still awaited", async () => {
    await page.clock.runFor(20_000);
    await expect(status).toHaveText("Reading published work…");
    await expect(problem).toHaveCount(0);
  });

  await test.step("at the bound the wait ends as a read problem", async () => {
    await page.clock.runFor(10_000);
    await expectProblemAndNoSnapshot(
      page,
      "GitHub did not answer within 30 seconds, so the read was given up.",
    );
  });

  await test.step("nothing reads again by itself, and the late answer publishes nothing", async () => {
    await page.clock.runFor("01:00:00");
    await page.evaluate(
      "window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('online')); document.dispatchEvent(new Event('visibilitychange'))",
    );
    releaseRef();
    await page.clock.runFor("00:10:00");
    expect(pathsRead(origin)).toEqual(["main"]);
    expect(headsChecks(githubFor(page).calls)).toEqual([]);
    await expect(problem).toBeVisible();
  });

  await test.step("Retry reads once more and publishes the first snapshot", async () => {
    await retry.click();
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [],
    );
    await expect(problem).toHaveCount(0);
    expect(pathsRead(origin)).toEqual([
      "main",
      "main",
      `PRODUCT-BACKLOG.md?ref=${revisionA}`,
    ]);
  });
});

test("read failure and retry publishes the first snapshot and withdraws the failure when Retry succeeds after failed openings", async ({
  page,
}) => {
  const firstFailure = new Date("2026-09-20T08:30:00.000Z");
  const secondFailure = new Date("2026-09-20T08:31:00.000Z");
  const retrievedA = new Date("2026-09-20T08:32:00.000Z");
  await page.clock.setFixedTime(firstFailure);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  const reconnect = origin.answerWith("main", noConnection);
  await page.goto("/");
  const { refresh, retry, problem } = parts(page);
  const unreachable =
    "The local GitHub CLI could not reach GitHub while reading main of terryyin/open-dough.";
  await expectProblemAndNoSnapshot(page, unreachable);
  await expect(problem.locator("time")).toHaveAttribute(
    "datetime",
    firstFailure.toISOString(),
  );

  await test.step("a Retry that fails too reports that attempt, still with no snapshot", async () => {
    await page.clock.setFixedTime(secondFailure);
    await retry.click();
    await expect(problem.locator("time")).toHaveAttribute(
      "datetime",
      secondFailure.toISOString(),
    );
    await expectProblemAndNoSnapshot(page, unreachable);
  });

  reconnect();
  await page.clock.setFixedTime(retrievedA);
  await retry.click();
  await expectWholeSnapshot(
    page,
    { revision: revisionA, titles: titlesOfA, retrievedAt: retrievedA },
    [],
  );
  await expect(problem).toHaveCount(0);
  await expect(parts(page).reading).toHaveCount(0);
  await expect(page.getByRole("button")).toHaveCount(6);
  await expect(parts(page).preparationHelp).toHaveCount(1);
  await expect(parts(page).refresh).toHaveAccessibleName("Refresh");
  await expect(page.getByRole("button", { name: "Inspect story" })).toHaveCount(
    4,
  );
  await expect(refresh).toBeFocused();
  expect(pathsRead(origin)).toHaveLength(4);
});
