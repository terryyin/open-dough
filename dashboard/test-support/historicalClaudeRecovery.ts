// One historical launch in its original checkout, held only as local evidence.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { FollowUp } from "../src/followUpRequest.ts";
import { keepMoreAttemptsBesideServer } from "./acceptedAttempts.ts";
import { keepMoreLaunchRecordsBesideServer } from "./support/launchStore.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

export async function keepHistoricalClaudeStart(
  dashboard: DashboardServer,
  workspace: string,
  followUp?: FollowUp,
) {
  const acceptedAt = new Date().toISOString();
  const instruction = "Continue the saved investigation";
  const requesting = {
    instruction,
    ...(followUp === undefined ? {} : { followUp }),
  };
  const sessionId = dashboard.claudeListsSession({
    name: instruction,
    cwd: workspace,
    startedAt: Date.parse(acceptedAt),
  });
  const accepted = makeMe.anAcceptedAttempt
    .adHoc(requesting)
    .acceptedAt(acceptedAt)
    .reportingTo(dashboard.origin);
  if (followUp !== undefined)
    accepted.launched({ host: "claude", sessionId }).settledAt(acceptedAt);
  const attempt = accepted.please();
  const launch = makeMe.aLaunchRecord
    .adHoc({ ...requesting, title: instruction })
    .inClaudeSession({ sessionId })
    .startingInExecutionCheckout({ workspace })
    .reportingThrough({
      origin: dashboard.origin,
      reference: attempt.id,
      command: "report the historical launch",
    })
    .launchedAt(acceptedAt)
    .please();
  await keepMoreAttemptsBesideServer(dashboard, [attempt]);
  await keepMoreLaunchRecordsBesideServer(dashboard, [launch]);
  return { attempt, launch, sessionId };
}
