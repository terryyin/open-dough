// Candidates recover from classified GitHub and local transport failures,
// honoring standing limits and retaining manual Retry for terminal answers.
// Synthetic rate-limit / malformed UI cases live in
// dashboard/frontend-tests/intent/intent-candidates-read-recovery.spec.ts.

import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { serveCommitted } from "../../dashboard/test-support/committedFiles.ts";
import { openDough } from "../../dashboard/test-support/intentCodeBrowseFixtures.ts";
import {
  advanceRecoveryClock,
  candidatesRequest,
  countCandidatesReads,
  isCandidatesContent,
  openCandidates,
  opened,
  publishedCandidates,
  readFailure,
  readRetry,
} from "../../dashboard/test-support/intentReadRecoveryPage.ts";
import { holdingAnswer } from "../../dashboard/test-support/support/heldGitHubAnswer.ts";

test.describe("with a short GitHub read bound", () => {
  test.use({ readTimeoutMs: 3_000 });

  test("candidates recover after a GitHub timeout and a further unreachable boundary", async ({
    page,
  }) => {
    await pausePageClockAt(page, opened);
    const published = publishedCandidates();
    const held = holdingAnswer(published, isCandidatesContent);
    const revision = serveCommitted(
      page,
      openDough.repository,
      published,
      held.answer,
    );
    const reads = countCandidatesReads(page);
    const timedOutAnswer = page.waitForResponse(candidatesRequest);
    const record = await openCandidates(page, revision);
    const problem = readFailure(record);
    try {
      await expect(problem).toContainText(
        "could not be read at this revision",
        {
          timeout: 10_000,
        },
      );
      await expect(readRetry(problem)).toBeVisible();
      const response = await timedOutAnswer;
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({
        revision,
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
