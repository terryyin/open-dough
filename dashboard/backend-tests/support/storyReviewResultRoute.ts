// Routed published comparison and result reads through the same fixture server.
import type { APIRequestContext } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect } from "../../test-support/support/preparationPage.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { intentSettingsText } from "../../test-support/support/intentSettingsFile.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import {
  storyReviewResultEndpoint,
  storyReviewResultQuery,
  storyReviewResultSchema,
  type StoryReviewResultRead,
} from "../../src/storyReviewResult.ts";

export const storyResultSettings = (root: string) =>
  intentSettingsText(
    makeMe.intentSettings
      .withLocations(
        makeMe.anIntentLocation.at(root).ofKind("typescript").please(),
      )
      .please(),
  );

export function storyResultRoute({
  request,
  dashboard,
}: {
  request: APIRequestContext;
  dashboard: DashboardServer;
}) {
  const result = (read: StoryReviewResultRead) =>
    getReview(
      request,
      dashboard,
      storyReviewResultEndpoint,
      storyReviewResultQuery(read),
    );
  return {
    async review(query: Record<string, string>) {
      const response = await getReview(
        request,
        dashboard,
        storyReviewEndpoint,
        query,
      );
      expect(response.status()).toBe(200);
      return storyReviewSchema.parse(await response.json());
    },
    result,
    async read(read: StoryReviewResultRead) {
      const response = await result(read);
      expect(response.status()).toBe(200);
      return storyReviewResultSchema.parse(await response.json());
    },
  };
}
