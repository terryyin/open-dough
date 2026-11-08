// The two published projects ./navigation/project-selection.spec.ts
// selects between, each with its own revision, direction, and Board, and its
// own telling of a story identity the two projects happen to share.

import { describedBacklog } from "./describedRevisions.ts";
import {
  doughnutRepository,
  doughnutSharedTitle,
  sharedStoryIdentity,
} from "./doughnutProject.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

export { doughnutRepository, doughnutSharedTitle, sharedStoryIdentity };

export const openDoughRepository = "terryyin/open-dough";

export const revisionOpenDough = "d0".repeat(20);
export const revisionDoughnut = "9f".repeat(20);

// The same recorded identity, told differently by each project
// (./doughnutProject.ts): it must not be merged into one entry or carried
// from one project's snapshot to the other's.
export const openDoughSharedTitle = "Open Dough's telling of the shared story";

export const openDoughTakenTitle = "Open Dough's own taken story";
const openDoughQueuedTitle = "Open Dough's own queued story";
export const doughnutTakenTitle = "Doughnut's own taken story";
const doughnutQueuedTitle = "Doughnut's own queued story";

const story = (title: string, href: string, identity: string) =>
  makeMe.aBacklogEntry.with({ identity, title, href }).please();
const sharedStory = (title: string) =>
  story(title, "seeds/SEED-777-shared.md#shared-story", sharedStoryIdentity);

// Each project's own direction, one Taken story, and two queued stories, the
// shared identity first.
export const openDoughBacklog = describedBacklog(
  makeMe.aRepository
    .withRevision("published", {
      backlog: {
        direction:
          "Show Open Dough's own published direction, distinct from any other project.",
        taken: [
          story(
            openDoughTakenTitle,
            "slice-plans/900-open-dough-story/PLAN.md",
            "OD-1#story",
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
);
export const doughnutBacklog = describedBacklog(
  makeMe.aRepository
    .withRevision("published", {
      backlog: {
        direction:
          "Show Doughnut's own published direction, distinct from Open Dough's.",
        taken: [
          story(
            doughnutTakenTitle,
            "slice-plans/500-doughnut-story/PLAN.md",
            "DN-1#story",
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
);

export const titlesOfOpenDough = {
  taken: [openDoughTakenTitle],
  backlog: [openDoughSharedTitle, openDoughQueuedTitle],
};
export const titlesOfDoughnut = {
  taken: [doughnutTakenTitle],
  backlog: [doughnutSharedTitle, doughnutQueuedTitle],
};
