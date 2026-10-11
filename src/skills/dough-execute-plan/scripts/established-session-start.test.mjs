// The start behavior the established-session rule rests on, through the
// actual `execution-start.mjs` against a real bare origin. A session's
// isolated workspace is one an unlisted one-shot start prepared; a workflow
// invoked there later hands that workspace and branch to its own start. A
// tracked start continues there when the workspace is clean, and refuses the
// conversation's own edits or commits without touching them or creating
// another workspace; an admission drafted in the default checkout continues
// there too; a one-shot start reuses it, also when the block spells its path
// through a symbolic link; and `--default-main` takes the default checkout as
// it is.
import assert from "node:assert/strict";
import { existsSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  occupyDefaultCheckout,
  snapshot,
  startExecutionThere,
  worktreePaths,
} from "./default-checkout-test-fixtures.mjs";
import {
  git,
  lsRemoteSha,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  admitArgs,
  storySection,
  withFacts,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";

const sessionBranch = "claude/session";

// The session's isolated workspace, as its launch established it: an unlisted
// one-shot start with no identity.
async function establishedSession(t) {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const started = await startCliResult(trunk, "story-branch", ["--one-shot"], {
    identity: null,
    name: "session",
    branch: sessionBranch,
    pushAuthorized: false,
  });
  assert.equal(started.receipt.status, "prepared", started.stdout);
  assert.equal(started.receipt.created, true);
  assert.equal(started.receipt.startingRevision, trunk.trunkSha);
  return { trunk, workspace: started.workspace };
}

// A standard tracked invocation in the session: the established workspace and
// branch, with the invocation's own identity.
const trackedStart = (trunk, workspace) =>
  startCliResult(trunk, "story-branch", [], {
    name: "tracked",
    workspace,
    branch: sessionBranch,
  });

// A one-shot invocation in the session, given the workspace as `path` spells it.
const oneShotStart = (trunk, path) =>
  startCliResult(trunk, "story-branch", ["--one-shot"], {
    identity: null,
    name: "invoked",
    workspace: path,
    branch: sessionBranch,
    pushAuthorized: false,
  });

function assertRefused(started, workspace, reason) {
  assert.equal(started.code, 1, started.stdout);
  assert.equal(started.receipt.ok, false);
  assert.equal(started.receipt.status, "setup-failed");
  assert.deepEqual(started.receipt.recovery, {
    workspace,
    branch: sessionBranch,
    error: `existing workspace cannot continue on fetched trunk as ${sessionBranch}: ${reason}`,
  });
}

test("a tracked start given the clean established workspace and branch continues there at its Take", async (t) => {
  const { trunk, workspace } = await establishedSession(t);
  const worktrees = await worktreePaths(trunk.integration);

  const started = await trackedStart(trunk, workspace);

  assert.equal(started.code, 0, started.stdout);
  assert.equal(started.receipt.status, "published");
  assert.equal(started.receipt.created, false);
  const take = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(started.receipt.publishedSha, take);
  assert.notEqual(take, trunk.trunkSha);
  assert.equal(await revParse(workspace, "HEAD"), take);
  assert.equal(
    (await git(workspace, "branch", "--show-current")).stdout.trim(),
    sessionBranch,
  );
  assert.deepEqual(await worktreePaths(trunk.integration), worktrees);
});

test("a tracked start refuses the established workspace holding the conversation's edit, leaving it and the remote as they were", async (t) => {
  const { trunk, workspace } = await establishedSession(t);
  writeFileSync(join(workspace, "notes.txt"), "the conversation's edit\n");
  const heads = await remoteHeads(trunk.origin);
  const worktrees = await worktreePaths(trunk.integration);

  const started = await trackedStart(trunk, workspace);

  assertRefused(started, workspace, "pending-edit");
  assert.equal(
    readFileSync(join(workspace, "notes.txt"), "utf8"),
    "the conversation's edit\n",
  );
  assert.equal(
    (await git(workspace, "status", "--porcelain")).stdout,
    "?? notes.txt\n",
  );
  assert.equal(await remoteHeads(trunk.origin), heads);
  assert.deepEqual(await worktreePaths(trunk.integration), worktrees);
});

test("a tracked start refuses the established workspace holding the conversation's commit, leaving it and the remote as they were", async (t) => {
  const { trunk, workspace } = await establishedSession(t);
  writeFileSync(join(workspace, "notes.txt"), "the conversation's commit\n");
  await git(workspace, "add", "notes.txt");
  await git(workspace, "commit", "--quiet", "-m", "session work");
  const commit = await revParse(workspace, "HEAD");
  const heads = await remoteHeads(trunk.origin);
  const worktrees = await worktreePaths(trunk.integration);

  const started = await trackedStart(trunk, workspace);

  assertRefused(started, workspace, "unpublished-commits");
  assert.equal(await revParse(workspace, "HEAD"), commit);
  assert.equal(await remoteHeads(trunk.origin), heads);
  assert.deepEqual(await worktreePaths(trunk.integration), worktrees);
});

test("an admission drafted in the default checkout is given the established workspace and continues there", async (t) => {
  const { trunk, workspace } = await establishedSession(t);
  const identity = "SEED-N#slow-start";
  const link = "seeds/N.md#slow-start";
  writeDraft(
    trunk,
    ".planning/seeds/N.md",
    withFacts(
      `---\nid: SEED-N\n---\n\n# Seed N\n\n${storySection("slow-start", identity, "Investigate slow start", "Find why startup is slow.")}`,
      link,
      identity,
      "unselected",
    ),
  );
  const worktrees = await worktreePaths(trunk.integration);

  const started = await startCliResult(
    trunk,
    "story-branch",
    admitArgs(identity, link, "Investigate slow start"),
    { name: "admitted", workspace, branch: sessionBranch },
  );

  assert.equal(started.code, 0, started.stdout);
  assert.equal(started.receipt.status, "published");
  assert.equal(started.receipt.created, false);
  assert.deepEqual(started.receipt.admitted, [".planning/seeds/N.md"]);
  assert.equal(
    await revParse(workspace, "HEAD"),
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
  );
  assert.deepEqual(await worktreePaths(trunk.integration), worktrees);
});

test("a one-shot start given the established workspace and branch reuses it and creates no second workspace", async (t) => {
  const { trunk, workspace } = await establishedSession(t);
  const heads = await remoteHeads(trunk.origin);
  const worktrees = await worktreePaths(trunk.integration);

  const started = await oneShotStart(trunk, workspace);

  assert.equal(started.code, 0, started.stdout);
  assert.equal(started.receipt.status, "prepared");
  assert.equal(started.receipt.created, false);
  assert.equal(started.receipt.startingRevision, trunk.trunkSha);
  assert.equal(await revParse(workspace, "HEAD"), trunk.trunkSha);
  assert.deepEqual(await worktreePaths(trunk.integration), worktrees);
  assert.equal(await remoteHeads(trunk.origin), heads);
});

test("a start given the established workspace through a symbolic link reuses that workspace", async (t) => {
  const { trunk, workspace } = await establishedSession(t);
  const linked = join(trunk.fixture, "linked-session");
  symlinkSync(workspace, linked);
  const worktrees = await worktreePaths(trunk.integration);

  const started = await oneShotStart(trunk, linked);

  assert.equal(started.code, 0, started.stdout);
  assert.equal(started.receipt.status, "prepared");
  assert.equal(started.receipt.created, false);
  assert.equal(started.receipt.startingRevision, trunk.trunkSha);
  assert.deepEqual(await worktreePaths(trunk.integration), worktrees);
});

test("a path inside the established workspace is still refused as its workspace", async (t) => {
  const { trunk, workspace } = await establishedSession(t);
  const inside = join(workspace, ".planning");
  assert.ok(existsSync(inside));

  const started = await oneShotStart(trunk, inside);

  assert.equal(started.code, 1, started.stdout);
  assert.equal(started.receipt.status, "setup-failed");
  assert.match(started.receipt.recovery.error, /not-the-workspace-toplevel$/);
});

test("a default-checkout session's one-shot start takes the default checkout as it is", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const checkout = trunk.integration;
  await occupyDefaultCheckout(checkout);
  const before = await snapshot(checkout, trunk.origin);
  const worktrees = await worktreePaths(checkout);

  const { code, receipt } = await startExecutionThere(trunk, [
    "--default-main",
  ]);

  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.status, "prepared");
  assert.equal(receipt.role, "default-checkout");
  assert.equal(receipt.workspace, checkout);
  assert.equal(receipt.branch, "main");
  assert.equal(receipt.startingRevision, before.head);
  assert.equal(receipt.created, false);
  assert.deepEqual(await snapshot(checkout, trunk.origin), before);
  assert.deepEqual(await worktreePaths(checkout), worktrees);
});
