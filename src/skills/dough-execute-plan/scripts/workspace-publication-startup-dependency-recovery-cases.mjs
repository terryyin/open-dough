// Dependency changes distinguish an unpublished claim retry from continuing
// the execution an already-published claim owns.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { dependency } from "../../../../tests/support/story-dependencies-fixture.mjs";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  interruptFirstPush,
  resumeArgs,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";
import {
  publishDependency,
  supplier,
} from "./workspace-publication-dependency-fixtures.mjs";

test("a newly published blocker prevents retry of an interrupted unpublished Take", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await interruptFirstPush(trunk);
  const interrupted = await startProcess(trunk, "a", identityA).result;
  assert.equal(interrupted.receipt.status, "unpublished");
  const { recovery } = interrupted.receipt;
  const tip = await publishDependency(trunk, dependency(supplier));
  const retry = await startProcess(trunk, "a", identityA, resumeArgs(recovery))
    .result;
  assert.equal(retry.receipt.status, "source-refused", JSON.stringify(retry));
  assert.match(retry.receipt.error, /execution is blocked/);
  assert.equal(
    await revParse(interrupted.workspace, "HEAD"),
    recovery.candidateSha,
  );
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.deepEqual(
    takenIdentities(
      (await git(trunk.origin, "show", "main:.planning/PRODUCT-BACKLOG.md"))
        .stdout,
    ),
    [],
  );
});

test("an existing Taken session is not interrupted by a dependency added after its claim", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const first = await startCliResult(trunk, "story-branch");
  assert.equal(first.code, 0, JSON.stringify(first));
  await publishDependency(trunk, dependency(supplier));
  const continuation = await startCliResult(trunk, "story-branch");
  assert.equal(continuation.code, 0, JSON.stringify(continuation));
  assert.equal(continuation.receipt.status, "existing");
  assert.equal(continuation.receipt.publishedSha, first.receipt.publishedSha);
  const retained = await startCliResult(
    trunk,
    "story-branch",
    resumeArgs(first.receipt),
  );
  assert.equal(retained.code, 0, JSON.stringify(retained));
  assert.equal(retained.receipt.status, "resumed");
  assert.equal(retained.receipt.publishedSha, first.receipt.publishedSha);
  const path = join(trunk.integration, ".planning/seeds/A.md");
  writeFileSync(
    path,
    readFileSync(path, "utf8").replace("Execute A.", "Another story contract."),
  );
  await git(
    trunk.integration,
    "commit",
    "-am",
    "change story contract after claim",
  );
  await git(trunk.integration, "push", "origin", "main");
  const changed = await startCliResult(
    trunk,
    "story-branch",
    resumeArgs(first.receipt),
  );
  assert.equal(changed.code, 1, JSON.stringify(changed));
  assert.match(
    changed.receipt.error,
    /selected published source changed since retained claim basis/,
  );
});
