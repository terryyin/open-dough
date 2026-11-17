// Shared setup for ad hoc session review boundary specs.
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { reviewedWorkQuery } from "../../src/reviewedWorkSubject.ts";
import { getReview } from "./completedReviewRequests.ts";
import type { APIRequestContext } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "@playwright/test";

export async function adHocReview(
  request: APIRequestContext,
  dashboard: DashboardServer,
  session: string,
) {
  const response = await getReview(
    request,
    dashboard,
    storyReviewEndpoint,
    reviewedWorkQuery({ source: "open-dough", host: "claude", session }),
  );
  expect(response.status()).toBe(200);
  return storyReviewSchema.parse(await response.json());
}
