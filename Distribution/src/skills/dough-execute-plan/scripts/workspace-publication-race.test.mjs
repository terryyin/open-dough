// Backlog publication adapter: ownership and semantic replay of competing claims.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { queuedReadyRepository } from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import { commitWorkspaceClaim } from "./workspace-publication-claim.mjs";
import { selectOwnedWorkspace } from "./workspace-publication-select.mjs";
import { publishClaimSha } from "./workspace-publication-push.mjs";
import {
  identityA,
  identityB,
  startCliResult,
  storyA,
  storyB,
} from "./workspace-publication-fixtures.mjs";
import {
  coAuthors,
  configureDeveloper,
  developer,
} from "./workspace-publication-startup-test-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

// Two workspaces selected from the same fetched trunk before either claims.
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
  });
  assert.equal(selectedA.ok, true, selectedA.recovery?.error);
  assert.equal(selectedB.ok, true, selectedB.recovery?.error);
  assert.equal(selectedA.created && selectedB.created, true);
  assert.equal(selectedA.startingRevision, selectedB.startingRevision);
  return { workspaceA, workspaceB, selectedA, selectedB };
}

test("concurrent claims for distinct identities both remain published, and the replayed agent Take keeps one developer credit", async (t) => {
  const trunk = await materializeRepository(queuedReadyRepository().please());
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
  const trunk = await materializeRepository(queuedReadyRepository().please());
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

test("startup refuses a malformed published backlog and can claim once trunk repairs it", async (t) => {
  const backlog = ".planning/PRODUCT-BACKLOG.md";
  const malformed = "# Product backlog\r\n\r\n## Taken\r\n";
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("malformed", { files: { [backlog]: malformed } })
      .please(),
  );
  t.after(trunk.cleanup);
  assert.equal(
    (await git(trunk.origin, "show", `${trunk.revisions.malformed}:${backlog}`))
      .stdout,
    malformed,
  );

  const refused = await startCliResult(trunk, "trunk");
  assert.equal(refused.code, 1, JSON.stringify(refused.receipt));
  assert.match(refused.receipt.error, /Expected exactly one "## Backlog list"/);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );

  await git(
    trunk.integration,
    "restore",
    "--source",
    trunk.revisions.base,
    "--",
    backlog,
  );
  await git(trunk.integration, "commit", "-am", "Repair the published backlog");
  await git(trunk.integration, "push", "origin", "main");
  const recovered = await startCliResult(trunk, "trunk");
  assert.equal(recovered.code, 0, JSON.stringify(recovered.receipt));
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    recovered.receipt.publishedSha,
  );
  const published = await git(trunk.origin, "show", `main:${backlog}`);
  assert.deepEqual(takenIdentities(published.stdout), [identityA]);
});
