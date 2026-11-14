// The `deliver` target each execution mode accepts: a Story Branch increment
// reaches only its execution branch unless it declares a one-shot landing,
// and the command names its mode and a branch-ref target.
import assert from "node:assert/strict";
import { test } from "node:test";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  createManagedFixture,
  watchCount,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const storyTarget = "refs/heads/exec/story";

test("a Story Branch increment aimed at trunk is refused before anything is fetched, pushed, or observed", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  for (const tracking of [undefined, "queued"]) {
    const { delivered, code } = await deliverThroughCli(fixture, {
      base: fixture.trunkSha,
      mode: "story-branch",
      tracking,
    });

    assert.equal(code, 1, JSON.stringify(delivered));
    assert.equal(delivered.ok, false);
    assert.equal(delivered.publication, "refused");
    assert.match(delivered.error, new RegExp(storyTarget));
    assert.match(delivered.error, /--tracking one-shot/);
    assert.equal(delivered.observation?.directory, undefined);
  }
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );
  assert.equal(await lsRemoteSha(fixture.origin, storyTarget), "");
  assert.equal(watchCount(fixture.storage), 0);
});

test("deliver names its mode and a branch-ref target", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const unnamed = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    mode: null,
  });
  assert.equal(unnamed.code, 2);
  assert.equal(unnamed.delivered, null);
  for (const usage of [
    "--mode trunk|story-branch",
    "--target-ref refs/heads/<branch>",
    "[--tracking one-shot]",
  ]) {
    assert.ok(unnamed.stderr.includes(usage), unnamed.stderr);
  }

  const unknown = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    mode: "feature",
  });
  assert.equal(unknown.code, 2, unknown.stdout);
  assert.ok(unknown.stderr.includes("--mode trunk|story-branch"));

  const bare = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    targetRef: "main",
  });
  assert.equal(bare.code, 2, bare.stdout);
  assert.match(bare.stderr, /authorized target must be a branch ref/);

  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );
  assert.equal(watchCount(fixture.storage), 0);
});
