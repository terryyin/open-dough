// Frontend arrangement for arriving at a story from its URL
// (../../frontend-tests/navigation/story-url-destination.spec.ts) or learning
// why it cannot be shown (story-url-destination-unavailable.spec.ts): Doughnut
// and Open Dough each tell the shared story identity
// (../projectSelectionProjects.ts), Doughnut with twelve stories queued ahead
// of it so its card starts out of view.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { describedRevision } from "../describedRevisions.ts";
import {
  doughnutPublication,
  doughnutSharedTitle,
  openDoughPublication,
  sharedStoryIdentity,
} from "../projectSelectionProjects.ts";
import { answerOnlyPublications } from "./frontendCatalogProjects.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";

const sharedStory = makeMe.aBacklogEntry
  .with({
    identity: sharedStoryIdentity,
    title: doughnutSharedTitle,
    href: "seeds/SEED-777-shared.md#shared-story",
  })
  .please();

// Twelve stories queued ahead, so the shared one starts out of view.
const preceding = [...Array(12).keys()].map((index) =>
  makeMe.aBacklogEntry
    .with({
      identity: `SEED-${String(800 + index)}#story`,
      title: `Earlier story ${String(index + 1)}`,
      href: `seeds/SEED-${String(800 + index)}.md#story`,
    })
    .please(),
);

// Doughnut's publication, holding the shared story last in its Backlog list
// or alone in Taken.
const doughnutAhead = (column: "Backlog list" | "Taken") => ({
  ...doughnutPublication,
  ...describedRevision(
    makeMe.aRepository
      .withRevision("published", {
        backlog:
          column === "Taken"
            ? { taken: [sharedStory], queued: preceding }
            : { queued: [...preceding, sharedStory] },
      })
      .please(),
    doughnutPublication.revision,
  ),
});

export async function answerSharedStoryProjects(
  page: Page,
  services: FrontendServiceState,
  column: "Backlog list" | "Taken" = "Backlog list",
) {
  await answerOnlyPublications(page, services, [
    openDoughPublication,
    doughnutAhead(column),
  ]);
}
