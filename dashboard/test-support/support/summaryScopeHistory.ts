// A Done story's mounted Summary whose selected scope reads one retained
// timing history: the canonical Summary scope story (`makeMe.aComparedStory`)
// completed at its work revision, and the scope history read answered with
// what `collectedAt` retains through that completion. Collection and retained
// projection belong to the integrated journeys.
import type { Page } from "@playwright/test";
import { scopeHistory } from "../intentScopeHistoryPage.ts";
import {
  mountComparison,
  type ComparisonServices,
} from "./comparisonMountPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { FrontendAppServer } from "./frontendAppServer.ts";

export async function openSummaryScopeHistory(
  page: Page,
  comparisonServer: FrontendAppServer,
  comparisonServices: ComparisonServices,
  collectedAt: (completion: string) => unknown,
) {
  const story = makeMe.aComparedStory.inSummaryScope().please();
  comparisonServices.serve(story);
  const completion = story.work.revision;
  const collected = collectedAt(completion);
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    (route) => route.fulfill({ json: collected }),
  );
  await mountComparison(page, comparisonServer, {
    ...story,
    doneEndpoint: { revision: completion, at: "2026-11-09T00:00:00Z" },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  return { completion, summary, history: scopeHistory(summary) };
}
