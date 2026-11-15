// Minimal observed Done Intent arrangement. Explicit landed answers are a
// presentation precondition, never evidence of historical source judgment.
import type { ReviewedFile } from "../../src/storyReviewContract.ts";
import type { IntentLocation } from "../../server/intentLocationsRead.ts";
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { IntentCoverage } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { storyB } from "../../../Distribution/tests/support/queued-repository.mjs";
import { summaryScopeFacts } from "./comparisonScopeFacts.ts";
import { answerFrontendIntentComparison } from "./frontendIntentComparison.ts";
import { answerFrontendIntentCi } from "./frontendIntentCi.ts";
import { putFrontendIntentStory } from "./frontendIntentStory.ts";
import {
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  frontendPublishedReview,
  frontendFileDiff,
  installFrontendStoryReview,
} from "./frontendStoryReview.ts";
import {
  summaryComparisonTrunkRevision,
  summaryComparisonChangeRevision,
} from "./intentSummaryStoryComparisonShared.ts";

export async function prepareFrontendDoneIntent(
  page: Page,
  services: FrontendServiceState,
  intentCoverage?: IntentCoverage,
  historical: {
    readonly files?: Readonly<Record<string, string>>;
    readonly changed?: readonly ReviewedFile[];
    readonly locations?: readonly IntentLocation[];
  } = {},
) {
  putFrontendIntentStory(services, { taken: false, workspace: false });
  const facts = summaryScopeFacts();
  const completion = facts.work.revision;
  const completedAt = new Date().toISOString();
  const record = makeMe.aDoneRecord.completed({
    identity: facts.identity,
    title: "Story A",
    completedAt,
  });
  if (intentCoverage !== undefined) record.withIntentCoverage(intentCoverage);
  putFrontendDoneRecords(services, "open-dough", [record.please()]);
  const backlog = describedBacklog(
    makeMe.aRepository
      .withRevision("published", { backlog: { queued: [storyB] } })
      .please(),
  );
  Object.assign(services, {
    backlog,
    files: { ...services.files, ".planning/PRODUCT-BACKLOG.md": backlog },
  });
  const landedFiles = {
    ...summaryComparisonTrunkRevision.files,
    ...summaryComparisonChangeRevision.files,
    ...historical.files,
  };
  for (const path of summaryComparisonChangeRevision.remove ?? [])
    Reflect.deleteProperty(landedFiles, path);
  const locations = historical.locations ?? [
    ...facts.scope.locations,
    makeMe.anIntentLocation
      .at("tests")
      .ofKind("shell", ["*.sh"])
      .selecting("tests/check.sh")
      .please(),
  ];
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("revision") === completion &&
      (url.searchParams.get("intent") === "locations" ||
        url.searchParams.has("path")),
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      if (params.get("intent") === "locations") {
        await route.fulfill({ json: { revision: completion, locations } });
      } else {
        const path = params.get("path") ?? "";
        const text = landedFiles[path];
        if (text === undefined)
          throw new Error(`Unarranged landed source ${path}`);
        await route.fulfill({ json: { revision: completion, path, text } });
      }
    },
  );
  const published = frontendPublishedReview([
    ...(historical.changed ?? facts.scope.changed),
  ]);
  const review = await installFrontendStoryReview(page, {
    ...published,
    completion,
    landingRevision: completion,
    completedAt,
  });
  review.answerHistoricalSnapshot(facts.identity, review.snapshot());
  const path = "dashboard/tests/folder/a.spec.ts";
  review.answerFile(frontendFileDiff(path, ["+changed"]), path);
  await answerFrontendIntentCi(page, services.revision);
  await answerFrontendIntentComparison(page, facts);
  return { completion, completedAt, review };
}
