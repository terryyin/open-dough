// One historical launch in its original checkout, held only as local evidence.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { keepMoreAttemptsBesideServer } from "./acceptedAttempts.ts";
import { keepMoreLaunchRecordsBesideServer } from "./support/launchStore.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

export async function keepHistoricalClaudeStart(
  dashboard: DashboardServer,
  workspace: string,
) {
  const acceptedAt = new Date().toISOString();
  const instruction = "Continue the saved investigation";
  const attempt = makeMe.anAcceptedAttempt
    .adHoc({ instruction })
    .acceptedAt(acceptedAt)
    .reportingTo(dashboard.origin)
    .please();
  const sessionId = dashboard.claudeListsSession({
    name: instruction,
    cwd: workspace,
    startedAt: Date.parse(acceptedAt),
  });
  const launch = makeMe.aLaunchRecord
    .adHoc({ instruction, title: instruction })
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
