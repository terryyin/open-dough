// Git mechanics (not guidance-following), not proof an agent follows guidance.
// Preservation keeps the execution worktree and branch usable.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  publishTrunkClosureRevision,
  removeExecutionResources,
} from "./closure-publication.mjs";
import {
  commitFile,
  createCleanTrunkFixture,
  createClosureObserver,
  executionBranch,
  git,
  lsRemoteSha,
  publishArgs,
  publishCompletedIncrement,
  revParse,
  trunkTarget,
} from "./closure-publication-fixtures.mjs";

test("preservation keeps a dirty checkout, another workspace, unpublished work, and an active observer usable", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const increment = await publishCompletedIncrement(fixture);
  const observer = createClosureObserver(execution);
  await commitFile(
    execution,
    "before-cleanup.txt",
    "before cleanup\n",
    "before-cleanup closure",
  );
  const beforePublished = await publishTrunkClosureRevision(
    publishArgs(fixture, observer, increment.receipt.sha),
  );
  await commitFile(
    execution,
    "final-closure.txt",
    "final closure\n",
    "final-closure",
  );
  const finalPublished = await publishTrunkClosureRevision(
    publishArgs(fixture, observer, beforePublished.receipt.sha),
  );
  const closureShas = [beforePublished.receipt.sha, finalPublished.receipt.sha];
  const other = join(fixture.fixture, "other");
  await git(integration, "worktree", "add", "-b", "other/task", other, "HEAD");
  writeFileSync(join(other, "other.txt"), "other workspace\n");

  const resources = {
    integration,
    execution,
    branch: executionBranch,
    observer,
    sessionOwned: true,
    closureShas,
  };
  const active = await removeExecutionResources(resources);
  assert.equal(active.reason, "active checkout-bound observer");
  assert.equal(await revParse(execution, "HEAD"), finalPublished.receipt.sha);
  assert.equal((await git(execution, "status", "--porcelain")).stdout, "");
  assert.equal(
    readFileSync(join(other, "other.txt"), "utf8"),
    "other workspace\n",
  );

  observer.stop();
  const another = await removeExecutionResources({
    ...resources,
    sessionOwned: false,
  });
  assert.equal(another.reason, "another workspace");
  assert.equal(existsSync(execution), true);
  assert.equal(
    await revParse(execution, executionBranch),
    finalPublished.receipt.sha,
  );
  assert.equal(
    (await git(other, "branch", "--show-current")).stdout.trim(),
    "other/task",
  );

  writeFileSync(join(execution, "dirty.txt"), "dirty checkout\n");
  const dirty = await removeExecutionResources(resources);
  assert.equal(dirty.reason, "dirty checkout");
  assert.equal(
    readFileSync(join(execution, "dirty.txt"), "utf8"),
    "dirty checkout\n",
  );
  assert.equal(await revParse(execution, "HEAD"), finalPublished.receipt.sha);
  assert.equal(existsSync(execution), true);

  const unpublished = await commitFile(
    execution,
    "dirty.txt",
    "dirty checkout\n",
    "unique local work",
  );
  const kept = await removeExecutionResources(resources);
  assert.equal(kept.reason, "unique unpublished work");
  assert.equal(await revParse(execution, "HEAD"), unpublished);
  assert.equal(
    (await git(execution, "show", "HEAD:dirty.txt")).stdout,
    "dirty checkout\n",
  );
  assert.equal(existsSync(execution), true);
  assert.equal(
    await revParse(integration, "refs/heads/other/task"),
    await revParse(other, "HEAD"),
  );
  assert.equal(
    await lsRemoteSha(origin, trunkTarget),
    finalPublished.receipt.sha,
  );
  assert.equal(await lsRemoteSha(origin, `refs/heads/${executionBranch}`), "");
  assert.equal(
    readFileSync(join(other, "other.txt"), "utf8"),
    "other workspace\n",
  );
});
