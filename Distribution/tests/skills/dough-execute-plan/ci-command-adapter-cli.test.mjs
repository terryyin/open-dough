import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import {
  callsReached,
  projectFixture,
} from "./ci-command-adapter-test-fixtures.mjs";
import { deployMailboxEntrypoint } from "./ci-installed-checkouts-test-fixtures.mjs";
import {
  awaitSignalWhileRunning,
  settledProbe,
} from "./process-lifetime-test-fixtures.mjs";

// Runs the installed stream until the provider receives its first call.
async function observeProvider(fixture, calls) {
  const entry = deployMailboxEntrypoint(fixture.root);
  const child = spawn(
    process.execPath,
    [entry, "stream", "--execution", "owner/project", "feature/custom"],
    {
      cwd: fixture.root,
      env: {
        ...fixture.env,
        DOUGH_CI_MAILBOX_ROOT: join(fixture.root, "mailboxes"),
      },
    },
  );
  const stdout = [];
  const stderr = [];
  child.stdout.on("data", (chunk) => stdout.push(chunk));
  child.stderr.on("data", (chunk) => stderr.push(chunk));
  const closed = once(child, "close");
  try {
    await awaitSignalWhileRunning(
      () => callsReached(calls, 1),
      settledProbe(closed),
      () =>
        `observer exited before ${calls} recorded a call: ${Buffer.concat(stderr)}`,
    );
  } finally {
    child.kill("SIGTERM");
  }
  const [code] = await closed;
  assert.equal(code, 0, Buffer.concat(stderr).toString());
  const output = Buffer.concat(stdout).toString();
  assert.match(output, /^CI_OBSERVER /);
  assert.match(output, /^CI_OBSERVER_RESULT .*"status":"stopped"/m);
}

test("normal observer CLI selects the configured command", async (t) => {
  const fixture = projectFixture(t, (adapter) =>
    makeMe.projectCiSettings
      .with({ ciAdapter: [process.execPath, adapter] })
      .please(),
  );
  await observeProvider(fixture, fixture.calls);

  assert.equal(existsSync(fixture.ghCalls), false);
  assert.deepEqual(JSON.parse(readFileSync(fixture.requests, "utf8")), {
    operation: "discover",
    check: { repo: "owner/project", branch: "feature/custom" },
  });
});

for (const [name, configuration] of [
  ["absent", null],
  ["empty", () => makeMe.projectCiSettings.with({ ciAdapter: [] }).please()],
]) {
  test(`${name} ciAdapter retains GitHub discovery`, async (t) => {
    const fixture = projectFixture(t, configuration);
    await observeProvider(fixture, fixture.ghCalls);

    assert.ok(Number(readFileSync(fixture.ghCalls, "utf8")) >= 1);
    assert.equal(existsSync(fixture.calls), false);
  });
}
