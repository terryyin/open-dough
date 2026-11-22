// The two published projects
// ../frontend-tests/navigation/project-selection.spec.ts selects between, each with its own revision, direction, and Board, and its
// own telling of a story identity the two projects happen to share.

import type { CatalogPublication } from "./catalogProjectRecords.ts";
import { describedRevision } from "./describedRevisions.ts";
import {
  doughnutRepository,
  doughnutSharedTitle,
  sharedStoryIdentity,
} from "./doughnutProject.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

export { doughnutSharedTitle, sharedStoryIdentity };

// The same recorded identity, told differently by each project
// (./doughnutProject.ts): it must not be merged into one entry or carried
// from one project's snapshot to the other's.
export const openDoughSharedTitle = "Open Dough's telling of the shared story";

export const openDoughTakenTitle = "Open Dough's own taken story";
export const openDoughTakenIdentity = "OD-1#story";
const openDoughQueuedTitle = "Open Dough's own queued story";
export const doughnutTakenTitle = "Doughnut's own taken story";
export const doughnutTakenIdentity = "DN-1#story";
const doughnutQueuedTitle = "Doughnut's own queued story";

const story = (title: string, href: string, identity: string) =>
  makeMe.aBacklogEntry.with({ identity, title, href }).please();
const sharedStory = (title: string) =>
  story(title, "seeds/SEED-777-shared.md#shared-story", sharedStoryIdentity);

// Each project's own direction, one Taken story, and two queued stories, the
// shared identity first, published at the project's own revision.
export const openDoughPublication: CatalogPublication = {
  ...makeMe.aPublishedSource
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: "terryyin/open-dough",
    })
    .please(),
  ...describedRevision(
    makeMe.aRepository
      .withRevision("published", {
        backlog: {
          direction:
            "Show Open Dough's own published direction, distinct from any other project.",
          taken: [
            story(
              openDoughTakenTitle,
              "slice-plans/900-open-dough-story/PLAN.md",
              openDoughTakenIdentity,
            ),
          ],
          queued: [
            sharedStory(openDoughSharedTitle),
            story(
              openDoughQueuedTitle,
              "seeds/SEED-901-open-dough.md#queued",
              "OD-2#queued",
            ),
          ],
        },
      })
      .please(),
    "d0".repeat(20),
  ),
};
export const doughnutPublication: CatalogPublication = {
  ...makeMe.aPublishedSource
    .with({ id: "doughnut", label: "Doughnut", repository: doughnutRepository })
    .please(),
  ...describedRevision(
    makeMe.aRepository
      .withRevision("published", {
        backlog: {
          direction:
            "Show Doughnut's own published direction, distinct from Open Dough's.",
          taken: [
            story(
              doughnutTakenTitle,
              "slice-plans/500-doughnut-story/PLAN.md",
              doughnutTakenIdentity,
            ),
          ],
          queued: [
            sharedStory(doughnutSharedTitle),
            story(
              doughnutQueuedTitle,
              "seeds/SEED-600-doughnut.md#queued",
              "DN-2#queued",
            ),
          ],
        },
      })
      .please(),
    "9f".repeat(20),
  ),
};

export const titlesOfOpenDough = {
  taken: [openDoughTakenTitle],
  backlog: [openDoughSharedTitle, openDoughQueuedTitle],
};
export const titlesOfDoughnut = {
  taken: [doughnutTakenTitle],
  backlog: [doughnutSharedTitle, doughnutQueuedTitle],
};
