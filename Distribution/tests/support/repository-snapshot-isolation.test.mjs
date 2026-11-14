import assert from "node:assert/strict";
import { existsSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { fixtureFiles } from "./fixture-observation.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
import {
  completedBy,
  gitOutput as read,
  offerSharedHistory,
  sharedHistory,
  snapshotPreparedByRun,
} from "./repository-snapshot-fixture.mjs";

test("a copy of the shared history keeps its own refs, config, index and files when its peer writes or is removed, and outlives the snapshot", async (t) => {
  const snapshot = await snapshotPreparedByRun(t, sharedHistory().please());
  offerSharedHistory(t, async () => snapshot);
  const description = completedBy("peer", 5);
  const first = await materializeRepository(description);
  t.after(first.cleanup);
  const second = await materializeRepository(description);
  t.after(second.cleanup);
  const pristine = fixtureFiles(second.fixture);
  const [looseObject] = fixtureFiles(join(snapshot, "remote.git", "objects"))
    .map(([file]) => join("remote.git", "objects", file))
    .filter((file) => !file.includes("/info/") && !file.includes("/pack/"));
  assert(looseObject);
  for (const copy of [first, second])
    assert.notEqual(
      statSync(join(copy.fixture, looseObject)).ino,
      statSync(join(snapshot, looseObject)).ino,
    );

  await git(first.integration, "commit", "--allow-empty", "-m", "advance");
  await git(first.integration, "push", "--quiet", "origin", "main");
  await git(first.integration, "config", "test.private", "first");
  await git(first.origin, "config", "test.private", "first");
  writeFileSync(join(first.integration, "scratch.txt"), "staged\n");
  await git(first.integration, "add", "scratch.txt");

  assert.deepEqual(fixtureFiles(second.fixture), pristine);
  assert.equal(
    await read(second.origin, "rev-parse", "main"),
    second.revisions.completed,
  );
  await assert.rejects(
    git(second.integration, "config", "--get", "test.private"),
    { code: 1 },
  );
  // Reading the status refreshes the index it reads; compare later copies
  // with the files from here on.
  assert.equal(await read(second.integration, "status", "--porcelain"), "");
  const secondAsRead = fixtureFiles(second.fixture);
  const later = await materializeRepository(description);
  t.after(later.cleanup);
  assert.deepEqual(later.revisions, second.revisions);
  assert.equal(existsSync(join(later.integration, "scratch.txt")), false);
  assert.equal(
    await read(later.origin, "rev-parse", "main"),
    later.revisions.completed,
  );

  await first.cleanup();
  assert.equal(existsSync(first.fixture), false);
  assert.deepEqual(fixtureFiles(second.fixture), secondAsRead);

  rmSync(snapshot, { recursive: true, force: true });
  for (const copy of [second, later]) {
    await git(copy.origin, "fsck", "--full");
    await git(copy.integration, "fsck", "--full");
    assert.equal(
      await read(copy.integration, "cat-file", "-t", "HEAD^{commit}"),
      "commit",
    );
  }
  await git(
    later.integration,
    "commit",
    "--allow-empty",
    "-m",
    "after the snapshot",
  );
  await git(later.integration, "push", "--quiet", "origin", "main");
  assert.equal(
    await read(later.origin, "rev-parse", "main^"),
    later.revisions.completed,
  );
});
