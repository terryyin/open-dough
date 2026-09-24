// Builds published readiness fixtures through the real product-backlog CLI,
// then commits them in an isolated Git repository. The dashboard journey serves
// those committed bytes; it does not receive hand-built badge outcomes.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  commitAll,
  recordAssessed,
  recordState,
  scratchRepo,
  writePlanning,
} from "./storyReadinessCli";
import {
  externalPlan,
  externalPlanSeed,
  externalPlanUrl,
  legacy,
  legacySeed,
  malformed,
  malformedSeed,
  planBlockedBody,
  planBlockedPath,
  planBlockedRelative,
  plannedBlocked,
  plannedReady,
  planless,
  planlessSeed,
  planReadyBody,
  planReadyPath,
  planReadyRelative,
  seedRelative,
  threeStorySeed,
  unrefined,
} from "./storyReadinessRecords";

export {
  externalPlan,
  legacy,
  malformed,
  plannedBlocked,
  plannedReady,
  planless,
  planBlockedPath,
  planReadyPath,
  planReadyTwoDoneBody,
  planReadyTwoDoneSlicesHeadingBody,
  seedRelative,
  unrefined,
} from "./storyReadinessRecords";

export type ReadinessRepo = {
  readonly directory: string;
  readonly revision: string;
  advanceTo(revision: string): void;
};

// Open Dough fixture backlog; Taken plan path and whether unrefined stays in
// membership are the varying claims.
export function openDoughProductBacklog(
  takenPlanPath: string,
  {
    includeUnrefined = true,
    includeQueuedPlan = false,
  }: { includeUnrefined?: boolean; includeQueuedPlan?: boolean } = {},
): string {
  const backlog = [
    includeUnrefined
      ? `- [${unrefined.title}](${unrefined.link}) — ${unrefined.identity}`
      : null,
    `- [${plannedBlocked.title}](${plannedBlocked.link}) — ${plannedBlocked.identity}${includeQueuedPlan ? ` ([plan](${planBlockedPath}))` : ""}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
  return `# Product backlog

## Near-future direction

Show published preparation and readiness on public-project cards.

## Taken

- [${plannedReady.title}](${plannedReady.link}) — ${plannedReady.identity} ([plan](${takenPlanPath}))

## Backlog list

${backlog}
`;
}

export function buildOpenDoughReadinessRepo(
  after: (cleanup: () => void) => void,
  { canonicalOnlyQueued = false }: { canonicalOnlyQueued?: boolean } = {},
): ReadinessRepo {
  const directory = scratchRepo(after, "dough-story-readiness-od-");

  writePlanning(
    directory,
    "PRODUCT-BACKLOG.md",
    openDoughProductBacklog(`${planReadyPath}#ordered-slices`, {
      includeQueuedPlan: !canonicalOnlyQueued,
    }),
  );
  writePlanning(directory, seedRelative, threeStorySeed);
  writePlanning(directory, planBlockedPath, planBlockedBody);
  writePlanning(directory, planReadyPath, planReadyBody);

  recordState(directory, unrefined, {
    refinement: "not-refined",
    approach: "unselected",
  });
  recordAssessed(directory, plannedBlocked, {
    refinement: "refined",
    approach: "planned",
    plan: planBlockedRelative,
    assessment: "not-ready",
    reasons: ["A blocking decision remains in the plan."],
  });
  recordAssessed(directory, plannedReady, {
    refinement: "refined",
    approach: "planned",
    plan: planReadyRelative,
    assessment: "ready",
  });

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
    `# Product backlog

## Near-future direction

Doughnut's own published readiness overview.

## Taken

## Backlog list

- [${planless.title}](${planless.link}) — ${planless.identity}
- [${legacy.title}](${legacy.link}) — ${legacy.identity}
- [${malformed.title}](${malformed.link}) — ${malformed.identity}
- [${externalPlan.title}](${externalPlan.link}) — ${externalPlan.identity} ([plan](${externalPlanUrl}))
`,
  );
  writePlanning(directory, "seeds/SEED-075-planless.md", planlessSeed);
  writePlanning(directory, "seeds/SEED-075-legacy.md", legacySeed);
  writePlanning(directory, "seeds/SEED-075-malformed.md", malformedSeed);
  writePlanning(directory, "seeds/SEED-075-external.md", externalPlanSeed);

  recordAssessed(directory, planless, {
    refinement: "refined",
    approach: "planless",
    assessment: "ready",
  });
  // External backlog plan is navigation only; preparation stays unselected so
  // the journey does not invent readiness from that external link.
  recordState(directory, externalPlan, {
    refinement: "refined",
    approach: "unselected",
  });

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
