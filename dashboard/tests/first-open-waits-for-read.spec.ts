// A journey's first card check after an open waits for the page's
// published-work read to answer or fail (`untilPublishedWorkRead` in
// ./pageRequestNotes.ts, through `expectMembership` in ./dashboardPage.ts),
// not for an `expect`'s own 5 s. The page, its local authenticated read
// boundary, and the fake GitHub behind it are the usual ones; the test only
// decides how GitHub answers the ref.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { recordsAt } from "./autoRefreshJourney.ts";
import { untilPublishedWorkRead } from "./pageRequestNotes.ts";
import {
  commitAnswer,
  publishMovingOrigin,
  publishOrigin,
  rawFileAnswer,
} from "./publishedOrigin.ts";
import {
  backlogA,
  dashboardStory,
  revisionA,
  titlesOfA,
} from "./refreshJourney.ts";

// Longer than an `expect` waits for a card (5 s, Playwright's default, which
// playwright.config.ts leaves alone) and well inside a test's 30 s: how long
// this slow GitHub keeps the ref answer back once the page is open. The time
// is the precondition itself -- a check bounded by 5 s can only be outlasted
// by an answer later than that -- and the test waits on the read, never on it.
const slowAnswerMs = 6_000;

test("a membership check right after an open waits for a published-work read slower than an expect's bound", async ({
  page,
}) => {
  let releaseRef: () => void = () => undefined;
  await publishOrigin(page, {
    ref: commitAnswer(revisionA),
    backlog: { revision: revisionA, answer: rawFileAnswer(backlogA) },
    refHeldUntil: new Promise<void>((resolve) => {
      releaseRef = resolve;
    }),
  });

  await page.goto("/");
  const answering = setTimeout(releaseRef, slowAnswerMs);
  try {
    await expectMembership(page, titlesOfA);
  } finally {
    clearTimeout(answering);
    releaseRef();
  }
  await expect(parts(page).reading).toHaveCount(0);
});

test("a published-work read that fails for good ends the wait, and the membership check then fails at once naming the titles", async ({
  page,
}) => {
  let releaseRef: () => void = () => undefined;
  // An answer naming no commit is a failure the page does not read again on
  // its own: it says to reload.
  await publishOrigin(page, {
    ref: commitAnswer("main"),
    refHeldUntil: new Promise<void>((resolve) => {
      releaseRef = resolve;
    }),
  });
  const { status, problem, stages } = parts(page);

  await page.goto("/");
  await expect(status).toHaveText("Reading published work…");

  // The wait is seen pending after an expectation asked after it, which
  // passes at once while the read is unanswered.
  let returned = false;
  const waited = untilPublishedWorkRead(page).then(() => {
    returned = true;
  });
  await expect(status).toHaveText("Reading published work…");
  expect(returned).toBe(false);

  releaseRef();
  await waited;
  await expect(problem).toContainText("Reload the page to read again.");

  // Nothing is on its way and the page reads no more on its own, so the
  // check fails without waiting out an expectation's bound: it is over
  // before an expectation that was started first and can only end at that
  // bound, the stages appearing.
  const bound = expect(stages)
    .toHaveCount(1)
    .then(
      () => "the bound",
      () => "the bound",
    );
  const failure = expectMembership(page, titlesOfA).then(
    () => undefined,
    (error: unknown) => error,
  );
  expect(
    await Promise.race([failure.then(() => "the membership check"), bound]),
  ).toBe("the membership check");
  const failed = await failure;
  expect(failed).toBeInstanceOf(Error);
  for (const title of [...titlesOfA.taken, ...titlesOfA.backlog]) {
    expect((failed as Error).message).toContain(title);
  }
  await bound;
});

test("a held detail read does not hold a membership check back", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA, recordsAt("A"));
  const release = origin.hold(".planning/seeds/SEED-021-progress.md");
  try {
    await page.goto("/");
    await expectMembership(page, titlesOfA);
    await expect(
      parts(page).backlog.getByRole("article", { name: dashboardStory }),
    ).toContainText("Reading preparation…");
  } finally {
    release();
  }
});
