// Request construction and capture for completed reviews. Scenarios assert
// the responses and the evidence observed at these boundaries.
import type { APIRequestContext, Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { queuedIdentity } from "./startOrigin.ts";

export const completedStoryQuery = {
  source: "open-dough",
  identity: queuedIdentity,
};
export const completedReviewQuery = {
  ...completedStoryQuery,
  completed: "true",
};

export async function getReview(
  request: APIRequestContext,
  dashboard: DashboardServer,
  endpoint: string,
  query: Record<string, string>,
) {
  return request.get(
    `${dashboard.baseURL}${endpoint}?${new URLSearchParams(query)}`,
    { headers: { Origin: dashboard.origin } },
  );
}

export async function readLandedReview(
  request: APIRequestContext,
  dashboard: DashboardServer,
  run: string,
) {
  const response = await getReview(request, dashboard, storyReviewEndpoint, {
    ...completedStoryQuery,
    run,
  });
  return storyReviewSchema.parse(await response.json());
}

export function waitForLandedReview(page: Page, run: string) {
  return waitForCompletedReview(page, (query) => query.get("run") === run);
}

export function waitForHistoricalReview(page: Page, identity?: string) {
  return waitForCompletedReview(
    page,
    (query) =>
      query.get("historical") === "true" &&
      (identity === undefined || query.get("identity") === identity),
  );
}

async function waitForCompletedReview(
  page: Page,
  matchesQuery: (query: URLSearchParams) => boolean,
) {
  const response = await page.waitForResponse((candidate) => {
    const url = new URL(candidate.url());
    return (
      url.pathname === storyReviewEndpoint && matchesQuery(url.searchParams)
    );
  });
  return storyReviewSchema.parse(await response.json());
}

export function waitForLandingProofRequest(
  page: Page,
  identity: string,
  base: string,
  revision: string,
) {
  return page.waitForRequest((request) => {
    const query = new URL(request.url()).searchParams;
    return (
      query.get("intent") === "ci-comparison" &&
      query.get("identity") === identity &&
      query.get("start") === base &&
      query.get("end") === revision
    );
  });
}
