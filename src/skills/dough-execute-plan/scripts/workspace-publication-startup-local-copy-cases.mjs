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
  setupMarkers,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { deliverFirstIncrement } from "./workspace-publication-startup-delivery-test-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

const seedFile = ".planning/seeds/A.md";
const planFile = ".planning/slice-plans/A/PLAN.md";

// Edits story A's section and its plan in the default checkout and commits both
// edits locally.
async function commitSelectedSourceEdits(trunk) {
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
  await git(trunk.integration, "add", seedFile, planFile);
  await git(trunk.integration, "commit", "-m", "local selected sources");
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
async function assertPublishedSourcesTaken(trunk, started, local) {
  const { receipt, workspace } = started;
  assert.equal(receipt.status, "published", started.stdout);
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
    assert.notEqual(published, localText, file);
    assert.equal(readFileSync(join(workspace, file), "utf8"), published, file);
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
  const { receipt } = await startCliResult(trunk, "trunk");
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

test("a start beside different local selected sources carries setup and the first delivery", async (t) => {
  const trunk = await createQueuedTrunk({ contributing: readyContributing });
  t.after(trunk.cleanup);
  await commitSelectedSourceEdits(trunk);
  const seed = join(trunk.integration, seedFile);
  const plan = join(trunk.integration, planFile);
  writeFileSync(plan, `${readFileSync(plan, "utf8")}Staged local plan.\n`);
  await git(trunk.integration, "add", planFile);
  writeFileSync(seed, `${readFileSync(seed, "utf8")}Unstaged local story.\n`);
  const before = await captureLocalSources(trunk);

  const started = await startCliResult(trunk, "trunk");
  await assertPublishedSourcesTaken(trunk, started, before);
  await deliverFirstIncrement(trunk, {
    workspace: started.workspace,
    branch: started.branch,
    publishedSha: started.receipt.publishedSha,
  });
  for (const marker of setupMarkers)
    assert.equal(existsSync(join(trunk.integration, marker)), false, marker);
  assert.deepEqual(await captureLocalSources(trunk), before);
});
