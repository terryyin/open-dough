import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  callsReached,
  projectFixture,
} from "./ci-command-adapter-test-fixtures.mjs";
import {
  awaitSignalWhileRunning,
  settledProbe,
} from "./process-lifetime-test-fixtures.mjs";

const observer = fileURLToPath(new URL("./watch-ci.mjs", import.meta.url));

// Runs the observer CLI until `path` counts `count` calls, then stops it and
// returns its stdout; the observer runs with a 60 s execution budget.
async function runObserverUntil(path, count, fixture, entry = observer) {
  const child = spawn(
    process.execPath,
    [entry, "--execution", "owner/project", "feature/custom", "60000"],
    {
      cwd: fixture.root,
      env: {
        ...process.env,
        PATH: `${fixture.bin}:${process.env.PATH}`,
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
      () => callsReached(path, count),
      settledProbe(closed),
      () =>
        `observer exited (code ${child.exitCode ?? child.signalCode}) before ${path} reached ${count} calls: ${Buffer.concat(stderr)}`,
    );
  } finally {
    child.kill("SIGTERM");
  }
  const [code] = await closed;
  assert.equal(code, 0, Buffer.concat(stderr).toString());
  return Buffer.concat(stdout).toString();
}

test("normal observer CLI selects the configured command", async (t) => {
  const fixture = projectFixture(t, (adapter) => ({
    ciAdapter: [process.execPath, adapter],
  }));
  const stdout = await runObserverUntil(fixture.calls, 1, fixture);

  assert.equal(stdout, "");
  assert.equal(existsSync(fixture.ghCalls), false);
  assert.deepEqual(JSON.parse(readFileSync(fixture.requests, "utf8")), {
    operation: "discover",
    check: { repo: "owner/project", branch: "feature/custom" },
  });
});

test("a symlink-equivalent entry path still selects the configured command", async (t) => {
  const fixture = projectFixture(t, (adapter) => ({
    ciAdapter: [process.execPath, adapter],
  }));
  const linkDir = mkdtempSync(join(tmpdir(), "ci-command-adapter-symlink-"));
  const entry = join(linkDir, "watch-ci-entry.mjs");
  symlinkSync(observer, entry);
  t.after(() => rmSync(linkDir, { recursive: true, force: true }));

  const stdout = await runObserverUntil(fixture.calls, 1, fixture, entry);

  assert.equal(stdout, "");
  assert.equal(existsSync(fixture.ghCalls), false);
  assert.deepEqual(JSON.parse(readFileSync(fixture.requests, "utf8")), {
    operation: "discover",
    check: { repo: "owner/project", branch: "feature/custom" },
  });
});

for (const [name, configuration] of [
  ["absent", null],
  ["empty", () => ({ ciAdapter: [] })],
]) {
  test(`${name} ciAdapter retains GitHub discovery`, async (t) => {
    const fixture = projectFixture(t, configuration);
    const stdout = await runObserverUntil(fixture.ghCalls, 1, fixture);

    assert.equal(stdout, "");
    assert.ok(Number(readFileSync(fixture.ghCalls, "utf8")) >= 1);
    assert.equal(existsSync(fixture.calls), false);
  });
}
