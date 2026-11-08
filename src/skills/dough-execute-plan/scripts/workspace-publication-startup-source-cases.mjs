// Published source resolution, authority, and fetch refusals.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { direction } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  readyStoryState,
  storyA,
  storyB,
  storySeed,
} from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  identityA,
  remoteBacklog,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { startExecution } from "./execution-start.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

test("a percent-encoded home link takes the story at its decoded path", async (t) => {
  const queued = [storyA, storyB].map((story) =>
    makeMe.aBacklogEntry
      .with({ ...story, href: story.href.replace("seeds/", "story%20notes/") })
      .please(),
  );
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("home under a spaced path", {
        backlog: { direction, queued },
        remove: [".planning/seeds"],
        files: {
          ".planning/story notes/A.md": storySeed(queued[0], "Execute A."),
          ".planning/story notes/B.md": storySeed(queued[1], "Execute B."),
        },
        storyStates: queued.map(readyStoryState),
      })
      .please(),
  );
  t.after(trunk.cleanup);
  const { receipt, workspace } = await startCliResult(trunk, "trunk");
  assert.deepEqual(
    { ok: receipt.ok, status: receipt.status, error: receipt.error },
    { ok: true, status: "published", error: undefined },
  );
  assert.equal(
    takenIdentities(await remoteBacklog(workspace)).includes(identityA),
    true,
  );
});

test("an unlisted identity is refused with a pointer to admission", async (t) => {
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("unlist A", { backlog: { direction, queued: [storyB] } })
      .please(),
  );
  t.after(trunk.cleanup);
  const tip = trunk.trunkSha;
  const { receipt, code, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(code, 1);
  assert.equal(receipt.status, "source-refused", JSON.stringify(receipt));
  assert.match(receipt.error, /not queued on fetched trunk; .*--admit/);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.equal(existsSync(workspace), false);
});

test("a failed fetch creates no workspace or claim", async (t) => {
  const trunk = await materializeRepository(queuedReadyRepository().please());
  t.after(trunk.cleanup);
  await git(
    trunk.integration,
    "remote",
    "set-url",
    "origin",
    join(trunk.fixture, "unreachable.git"),
  );
  const unavailable = await startCliResult(trunk, "trunk");
  assert.equal(unavailable.receipt.status, "source-refused");
  assert.equal(existsSync(unavailable.workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});

test("missing publication authority refuses before fetch or workspace selection", async (t) => {
  const trunk = await materializeRepository(queuedReadyRepository().please());
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "unauthorized");
  const receipt = await startExecution({
    integration: trunk.integration,
    workspace,
    branch: "exec/unauthorized",
    identity: identityA,
    publisherId: "unauthorized",
    mode: "trunk",
    remote: "origin",
    target: "main",
    workspaceAuthorized: true,
  });
  assert.equal(receipt.status, "authority-required");
  assert.equal(existsSync(workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});
