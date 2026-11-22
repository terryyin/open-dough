// The trunk's judgment, Proof and CI history as one rendered CI status panel.
// Backend collection: ../../backend-tests/intent/landed-ci-history-collection.spec.ts
// Pending on a published landing: ../../../e2e/intent/intent-ci-wall-time-history-pending.spec.ts
import { expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  historyName,
  openTrunkHistory,
  trunkBuild,
} from "./intent-ci-wall-time-history-page.ts";

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
    .measuredBuild({ ...trunkBuild, timeMs: 365_000 })
    .pleaseMeasured();
  const opened = await openTrunkHistory(answer);
  const { ci, history, headingText, mark, historyReads } = opened;
  const { panel } = ci;
  await expectTrunkJudgmentAndProof(panel);

  await expect
    .poll(headingText)
    .toBe("CI time without runner waits history 1 measured build · Nov 5");
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
  await expect.element(mark("Nov 5 · 6 min 5 s")).toBeVisible();

  expect([window.innerWidth, window.innerHeight]).toEqual([390, 844]);
  const evidence = await opened.openEvidenceByKeyboard();
  expect(
    evidence
      .getByRole("listitem")
      .elements()
      .map((row) => row.textContent),
  ).toEqual([
    "Nov 5 · 6 min 5 s · exact revision a1b2c3d · Run 41 · attempt 1",
  ]);
  await userEvent.tab();
  const link = evidence.getByRole("link", {
    name: "Run 41 · attempt 1",
    exact: true,
  });
  await expect.element(link).toHaveFocus();
  expect(link.element().getAttribute("href")).toBe(
    "https://ci.invalid/runs/41",
  );

  expect(opened.scrollingSideways(), "scrolling sideways").toEqual([]);

  // Check again starts a new refresh round, which reads the history again.
  expect(historyReads).toEqual(["open-dough"]);
  await ci.checkAgain();
  await expect
    .poll(() => [...historyReads])
    .toEqual(["open-dough", "open-dough"]);
});

test("a history with no measured landing says none has been measured yet, draws no chart, and keeps the judgment and Proof", async () => {
  const { ci, history, headingText } = await openTrunkHistory(
    makeMe.aCiHistoryAnswer.pleaseMeasured(),
  );
  await expectTrunkJudgmentAndProof(ci.panel);

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
  expect(history.element().querySelector("summary")).toBeNull();
});
