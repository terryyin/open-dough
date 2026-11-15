// Intent CI history answers for frontend-only journeys: the authenticated
// read's project `intent=ci-history` family
// (../../src/authenticatedIntentCiHistoryRead.ts) answering the history a
// case arranges (`makeMe.aCiHistoryAnswer`, ../../src/landedCiHistory.ts):
// its landings in the order the Backend chose, each a measured build or a
// gap. The family counts the page's project history reads. Scope and Done
// endpoint reads (`scope=`, `revision=`) are not this family's. Which
// landings the Backend keeps, how it orders and windows them and what it
// collects is proved by ../../backend-tests/intent/landed-ci-history-*.spec.ts,
// ../../../Distribution/tests/support/landed-ci-history-reading-order.test.mjs
// and ../../../e2e/intent/.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import type { LandedCiHistory } from "../../src/landedCiHistory.ts";
import { fulfillJson } from "./frontendSubstituteAnswers.ts";

export type FrontendCiHistoryAnswers = {
  // The page's project history reads so far.
  readonly reads: () => number;
};

// Answers each project history read with `history`.
export async function serveFrontendCiHistory(
  page: Page,
  history: LandedCiHistory,
): Promise<FrontendCiHistoryAnswers> {
  let reads = 0;
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "ci-history" &&
      !url.searchParams.has("scope") &&
      !url.searchParams.has("revision"),
    async (route) => {
      reads += 1;
      await fulfillJson(route, history);
    },
  );
  return { reads: () => reads };
}
