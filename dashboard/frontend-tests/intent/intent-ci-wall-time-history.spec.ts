// The trunk's judgment, Proof and CI history as one rendered CI status panel.
// Backend collection: ../../backend-tests/intent/landed-ci-history-collection.spec.ts
// Pending on a published landing: ../../../e2e/intent/intent-ci-wall-time-history-pending.spec.ts
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import "../../src/dashboardStyles.ts";
import { JudgedBranch } from "../../src/IntentCiJudgedBranch.tsx";
import "../../src/intent-ci-status.css";
import {
  measuredHistoryOf,
  type LandedCiHistory,
} from "../../src/landedCiHistory.ts";
import { shownRunOf } from "../../src/shownCiProofRun.ts";

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

const run = { revision: `a1b2c3d${"0".repeat(33)}`, runId: 41, runAttempt: 1 };
const startedAt = "2026-11-05T10:00:00Z";
const completedAt = "2026-11-05T10:06:05Z";
const historyName = "CI time without runner waits history";

async function mountTrunkHistory(answer: LandedCiHistory) {
  const shown = makeMe.anIntentCiStatus
    .with({
      ...run,
      branch: "main",
      runBranch: "main",
      state: "pass",
      subject: "Result landed.txt",
      laterWithoutResult: 0,
      runUrl: "https://ci.invalid/runs/41",
      startedAt,
      completedAt,
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
  return page.getByRole("region", { name: "CI status", exact: true });
}

async function expectTrunkJudgmentAndProof(panel: Locator) {
  await expect
    .element(
      panel.getByText("Passed at a1b2c3d (Result landed.txt)", { exact: true }),
    )
    .toBeVisible();
  const proof = panel.getByRole("region", { name: "Proof", exact: true });
  await expect.element(proof).toBeVisible();
  const labels = proof.getByRole("list", { name: "CI evidence", exact: true });
  expect(
    labels
      .getByRole("listitem")
      .elements()
      .map((label) => ({
        heard: [...label.querySelectorAll(".intent-evidence-label-heard")].map(
          (node) =>
            node.textContent
              .replace(/[\u200b\u00ad]/g, "")
              .trim()
              .replace(/\s+/g, " "),
        ),
        ariaLabel: label.getAttribute("aria-label"),
      })),
  ).toEqual([
    { heard: ["Run 41 · attempt 1"], ariaLabel: null },
    { heard: ["Revision a1b2c3d"], ariaLabel: null },
    { heard: ["CI wall time 6 min"], ariaLabel: null },
  ]);
}

test("a measured build is a point of CI time without runner waits beside the trunk's judgment and Proof, listed with its date, that time, exact revision and run, by keyboard on a phone", async () => {
  const answer = makeMe.aCiHistoryAnswer
    .measuredBuild({
      revision: run.revision,
      runId: run.runId,
      startedAt,
      completedAt,
      timeMs: 365_000,
    })
    .please();
  const panel = await mountTrunkHistory(answer);
  await expectTrunkJudgmentAndProof(panel);

  const history = panel.getByRole("region", { name: historyName, exact: true });
  expect(history.getByRole("heading").element().textContent).toBe(
    "CI time without runner waits history 1 measured build · Nov 5",
  );
  await expect
    .element(
      history.getByText("Collected from dashboard-recorded landings", {
        exact: true,
      }),
    )
    .toBeVisible();
  expect(history.getByRole("term").element().textContent).toBe(
    "Latest measured build",
  );
  expect(history.getByRole("definition").element().textContent).toBe(
    "6 min 5 s",
  );
  const chart = history.getByRole("img", {
    name: "CI time without runner waits by build date",
    exact: true,
  });
  await expect.element(chart).toBeVisible();

  expect([window.innerWidth, window.innerHeight]).toEqual([390, 844]);
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
    "Nov 5 · 6 min 5 s · exact revision a1b2c3d · Run 41 · attempt 1",
  ]);
  await act(() => userEvent.tab());
  const link = evidence.getByRole("link", {
    name: "Run 41 · attempt 1",
    exact: true,
  });
  await expect.element(link).toHaveFocus();
  expect(link.element().getAttribute("href")).toBe(
    "https://ci.invalid/runs/41",
  );

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

test("a history with no measured landing says none has been measured yet, draws no chart, and keeps the judgment and Proof", async () => {
  const panel = await mountTrunkHistory(makeMe.aCiHistoryAnswer.please());
  await expectTrunkJudgmentAndProof(panel);

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
  expect(history.element().querySelector("summary")).toBeNull();
});
