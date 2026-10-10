// Codex managed delivery: the yielded stream the coordinator armed at
// execution start and retained is the observer every delivery registers on.
// Without it, delivery keeps publication and names arming that stream.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  createManagedFixture,
  git,
  watchCount,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  installedStream,
  retained,
} from "./execution-increment-managed-delivery-codex-test-fixtures.mjs";

const coordinator = "coordinator";

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
  const stream = installedStream(fixture, { coordinator });
  const { directory } = await stream.setup();

  const increment = await deliverThroughCli(fixture, {
    host: "codex",
    base: fixture.trunkSha,
    extra: retained(coordinator, directory),
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
    extra: retained(coordinator, directory),
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

test("a Codex delivery before any stream is armed keeps publication and names arming the yielded stream; the next delivery with the armed stream's receipt reuses it", async (t) => {
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
    /ci-mailbox\.mjs stream --execution owner\/project main --coordinator <value>/,
  );
  assert.match(unarmed.delivered.observation.reason, /ci-notify-codex\.md/);
  assert.equal(existsSync(fixture.storage), false);

  const stream = installedStream(fixture, { coordinator });
  const { directory } = await stream.setup();
  await commitIncrement(fixture, "after-arming.txt");
  const armed = await deliverThroughCli(fixture, {
    host: "codex",
    base: unarmed.delivered.receipt.sha,
    extra: retained(coordinator, directory),
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

test("stream refuses --coordinator without a value and arms nothing", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  for (const tail of [["--coordinator"], ["--coordinator", "--other"]]) {
    const result = await promisify(execFile)(
      process.execPath,
      [
        join(fixture.skill, "scripts/ci-mailbox.mjs"),
        "stream",
        "--execution",
        "owner/project",
        "main",
        ...tail,
      ],
      { env: fixture.env },
    ).catch((error) => error);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /Expected --coordinator VALUE/);
  }
  assert.equal(watchCount(fixture.storage), 0);
});
