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
  legacy,
  legacySeed,
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
  legacy,
  plannedBlocked,
  plannedReady,
  planless,
  seedRelative,
  unrefined,
} from "./storyReadinessRecords";

export type ReadinessRepo = {
  readonly directory: string;
  readonly revision: string;
};

export function buildOpenDoughReadinessRepo(
  after: (cleanup: () => void) => void,
): ReadinessRepo {
  const directory = scratchRepo(after, "dough-story-readiness-od-");

  writePlanning(
    directory,
    "PRODUCT-BACKLOG.md",
    `# Product backlog

## Near-future direction

Show published preparation and readiness on public-project cards.

## Taken

- [${plannedReady.title}](${plannedReady.link}) — ${plannedReady.identity} ([plan](${planReadyPath}))

## Backlog list

- [${unrefined.title}](${unrefined.link}) — ${unrefined.identity}
- [${plannedBlocked.title}](${plannedBlocked.link}) — ${plannedBlocked.identity} ([plan](${planBlockedPath}))
`,
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

  const revision = commitAll(directory, "Publish readiness fixture");

  // Unpushed local edit: must remain invisible when the journey serves the
  // committed revision at the GitHub HTTP boundary.
  const seedPath = join(directory, ".planning", seedRelative);
  writeFileSync(
    seedPath,
    `${readFileSync(seedPath, "utf8")}\n\nUnpushed local edit that must stay invisible.\n`,
    "utf8",
  );

  return { directory, revision };
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
`,
  );
  writePlanning(directory, "seeds/SEED-075-planless.md", planlessSeed);
  writePlanning(directory, "seeds/SEED-075-legacy.md", legacySeed);

  recordAssessed(directory, planless, {
    refinement: "refined",
    approach: "planless",
    assessment: "ready",
  });

  const revision = commitAll(directory, "Publish doughnut readiness fixture");
  return { directory, revision };
}
