// Real writer publications; these supply repository facts, never card state.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { normalizeStoryDependency } from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { test as base } from "./dashboardTest.ts";
import { startOrigin, type StartOrigin } from "./support/startOrigin.ts";
import { recordAssessed, writePlanning } from "./storyReadinessCli.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

export const consumer = makeMe.aBacklogEntry
  .with({ identity: "SEED-A#a", href: "seeds/A.md#a", title: "Story A" })
  .please();
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

export const test = base.extend<{ origin: StartOrigin }>({
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin();
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

export function recordDependency(
  origin: StartOrigin,
  facts: Pick<Agreement, "supplier" | "state" | "decision" | "resolution">,
) {
  const current = JSON.parse(
    call(origin, "read-dependencies", "--link", consumer.href),
  ) as { basis: string };
  const input = path.join(origin.machine, "dependency.json");
  writeFileSync(
    input,
    JSON.stringify(
      makeMe.aSupplierAgreement
        .with({
          implementation: "Shared endpoint contract",
          rationale: reason,
          condition,
          ...facts,
        })
        .please(),
    ),
  );
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
export async function twoDependencies(
  origin: StartOrigin,
  review?: Pick<Parameters<typeof recordAssessed>[2], "assessment" | "reasons">,
) {
  writePlanning(
    origin.project,
    "seeds/C.md",
    '---\nid: SEED-C\n---\n\n# Seed C\n\n<a id="c"></a>\n\n### Story C\n\n**Identity:** SEED-C#c\n\nDeliver another endpoint.\n',
  );
  recordDependency(origin, { supplier: supplierB, state: "waiting" });
  recordDependency(origin, {
    supplier: supplierC,
    state: "decision-needed",
    decision,
  });
  if (review)
    recordAssessed(
      origin.project,
      consumer,
      makeMe.aStoryPreparation
        .with({
          refinement: "refined",
          approach: "planned",
          plan: "../slice-plans/A/PLAN.md",
          ...review,
        })
        .please(),
    );
  return publishDependencies(origin);
}
export async function publishMalformedDependencies(origin: StartOrigin) {
  const file = path.join(origin.project, ".planning/seeds/A.md");
  writeFileSync(
    file,
    readFileSync(file, "utf8").replace(
      /```json dough-story-dependencies\n[^\n]+/,
      "```json dough-story-dependencies\n{broken",
    ),
  );
  return publishDependencies(origin);
}
