// Shared setup for ad hoc session review boundary specs.
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { reviewedWorkQuery } from "../../src/reviewedWorkSubject.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launch, markDone, recordsOf } from "../agentLaunchBoundary.ts";
import { getReview } from "./completedReviewRequests.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";
import type { APIRequestContext } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "@playwright/test";

const sessionQuery = (session: string) =>
  reviewedWorkQuery({ source: "open-dough", host: "claude", session });

export async function adHocReview(
  request: APIRequestContext,
  dashboard: DashboardServer,
  session: string,
  // A kept run's position among the session's runs, oldest first.
  run?: number,
) {
  const response = await getReview(request, dashboard, storyReviewEndpoint, {
    ...sessionQuery(session),
    ...(run === undefined ? {} : { run: String(run) }),
  });
  expect(response.status()).toBe(200);
  return storyReviewSchema.parse(await response.json());
}

// A file diff read of a session's kept commits, naming the pair by its two
// commits; answers the response.
export function adHocSessionFileDiff(
  request: APIRequestContext,
  dashboard: DashboardServer,
  session: string,
  file: { baseline: string; tree: string; path: string; oldPath?: string },
) {
  return getReview(request, dashboard, storyReviewFileEndpoint, {
    ...sessionQuery(session),
    ...file,
  });
}

// Launches an ad hoc session in the project's Default main checkout, blank
// unless given an instruction; answers its record as launched.
export async function launchDefaultMainSession(
  dashboard: DashboardServer,
  instruction?: string,
): Promise<LaunchRecord> {
  dashboard.claudeScenario("launched");
  const launched = await launch(
    dashboard,
    makeMe.aLaunchRequest
      .adHoc(instruction === undefined ? {} : { instruction })
      .please(),
  );
  expect(launched.status).toBe(200);
  return (JSON.parse(launched.body) as { record: LaunchRecord }).record;
}

// Keeps a session established now in the project's Default main checkout at
// its current commit; answers when it launched.
export function establishDefaultMainSession(
  dashboard: DashboardServer,
  origin: Pick<StartOrigin, "project">,
  sessionId: string,
): string {
  const launchedAt = new Date().toISOString();
  dashboard.claudeScenario("launched");
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title: "Established in Default main" })
      .inDefaultCheckout({
        workspace: origin.project,
        landing: "review",
        revision: git(origin.project, "rev-parse", "HEAD"),
      })
      .inClaudeSession({ sessionId })
      .launchedAt(launchedAt)
      .please(),
  ]);
  return launchedAt;
}

// Marks the session done; answers its Done time.
export async function markAdHocDone(
  dashboard: DashboardServer,
  session: string,
): Promise<string | undefined> {
  const done = await markDone(dashboard, { source: "open-dough", session });
  expect(done.status).toBe(200);
  return (JSON.parse(done.body) as { record: LaunchRecord }).record.doneAt;
}

// The session's record as the project keeps it now.
export async function keptAdHocRecord(
  dashboard: DashboardServer,
  session: string,
): Promise<LaunchRecord | undefined> {
  return ((await recordsOf(dashboard, "open-dough")) as LaunchRecord[]).find(
    (record) => record.session.sessionId === session,
  );
}
