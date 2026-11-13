// Real writer publications; these supply repository facts, never card state.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { normalizeStoryDependency } from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  queuedSeedWithDependencies,
  readyStoryState,
  reviewedStorySeed,
  storyB,
  roughStoryC,
  storyA,
  storySeed,
} from "../../tests/support/queued-repository.mjs";
import { direction } from "../../tests/support/product-backlog-fixture.mjs";
import type {
  RevisionFacts,
  StoryState,
} from "../../tests/support/repositoryTestData.mjs";
import { test as base } from "./dashboardTest.ts";
import {
  queuedOriginRepository,
  startOrigin,
  type StartOrigin,
  type StartOriginFixtures,
} from "./support/startOrigin.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

export const consumer = storyA;
export const supplierB = { identity: "SEED-B#b", href: "seeds/B.md#b" };
export const supplierC = { identity: "SEED-C#c", href: "seeds/C.md#c" };
export const reason =
  "Both externally valuable stories need the published endpoint before the consumer can execute.";
export const condition =
  "The shared endpoint contract is integrated and verified.";
export const decision =
  "Which endpoint compatibility behavior does the consumer promise?";
const cli = path.join(
  repoRoot,
  "src/skills/dough-product-backlog/scripts/product-backlog.mjs",
);

export const test = base.extend<StartOriginFixtures>({
  originRepository: queuedOriginRepository,
  origin: async ({ originRepository }, use) => {
    const origin = await startOrigin(originRepository);
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
});

function call(origin: StartOrigin, ...args: string[]) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: origin.project,
    encoding: "utf8",
  });
}
type Agreement = ReturnType<typeof normalizeStoryDependency>;

type AgreementFacts = Pick<
  Agreement,
  "supplier" | "state" | "decision" | "resolution"
>;

// The consumer's agreement with a supplier, as this fixture's stories state it.
export function agreement(facts: AgreementFacts) {
  return makeMe.aSupplierAgreement
    .with({
      implementation: "Shared endpoint contract",
      rationale: reason,
      condition,
      ...facts,
    })
    .please();
}

export function recordDependency(origin: StartOrigin, facts: AgreementFacts) {
  const current = JSON.parse(
    call(origin, "read-dependencies", "--link", consumer.href),
  ) as { basis: string };
  const input = path.join(origin.machine, "dependency.json");
  writeFileSync(input, JSON.stringify(agreement(facts)));
  call(
    origin,
    "update-dependency",
    "--identity",
    consumer.identity,
    "--link",
    consumer.href,
    "--dependency-file",
    input,
    "--expect-dependencies",
    current.basis,
  );
}
// Takes the consumer from the Backlog list into Taken with its plan.
export function takeConsumer(origin: StartOrigin) {
  call(
    origin,
    "take",
    "--identity",
    consumer.identity,
    "--plan",
    "slice-plans/A/PLAN.md",
  );
}

export function takeSupplier(origin: StartOrigin) {
  call(
    origin,
    "take",
    "--identity",
    "SEED-B#b",
    "--plan",
    "slice-plans/B/PLAN.md",
  );
}
export async function publishDependencies(origin: StartOrigin) {
  execFileSync("git", ["add", ".planning"], {
    cwd: origin.project,
    stdio: "pipe",
  });
  execFileSync("git", ["commit", "-m", "Publish story dependency facts"], {
    cwd: origin.project,
    stdio: "pipe",
  });
  execFileSync("git", ["push", "origin", "main"], {
    cwd: origin.project,
    stdio: "pipe",
  });
  return (await origin.originGit("rev-parse", "main")).trim();
}
// Story A waits on Story B and needs a decision about Story C, a rough story
// whose seed this revision adds; with a review, Story A's readiness is
// recorded again with that judgment after the agreements.
export function twoDependencies(
  review?: Pick<StoryState, "assessment" | "reasons">,
): RevisionFacts {
  return {
    message: "Publish story dependency facts",
    files: {
      ".planning/seeds/C.md": storySeed(
        roughStoryC,
        "Deliver another endpoint.",
      ),
      ".planning/seeds/A.md": queuedSeedWithDependencies(consumer, [
        agreement({ supplier: supplierB, state: "waiting" }),
        agreement({
          supplier: supplierC,
          state: "decision-needed",
          decision,
        }),
      ]),
    },
    // The review judges Story A with its agreements in place.
    storyStates:
      review === undefined ? [] : [{ ...readyStoryState(consumer), ...review }],
  };
}

// Two separately identified suppliers share Story B's canonical seed.
export const secondInSeedB = makeMe.aBacklogEntry
  .with({
    identity: "SEED-B#second",
    href: "seeds/B.md#second",
    title: "Second story in seed B",
  })
  .please();

export function suppliersInOneSeed(): RevisionFacts {
  return {
    backlog: { direction, queued: [storyA, storyB, secondInSeedB] },
    files: {
      ".planning/seeds/B.md": `${reviewedStorySeed(storyB)}\n<a id="second"></a>\n\n### Second story in seed B\n\n**Identity:** SEED-B#second\n\nAnother outcome.\n`,
    },
  };
}
