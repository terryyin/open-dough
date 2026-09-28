// Startup executes the selected source published on fetched trunk and leaves
// every copy the default checkout holds, selected or unrelated, as it was.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  captureCheckout,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  readyContributing,
  remoteBacklog,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { runReadinessGate } from "./execution-worktree-preparation-readiness-gate.mjs";
import { installManagedDelivery } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

const seedFile = ".planning/seeds/A.md";
const planFile = ".planning/slice-plans/A/PLAN.md";

// Edits story A's section and its plan in the default checkout and leaves both
// edits at `layer`: its working tree, its index, or a local commit.
async function editSelectedSources(trunk, layer) {
  const seed = join(trunk.integration, seedFile);
  const plan = join(trunk.integration, planFile);
  writeFileSync(
    seed,
    readFileSync(seed, "utf8").replace(
      "Execute A.",
      "Edited selected promise.",
    ),
  );
  writeFileSync(plan, `${readFileSync(plan, "utf8")}Changed local plan.\n`);
  if (layer !== "worktree")
    await git(trunk.integration, "add", seedFile, planFile);
  if (layer === "commit")
    await git(trunk.integration, "commit", "-m", `local selected ${layer}`);
}

// The default checkout's Git state and its selected source bytes.
async function captureLocalSources(trunk) {
  return {
    checkout: await captureCheckout(trunk.integration),
    seed: readFileSync(join(trunk.integration, seedFile), "utf8"),
    plan: readFileSync(join(trunk.integration, planFile), "utf8"),
  };
}

// The start's claim is this publisher's Taken claim at the remote tip, and its
// owned workspace holds the published story and plan rather than `local`'s.
async function assertPublishedSourcesTaken(trunk, started, local, label) {
  const { receipt, workspace } = started;
  assert.equal(receipt.status, "published", `${label}: ${started.stdout}`);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
  assert.match(
    (await git(trunk.origin, "log", "-1", "--format=%B", receipt.publishedSha))
      .stdout,
    /Claim-Publisher: publisher-trunk/,
  );
  assert.equal(
    takenIdentities(await remoteBacklog(workspace)).includes(identityA),
    true,
  );
  for (const file of [seedFile, planFile]) {
    const published = (
      await git(trunk.origin, "show", `${receipt.publishedSha}:${file}`)
    ).stdout;
    const localText = file === seedFile ? local.seed : local.plan;
    assert.notEqual(published, localText, `${label}: ${file}`);
    assert.equal(
      readFileSync(join(workspace, file), "utf8"),
      published,
      `${label}: ${file}`,
    );
  }
}

test("startup preserves unrelated staged, tracked, untracked, and sibling source edits", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seed = join(trunk.integration, seedFile);
  writeFileSync(
    seed,
    `${readFileSync(seed, "utf8")}\n<a id="b"></a>\n\n### Story B\n\nSibling edit.\n`,
  );
  writeFileSync(join(trunk.integration, "staged.txt"), "index\n");
  await git(trunk.integration, "add", "staged.txt");
  writeFileSync(join(trunk.integration, "untracked.txt"), "working\n");
  const before = {
    staged: (await git(trunk.integration, "diff", "--cached")).stdout,
    seed: readFileSync(seed, "utf8"),
    untracked: readFileSync(join(trunk.integration, "untracked.txt"), "utf8"),
  };
  const { receipt } = await startCliResult(trunk, "trunk", [
    "--declared-owner",
    "owner",
    "--requester",
    "owner",
  ]);
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.deepEqual(receipt.maintenance, {
    result: "deferred",
    reason: "pending-edit",
  });
  assert.equal("earlierMaintenance" in receipt, false);
  assert.equal(
    (await git(trunk.integration, "diff", "--cached")).stdout,
    before.staged,
  );
  assert.equal(readFileSync(seed, "utf8"), before.seed);
  assert.equal(
    readFileSync(join(trunk.integration, "untracked.txt"), "utf8"),
    before.untracked,
  );
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
});

test("different selected sources at every local Git layer leave the published sources taken", async (t) => {
  for (const layer of ["worktree", "index", "commit"]) {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    await editSelectedSources(trunk, layer);
    const before = await captureLocalSources(trunk);
    const started = await startCliResult(trunk, "trunk");
    await assertPublishedSourcesTaken(trunk, started, before, layer);
    assert.deepEqual(await captureLocalSources(trunk), before, layer);
  }
});

test("a start beside different local selected sources carries setup and the first delivery", async (t) => {
  const trunk = await createQueuedTrunk({ contributing: readyContributing });
  t.after(trunk.cleanup);
  await editSelectedSources(trunk, "commit");
  const seed = join(trunk.integration, seedFile);
  const plan = join(trunk.integration, planFile);
  writeFileSync(plan, `${readFileSync(plan, "utf8")}Staged local plan.\n`);
  await git(trunk.integration, "add", planFile);
  writeFileSync(seed, `${readFileSync(seed, "utf8")}Unstaged local story.\n`);
  const before = await captureLocalSources(trunk);

  const started = await startCliResult(trunk, "trunk");
  await assertPublishedSourcesTaken(trunk, started, before, "all layers");
  const { receipt, workspace } = started;

  const readiness = await runReadinessGate(workspace, process.env);
  assert.equal(readiness.ok, true, readiness.report);
  assert.equal(
    readiness.invocations.every(({ cwd }) => cwd === workspace),
    true,
  );
  for (const marker of [".setup-ran", ".command-ran"]) {
    assert.equal(existsSync(join(workspace, marker)), true, marker);
    assert.equal(existsSync(join(trunk.integration, marker)), false, marker);
  }

  writeFileSync(join(workspace, "feature.txt"), "first increment\n");
  await git(workspace, "add", "feature.txt");
  await git(workspace, "commit", "-m", "first verified increment");
  const increment = await revParse(workspace, "HEAD");
  const delivery = await installManagedDelivery(
    trunk,
    trunk.fixture,
    workspace,
  );
  const delivered = await delivery.deliverManagedExecutionIncrement({
    ...delivery.requestBase,
    workspace,
    branch: started.branch,
    previouslyPublishedBase: receipt.publishedSha,
    targetRef: "refs/heads/main",
    repo: "owner/project",
  });
  assert.equal(delivered.ok, true, JSON.stringify(delivered));
  assert.equal(delivered.publication, "accepted");
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), increment);
  assert.equal(
    await revParse(workspace, `${increment}^`),
    receipt.publishedSha,
  );
  assert.deepEqual(await captureLocalSources(trunk), before);
});
