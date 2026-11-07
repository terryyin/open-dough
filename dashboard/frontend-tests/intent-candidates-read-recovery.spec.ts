// Candidates recover from synthetic rate-limit and malformed answers using
// explicit authenticated-read substitutes — no dashboardServer or FakeGitHub.

import { expect, test } from "../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../tests/dashboardTest.ts";
import {
  advanceRecoveryClock,
  candidatesRequest,
  countCandidatesReads,
  openCandidates,
  opened,
} from "../tests/intentReadRecoveryPage.ts";
import { noticedResumeTime } from "../tests/limitNotice.ts";
import { untilPageRequestsAnswered } from "../tests/pageRequestNotes.ts";
import {
  frontendRevision,
  putFrontendCandidates,
  type FrontendServiceState,
} from "../tests/support/frontendServiceState.ts";
import { openDoughCandidatesRecord } from "../tests/intentCandidatesFixtures.ts";

function presentCandidates(state: FrontendServiceState) {
  putFrontendCandidates(state, {
    revision: frontendRevision,
    candidates: openDoughCandidatesRecord,
  });
}

test("candidates wait for the standing GitHub limit after their shorter backoff is due", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, opened);
  presentCandidates(frontendServices);
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
      await route.fulfill({
        json: {
          revision: frontendRevision,
          candidates: openDoughCandidatesRecord,
        },
      });
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
  frontendServices,
}) => {
  await pausePageClockAt(page, opened);
  presentCandidates(frontendServices);
  putFrontendCandidates(frontendServices, {
    revision: frontendRevision,
    candidates: null,
    candidatesProblem: "unreadable",
    recovery: undefined,
  });
  // First answer: 403-shaped refusal through the candidates substitute.
  let mode: "refuse" | "malformed" | "ok" = "refuse";
  await page.route(candidatesRequest, async (route) => {
    if (mode === "refuse") {
      await route.fulfill({
        status: 403,
        json: { error: "Forbidden" },
      });
      return;
    }
    if (mode === "malformed") {
      await route.fulfill({
        json: {
          revision: frontendRevision,
          candidates: 42,
          recovery: "transient",
        },
      });
      return;
    }
    await route.fulfill({
      json: {
        revision: frontendRevision,
        candidates: openDoughCandidatesRecord,
      },
    });
  });
  const reads = countCandidatesReads(page);
  const record = await openCandidates(page);
  const problem = record.getByRole("alert");
  const retry = problem.getByRole("button", { name: "Retry" });
  await expect(retry).toBeVisible();
  await advanceRecoveryClock(page, 70_000);
  expect(reads()).toBe(1);

  mode = "malformed";
  await retry.click();
  await untilPageRequestsAnswered(page);
  await expect(retry).toBeVisible();
  await advanceRecoveryClock(page, 70_000);
  expect(reads()).toBe(2);

  mode = "ok";
  await retry.click();
  await untilPageRequestsAnswered(page);
  expect(reads()).toBe(3);
  await expect(problem).toHaveCount(0);
  await expect(
    record.getByRole("region", { name: "Pending candidates" }),
  ).toBeVisible();
});
