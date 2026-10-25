// A bare origin whose trunk holds a Take of one story with its plan, and an
// execution branch forked at it, for the source freshness command's proofs.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  createCleanTrunkFixture,
  executionBranch,
  git,
  lsRemoteSha,
  revParse,
  runScriptIn,
  trunkTarget,
} from "../../dough-story-wrap-up/scripts/closure-git-fixtures.mjs";

export const cli = fileURLToPath(
  new URL("./source-freshness.mjs", import.meta.url),
);
const identity = "SEED-900#story";
export const seedPath = ".planning/seeds/SEED-900-freshness.md";
export const planPath = ".planning/slice-plans/001-story/PLAN.md";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const backlog = backlogOf(
  [
    `- [The story](seeds/SEED-900-freshness.md#story) — ${identity} ([plan](slice-plans/001-story/PLAN.md))`,
  ],
  [],
);

export const storySection = (extra = "") => `<a id="story"></a>

### The story

**Identity:** ${identity}

Promise one.${extra}`;

export const seedOf = ({
  story = storySection(),
  sibling = "Sibling text.",
} = {}) =>
  `---
id: SEED-900
---

# Freshness seed

## Stories

<a id="sibling"></a>

### Sibling story

${sibling}

${story}

<a id="after"></a>

### After story

After text.

## Human-Owned Decisions

None.
`;

export const slice = (index, name, { status = "planned", behavior } = {}) =>
  `### ${index}. ${name}
Type: Behavior
Status: ${status}
Proof: proof ${index}

Behavior: ${behavior ?? `does ${name}.`}
`;

export const planOf = (...slices) =>
  `# Story plan

## Ordered slices

${slices.join("\n")}
## Learnings

None.
`;

const takenPlan = planOf(slice(1, "A"), slice(2, "B"));
export const branchPlan = planOf(
  slice(1, "A", { status: "done" }),
  slice(2, "B"),
);

export function writeTree(checkout, files) {
  for (const [path, body] of Object.entries(files)) {
    const file = join(checkout, path);
    if (body === null) rmSync(file);
    else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, body);
    }
  }
}

export async function commitTree(checkout, files, message) {
  writeTree(checkout, files);
  await git(checkout, "add", "-A");
  await git(checkout, "commit", "-q", "-m", message);
  return revParse(checkout, "HEAD");
}

// A Take published on trunk and the execution branch, then a branch increment
// marking slice 1 done, published only to the execution branch.
export async function takenStoryBranch(t) {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { execution } = fixture;
  const take = await commitTree(
    execution,
    { [backlogPath]: backlog, [seedPath]: seedOf(), [planPath]: takenPlan },
    "Take",
  );
  await git(execution, "push", "-q", "origin", `HEAD:${trunkTarget}`);
  await commitTree(execution, { [planPath]: branchPlan }, "slice 1");
  await git(
    execution,
    "push",
    "-q",
    "origin",
    `HEAD:refs/heads/${executionBranch}`,
  );
  return { ...fixture, take };
}

// A human's trunk commit made from the primary checkout on main.
export async function amendTrunk(
  { integration },
  files,
  message = "human amendment",
) {
  await git(integration, "pull", "-q", "--ff-only", "origin", "main");
  await commitTree(integration, files, message);
  await git(integration, "push", "-q", "origin", "main");
  return revParse(integration, "HEAD");
}

const freshness = (command, { execution }, id = identity, env = process.env) =>
  runScriptIn(
    env,
    cli,
    command,
    "--workspace",
    execution,
    "--identity",
    id,
    "--remote",
    "origin",
    "--target-ref",
    trunkTarget,
  );

// Runs `command` (in `env` when given), checks its exit code, and that origin
// trunk did not move.
export async function run(fixture, command, code, id, env) {
  const before = await lsRemoteSha(fixture.origin, trunkTarget);
  const outcome = await freshness(command, fixture, id, env);
  assert.equal(outcome.stderr, "");
  assert.equal(outcome.code, code, outcome.stdout);
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), before);
  assert.equal(outcome.stdout.split("\n").filter(Boolean).length, 1);
  return JSON.parse(outcome.stdout);
}

export const recordOf = (report, record) =>
  report.records.find((item) => item.record === record);
export const read = (fixture, path) =>
  readFileSync(join(fixture.execution, path), "utf8");
