// Backlog publication adapter: ownership and semantic replay of competing claims.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  commitWorkspaceClaim,
  selectOwnedWorkspace,
} from "./workspace-publication-select.mjs";
import { publishClaimSha } from "./workspace-publication-push.mjs";
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
  const publishedB = await publishClaimSha({
    ...selectedB,
    origin: trunk.origin,
    identity: identityA,
    publisherId: "exec-b",
    candidateSha: committedB.candidateSha,
  });

  assert.equal(publishedA.status, "published");
  assert.equal(publishedB.status, "conflict");
  assert.equal(publishedB.ownership, "other");
  assert.equal(publishedB.implemented, false);
  assert.equal(publishedB.recovery.provenance.publisher, "exec-a");
  assert.equal(publishedB.recovery.candidateSha, committedB.candidateSha);
  assert.equal(await revParse(workspaceB, "HEAD"), committedB.candidateSha);
  await assert.rejects(git(workspaceB, "rev-parse", "--verify", "REBASE_HEAD"));
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    publishedA.publishedSha,
  );
});
