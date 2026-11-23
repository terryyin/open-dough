import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { FinalReportRead } from "../../src/finalReportContract.ts";
import {
  mountSessionCards,
  readyStory,
  sessionsReading,
} from "./session-card-mount.ts";

export const unfinishedReportTitle =
  "Read the saved unfinished report. Keep the intended work open until its remaining steps are complete.";
export const defaultReportText =
  "Landed on main at `a5df85d90a`.\n\n- Story 2 remains **not ready**.\n- Removed the worktree and branch.\n\nNo product code changed.\n<script>window.reportExecuted=true</script>";

function unfinishedLaunch(title: string, sessionId: string) {
  return makeMe.aLaunchRecord
    .refining({ identity: readyStory.identity, title })
    .inClaudeSession({ sessionId })
    .completedWith({
      outcome: "unfinished",
      message: "Keep the remaining steps open.",
    })
    .withReportRead();
}

function observeRetainedReport(record: LaunchRecord) {
  return makeMe.anObservedLaunch
    .of(record)
    .withSessionState(makeMe.aSessionState.retained("review").please())
    .withWorkspace("missing")
    .please();
}

export function retainedReport(title: string, sessionId: string) {
  return observeRetainedReport(unfinishedLaunch(title, sessionId).please());
}

export async function mountUnfinishedReport(
  viewport: { width: number; height: number },
  text = defaultReportText,
) {
  const launch = unfinishedLaunch(unfinishedReportTitle, "unfinished-report");
  const record = observeRetainedReport(launch.please());
  const marked = observeRetainedReport(launch.markedDone().please());
  const answer: FinalReportRead = {
    kind: "available",
    turnId: "mounted-report-turn",
    text,
  };
  await mountSessionCards({
    viewport,
    reading: sessionsReading("unfinished", record),
    readFinalReport: () => Promise.resolve(answer),
    markDone: () =>
      Promise.resolve({
        kind: "marked",
        record: marked,
      }),
  });
}
