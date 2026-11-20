// Launch and review reads for ad hoc session review boundary specs.
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { reviewedWorkQuery } from "../../src/reviewedWorkSubject.ts";
import { getReview } from "./completedReviewRequests.ts";
import { launched } from "./startSessionLandingCapture.ts";
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
