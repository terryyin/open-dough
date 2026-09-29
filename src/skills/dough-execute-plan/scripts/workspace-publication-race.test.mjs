// Backlog publication adapter: ownership and semantic replay of competing claims.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import {
  createdForRecords,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import { commitWorkspaceClaim } from "./workspace-publication-claim.mjs";
import { selectOwnedWorkspace } from "./workspace-publication-select.mjs";
import { publishClaimSha } from "./workspace-publication-push.mjs";
import {
  createQueuedTrunk,
  identityA,
  identityB,
  storyA,
  storyB,
} from "./workspace-publication-fixtures.mjs";
import {
  coAuthors,
  configureDeveloper,
  developer,
} from "./workspace-publication-startup-test-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

// Two workspaces selected before either claims: A's request names no work,
// and B's names one Git rejects as a ref name. Both are created as usual,
// with no record of the work they were created for.
async function claimPair(trunk) {
  const workspaceA = join(trunk.fixture, "exec-a");
  const workspaceB = join(trunk.fixture, "exec-b");
  const selectedA = await selectOwnedWorkspace({
    repository: trunk.integration,
    origin: trunk.origin,
    workspace: workspaceA,
    branch: "exec/a",
  });
  const selectedB = await selectOwnedWorkspace({
    repository: trunk.integration,
    origin: trunk.origin,
    workspace: workspaceB,
    branch: "exec/b",
    identity: "SEED-B#b..not-a-ref",
  });
  assert.equal(selectedA.ok, true, selectedA.recovery?.error);
  assert.equal(selectedB.ok, true, selectedB.recovery?.error);
  assert.equal(selectedA.created && selectedB.created, true);
  assert.equal(selectedA.startingRevision, selectedB.startingRevision);
  for (const workspace of [workspaceA, workspaceB])
    assert.deepEqual(await createdForRecords(workspace), [], workspace);
  return { workspaceA, workspaceB, selectedA, selectedB };
}

test("concurrent claims for distinct identities both remain published, and the replayed agent Take keeps one developer credit", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await configureDeveloper(trunk.integration);
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
    mode: "trunk",
    agent: { name: "Akiho" },
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
  // B's agent Take was replayed onto A's; its credit is replayed unchanged.
  assert.notEqual(publishedB.publishedSha, committedB.candidateSha);
  assert.equal(
    (
      await git(workspaceB, "log", "-1", "--format=%an|%cn", "origin/main")
    ).stdout.trim(),
    "Akiho-chan|Dana Developer",
  );
  assert.equal(await coAuthors(workspaceB, "origin/main"), developer);
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
