// Published source resolution, authority, and fetch refusals.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  remoteBacklog,
  startCliResult,
  storyA,
} from "./workspace-publication-fixtures.mjs";
import { startExecution } from "./execution-start.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

test("a percent-encoded home link takes the story at its decoded path", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await git(
    trunk.integration,
    "mv",
    ".planning/seeds",
    ".planning/story notes",
  );
  const backlog = join(trunk.integration, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    readFileSync(backlog, "utf8").replaceAll("seeds/", "story%20notes/"),
  );
  await git(trunk.integration, "commit", "-am", "home under a spaced path");
  await git(trunk.integration, "push", "origin", "main");
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
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const backlog = join(trunk.integration, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    readFileSync(backlog, "utf8").replace(`${storyA}\n`, ""),
  );
  await git(trunk.integration, "commit", "-am", "unlist A");
  await git(trunk.integration, "push", "origin", "main");
  const tip = await revParse(trunk.integration, "HEAD");
  const { receipt, code, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(code, 1);
  assert.equal(receipt.status, "source-refused", JSON.stringify(receipt));
  assert.match(receipt.error, /not queued on fetched trunk; .*--admit/);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.equal(existsSync(workspace), false);
});

test("a failed fetch creates no workspace or claim", async (t) => {
  const trunk = await createQueuedTrunk();
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
  const trunk = await createQueuedTrunk();
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
