// Candidates recover from classified GitHub and local transport failures,
// honoring standing limits and retaining manual Retry for terminal answers.

import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { openDough } from "./intentCodeBrowseFixtures.ts";
import {
  advanceRecoveryClock,
  candidatesRequest,
  countCandidatesReads,
  isCandidatesContent,
  openCandidates,
  opened,
  publishedCandidates,
} from "./intentReadRecoveryPage.ts";
import { noticedResumeTime } from "./limitNotice.ts";
import { httpErrorAnswer } from "./originAnswers.ts";
import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";

test.describe("with a short GitHub read bound", () => {
  test.use({ readTimeoutMs: 3_000 });

  test("candidates recover after a GitHub timeout and a further unreachable boundary", async ({
    page,
  }) => {
    await pausePageClockAt(page, opened);
    const held = holdingAnswer(publishedCandidates(), isCandidatesContent);
    githubFor(page).serve(openDough.repository, held.answer);
    const reads = countCandidatesReads(page);
    const timedOutAnswer = page.waitForResponse(candidatesRequest);
    const record = await openCandidates(page);
    const problem = record.getByRole("alert");
    try {
      await expect(problem).toContainText(
        "could not be read at this revision",
        {
          timeout: 10_000,
        },
      );
      await expect(
        problem.getByRole("button", { name: "Retry" }),
      ).toBeVisible();
      const response = await timedOutAnswer;
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({
        revision: openDough.revision,
        candidates: null,
        candidatesProblem: "unreadable",
        recovery: "transient",
      });
    } finally {
      held.release();
    }

    await page.route(
      candidatesRequest,
      (route) => route.abort("connectionreset"),
      { times: 1 },
    );
    await advanceRecoveryClock(page, 14_999);
    expect(reads()).toBe(1);
    await advanceRecoveryClock(page, 251);
    expect(reads()).toBe(2);
    await expect(problem).toBeVisible();

    await advanceRecoveryClock(page, 29_000);
    expect(reads()).toBe(2);
    await advanceRecoveryClock(page, 1_250);
    expect(reads()).toBe(3);
    await expect(problem).toHaveCount(0);
    await expect(
      record.getByRole("region", { name: "Pending candidates" }),
    ).toContainText("launch-records-poll-waits");
    await expect(
      record.getByRole("region", { name: "Accepted necessary costs" }),
    ).toContainText("story-review-completed-journey-landed-runs-tail");
  });
});

test("candidates wait for the standing GitHub limit after their shorter backoff is due", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  githubFor(page).serve(openDough.repository, publishedCandidates());
  const reads = countCandidatesReads(page);
  let attempt = 0;
  await page.route(candidatesRequest, async (route) => {
    attempt += 1;
    if (attempt === 1) {
      await route.abort("connectionreset");
    } else if (attempt === 2) {
      await route.fulfill({
        status: 502,
        json: { error: "GitHub limited the rate", retryAfterSeconds: 45 },
      });
    } else {
      await route.fallback();
    }
  });

  const record = await openCandidates(page);
  await expect(record.getByRole("alert")).toBeVisible();
  await advanceRecoveryClock(page, 15_250);
  expect(reads()).toBe(2);
  const resumesAt = await noticedResumeTime(page);
  await advanceRecoveryClock(page, 31_000);
  expect(reads()).toBe(2);
  await expect(record.getByRole("alert")).toBeVisible();

  const now = await page.evaluate(() => Date.now());
  await advanceRecoveryClock(page, resumesAt - now - 1);
  expect(reads()).toBe(2);
  await advanceRecoveryClock(page, 251);
  expect(reads()).toBe(3);
  await expect(record.getByRole("alert")).toHaveCount(0);
  await expect(
    record.getByRole("region", { name: "Pending candidates" }),
  ).toBeVisible();
});

test("candidate access refusal and unexpected answers wait for manual Retry", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const published = publishedCandidates();
  githubFor(page).serve(openDough.repository, (call) =>
    isCandidatesContent(call.request)
      ? Promise.resolve(httpErrorAnswer(403))
      : published(call),
  );
  const reads = countCandidatesReads(page);
  const record = await openCandidates(page);
  const problem = record.getByRole("alert");
  const retry = problem.getByRole("button", { name: "Retry" });
  await expect(retry).toBeVisible();
  await advanceRecoveryClock(page, 70_000);
  expect(reads()).toBe(1);

  await page.route(
    candidatesRequest,
    (route) =>
      route.fulfill({
        json: {
          revision: openDough.revision,
          candidates: 42,
          recovery: "transient",
        },
      }),
    { times: 1 },
  );
  await retry.click();
  await untilPageRequestsAnswered(page);
  await expect(retry).toBeVisible();
  await advanceRecoveryClock(page, 70_000);
  expect(reads()).toBe(2);

  githubFor(page).serve(openDough.repository, published);
  await retry.click();
  await untilPageRequestsAnswered(page);
  expect(reads()).toBe(3);
  await expect(problem).toHaveCount(0);
  await expect(
    record.getByRole("region", { name: "Pending candidates" }),
  ).toBeVisible();
});
