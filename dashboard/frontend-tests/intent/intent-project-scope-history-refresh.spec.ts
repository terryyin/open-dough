// Check again reads the same observed head's scope history afresh, showing
// the kept history as previously retrieved until the answer; a failed
// refresh keeps the kept history and live Scope Proof and recovers on Retry;
// a new observed head reads its own history, borrowing none on failure.
// Same-head time-only refreshes reading nothing are
// intent-project-scope-history-key-isolation's.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ScopeHistoryGlance } from "../../src/ciScopeHistory.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { intentViewTab } from "./intent-candidates-page.ts";
import { workOf } from "./intent-ci-homepage-page.ts";
import { heldRead, openDoughSource } from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import {
  caseTimingHistory,
  mountUnprovenScopeHistory,
} from "./intent-project-scope-history-fixtures.ts";
import { scopeHistoryIn } from "./intent-scope-history-page.ts";
import { openSummary } from "./intent-summary-proof-page.ts";

const first = makeMe.aPublishedWork
  .with({
    ...workOf(openDoughSource, "a1a1a1a"),
    retrievedAt: new Date("2026-11-11T07:00:00Z"),
  })
  .please();

// Return to Project Intent's CI status and Check again.
async function checkAgain() {
  await userEvent.click(intentViewTab("CI status"));
  await intentCiStatus().checkAgain();
}

test("Check again refreshes the same observed head, while failed reads keep their own freshness", async () => {
  const answering = (ms: number) => (path: string, revision: string) =>
    Promise.resolve(caseTimingHistory(path, ms, revision));
  let answer = answering(8000);
  const endpoints: string[] = [];
  const shown = await mountUnprovenScopeHistory({
    work: first,
    readScopeHistory: (...[, path, endpoint]) => {
      endpoints.push(endpoint.revision);
      return answer(path, endpoint.revision);
    },
  });
  const summary = await openSummary("dashboard/tests");
  const history = scopeHistoryIn(summary);
  const selected = () => history.readout().selected;
  await expect.poll(selected).toContain("8.0 s");
  expect(history.text()).toContain("History read");
  const observed = history.endpointTime();
  const firstAnswer = history.answeredAt();
  expect(endpoints).toEqual([first.revision]);

  const held = heldRead<ScopeHistoryGlance>();
  answer = () => held.ask();
  await checkAgain();
  await openSummary("dashboard/tests");
  await expect.poll(() => endpoints.length).toBe(2);
  expect(selected()).toContain("8.0 s");
  expect(history.text()).toContain("Previously retrieved history");
  held.resolve(caseTimingHistory("dashboard/tests", 11000, first.revision));
  await expect.poll(selected).toContain("11.0 s");
  expect(history.text()).not.toContain("Previously retrieved history");
  expect(history.answeredAt()).not.toBe(firstAnswer);

  answer = () => Promise.reject(new Error("Matching history refresh failed"));
  await checkAgain();
  await openSummary("dashboard/tests");
  await expect
    .element(history.failure)
    .toHaveTextContent("Matching history refresh failed");
  expect(selected()).toContain("11.0 s");
  expect(history.text()).toContain("Previously retrieved history");
  await expect.element(summary.getByRole("table")).toBeVisible();
  answer = answering(9000);
  await userEvent.click(history.retry);
  await expect.poll(selected).toContain("9.0 s");
  expect(history.failure.query()).toBeNull();
  expect(endpoints).toEqual(Array(4).fill(first.revision));

  // A new head's failed read borrows no other endpoint's history.
  const next = workOf(openDoughSource, "b2b2b2b");
  answer = () => Promise.reject(new Error("New head history failed"));
  await shown.showWork({
    ...next,
    retrievedAt: new Date("2026-11-11T07:05:00Z"),
  });
  await expect
    .element(history.failure)
    .toHaveTextContent("New head history failed");
  expect(history.text()).not.toContain("9.0 s");
  await expect.element(summary.getByRole("table")).toBeVisible();
  answer = answering(9000);
  await userEvent.click(history.retry);
  await expect
    .poll(selected)
    .toBe(`Observed trunk endpoint ${shortSha(next.revision)} · 9.0 s`);
  expect(endpoints).toEqual([
    ...Array<string>(4).fill(first.revision),
    next.revision,
    next.revision,
  ]);
  expect(history.endpointTime()).not.toBe(observed);
});
