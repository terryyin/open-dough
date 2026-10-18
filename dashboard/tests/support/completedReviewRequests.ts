// The completed-story boundary specs share only request construction, keeping
// real Git setup and every response observation in their owning scenarios.
import type { APIRequestContext } from "@playwright/test";
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
