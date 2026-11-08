import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { commitsTraced } from "./fixture-observation.mjs";
import {
  integrationDeveloper,
  materializeRepository,
  prepareRepositorySnapshot,
  registerPreparedPrefix,
} from "./repository-fixture.mjs";
import {
  committedOn,
  completedBy,
  gitOutput as read,
  offerSharedHistory,
  sharedHistory,
  snapshotDirectory,
  snapshotPreparedByRun,
  traceGit,
} from "./repository-snapshot-fixture.mjs";

test("two requests with different completions copy the run's prepared history once and each commits only its own completion, matching a full build commit for commit", async (t) => {
  const snapshot = await snapshotPreparedByRun(t, sharedHistory().please());
  const requests = offerSharedHistory(t, async () => snapshot);
  const trace = traceGit(t);
  const [first, second] = await Promise.all([
    materializeRepository(completedBy("first", 3)),
    materializeRepository(completedBy("second", 4)),
  ]);
  t.after(first.cleanup);
  t.after(second.cleanup);
  const commitsMade = commitsTraced(trace);
  // A full build of the first description, commit for commit.
  const control = snapshotDirectory(t);
  await prepareRepositorySnapshot(control, completedBy("first", 3));
  const fullBuild = JSON.parse(readFileSync(join(control, "snapshot.json")));

  assert.equal(commitsMade, 2);
  assert.deepEqual(requests, [snapshot, snapshot]);
  assert.deepEqual(first.revisions, fullBuild.revisions);
  assert.equal(first.trunkSha, fullBuild.trunkSha);
  assert.equal(second.revisions.taken, first.revisions.taken);
  assert.notEqual(second.revisions.completed, first.revisions.completed);
  for (const [copy, who, day] of [
    [first, "first", 3],
    [second, "second", 4],
  ]) {
    assert.equal(
      await read(copy.origin, "rev-parse", "main"),
      copy.revisions.completed,
    );
    assert.equal(
      await read(copy.origin, "rev-parse", "main^"),
      copy.revisions.taken,
    );
    assert.equal(
      await read(copy.origin, "for-each-ref", "--format=%(refname)"),
      "refs/heads/main",
    );
    assert.equal(await read(copy.origin, "show", "main:done.txt"), who);
    assert.equal(
      await read(copy.origin, "log", "-1", "--format=%s|%cn|%ct", "main"),
      `complete for ${who}|${integrationDeveloper.name}|${String(Date.parse(committedOn(day).date) / 1000)}`,
    );
    assert.equal(
      await read(copy.integration, "rev-parse", "HEAD"),
      copy.revisions.completed,
    );
    assert.equal(await read(copy.integration, "status", "--porcelain"), "");
    assert.equal(
      await read(copy.integration, "config", "--get", "remote.origin.url"),
      copy.origin,
    );
  }
});

test("a request without a run owner, or with other facts than the shared history, is built from scratch", async (t) => {
  const requests = offerSharedHistory(t, async () => undefined);
  const trace = traceGit(t);
  const ownerless = await materializeRepository(completedBy("ownerless", 6));
  t.after(ownerless.cleanup);
  assert.equal(commitsTraced(trace), 3);
  assert.deepEqual(requests, [undefined]);
  assert.equal(
    await read(ownerless.origin, "rev-list", "--count", "main"),
    "3",
  );
  assert.equal(
    await read(ownerless.origin, "rev-parse", "main"),
    ownerless.revisions.completed,
  );

  const otherFacts = await materializeRepository(
    sharedHistory()
      .withTrunkBranch("trunk")
      .withRevision("completed", { files: { "done.txt": "other\n" } })
      .please(),
  );
  t.after(otherFacts.cleanup);
  assert.equal(commitsTraced(trace), 6);
  assert.deepEqual(requests, [undefined]);
  assert.equal(
    await read(otherFacts.origin, "rev-parse", "trunk"),
    otherFacts.revisions.completed,
  );
});

test("a failed or incomplete run preparation reaches its callers as the setup failure, and a fresh preparation builds the history again", async (t) => {
  const failing = snapshotDirectory(t);
  // The owner's build breaks after its first revision and, as the run owner
  // does, removes what it built; every caller gets that failure.
  const preparation = prepareRepositorySnapshot(
    failing,
    sharedHistory()
      .withRevision("broken", { files: { "../outside.txt": "escapes\n" } })
      .please(),
  ).catch((error) => {
    rmSync(failing, { recursive: true, force: true });
    throw error;
  });
  const withdrawFailing = registerPreparedPrefix({
    description: sharedHistory().please(),
    locate: () => preparation.then(() => failing),
  });
  const description = completedBy("retried", 7);
  await assert.rejects(materializeRepository(description), {
    message: /Repository fixture path leaves its checkout/,
  });
  await assert.rejects(materializeRepository(description), {
    message: /Repository fixture path leaves its checkout/,
  });
  assert.equal(existsSync(failing), false);
  withdrawFailing();

  const incomplete = snapshotDirectory(t);
  const withdrawIncomplete = registerPreparedPrefix({
    description: sharedHistory().please(),
    locate: async () => incomplete,
  });
  await assert.rejects(materializeRepository(description), {
    message: /is incomplete: snapshot\.json is missing/,
  });
  withdrawIncomplete();

  const snapshot = await snapshotPreparedByRun(t, sharedHistory().please());
  offerSharedHistory(t, async () => snapshot);
  const built = await materializeRepository(description);
  t.after(built.cleanup);
  assert.equal(
    await read(built.origin, "rev-parse", "main"),
    built.revisions.completed,
  );
  assert.equal(
    await read(built.origin, "rev-parse", "main^"),
    built.revisions.taken,
  );
  assert.equal(await read(built.origin, "show", "main:done.txt"), "retried");
});
