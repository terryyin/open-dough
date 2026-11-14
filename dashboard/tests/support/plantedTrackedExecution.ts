// A Cursor execution of one story planted on a boundary server's machine: its
// accepted attempt, its kept record with a first landing at the published head
// of a repository whose backlog the case states, and the reports it delivers
// to that server's completion endpoint, as its reporting command would.
import { randomUUID } from "node:crypto";
import path from "node:path";
import { expect } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import type { LaunchAttemptRecord } from "../../src/agentLaunch.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { keepMoreAttemptsBesideServer } from "../acceptedAttempts.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { postCompletion } from "./completionRecovery.ts";
import {
  keepMoreLaunchRecordsBesideServer,
  keptLaunchRecords,
} from "./launchStore.ts";
import { plantTrackedClosureRepository } from "./retainedReport.ts";

export type PlantedExecution = {
  readonly record: LaunchRecord;
  readonly attempt: LaunchAttemptRecord;
};

// The execution of `story` named `name`, claimed unless `oneShot`, whose
// repository publishes `backlog`; `launched` settles its attempt now, while
// an unsettled one awaits its native session.
export function plantedExecution(
  dashboard: DashboardServer,
  story: { readonly identity: string; readonly title: string },
  name: string,
  backlog: Parameters<typeof plantTrackedClosureRepository>[1],
  { launched = true, oneShot = false } = {},
): PlantedExecution {
  const repository = path.join(dashboard.home, `${name}-repository`);
  const { revision } = plantTrackedClosureRepository(repository, backlog);
  const reference = randomUUID();
  const reporting = {
    origin: dashboard.origin,
    reference,
    command: "dashboard-completion",
  };
  const now = new Date().toISOString();
  const record = makeMe.aLaunchRecord
    .executing({ identity: story.identity, title: story.title })
    .inCursorSession({
      sessionId: randomUUID(),
      continuation: { workspace: repository },
    })
    .onStoryBranch({
      workspace: repository,
      branch: `cursor/${name}`,
      ...(oneShot && {
        tracking: "one-shot" as const,
        role: "isolated" as const,
        landing: "review" as const,
      }),
    })
    .reportingThrough(reporting)
    .withLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository, identity: story.identity })
        .comparing({ base: revision, revision })
        .forLaunch(reference)
        .please(),
    )
    .launchedAt(now)
    .please();
  const accepted = makeMe.anAcceptedAttempt
    .executing({ identity: story.identity, title: story.title, host: "cursor" })
    .withId(reference)
    .acceptedAt(now)
    .reportingTo(dashboard.origin)
    .capturingLanding({ reporting });
  const attempt = launched
    ? accepted.launched(record.session).settledAt(now).please()
    : accepted.please();
  return { record, attempt };
}

// Keeps the executions' attempts and `records`, by default their records,
// beside the running server.
export async function keepPlanted(
  dashboard: DashboardServer,
  launches: readonly PlantedExecution[],
  records: readonly LaunchRecord[] = launches.map(({ record }) => record),
) {
  await keepMoreAttemptsBesideServer(
    dashboard,
    launches.map(({ attempt }) => attempt),
  );
  await keepMoreLaunchRecordsBesideServer(dashboard, records);
}

// The execution's report, quiet unless it carries a message, and its receipt.
export async function deliverReport(
  dashboard: DashboardServer,
  { record }: PlantedExecution,
  outcome: "completed" | "unfinished" = "completed",
  message = outcome === "completed" ? "" : "Resolve the decision first.",
) {
  const reference = record.request.reporting?.reference;
  if (reference === undefined) throw new Error("No reporting launch");
  const response = await postCompletion(
    dashboard.origin,
    makeMe.aCompletionSubmission
      .reportingFor({ host: "cursor", reference })
      .withOutcome(outcome)
      .saying(message)
      .please(),
  );
  expect(response.status).toBe(200);
  return completionReceiptSchema.parse(JSON.parse(response.body));
}

// The execution's record as this machine keeps it now.
export const keptExecution = (
  dashboard: DashboardServer,
  { record }: Pick<PlantedExecution, "record">,
) =>
  keptLaunchRecords(dashboard).find(
    (entry): entry is LaunchRecord =>
      "session" in entry &&
      entry.session.sessionId === record.session.sessionId,
  );
