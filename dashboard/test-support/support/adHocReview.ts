// Shared setup for ad hoc session review boundary specs.
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { reviewedWorkQuery } from "../../src/reviewedWorkSubject.ts";
import { markDone, recordsOf } from "../agentLaunchBoundary.ts";
import { getReview } from "./completedReviewRequests.ts";
import { launched } from "./startSessionLandingCapture.ts";
import { git } from "./storyReviewWorktree.ts";
import type { APIRequestContext } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "@playwright/test";

const sessionQuery = (session: string) =>
  reviewedWorkQuery({ source: "open-dough", host: "claude", session });

export async function launchIsolatedReview(
  dashboard: DashboardServer,
  instruction: string,
) {
  const { record, sent } = await launched(dashboard, {
    instruction,
    policy: { workspace: "isolated", landing: "review" },
  });
  const { establishedSession: place, session } = record;
  if (place?.startingRevision === undefined)
    throw new Error("Missing the isolated launch's starting revision.");
  return {
    workspace: place.workspace,
    branch: place.branch,
    baseline: place.startingRevision,
    session: session.sessionId,
    sent,
  };
}

export async function markAdHocDone(
  dashboard: DashboardServer,
  session: string,
) {
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);
}

export function retireAdHocBranch(
  checkout: string,
  workspace: string,
  branch: string,
  { discardWorkingChanges = false } = {},
) {
  git(
    checkout,
    "worktree",
    "remove",
    ...(discardWorkingChanges ? ["--force"] : []),
    workspace,
  );
  git(checkout, "branch", "--quiet", "-D", branch);
  git(checkout, "reflog", "expire", "--expire=now", "--all");
  git(checkout, "gc", "--quiet", "--prune=now");
}

export function sessionBranchPins(checkout: string, session: string): string[] {
  return git(
    checkout,
    "for-each-ref",
    "--format=%(objectname)",
    `refs/open-dough/session-branch/claude/${session}/`,
  )
    .split("\n")
    .filter(Boolean);
}

export async function adHocReview(
  request: APIRequestContext,
  dashboard: DashboardServer,
  session: string,
  run?: string | number,
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

// The session's record as the project keeps it now.
export async function keptAdHocRecord(
  dashboard: DashboardServer,
  session: string,
): Promise<LaunchRecord | undefined> {
  return ((await recordsOf(dashboard, "open-dough")) as LaunchRecord[]).find(
    (record) => record.session.sessionId === session,
  );
}
