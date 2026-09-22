// Builds published readiness fixtures through the real product-backlog CLI,
// then commits them in an isolated Git repository. The dashboard journey serves
// those committed bytes; it does not receive hand-built badge outcomes.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  commitAll,
  commitPaths,
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
  planReadyTwoDoneBody,
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
  seedRelative,
  unrefined,
} from "./storyReadinessRecords";

export type ReadinessRepo = {
  readonly directory: string;
  readonly revision: string;
  advanceTo(revision: string): void;
};

// Open Dough fixture backlog; Taken plan path is the only varying claim.
export function openDoughProductBacklog(takenPlanPath: string): string {
  return `# Product backlog

## Near-future direction

Show published preparation and readiness on public-project cards.

## Taken

- [${plannedReady.title}](${plannedReady.link}) — ${plannedReady.identity} ([plan](${takenPlanPath}))

## Backlog list

- [${unrefined.title}](${unrefined.link}) — ${unrefined.identity}
- [${plannedBlocked.title}](${plannedBlocked.link}) — ${plannedBlocked.identity} ([plan](${planBlockedPath}))
`;
}

export function buildOpenDoughReadinessRepo(
  after: (cleanup: () => void) => void,
): ReadinessRepo {
  const directory = scratchRepo(after, "dough-story-readiness-od-");

  writePlanning(
    directory,
    "PRODUCT-BACKLOG.md",
    openDoughProductBacklog(planReadyPath),
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

// Second publication: records two of five slices done with accepted proof in
// the plan text the shared reader interprets. Does not hand-build display state.
// Only the plan path is committed so the unpushed seed edit stays unpublished.
export function publishTwoSlicesDone(repo: ReadinessRepo): string {
  writePlanning(repo.directory, planReadyPath, planReadyTwoDoneBody);
  const next = commitPaths(
    repo.directory,
    [`.planning/${planReadyPath}`],
    "Record two of five slices done with accepted proof",
  );
  repo.advanceTo(next);
  return next;
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

// Publishes assessed-content change without re-recording assessment. Shared
// seed digest shifts for every assessed story in that file.
export function publishAssessedContentChange(repo: ReadinessRepo): string {
  const seedPath = join(repo.directory, ".planning", seedRelative);
  const current = readFileSync(seedPath, "utf8");
  writeFileSync(
    seedPath,
    `${current}\n\nAssessed scope changed without a fresh assessment.\n`,
    "utf8",
  );
  const next = commitPaths(
    repo.directory,
    [`.planning/${seedRelative}`],
    "Change assessed seed content without reassessment",
  );
  repo.advanceTo(next);
  return next;
}

// Points the Taken backlog plan at the blocked plan while story-state still
// associates the ready plan — a conflict the shared readers must report.
export function publishConflictingPlanAssociation(repo: ReadinessRepo): string {
  writePlanning(
    repo.directory,
    "PRODUCT-BACKLOG.md",
    openDoughProductBacklog(planBlockedPath),
  );
  const next = commitPaths(
    repo.directory,
    [".planning/PRODUCT-BACKLOG.md"],
    "Introduce conflicting backlog plan association",
  );
  repo.advanceTo(next);
  return next;
}
