// Two immutable Done publications for the actual Sessions selection journey.
import { describedBacklog } from "../describedRevisions.ts";
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { putFrontendDoneRecords } from "./frontendServiceState.ts";
import { prepareFrontendDoneReview } from "./frontendDoneReview.ts";
import {
  frontendFileDiff,
  frontendPublishedReview,
} from "./frontendStoryReview.ts";
import {
  observedDone,
  putFrontendObservedLaunches,
} from "./frontendRecentlyDoneSidebar.ts";

export async function prepareFrontendDoneSelection(
  page: Page,
  services: FrontendServiceState,
) {
  const first = await prepareFrontendDoneReview(page, services, "a 11");
  first.review.answerHistoricalSnapshot(storyA.identity, {
    ...first.published,
    files: [
      makeMe.aReviewedFile
        .with({ kind: "modified", path: "dashboard/src/App.tsx" })
        .please(),
    ],
  });
  const backlog = describedBacklog(
    makeMe.aRepository
      .withRevision("completed-both", { backlog: { queued: [] } })
      .please(),
  );
  Object.assign(services, {
    backlog,
    files: { ...services.files, ".planning/PRODUCT-BACKLOG.md": backlog },
  });
  const completedAt = new Date().toISOString();
  putFrontendDoneRecords(
    services,
    "open-dough",
    [storyA, storyB].map((story) =>
      makeMe.aDoneRecord.completed({ ...story, completedAt }).please(),
    ),
  );
  putFrontendObservedLaunches(
    services,
    observedDone(
      makeMe.aLaunchRecord
        .executing(storyB)
        .inClaudeSession({ sessionId: "completed-story-b", shortId: "story-b" })
        .markedDoneAt(completedAt)
        .please(),
    ),
  );
  const secondCompletion = "d".repeat(40);
  const path = "second/tests/b.spec.ts";
  const files = [makeMe.aReviewedFile.with({ kind: "added", path }).please()];
  first.review.answerHistoricalSnapshot(storyB.identity, {
    ...frontendPublishedReview(files),
    completion: secondCompletion,
    landingRevision: secondCompletion,
    completedAt,
  });
  first.review.answerFile(
    frontendFileDiff(path, ["+Story B historical source"]),
    path,
  );
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("revision") === secondCompletion &&
      (url.searchParams.get("intent") === "locations" ||
        url.searchParams.get("path") === path),
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      await route.fulfill({
        json:
          params.get("intent") === "locations"
            ? {
                revision: secondCompletion,
                locations: [
                  makeMe.anIntentLocation
                    .at("second/tests")
                    .ofKind("typescript", ["**/*.spec.ts"])
                    .selecting(path)
                    .please(),
                ],
              }
            : {
                revision: secondCompletion,
                path,
                text: "Story B historical source\n",
              },
      });
    },
  );
  return { first, secondCompletion };
}
