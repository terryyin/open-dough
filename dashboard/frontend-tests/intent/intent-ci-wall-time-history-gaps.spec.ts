// Backend collection: ../../backend-tests/intent/landed-ci-history-gaps.spec.ts
// Pending proof: ../../backend-tests/intent/landed-ci-history-pending-proof.spec.ts
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  historyName,
  openTrunkHistory,
} from "./intent-ci-wall-time-history-page.ts";

test("a history whose recorded landings are all gaps says none is measured yet, draws no chart, and lists each gap with its reason and the build it names, each run link reached by keyboard on a phone", async () => {
  const landingOf = (day: number) => ({
    revision: `e${String(day - 1)}`.repeat(20),
    receivedAt: new Date(2026, 9, day, 12).toISOString(),
  });
  const answer = makeMe.aCiHistoryAnswer
    .unmeasuredLanding({ ...landingOf(1), reason: "no-build" })
    .unmeasuredLanding({
      ...landingOf(2),
      reason: "cancelled",
      build: { revision: "e1".repeat(20), provenance: "exact", runId: 301 },
    })
    .unmeasuredLanding({
      ...landingOf(3),
      reason: "expired",
      build: {
        revision: "b2".repeat(20),
        provenance: "equivalent",
        runId: 302,
      },
    })
    .unmeasuredLanding({
      ...landingOf(4),
      reason: "unreadable",
      build: { revision: "b3".repeat(20), provenance: "later", runId: 303 },
    })
    .unmeasuredLanding({
      ...landingOf(5),
      reason: "no-proof",
      build: {
        revision: "b4".repeat(20),
        provenance: "equivalent",
        runId: 304,
      },
    })
    .pendingLanding({ ...landingOf(6), waitsFor: "proof", runId: 305 })
    .pendingLanding({ ...landingOf(7), waitsFor: "run" })
    .pleaseMeasured();
  const opened = await openTrunkHistory(answer);
  const { history, headingText } = opened;

  expect([window.innerWidth, window.innerHeight]).toEqual([390, 844]);
  await expect.poll(headingText).toBe(historyName);
  await expect
    .element(
      history.getByText(
        "No dashboard-recorded landings have been measured yet.",
        { exact: true },
      ),
    )
    .toBeVisible();
  expect(
    history.getByRole("img", { includeHidden: true }).elements(),
  ).toHaveLength(0);

  const evidence = await opened.openEvidenceByKeyboard();
  expect(
    evidence
      .getByRole("listitem")
      .elements()
      .map((row) => row.textContent),
  ).toEqual([
    "Oct 1 · No build · landed revision e0e0e0e",
    "Oct 2 · Cancelled · exact revision e1e1e1e · Run 301 · attempt 1",
    "Oct 3 · CI proof expired · reused equivalent b2b2b2b for e2e2e2e · Run 302 · attempt 1",
    "Oct 4 · CI proof unreadable · later trunk build b3b3b3b for e3e3e3e · Run 303 · attempt 1",
    "Oct 5 · No CI proof summary · reused equivalent b4b4b4b for e4e4e4e · Run 304 · attempt 1",
    "Oct 6 · Pending · CI proof not read yet · landed revision e5e5e5e · Run 305 · attempt 1",
    "Oct 7 · Pending · no CI run yet · landed revision e6e6e6e",
  ]);
  for (const runId of [301, 302, 303, 304, 305]) {
    await userEvent.tab();
    const link = evidence.getByRole("link", {
      name: `Run ${String(runId)} · attempt 1`,
      exact: true,
    });
    await expect.element(link).toHaveFocus();
    expect(link.element().getAttribute("href")).toBe(
      `https://ci.invalid/runs/${String(runId)}`,
    );
  }

  expect(opened.scrollingSideways(), "scrolling sideways").toEqual([]);
});
