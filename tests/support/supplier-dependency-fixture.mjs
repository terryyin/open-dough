// Bare-origin starting input; all dependency writes/resolutions use real CLI.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { run } from "./product-backlog-fixture.mjs";
import {
  dependency,
  readDependencies,
  updateDependency,
} from "./story-dependencies-fixture.mjs";
import {
  git,
  revParse,
} from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { createQueuedTrunk } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  consumer,
  projectOf,
  supplier,
} from "../../src/skills/dough-execute-plan/scripts/workspace-publication-dependency-fixtures.mjs";
import { draftLateStory } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs";

export {
  consumer,
  supplier,
  dependency,
  readDependencies,
  updateDependency,
  git,
  run,
  revParse,
};
export const supplierPlan = ".planning/slice-plans/B/PLAN.md";
export function plan(status) {
  return `# Supplier plan\n\n## Ordered slices\n\n### 1. Deliver selected endpoint\n\n**Type:** Behavior\n\n**Status:** ${status}\n\n**Proof:** Endpoint behavior observed.\n`;
}
export async function fixture(t) {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const project = projectOf(trunk);
  const late = draftLateStory(trunk);
  const sibling = { identity: late.identity, link: "seeds/A.md#late" };
  const third = { identity: "THIRD", link: "seeds/third.md" };
  writeFileSync(
    join(trunk.integration, ".planning", third.link),
    "# Third\n**Identity:** THIRD\n",
  );
  writeFileSync(join(trunk.integration, supplierPlan), plan("planned"));
  for (const story of [consumer, sibling]) {
    const result = await updateDependency(project, story, dependency(supplier));
    assert.equal(result.code, 0, result.stderr);
  }
  assert.equal(
    (await updateDependency(project, consumer, dependency(third))).code,
    0,
  );
  return { ...trunk, project, late, sibling, third };
}
export async function publish(fixture, message = "supplier fixture change") {
  await git(fixture.integration, "add", ".planning");
  await git(fixture.integration, "commit", "-m", message);
  await git(fixture.integration, "push", "origin", "main");
  return revParse(fixture.integration, "HEAD");
}
export async function resolveConsumer(
  fixture,
  story,
  evidence,
  accepted,
  overrides = {},
  extra = [],
) {
  const facts = await readDependencies(fixture.project, story);
  const held = facts.dependencies.find(
    (entry) => entry.supplier.identity === supplier.identity,
  );
  const input = join(fixture.fixture, "resolve-input.json");
  writeFileSync(
    input,
    JSON.stringify({
      ...held,
      state: "satisfied",
      resolution: {
        revision: evidence,
        path: ".planning/seeds/B.md#b",
        summary:
          "Delivered endpoint contract directly proves the unchanged consumer condition.",
      },
      ...overrides,
    }),
  );
  return run(fixture.project, [
    "resolve-dependency",
    "--identity",
    story.identity,
    "--link",
    story.link,
    "--dependency-file",
    input,
    "--expect-dependencies",
    facts.basis,
    "--accepted-revision",
    accepted,
    "--remote",
    "origin",
    "--target",
    "main",
    ...extra,
  ]);
}
export async function discover(fixture) {
  const result = await run(fixture.project, [
    "discover-consumers",
    "--supplier-identity",
    supplier.identity,
  ]);
  assert.equal(result.code, 0, result.stderr);
  return JSON.parse(result.stdout);
}
export const homeBytes = (fixture) =>
  readFileSync(join(fixture.integration, ".planning/seeds/A.md"), "utf8");
