// Backend collection: ../../backend-tests/intent/landed-ci-history-gaps.spec.ts
// Pending proof: ../../backend-tests/intent/landed-ci-history-pending-proof.spec.ts
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import "../../src/dashboardStyles.ts";
import { JudgedBranch } from "../../src/IntentCiJudgedBranch.tsx";
import "../../src/intent-ci-status.css";
import { measuredHistoryOf } from "../../src/landedCiHistory.ts";
import { shownRunOf } from "../../src/shownCiProofRun.ts";

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

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
    .please();
  const run = {
    revision: `a1b2c3d${"0".repeat(33)}`,
    runId: 41,
    runAttempt: 1,
  };
  const shown = makeMe.anIntentCiStatus
    .with({
      ...run,
      branch: "main",
      runBranch: "main",
      state: "pass",
      subject: "Result landed.txt",
      laterWithoutResult: 0,
      runUrl: "https://ci.invalid/runs/41",
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:06:05Z",
      checkedAt: "2026-11-05T12:00:00Z",
      freshness: "fresh",
    })
    .please();
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  onTestFinished(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
  });
  await act(() => {
    root.render(
      createElement(JudgedBranch, {
        branch: "main",
        story: undefined,
        judged: {
          shown,
          reading: false,
          previouslyRetrieved: false,
          refreshFailed: undefined,
          checkAgain: () => {},
          round: undefined,
        },
        proof: {
          run: shownRunOf(shown),
          read: makeMe.aCiProof.forRun(run).please(),
        },
        history: { shown: measuredHistoryOf(answer), failed: undefined },
      }),
    );
    return Promise.resolve();
  });

  expect([window.innerWidth, window.innerHeight]).toEqual([390, 844]);
  const panel = page.getByRole("region", { name: "CI status", exact: true });
  const historyName = "CI time without runner waits history";
  const history = panel.getByRole("region", { name: historyName, exact: true });
  expect(history.getByRole("heading").element().textContent).toBe(historyName);
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

  const checkAgain = panel.getByRole("button", {
    name: "Check again",
    exact: true,
  });
  await expect.element(checkAgain).toBeEnabled();
  (checkAgain.element() as HTMLElement).focus();
  await expect.element(checkAgain).toHaveFocus();
  const summary = history.getByText("Builds and evidence", { exact: true });
  const evidence = history.getByRole("list", {
    name: "Builds and evidence",
    exact: true,
  });
  expect(evidence.elements()).toHaveLength(0);
  await act(() => userEvent.tab({ shift: true }));
  await expect.element(summary).toHaveFocus();
  await act(() => userEvent.keyboard("{Enter}"));
  await expect.element(evidence).toBeVisible();
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
    await act(() => userEvent.tab());
    const link = evidence.getByRole("link", {
      name: `Run ${String(runId)} · attempt 1`,
      exact: true,
    });
    await expect.element(link).toHaveFocus();
    expect(link.element().getAttribute("href")).toBe(
      `https://ci.invalid/runs/${String(runId)}`,
    );
  }

  const phone = document.documentElement;
  expect(phone.scrollWidth, "page scroll width").toBeLessThanOrEqual(
    phone.clientWidth,
  );
  const area = history.element();
  const overflowing = [area, ...area.querySelectorAll("*")]
    .filter((element) => element.scrollWidth > element.clientWidth + 1)
    .map((element) => element.tagName);
  expect(overflowing, "history elements scrolling sideways").toEqual([]);
});
