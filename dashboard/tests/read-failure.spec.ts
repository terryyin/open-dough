import { expect, test, type Page } from "@playwright/test";
import { expectMembership, expectWholeSnapshot, parts } from "./dashboardPage";
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
} from "./githubOrigin";
import { backlogA, revisionA, titlesOfA } from "./refreshJourney";

const revision = "5e".repeat(20);
const repairEntry =
  "- [Repair the installer's update report](quick/059-installer-update-report/PLAN.md)";
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

// A failed opening shows the problem and the way to read again, and nothing
// that only a snapshot could say.
async function expectProblemAndNoSnapshot(page: Page, problemText: string) {
  const { stages, source, problem } = parts(page);
  await expect(problem).toContainText("Published work could not be read");
  await expect(problem).toContainText(problemText);
  await expect(problem).toContainText(
    "No published work is shown, because none has been read.",
  );
  await expect(page.getByRole("button")).toHaveText(["Retry"]);
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(stages).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByText(/\d+ entr(y|ies)/)).toHaveCount(0);
  await expect(page.getByText(/entries are recorded/)).toHaveCount(0);
  await expect(page.getByText("Near-future direction")).toHaveCount(0);
  await expect(source).toContainText("terryyin/open-dough");
  await expect(source).not.toContainText("Revision");
  await expect(source).not.toContainText("Retrieved");
}

const failedOpenings: { when: string; origin: Origin; problem: string }[] = [
  {
    when: "the connection fails",
    origin: { ref: noConnection },
    problem:
      "GitHub could not be reached while reading main of terryyin/open-dough.",
  },
  {
    when: "GitHub limits the rate with HTTP 429",
    origin: { ref: rateLimitedAnswer(429) },
    problem:
      "GitHub answered HTTP 429 while reading main of terryyin/open-dough.",
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
    problem: `GitHub answered HTTP 404 while reading .planning/PRODUCT-BACKLOG.md at ${revision}.`,
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
    problem: "The backlog already lists the same work twice: lines 9 and 14.",
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
  await expect(page.getByRole("button")).toHaveText(["Refresh"]);
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
  const { retry, problem } = parts(page);
  await expect(page.getByRole("status")).toHaveText("Reading published work…");
  await page.clock.pauseAt(new Date(opened.getTime() + 5_000));

  await test.step("before the bound the read is still awaited", async () => {
    await page.clock.runFor(20_000);
    await expect(page.getByRole("status")).toHaveText(
      "Reading published work…",
    );
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
    "GitHub could not be reached while reading main of terryyin/open-dough.";
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
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByRole("button")).toHaveText(["Refresh"]);
  await expect(refresh).toBeFocused();
  expect(pathsRead(origin)).toHaveLength(4);
});
