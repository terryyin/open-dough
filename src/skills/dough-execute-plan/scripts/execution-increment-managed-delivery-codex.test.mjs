// Codex managed delivery: the yielded stream the coordinator armed at
// execution start is the observer every delivery reuses. Without a live
// stream, delivery keeps publication and names arming that stream.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";
import { createCodexReplay } from "./ci-codex-lifecycle-test-fixtures.mjs";
import {
  createManagedFixture,
  git,
  watchCount,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";

// The installed stream command a Codex coordinator runs in its yielded cell.
function codexStream(fixture) {
  return createCodexReplay(fixture.teardown, fixture.env, {
    command: [
      join(fixture.skill, "scripts/ci-mailbox.mjs"),
      "stream",
      "--execution",
      "owner/project",
      "main",
      "60000",
    ],
  });
}

async function commitIncrement(fixture, name) {
  writeFileSync(join(fixture.execution, name), `${name}\n`);
  await git(fixture.execution, "add", name);
  await git(fixture.execution, "commit", "-m", `verified ${name}`);
}

const shas = (directory) =>
  readRevisionCoverage(directory).map(({ sha }) => sha);

test("a Codex coordinator's start-time stream is the observer its increment and repair deliveries reuse", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const stream = codexStream(fixture);
  const { directory } = await stream.setup();

  const increment = await deliverThroughCli(fixture, {
    host: "codex",
    base: fixture.trunkSha,
  });
  assert.equal(increment.code, 0);
  assert.equal(increment.delivered.publication, "accepted");
  assert.equal(increment.delivered.observation.state, "reused");
  assert.equal(increment.delivered.observation.directory, directory);
  assert.equal(increment.delivered.startReceipt, null);

  await commitIncrement(fixture, "repair.txt");
  const repair = await deliverThroughCli(fixture, {
    host: "codex",
    base: increment.delivered.receipt.sha,
  });
  assert.equal(repair.delivered.publication, "accepted");
  assert.equal(repair.delivered.observation.state, "reused");
  assert.equal(repair.delivered.observation.directory, directory);

  assert.deepEqual(
    shas(directory).sort(),
    [
      increment.delivered.receipt.sha.toLowerCase(),
      repair.delivered.receipt.sha.toLowerCase(),
    ].sort(),
  );
  assert.equal(stream.launches(), 1);
  assert.equal(watchCount(fixture.storage), 1);
});

test("a Codex delivery without a live stream keeps publication and names arming the yielded stream; the next delivery after arming reuses it", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const unarmed = await deliverThroughCli(fixture, {
    host: "codex",
    base: fixture.trunkSha,
  });
  assert.equal(unarmed.delivered.publication, "accepted");
  assert.equal(unarmed.delivered.observation.state, "unobserved");
  assert.match(
    unarmed.delivered.observation.reason,
    /ci-mailbox\.mjs stream --execution owner\/project main/,
  );
  assert.match(unarmed.delivered.observation.reason, /ci-notify-codex\.md/);
  assert.equal(existsSync(fixture.storage), false);

  const stream = codexStream(fixture);
  const { directory } = await stream.setup();
  await commitIncrement(fixture, "after-arming.txt");
  const armed = await deliverThroughCli(fixture, {
    host: "codex",
    base: unarmed.delivered.receipt.sha,
  });
  assert.equal(armed.delivered.publication, "accepted");
  assert.equal(armed.delivered.observation.state, "reused");
  assert.equal(armed.delivered.observation.directory, directory);
  assert.deepEqual(shas(directory), [
    armed.delivered.receipt.sha.toLowerCase(),
  ]);
  assert.equal(watchCount(fixture.storage), 1);
});

test("deliver rejects --codex-bridge-available as an unknown flag", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  for (const extra of [
    ["--codex-bridge-available"],
    ["--codex-bridge-available", "--authority", "publish"],
  ]) {
    const result = await deliverThroughCli(fixture, {
      host: "codex",
      base: fixture.trunkSha,
      extra,
    });
    assert.equal(result.code, 2);
    assert.equal(result.delivered, null);
    assert.match(result.stderr, /invalid argument --codex-bridge-available/);
  }
  assert.equal(
    await lsRemoteSha(fixture.origin, "refs/heads/main"),
    fixture.trunkSha,
  );
  assert.equal(existsSync(fixture.storage), false);
});
