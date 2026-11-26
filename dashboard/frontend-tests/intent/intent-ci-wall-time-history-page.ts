// Intent's CI status homepage on a phone judging main's run 41 passed at
// a1b2c3d with its Proof, main's CI time without runner waits history
// answered by `answer` (and Intent read through `intent`, unconfigured unless
// given): the CI status page object, that history's region, its
// heading's text once shown, a chart mark by its accessible name and each
// history read the page asked, in order; and the reader's journeys on it:
// opening its Builds and evidence by keyboard from Check again, and finding
// what scrolls sideways on the phone.
import { expect } from "vitest";
import { userEvent } from "vitest/browser";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { MeasuredHistory } from "../../src/landedCiHistory.ts";
import { judgedRun, mountJudgedRunProof } from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import { scrollingSidewaysIn } from "./intent-scope-history-page.ts";

export const historyName = "CI time without runner waits history";

// The judged run as a build the history can measure.
export const trunkBuild = {
  revision: judgedRun.revision,
  runId: judgedRun.runId,
  startedAt: "2026-11-05T10:00:00Z",
  completedAt: "2026-11-05T10:06:05Z",
};

export async function openTrunkHistory(
  answer: MeasuredHistory,
  intent?: IntentReadSource,
) {
  const historyReads: string[] = [];
  await mountJudgedRunProof({
    entries: [],
    judgment: {
      subject: "Result landed.txt",
      startedAt: trunkBuild.startedAt,
      completedAt: trunkBuild.completedAt,
    },
    viewport: { width: 390, height: 844 },
    ...(intent && { intent }),
    ci: {
      readHistory: (source) => {
        historyReads.push(source.id);
        return Promise.resolve(answer);
      },
    },
  });
  const ci = intentCiStatus();
  const history = ci.panel.getByRole("region", {
    name: historyName,
    exact: true,
  });
  const headingText = () => history.getByRole("heading").query()?.textContent;
  const mark = (readout: string) =>
    history.getByRole("button", { name: readout, exact: true });
  const evidence = history.getByRole("list", {
    name: "Builds and evidence",
    exact: true,
  });
  // From Check again, Shift+Tab reaches the Builds and evidence summary and
  // Enter opens it: the evidence list, shown.
  const openEvidenceByKeyboard = async () => {
    const checkAgain = ci.panel.getByRole("button", {
      name: "Check again",
      exact: true,
    });
    await expect.element(checkAgain).toBeEnabled();
    (checkAgain.element() as HTMLElement).focus();
    await expect.element(checkAgain).toHaveFocus();
    expect(evidence.elements()).toHaveLength(0);
    await userEvent.tab({ shift: true });
    await expect
      .element(history.getByText("Builds and evidence", { exact: true }))
      .toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(evidence).toBeVisible();
    return evidence;
  };
  // What scrolls sideways on the phone.
  const scrollingSideways = () => scrollingSidewaysIn(history.element());
  return {
    ci,
    history,
    headingText,
    mark,
    historyReads,
    openEvidenceByKeyboard,
    scrollingSideways,
  };
}
