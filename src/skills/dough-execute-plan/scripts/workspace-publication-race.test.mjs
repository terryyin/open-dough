// Git mechanics (not guidance-following): concurrent Taken claims. Distinct
// identities both publish. One identity yields one owner and a recoverable
// conflict. Identical Taken text is not ownership. Native sequencing is not
// this file.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  commitWorkspaceClaim,
  publishClaimSha,
  selectOwnedWorkspace,
  acquireWorkspaceClaim,
} from "./workspace-publication.mjs";
import {
  createQueuedTrunk,
  identityA,
  identityB,
  storyA,
  storyB,
} from "./workspace-publication-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

async function claimPair(trunk) {
  const workspaceA = join(trunk.fixture, "exec-a");
  const workspaceB = join(trunk.fixture, "exec-b");
  const selectedA = await selectOwnedWorkspace({
    integration: trunk.integration,
    origin: trunk.origin,
    workspace: workspaceA,
    branch: "exec/a",
  });
  const selectedB = await selectOwnedWorkspace({
    integration: trunk.integration,
    origin: trunk.origin,
    workspace: workspaceB,
    branch: "exec/b",
  });
  assert.equal(selectedA.ok, true, selectedA.recovery?.error);
  assert.equal(selectedB.ok, true, selectedB.recovery?.error);
  assert.equal(selectedA.startingRevision, selectedB.startingRevision);
  return { workspaceA, workspaceB, selectedA, selectedB };
}

test("concurrent claims for distinct identities both remain published", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { workspaceB, selectedA, selectedB } = await claimPair(trunk);
  const committedA = await commitWorkspaceClaim({
    ...selectedA,
    identity: identityA,
    publisherId: "exec-a",
  });
  const committedB = await commitWorkspaceClaim({
    ...selectedB,
    identity: identityB,
    publisherId: "exec-b",
  });
  const publishedA = await publishClaimSha({
    ...selectedA,
    origin: trunk.origin,
    identity: identityA,
    publisherId: "exec-a",
    candidateSha: committedA.candidateSha,
  });
  const publishedB = await publishClaimSha({
    ...selectedB,
    origin: trunk.origin,
    identity: identityB,
    publisherId: "exec-b",
    candidateSha: committedB.candidateSha,
  });

  assert.equal(publishedA.status, "published");
  assert.equal(
    publishedB.status,
    "published",
    JSON.stringify(publishedB.recovery),
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    publishedB.publishedSha,
  );
  await git(workspaceB, "fetch", "origin");
  const published = (
    await git(
      workspaceB,
      "show",
      `${publishedB.publishedSha}:.planning/PRODUCT-BACKLOG.md`,
    )
  ).stdout;
  assert.deepEqual(takenIdentities(published), [identityA, identityB]);
  assert.equal(published.includes(storyA), true);
  assert.equal(published.includes(storyB), true);
  assert.equal(published.includes("## Backlog list\n\n-"), false);
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  const log = (await git(workspaceB, "log", "--format=%B", "origin/main"))
    .stdout;
  assert.match(log, /Claim-Publisher: exec-a/);
  assert.match(log, /Claim-Publisher: exec-b/);
});

test("competing claims for one identity keep one owner and a recoverable conflict", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { workspaceA, workspaceB, selectedA, selectedB } =
    await claimPair(trunk);
  const committedA = await commitWorkspaceClaim({
    ...selectedA,
    identity: identityA,
    publisherId: "exec-a",
  });
  const committedB = await commitWorkspaceClaim({
    ...selectedB,
    identity: identityA,
    publisherId: "exec-b",
  });
  const bytesA = (
    await git(
      workspaceA,
      "show",
      `${committedA.candidateSha}:.planning/PRODUCT-BACKLOG.md`,
    )
  ).stdout;
  const bytesB = (
    await git(
      workspaceB,
      "show",
      `${committedB.candidateSha}:.planning/PRODUCT-BACKLOG.md`,
    )
  ).stdout;
  assert.equal(bytesA, bytesB);

  const publishedA = await publishClaimSha({
    ...selectedA,
    origin: trunk.origin,
    identity: identityA,
    publisherId: "exec-a",
    candidateSha: committedA.candidateSha,
  });
  let implemented = false;
  const publishedB = await publishClaimSha({
    ...selectedB,
    origin: trunk.origin,
    identity: identityA,
    publisherId: "exec-b",
    candidateSha: committedB.candidateSha,
    onImplement() {
      implemented = true;
    },
  });

  assert.equal(publishedA.status, "published");
  assert.equal(publishedB.status, "conflict");
  assert.equal(publishedB.ownership, "other");
  assert.equal(publishedB.implemented, false);
  assert.equal(implemented, false);
  assert.equal(publishedB.recovery.provenance.publisher, "exec-a");
  assert.equal(publishedB.recovery.candidateSha, committedB.candidateSha);
  assert.equal(await revParse(workspaceB, "HEAD"), committedB.candidateSha);
  await assert.rejects(git(workspaceB, "rev-parse", "--verify", "REBASE_HEAD"));
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    publishedA.publishedSha,
  );
});

test("identical Taken text without publication provenance keeps the conflict", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const planter = join(trunk.fixture, "planter");
  const selected = await selectOwnedWorkspace({
    integration: trunk.integration,
    origin: trunk.origin,
    workspace: planter,
    branch: "exec/planter",
  });
  const committed = await commitWorkspaceClaim({
    ...selected,
    identity: identityA,
    publisherId: "exec-planter",
  });
  await git(planter, "commit", "--amend", "-m", "Take queued work: SEED-A#a");
  const amended = await revParse(planter, "HEAD");
  await git(planter, "push", "origin", `${amended}:refs/heads/main`);

  const workspace = join(trunk.fixture, "exec-b");
  let implemented = false;
  const result = await acquireWorkspaceClaim({
    integration: trunk.integration,
    origin: trunk.origin,
    workspace,
    branch: "exec/b",
    identity: identityA,
    publisherId: "exec-b",
    onImplement() {
      implemented = true;
    },
  });

  assert.equal(result.status, "conflict");
  assert.equal(result.ownership, "ambiguous");
  assert.equal(result.implemented, false);
  assert.equal(implemented, false);
  assert.equal(result.recovery.provenance.publisher, undefined);
  assert.equal(
    await revParse(workspace, "HEAD"),
    result.recovery.startingRevision,
  );
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), amended);
  await git(workspace, "fetch", "origin");
  const remote = (
    await git(workspace, "show", "origin/main:.planning/PRODUCT-BACKLOG.md")
  ).stdout;
  const local = (
    await git(
      planter,
      "show",
      `${committed.candidateSha}:.planning/PRODUCT-BACKLOG.md`,
    )
  ).stdout;
  assert.equal(remote, local);
});
