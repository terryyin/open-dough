// Shared setup for ad hoc session review boundary specs.
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { reviewedWorkQuery } from "../../src/reviewedWorkSubject.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { recordsOf } from "../agentLaunchBoundary.ts";
import { getReview } from "./completedReviewRequests.ts";
import { keepLaunchRecords } from "./launchStore.ts";
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

// The file text read of the same pair, which the panel asks beside the diff.
export function adHocSessionFileText(
  request: APIRequestContext,
  dashboard: DashboardServer,
  session: string,
  file: { baseline: string; tree: string; path: string },
) {
  return getReview(request, dashboard, storyReviewFileTextEndpoint, {
    ...sessionQuery(session),
    ...file,
  });
}

// Keeps a Done session of the Default main checkout at `repository` whose
// kept commits are the one run `base` to `revision`; answers its session id.
export function keepSessionWithKeptRun(
  dashboard: DashboardServer,
  repository: string,
  { base, revision }: { base: string; revision: string },
): string {
  const sessionId = "session-with-kept-run";
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title: "Session with a kept run" })
      .inDefaultCheckout({
        workspace: repository,
        landing: "review",
        revision: base,
      })
      .inClaudeSession({ sessionId })
      .keptSessionCommits({ repository, runs: [{ base, revision }] })
      .markedDone()
      .please(),
  ]);
  return sessionId;
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
