// A Story Branch supplier branched before a consumer existed on trunk. Every
// dependency write and the integration use the real commands; tests supply
// only the agent's per-consumer judgment, never the consumer list.
import assert from "node:assert/strict";
import { appendFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  consumer,
  dependency,
  git,
  plan,
  publish,
  revParse,
  run,
  supplier,
  supplierPlan,
  updateDependency,
} from "./supplier-dependency-fixture.mjs";
import { runScript } from "../../src/skills/dough-story-wrap-up/scripts/closure-git-fixtures.mjs";
import { createQueuedTrunk } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { projectOf } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-dependency-fixtures.mjs";
import { draftLateStory } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs";
import { deploySkill } from "../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";

export const executionBranch = "exec/supplier";

// B's branch shows no consumer, preserves its completed proof, cleans up,
// and publishes its closure tip. Trunk meanwhile gains consumer A waiting
// on B and THIRD, and the prepared unqueued sibling SEED-A#late waiting on B.
export async function branchedSupplier(t) {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const project = projectOf(trunk);
  const third = { identity: "THIRD", link: "seeds/third.md" };
  writeFileSync(
    join(trunk.integration, ".planning", third.link),
    "# Third\n**Identity:** THIRD\n",
  );
  writeFileSync(join(trunk.integration, supplierPlan), plan("planned"));
  await publish(trunk, "supplier B is planned");
  const workspace = join(trunk.fixture, "supplier-workspace");
  await git(
    trunk.integration,
    "worktree",
    "add",
    "-q",
    "-b",
    executionBranch,
    workspace,
    "HEAD",
  );
  appendFileSync(join(trunk.integration, ".git/info/exclude"), ".agents/\n");
  const installed = deploySkill(workspace);
  const owned = { directory: workspace, inputDirectory: trunk.fixture };
  writeFileSync(join(workspace, supplierPlan), plan("done"));
  await git(workspace, "add", supplierPlan);
  await git(workspace, "commit", "-q", "-m", "supplier outcome and proof");
  const evidence = await revParse(workspace, "HEAD");
  const closed = await run(owned, [
    "complete",
    "--identity",
    supplier.identity,
  ]);
  assert.equal(closed.code, 0, closed.stderr);
  rmSync(join(workspace, ".planning/seeds/B.md"));
  rmSync(join(workspace, supplierPlan));
  await git(workspace, "add", "-A", ".planning");
  await git(workspace, "commit", "-q", "-m", "supplier final closure");
  const closureTip = await revParse(workspace, "HEAD");
  await git(workspace, "push", "-q", "origin", executionBranch);
  for (const entry of [supplier, third].map(dependency)) {
    const result = await updateDependency(project, consumer, entry);
    assert.equal(result.code, 0, result.stderr);
  }
  const late = draftLateStory(trunk);
  const sibling = { identity: late.identity, link: "seeds/A.md#late" };
  const waiting = await updateDependency(
    project,
    sibling,
    dependency(supplier),
  );
  assert.equal(waiting.code, 0, waiting.stderr);
  const lateTrunk = await publish(trunk, "late consumer waits on supplier B");
  return {
    trunk,
    project,
    workspace,
    installed,
    owned,
    evidence,
    closureTip,
    lateTrunk,
    sibling,
    third,
  };
}

// The installed Story Branch integration command, optionally as the selected
// supplier's completion integration.
export async function integrate(setup, extra = []) {
  const result = await runScript(
    join(setup.installed, "scripts/history-preserving-publication.mjs"),
    "integrate",
    "--workspace",
    setup.workspace,
    "--published-tip",
    setup.closureTip,
    "--branch",
    executionBranch,
    ...extra,
  );
  return { ...result, json: result.stdout ? JSON.parse(result.stdout) : null };
}

export const selected = ["--supplier-identity", supplier.identity];

export async function visitConsumers(setup, accepted, remote = "origin") {
  const result = await runScript(
    join(
      setup.installed,
      "../dough-product-backlog/scripts/product-backlog.mjs",
    ),
    "visit-consumers",
    "--file",
    join(setup.workspace, ".planning/PRODUCT-BACKLOG.md"),
    "--supplier-identity",
    supplier.identity,
    "--accepted-revision",
    accepted,
    "--remote",
    remote,
    "--target",
    "main",
  );
  return { ...result, json: result.stdout ? JSON.parse(result.stdout) : null };
}

export const identities = (visit) =>
  visit.consumers.map((entry) => entry.identity).sort();

export const entryFor = (visit, identity) =>
  visit.consumers.find((entry) => entry.identity === identity);

let judgments = 0;

// Applies an agent's judgment to one visited agreement, using that visit's
// observed record and basis.
export async function recordJudgment(setup, entry, accepted, judged) {
  judgments += 1;
  const input = join(setup.trunk.fixture, `judgment-${judgments}.json`);
  writeFileSync(input, JSON.stringify({ ...entry.dependency, ...judged }));
  return run(setup.owned, [
    "resolve-dependency",
    "--identity",
    entry.identity,
    "--link",
    entry.href,
    "--dependency-file",
    input,
    "--expect-dependencies",
    entry.basis,
    "--accepted-revision",
    accepted,
    "--remote",
    "origin",
    "--target",
    "main",
  ]);
}

export const satisfied = (setup, accepted) => ({
  state: "satisfied",
  resolution: {
    revision: setup.evidence,
    path: ".planning/seeds/B.md#b",
    summary: `Supplier proof ${setup.evidence} delivers the selected endpoint contract, accepted on main in ${accepted}; it proves the unchanged condition.`,
  },
});

// Publishes the owned consumer changes to trunk; one ordinary retry
// incorporates another writer's accepted change.
export async function publishConsumers(setup, message) {
  await git(setup.workspace, "add", ".planning");
  await git(setup.workspace, "commit", "-q", "-m", message);
  try {
    await git(setup.workspace, "push", "-q", "origin", "HEAD:main");
  } catch {
    await git(setup.workspace, "pull", "-q", "--rebase", "origin", "main");
    await git(setup.workspace, "push", "-q", "origin", "HEAD:main");
  }
  return revParse(setup.workspace, "HEAD");
}

export const seedBytes = (workspace) =>
  readFileSync(join(workspace, ".planning/seeds/A.md"), "utf8");

export const remoteMain = async (setup) =>
  (await git(setup.workspace, "ls-remote", "origin", "refs/heads/main")).stdout
    .trim()
    .split("\t")[0];

// How many of a consumer's blocking entries still name the supplier.
export const supplierBlocks = (facts) =>
  facts.blocking.filter((entry) =>
    JSON.stringify(entry).includes(supplier.identity),
  ).length;
