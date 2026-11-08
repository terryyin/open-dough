// Builds published readiness fixtures from a repository description: backlog
// membership, seeds and plans, with each story's preparation recorded by the
// production story-state encoder, materialized through the shared repository
// harness. The journey serves the integration checkout's committed bytes and
// advances it with path-specific commits; it does not receive hand-built
// badge outcomes.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { renderEntry } from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderPublishedBacklog } from "../../tests/support/published-backlog.mjs";
import { materializeRepository } from "../../tests/support/repository-fixture.mjs";
import type { StoryState } from "../../tests/support/repositoryTestData.mjs";
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

// Hands a scratch repository's removal to the journey.
type Removals = (cleanup: () => Promise<void>) => void;

type PlanLink = NonNullable<Parameters<typeof renderEntry>[0]["plan"]>;
type Story = Pick<StoryState, "identity" | "href">;

// A story's preparation as its canonical home records it.
const preparedAs = (
  { identity, href }: Story,
  preparation: Omit<StoryState, "identity" | "href">,
): StoryState => ({
  identity,
  href,
  ...makeMe.aStoryPreparation.with(preparation).please(),
});

// Published membership and its links. The preparation assessment is recorded
// separately in each canonical home.
function openDoughBacklog(
  takenPlan: PlanLink,
  {
    includeUnrefined = true,
    queuedPlan,
  }: { includeUnrefined?: boolean; queuedPlan?: PlanLink } = {},
) {
  const taken = makeMe.aBacklogEntry
    .with({ ...plannedReady, plan: takenPlan })
    .please();
  const blocked = makeMe.aBacklogEntry
    .with({
      ...plannedBlocked,
      ...(queuedPlan !== undefined && { plan: queuedPlan }),
    })
    .please();
  return {
    taken: [taken],
    queued: [...(includeUnrefined ? [unrefined] : []), blocked],
    direction:
      "Show published preparation and readiness on public-project cards.",
  };
}

export function openDoughProductBacklog(
  ...args: Parameters<typeof openDoughBacklog>
): string {
  return renderPublishedBacklog(openDoughBacklog(...args));
}

// Three stories in one seed: one unrefined, one planned with a blocking
// concern and one planned and Ready, Taken with its plan's ordered slices.
// With `canonicalOnlyQueued`, the blocked story's backlog entry links no plan.
const openDoughReadiness = (canonicalOnlyQueued: boolean) =>
  makeMe.aRepository
    .withRevision("Publish readiness fixture", {
      backlog: openDoughBacklog(
        { label: "plan", target: `${planReadyPath}#ordered-slices` },
        canonicalOnlyQueued
          ? {}
          : { queuedPlan: { label: "plan", target: planBlockedPath } },
      ),
      files: {
        [`.planning/${seedRelative}`]: threeStorySeed,
        [`.planning/${planBlockedPath}`]: planBlockedBody,
        [`.planning/${planReadyPath}`]: planReadyBody,
      },
      storyStates: [
        preparedAs(unrefined, {
          refinement: "not-refined",
          approach: "unselected",
        }),
        preparedAs(plannedBlocked, {
          refinement: "refined",
          approach: "planned",
          plan: planBlockedRelative,
          assessment: "not-ready",
          reasons: ["A blocking decision remains in the plan."],
        }),
        preparedAs(plannedReady, {
          refinement: "refined",
          approach: "planned",
          plan: planReadyRelative,
          assessment: "ready",
        }),
      ],
    })
    .please();
const openDoughRepositories = {
  canonicalOnlyQueued: openDoughReadiness(true),
  withQueuedPlan: openDoughReadiness(false),
};

// Doughnut's planless Ready story, a legacy one without structured state, one
// whose state block is not valid JSON, and one whose backlog plan is external.
const doughnutRepository = makeMe.aRepository
  .withRevision("Publish doughnut readiness fixture", {
    backlog: {
      queued: [planless, legacy, malformed, externalPlan],
      direction: "Doughnut's own published readiness overview.",
    },
    files: {
      ".planning/seeds/SEED-075-planless.md": planlessSeed,
      ".planning/seeds/SEED-075-legacy.md": legacySeed,
      // Malformed bytes are what the journey reads.
      ".planning/seeds/SEED-075-malformed.md": malformedSeed,
      ".planning/seeds/SEED-075-external.md": externalPlanSeed,
    },
    storyStates: [
      preparedAs(planless, {
        refinement: "refined",
        approach: "planless",
        assessment: "ready",
      }),
      // External backlog plan is navigation only; preparation stays
      // unselected so the journey does not invent readiness from that link.
      preparedAs(externalPlan, {
        refinement: "refined",
        approach: "unselected",
      }),
    ],
  })
  .please();

// The integration checkout of a materialized description at its published
// revision, removed after the journey.
async function readinessRepo(
  after: Removals,
  description: Parameters<typeof materializeRepository>[0],
): Promise<ReadinessRepo> {
  const built = await materializeRepository(description);
  after(built.cleanup);
  let revision = built.trunkSha;
  return {
    directory: built.integration,
    get revision() {
      return revision;
    },
    advanceTo(next) {
      revision = next;
    },
  };
}

export async function buildOpenDoughReadinessRepo(
  after: Removals,
  { canonicalOnlyQueued = false }: { canonicalOnlyQueued?: boolean } = {},
): Promise<ReadinessRepo> {
  const repo = await readinessRepo(
    after,
    canonicalOnlyQueued
      ? openDoughRepositories.canonicalOnlyQueued
      : openDoughRepositories.withQueuedPlan,
  );
  // Unpushed local edit: must remain invisible when the journey serves the
  // committed revision at the GitHub HTTP boundary.
  const seedPath = join(repo.directory, ".planning", seedRelative);
  writeFileSync(
    seedPath,
    `${readFileSync(seedPath, "utf8")}\n\nUnpushed local edit that must stay invisible.\n`,
    "utf8",
  );
  return repo;
}

export function buildDoughnutReadinessRepo(
  after: Removals,
): Promise<ReadinessRepo> {
  return readinessRepo(after, doughnutRepository);
}
