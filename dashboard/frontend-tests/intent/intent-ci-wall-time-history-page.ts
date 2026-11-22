// Intent's CI status homepage on a phone judging main's run 41 passed at
// a1b2c3d with its Proof, main's CI time without runner waits history
// answered by `answer`: the CI status page object, that history's region, its
// heading's text once shown, a chart mark by its accessible name and each
// history read the page asked, in order.
import type { MeasuredHistory } from "../../src/landedCiHistory.ts";
import { judgedRun, mountJudgedRunProof } from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

export const historyName = "CI time without runner waits history";

// The judged run as a build the history can measure.
export const trunkBuild = {
  revision: judgedRun.revision,
  runId: judgedRun.runId,
  startedAt: "2026-11-05T10:00:00Z",
  completedAt: "2026-11-05T10:06:05Z",
};

export async function openTrunkHistory(answer: MeasuredHistory) {
  const historyReads: string[] = [];
  await mountJudgedRunProof(
    [],
    {
      subject: "Result landed.txt",
      startedAt: trunkBuild.startedAt,
      completedAt: trunkBuild.completedAt,
    },
    {
      viewport: { width: 390, height: 844 },
      ci: {
        readHistory: (source) => {
          historyReads.push(source.id);
          return Promise.resolve(answer);
        },
      },
    },
  );
  const ci = intentCiStatus();
  const history = ci.panel.getByRole("region", {
    name: historyName,
    exact: true,
  });
  const headingText = () => history.getByRole("heading").query()?.textContent;
  const mark = (readout: string) =>
    history.getByRole("button", { name: readout, exact: true });
  return { ci, history, headingText, mark, historyReads };
}
