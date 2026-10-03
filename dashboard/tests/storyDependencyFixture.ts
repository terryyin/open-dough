// Real writer publications; these supply repository facts, never card state.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test as base } from "./dashboardTest.ts";
import { startOrigin, type StartOrigin } from "./support/startOrigin.ts";
import { recordAssessed, writePlanning } from "./storyReadinessCli.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

export const consumer = {
  identity: "SEED-A#a",
  link: "seeds/A.md#a",
  title: "Story A",
};
export const suppliers = [
  { identity: "SEED-B#b", href: "seeds/B.md#b" },
  { identity: "SEED-C#c", href: "seeds/C.md#c" },
] as const;
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
export function recordDependency(
  origin: StartOrigin,
  index: number,
  state: "waiting" | "satisfied" | "decision-needed",
  revision?: string,
) {
  const current = JSON.parse(
    call(origin, "read-dependencies", "--link", consumer.link),
  ) as { basis: string };
  const input = path.join(origin.machine, "dependency.json");
  writeFileSync(
    input,
    JSON.stringify({
      supplier: suppliers[index],
      implementation: "Shared endpoint contract",
      rationale: reason,
      condition,
      state,
      ...(state === "decision-needed" && { decision }),
      ...(state === "satisfied" && {
        resolution: {
          revision,
          path: ".planning/seeds/B.md",
          summary: "Accepted supplier endpoint proof.",
        },
      }),
    }),
  );
  call(
    origin,
    "update-dependency",
    "--identity",
    consumer.identity,
    "--link",
    consumer.link,
    "--dependency-file",
    input,
    "--expect-dependencies",
    current.basis,
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
export async function twoDependencies(origin: StartOrigin, notReady = false) {
  writePlanning(
    origin.project,
    "seeds/C.md",
    '---\nid: SEED-C\n---\n\n# Seed C\n\n<a id="c"></a>\n\n### Story C\n\n**Identity:** SEED-C#c\n\nDeliver another endpoint.\n',
  );
  recordDependency(origin, 0, "waiting");
  recordDependency(origin, 1, "decision-needed");
  if (notReady)
    recordAssessed(origin.project, consumer, {
      refinement: "refined",
      approach: "planned",
      plan: "../slice-plans/A/PLAN.md",
      assessment: "not-ready",
      reasons: ["Unrelated consumer design decision remains."],
    });
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
