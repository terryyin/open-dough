// Builds published readiness fixtures through the real product-backlog CLI,
// then commits them in an isolated Git repository. The dashboard journey serves
// those committed bytes; it does not receive hand-built badge outcomes.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { renderEntry } from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderPublishedBacklog } from "../../tests/support/published-backlog.mjs";
import {
  commitAll,
  recordAssessed,
  recordState,
  scratchRepo,
  writePlanning,
} from "./storyReadinessCli.ts";
import {
  planBlockedBody,
  planBlockedPath,
  planBlockedRelative,
  planReadyBody,
  planReadyPath,
  planReadyRelative,
} from "./storyReadinessPlans.ts";
import {
  externalPlan,
  externalPlanSeed,
  legacy,
  legacySeed,
  malformed,
  malformedSeed,
  plannedBlocked,
  plannedReady,
  planless,
  planlessSeed,
  seedRelative,
  threeStorySeed,
  unrefined,
} from "./storyReadinessRecords.ts";

export {
  planBlockedPath,
  planReadyPath,
  planReadyTwoDoneBody,
} from "./storyReadinessPlans.ts";
export {
  externalPlan,
  legacy,
  malformed,
  plannedBlocked,
  plannedReady,
  planless,
  seedRelative,
  unrefined,
} from "./storyReadinessRecords.ts";

export type ReadinessRepo = {
  readonly directory: string;
  readonly revision: string;
  advanceTo(revision: string): void;
};

type PlanLink = NonNullable<Parameters<typeof renderEntry>[0]["plan"]>;

// Publish membership and its links. The preparation assessment is recorded
// separately in each canonical home by the CLI.
export function openDoughProductBacklog(
  takenPlan: PlanLink,
  {
    includeUnrefined = true,
    queuedPlan,
  }: { includeUnrefined?: boolean; queuedPlan?: PlanLink } = {},
): string {
  const taken = makeMe.aBacklogEntry
    .with({ ...plannedReady, plan: takenPlan })
    .please();
  const blocked = makeMe.aBacklogEntry
    .with({
      ...plannedBlocked,
      ...(queuedPlan !== undefined && { plan: queuedPlan }),
    })
    .please();
  return renderPublishedBacklog({
    taken: [taken],
    queued: [...(includeUnrefined ? [unrefined] : []), blocked],
    direction:
      "Show published preparation and readiness on public-project cards.",
  });
}

export function buildOpenDoughReadinessRepo(
  after: (cleanup: () => void) => void,
  { canonicalOnlyQueued = false }: { canonicalOnlyQueued?: boolean } = {},
): ReadinessRepo {
  const directory = scratchRepo(after, "dough-story-readiness-od-");

  writePlanning(
    directory,
    "PRODUCT-BACKLOG.md",
    openDoughProductBacklog(
      { label: "plan", target: `${planReadyPath}#ordered-slices` },
      canonicalOnlyQueued
        ? {}
        : { queuedPlan: { label: "plan", target: planBlockedPath } },
    ),
  );
  writePlanning(directory, seedRelative, threeStorySeed);
  writePlanning(directory, planBlockedPath, planBlockedBody);
  writePlanning(directory, planReadyPath, planReadyBody);

  recordState(
    directory,
    unrefined,
    makeMe.aStoryPreparation
      .with({
        refinement: "not-refined",
        approach: "unselected",
      })
      .please(),
  );
  recordAssessed(
    directory,
    plannedBlocked,
    makeMe.aStoryPreparation
      .with({
        refinement: "refined",
        approach: "planned",
        plan: planBlockedRelative,
        assessment: "not-ready",
        reasons: ["A blocking decision remains in the plan."],
      })
      .please(),
  );
  recordAssessed(
    directory,
    plannedReady,
    makeMe.aStoryPreparation
      .with({
        refinement: "refined",
        approach: "planned",
        plan: planReadyRelative,
        assessment: "ready",
      })
      .please(),
  );

  let revision = commitAll(directory, "Publish readiness fixture");

  // Unpushed local edit: must remain invisible when the journey serves the
  // committed revision at the GitHub HTTP boundary.
  const seedPath = join(directory, ".planning", seedRelative);
  writeFileSync(
    seedPath,
    `${readFileSync(seedPath, "utf8")}\n\nUnpushed local edit that must stay invisible.\n`,
    "utf8",
  );

  return {
    directory,
    get revision() {
      return revision;
    },
    advanceTo(next) {
      revision = next;
    },
  };
}

export function buildDoughnutReadinessRepo(
  after: (cleanup: () => void) => void,
): ReadinessRepo {
  const directory = scratchRepo(after, "dough-story-readiness-dn-");

  writePlanning(
    directory,
    "PRODUCT-BACKLOG.md",
    renderPublishedBacklog({
      queued: [planless, legacy, malformed, externalPlan],
      direction: "Doughnut's own published readiness overview.",
    }),
  );
  writePlanning(directory, "seeds/SEED-075-planless.md", planlessSeed);
  writePlanning(directory, "seeds/SEED-075-legacy.md", legacySeed);
  writePlanning(directory, "seeds/SEED-075-malformed.md", malformedSeed);
  writePlanning(directory, "seeds/SEED-075-external.md", externalPlanSeed);

  recordAssessed(
    directory,
    planless,
    makeMe.aStoryPreparation
      .with({
        refinement: "refined",
        approach: "planless",
        assessment: "ready",
      })
      .please(),
  );
  // External backlog plan is navigation only; preparation stays unselected so
  // the journey does not invent readiness from that external link.
  recordState(
    directory,
    externalPlan,
    makeMe.aStoryPreparation
      .with({
        refinement: "refined",
        approach: "unselected",
      })
      .please(),
  );

  let revision = commitAll(directory, "Publish doughnut readiness fixture");
  return {
    directory,
    get revision() {
      return revision;
    },
    advanceTo(next) {
      revision = next;
    },
  };
}
