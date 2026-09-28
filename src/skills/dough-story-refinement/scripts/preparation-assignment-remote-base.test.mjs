// Where a fresh preparation drafts: the production `start` command selects a
// workspace path that does not exist yet at freshly fetched trunk, however
// stale, divergent, or dirty the checkout preparation was invoked from. The
// draft continues through resume, release, and the Dough Land Git model
// while that checkout's commits, index, and files stay exactly as they were.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  captureCheckout,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { isAncestor } from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import { configureDeveloper } from "../../dough-execute-plan/scripts/workspace-publication-startup-test-fixtures.mjs";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import {
  createPreparationTrunk,
  git,
  identityC,
  lsRemoteSha,
  read,
  refineStoryC,
  releasePreparation,
  remoteChanges,
  remoteFile,
  revParse,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";

const localSeed =
  '---\nid: SEED-C\n---\n\n# Seed C\n\n<a id="c"></a>\n\n### Story C\n\n**Identity:** SEED-C#c\n\nA local idea for C nobody published.\n';

// The developer's checkout: one unpublished local commit changing story C,
// a staged new file, and an unstaged edit to that same seed, while another
// writer has since advanced remote trunk.
async function staleDeveloperCheckout(trunk) {
  const { integration } = trunk;
  await configureDeveloper(integration);
  writeFileSync(join(integration, seedC), localSeed);
  await git(integration, "commit", "--quiet", "-am", "local story C idea");
  const localCommit = await revParse(integration, "HEAD");
  writeFileSync(join(integration, "human-staged.txt"), "staged by a human\n");
  await git(integration, "add", "human-staged.txt");
  writeFileSync(join(integration, seedC), `${localSeed}Unstaged thought.\n`);
  const advanced = await advanceOriginFromAnotherWriter(trunk.origin);
  const bytes = () =>
    Promise.all([
      captureCheckout(integration),
      readFileSync(join(integration, seedC), "utf8"),
      readFileSync(join(integration, "human-staged.txt"), "utf8"),
      git(integration, "branch", "--show-current"),
    ]).then(([checkout, seed, staged, branch]) => ({
      checkout,
      seed,
      staged,
      branch: branch.stdout,
    }));
  return { localCommit, advanced, bytes };
}

test("a fresh preparation from a stale, dirty checkout drafts on fetched trunk, resumes its own draft, and lands it without touching that checkout", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { localCommit, advanced, bytes } = await staleDeveloperCheckout(trunk);
  const before = await bytes();
  const workspace = join(trunk.fixture, "owned", "prep-c");
  const branch = "prep/c";
  assert.equal(existsSync(workspace), false);

  const { code, receipt } = await startPreparation(
    trunk,
    workspace,
    identityC,
    ["--branch", branch],
  );
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.status, "announced");
  assert.deepEqual(receipt.selection, {
    created: true,
    branch,
    startingRevision: advanced,
  });
  // The workspace starts at the other writer's trunk, not the local commit.
  const announced = receipt.publishedSha;
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), announced);
  assert.equal(await revParse(trunk.origin, `${announced}^`), advanced);
  assert.equal(await revParse(workspace, "HEAD"), announced);
  assert.equal(
    (await git(workspace, "branch", "--show-current")).stdout.trim(),
    branch,
  );
  assert.equal(await isAncestor(workspace, localCommit, "HEAD"), false);
  assert.equal(existsSync(join(workspace, "other-writer.txt")), true);
  assert.equal(
    read(workspace, seedC),
    await remoteFile(trunk, advanced, seedC),
  );
  assert.notEqual(receipt.refresh.result, "advanced");

  // The first draft write refines the published story C, not the local one.
  refineStoryC(workspace);
  const draft = read(workspace, seedC);
  assert.match(draft, /C is useful/);
  assert.doesNotMatch(draft, /local idea/);
  assert.deepEqual(await bytes(), before);

  // A related or resumed preparation reuses the same owned draft unchanged.
  const resumed = await startPreparation(trunk, workspace, identityC, [
    "--branch",
    branch,
  ]);
  assert.equal(resumed.code, 0, JSON.stringify(resumed.receipt));
  assert.equal(resumed.receipt.status, "continued");
  assert.equal(resumed.receipt.allocation, announced);
  assert.equal(resumed.receipt.selection, undefined);
  assert.equal(await revParse(workspace, "HEAD"), announced);
  assert.equal(read(workspace, seedC), draft);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), announced);

  // Keep: the release and the draft land together on remote trunk.
  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.receipt.status, "release-staged");
  const landing = await landWorktree({
    worktree: workspace,
    branch,
    defaultCheckout: trunk.integration,
    message: "Keep story C preparation",
  });
  assert.equal(landing.stopped, null, JSON.stringify(landing));
  const landed = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(await revParse(trunk.origin, `${landed}^`), announced);
  assert.deepEqual((await remoteChanges(trunk, landed)).sort(), [
    "D\t.planning/agents/yui-chan.json",
    `M\t${seedC}`,
  ]);
  assert.equal(await remoteFile(trunk, landed, seedC), draft);
  assert.notEqual(landing.refresh.result, "advanced");
  assert.deepEqual(await bytes(), before);
});

test("a workspace that cannot be selected at fetched trunk is not created", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  await configureDeveloper(trunk.integration);
  const workspace = join(trunk.fixture, "prep-missing");

  const unnamed = await startPreparation(trunk, workspace, identityC);
  assert.equal(unnamed.code, 1);
  assert.equal(unnamed.receipt.status, "invalid-request");
  assert.match(unnamed.receipt.error, /--branch/);

  const unqueued = await startPreparation(trunk, workspace, "SEED-Z#z", [
    "--branch",
    "prep/z",
  ]);
  assert.equal(unqueued.code, 1);
  assert.equal(unqueued.receipt.status, "not-queued");

  assert.equal(existsSync(workspace), false);
  assert.equal(
    (await git(trunk.integration, "branch", "--list", "prep/*")).stdout,
    "",
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});
