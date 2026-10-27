// A selected completed supplier's landing worktree holding its wholly
// unpublished suffix while a writer adds a consumer waiting on it to trunk.
// Every dependency write uses the real commands; landings run the queued
// closure check on each fetched target.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  consumer,
  dependency,
  git,
  plan,
  publish,
  revParse,
  supplier,
  supplierPlan,
  updateDependency,
} from "./supplier-dependency-fixture.mjs";
import {
  commitSupplierCleanup,
  third,
} from "./supplier-closure-visit-fixture.mjs";
import { cloneAsAnotherWriter } from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { createQueuedTrunk } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { projectOf } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-dependency-fixtures.mjs";
import { draftLateStory } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs";
import { checkQueuedClosures } from "../../src/skills/dough-land/scripts/queued-closure-check.mjs";

export const main = "refs/heads/main";
export const branch = "land/supplier";

// Consumer A waits on B and THIRD on trunk; the landing worktree holds B's
// preserved proof and cleanup unpublished while trunk gains SEED-A#late
// waiting on B.
export async function racedLanding(t) {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const project = projectOf(trunk);
  writeFileSync(
    join(trunk.integration, ".planning", third.link),
    "# Third\n**Identity:** THIRD\n",
  );
  writeFileSync(join(trunk.integration, supplierPlan), plan("planned"));
  for (const entry of [dependency(supplier), dependency(third)]) {
    const result = await updateDependency(project, consumer, entry);
    assert.equal(result.code, 0, result.stderr);
  }
  const base = await publish(trunk, "consumer A waits on supplier B");
  const workspace = join(trunk.fixture, "landing-worktree");
  await git(
    trunk.integration,
    "worktree",
    "add",
    "-q",
    "-b",
    branch,
    workspace,
  );
  const owned = { directory: workspace, inputDirectory: trunk.fixture };
  writeFileSync(join(workspace, supplierPlan), plan("done"));
  await git(workspace, "add", supplierPlan);
  await git(workspace, "commit", "-q", "-m", "supplier outcome and proof");
  const evidence = await revParse(workspace, "HEAD");
  await commitSupplierCleanup(owned);
  const late = draftLateStory(trunk);
  const sibling = { identity: late.identity, link: "seeds/A.md#late" };
  const waiting = await updateDependency(
    project,
    sibling,
    dependency(supplier),
  );
  assert.equal(waiting.code, 0, waiting.stderr);
  const lateTrunk = await publish(trunk, "late consumer waits on supplier B");
  return { trunk, workspace, owned, evidence, base, lateTrunk, sibling };
}

const closureCheck = (checkout) => async () => {
  const receipt = await checkQueuedClosures({
    checkout,
    remote: "origin",
    targetRef: main,
  });
  if (receipt.ok) return undefined;
  const { status, ownership, error } = receipt;
  return { status, fields: { ownership, error } };
};

export const landing = (setup, extra) => ({
  workspace: setup.workspace,
  branch,
  targetRef: main,
  validate: () => true,
  onFetchedTarget: closureCheck(setup.workspace),
  ...extra,
});

export async function finalView(setup) {
  const view = {
    directory: join(setup.trunk.fixture, "final-view"),
    inputDirectory: setup.trunk.fixture,
  };
  await cloneAsAnotherWriter(setup.trunk.origin, view.directory);
  return view;
}
