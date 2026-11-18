// The records the limited-reading journeys (limited-reading-*.spec.ts) publish
// for Open Dough at one revision: a backlog of two stories, one whose record
// the limit withholds, and a planned story whose record is read beside it and
// whose plan is asked only after the limit.

import { renderSlicePlan } from "../../Distribution/tests/support/published-plan.mjs";
import { renderStorySection } from "../../Distribution/tests/support/published-seed.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { describedRevision } from "./describedRevisions.ts";
export const repository = "terryyin/open-dough";
export const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const revision = "6e".repeat(20);
export const opened = new Date("2026-10-07T09:00:00.000Z");

export const withheldTitle = "A story whose record the limit withheld";
export const plannedTitle = "A planned story read beside it";
export const withheldSeed = ".planning/seeds/SEED-264-withheld.md";
export const plannedSeed = ".planning/seeds/SEED-264-planned.md";
export const plannedPlan = ".planning/slice-plans/264-planned/PLAN.md";
export const titles = { taken: [], backlog: [withheldTitle, plannedTitle] };

// A third story, whose record GitHub cannot be reached for, for the recovery
// journeys (limit-recovery-*.spec.ts): a gap that another failure left, not
// the limit.
export const unreachableTitle = "A story whose record could not be reached";
export const unreachableSeed = ".planning/seeds/SEED-264-unreachable.md";
export const unreachableGap =
  "The canonical record could not be read for preparation facts.";
export const titlesBesideUnreachable = {
  taken: [],
  backlog: [withheldTitle, plannedTitle, unreachableTitle],
};

const queued = (anchor: string, title: string) =>
  makeMe.aBacklogEntry
    .with({
      identity: `SEED-264#${anchor}`,
      href: `seeds/SEED-264-${anchor}.md#${anchor}`,
      title,
    })
    .please();

// The two stories' records, and the unreachable story's beside them when
// `besideUnreachable`.
const filesAt = (besideUnreachable: boolean) => {
  const withheld = queued("withheld", withheldTitle);
  const planned = queued("planned", plannedTitle);
  const unreachable = queued("unreachable", unreachableTitle);
  return describedRevision(
    makeMe.aRepository
      .withRevision("limited", {
        backlog: {
          queued: [
            withheld,
            planned,
            ...(besideUnreachable ? [unreachable] : []),
          ],
        },
        files: {
          [withheldSeed]: `# Withheld

${renderStorySection(withheld, {
  goal: "Only GitHub's limit keeps this record unread.",
})}`,
          [plannedSeed]: `# Planned

${renderStorySection(planned, {
  goal: "Its plan is asked only once the limit stands.",
})}`,
          [plannedPlan]: renderSlicePlan(
            makeMe.aSlicePlan
              .with({
                slices: [
                  makeMe.aPlanSlice
                    .with({
                      index: 1,
                      name: "First slice",
                      proof: "A journey observes slice 1.",
                    })
                    .please(),
                ],
              })
              .please(),
            { heading: "Slices" },
          ),
          ...(besideUnreachable && {
            [unreachableSeed]: `# Unreachable

${renderStorySection(unreachable)}`,
          }),
        },
        storyStates: [
          {
            identity: planned.identity,
            href: planned.href,
            ...makeMe.aStoryPreparation
              .plannedIn("../slice-plans/264-planned/PLAN.md")
              .please(),
          },
        ],
      })
      .please(),
    revision,
  ).files;
};

export const files = filesAt(false);
export const filesBesideUnreachable = filesAt(true);
