// Real command races against a bare remote and canonical prepared stories.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  identityB,
} from "./workspace-publication-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";
import {
  advanceRemote,
  awaitFile,
  holdFirstPush,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";

test("real startup commands replay distinct claims from one base without losing either", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const barrier = await holdFirstPush(trunk);
  const a = startProcess(trunk, "a", identityA);
  t.after(() => {
    barrier.release();
    a.child.kill();
  });
  await awaitFile(barrier.arrived);
  const b = await startProcess(trunk, "b", identityB).result;
  assert.equal(b.receipt.ok, true, JSON.stringify(b));
  barrier.release();
  const first = await a.result;
  assert.equal(first.receipt.ok, true, JSON.stringify(first));
  assert.equal(
    first.receipt.publishedSha,
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
  );
  const backlog = (
    await git(
      first.workspace,
      "show",
      "origin/main:.planning/PRODUCT-BACKLOG.md",
    )
  ).stdout;
  assert.deepEqual(takenIdentities(backlog), [identityA, identityB]);
  const log = (await git(first.workspace, "log", "--format=%B", "origin/main"))
    .stdout;
  assert.equal((log.match(/Claim-Publisher: publisher-a/g) ?? []).length, 1);
  assert.equal((log.match(/Claim-Publisher: publisher-b/g) ?? []).length, 1);
});

test("distinct claims also converge when the other execution wins the first push", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const barrier = await holdFirstPush(trunk, "b");
  const b = startProcess(trunk, "b", identityB);
  t.after(() => {
    barrier.release();
    b.child.kill();
  });
  await awaitFile(barrier.arrived);
  const a = await startProcess(trunk, "a", identityA).result;
  assert.equal(a.receipt.ok, true, JSON.stringify(a));
  barrier.release();
  const second = await b.result;
  assert.equal(second.receipt.ok, true, JSON.stringify(second));
  assert.equal(
    second.receipt.publishedSha,
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
  );
  const backlog = (
    await git(
      second.workspace,
      "show",
      "origin/main:.planning/PRODUCT-BACKLOG.md",
    )
  ).stdout;
  assert.deepEqual(takenIdentities(backlog), [identityA, identityB]);
  const log = (await git(second.workspace, "log", "--format=%B", "origin/main"))
    .stdout;
  assert.equal((log.match(/Claim-Publisher: publisher-a/g) ?? []).length, 1);
  assert.equal((log.match(/Claim-Publisher: publisher-b/g) ?? []).length, 1);
});

test("real competing same-story command stops on the first owner's provenance", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const barrier = await holdFirstPush(trunk);
  const a = startProcess(trunk, "a", identityA);
  t.after(() => {
    barrier.release();
    a.child.kill();
  });
  await awaitFile(barrier.arrived);
  const b = await startProcess(trunk, "b", identityA).result;
  assert.equal(b.receipt.ok, true, JSON.stringify(b));
  barrier.release();
  const rival = await a.result;
  assert.equal(rival.receipt.status, "conflict");
  assert.equal(rival.receipt.ownership, "other");
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    b.receipt.publishedSha,
  );
  assert.equal(
    await revParse(rival.workspace, "HEAD"),
    rival.receipt.recovery.candidateSha,
  );
});

test("remote advance replays an owned suffix, but changed selected source stops before replay", async (t) => {
  for (const changedSource of [false, true]) {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const barrier = await holdFirstPush(trunk);
    const a = startProcess(trunk, "a", identityA);
    t.after(() => {
      barrier.release();
      a.child.kill();
    });
    await awaitFile(barrier.arrived);
    if (changedSource) {
      const path = join(trunk.integration, ".planning/seeds/A.md");
      const source = (
        await git(trunk.integration, "show", "HEAD:.planning/seeds/A.md")
      ).stdout;
      writeFileSync(path, source.replace("Execute A.", "Execute changed A."));
      await git(trunk.integration, "add", ".planning/seeds/A.md");
      await git(trunk.integration, "commit", "-m", "change selected source");
      await git(trunk.integration, "push", "origin", "HEAD:refs/heads/main");
    } else {
      await advanceRemote(trunk, "unrelated.txt");
    }
    barrier.release();
    const result = await a.result;
    if (changedSource) {
      assert.equal(result.receipt.status, "source-refused");
      assert.equal(
        await revParse(result.workspace, "HEAD"),
        result.receipt.recovery.candidateSha,
      );
      assert.equal(
        await lsRemoteSha(trunk.origin, "refs/heads/main"),
        await revParse(trunk.integration, "HEAD"),
      );
    } else {
      assert.equal(result.receipt.ok, true, JSON.stringify(result));
      assert.equal(
        result.receipt.publishedSha,
        await lsRemoteSha(trunk.origin, "refs/heads/main"),
      );
    }
  }
});
