// A retained card session whose workspace is missing, so the entry offers
// Read final report for frontend-only journeys.

import type { Page } from "@playwright/test";
import type { FinalReportRead } from "../../src/finalReportContract.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { notRefinedIdentity, notRefinedStory } from "../launchJourney.ts";
import { readFinalReportControl } from "../finalReportPages.ts";
import { cardSessionEntry } from "./frontendCardSessions.ts";
import { frontendStoryLaunch } from "./frontendServiceState.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { installFrontendFinalReport } from "./frontendFinalReportSubstitutes.ts";
import { installFrontendSessionActions } from "./frontendSessionActions.ts";
import { openFrontendTakenBacklog } from "./frontendApp.ts";

export const unfinishedReportTitle =
  "Read the saved unfinished report. Keep the intended work open until its remaining steps are complete.";

export const defaultReportText =
  "Landed on main at `a5df85d90a`.\n\n- Story 2 remains **not ready**.\n- Removed the worktree and branch.\n\nNo product code changed.\n<script>window.reportExecuted=true</script>";

// Retained refinement on the not-refined story with a missing workspace, so
// the card offers Read final report. `sessionId` names the host conversation
// when several retained entries must be told apart.
export function retainedMissingWorkspaceSession(
  sessionId?: string,
): LaunchWithState {
  const launch = frontendStoryLaunch("refining", notRefinedStory);
  const record =
    sessionId === undefined
      ? launch.please()
      : launch.inClaudeSession({ sessionId }).please();
  return makeMe.anObservedLaunch
    .of(record)
    .withSessionState(makeMe.aSessionState.retained("review").please())
    .withWorkspace("missing")
    .please();
}

export function unfinishedRetainedSession(): LaunchWithState {
  return makeMe.anObservedLaunch
    .of(
      makeMe.aLaunchRecord
        .refining({
          identity: notRefinedIdentity,
          title: unfinishedReportTitle,
        })
        .completedWith({
          outcome: "unfinished",
          message: "Keep the remaining steps open.",
        })
        .withReportRead()
        .please(),
    )
    .withSessionState(makeMe.aSessionState.retained("review").please())
    .withWorkspace("missing")
    .please();
}

export async function openFrontendUnfinishedReport(
  page: Page,
  services: FrontendServiceState,
  report: FinalReportRead = {
    kind: "available",
    turnId: "frontend-report-turn",
    text: defaultReportText,
  },
) {
  const session = unfinishedRetainedSession();
  services.answerMachine(makeMe.aMachineAnswer.observing(session).please());
  const reports = await installFrontendFinalReport(page, report);
  const actions = await installFrontendSessionActions(page, services);
  await openFrontendTakenBacklog(page);
  const entry = cardSessionEntry(page, notRefinedStory, "Refinement");
  const open = readFinalReportControl(entry);
  await open.focus();
  await page.keyboard.press("Enter");
  return { entry, open, reports, actions, session };
}
