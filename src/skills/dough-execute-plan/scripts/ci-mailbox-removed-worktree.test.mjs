import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  deployRuntime,
  installedCheckouts,
} from "./ci-installed-checkouts-test-fixtures.mjs";
import {
  awaitWorkerSignal,
  deferObserverStop,
} from "./watch-ci-test-fixtures.mjs";

const exec = promisify(execFile);
const receiptOf = ({ stdout }) =>
  JSON.parse(stdout.slice("CI_OBSERVER ".length));
const refused = /CI mailbox belongs to another checkout/;

// One repository's default checkout and an observer armed from its linked
// worktree, which is still present. `stop(mailbox, from)` runs the installed
// `stop` of the checkout named `from`, the default one when omitted, and
// `stopped` is the receipt of a confirmed stop of the observer.
async function armedFromWorktree(t) {
  const checkouts = await installedCheckouts(t, "ci-mailbox-removed-worktree-");
  const { fixture, teardown, checkout, worktree, launchers, env } = checkouts;
  const { directory } = receiptOf(
    await exec(
      process.execPath,
      [
        launchers.worktree,
        "start",
        "--execution",
        "owner/repo",
        "main",
        "60000",
      ],
      { cwd: worktree, env },
    ),
  );
  deferObserverStop(teardown, {
    launcher: launchers.checkout,
    directory,
    cwd: checkout,
    env,
  });
  await awaitWorkerSignal(directory, join(fixture, "github-request-started"));
  return {
    ...checkouts,
    directory,
    stop: (mailbox, from = "checkout") =>
      exec(process.execPath, [launchers[from], "stop", mailbox], {
        cwd: checkouts[from],
        env,
      }),
    stopped: {
      directory,
      terminal: {
        status: "stopped",
        coverage: { state: "ended", pendingCi: "unobserved" },
        evidence: { recordedThrough: 0, deliveredThrough: 0, unread: 0 },
      },
    },
  };
}

// The same, after the arming worktree was removed.
async function armedFromRemovedWorktree(t) {
  const armed = await armedFromWorktree(t);
  await exec("git", ["worktree", "remove", "--force", armed.worktree], {
    cwd: armed.checkout,
  });
  assert.equal(existsSync(armed.worktree), false);
  return armed;
}

test("stop from the default checkout reaches an observer armed from a removed worktree", async (t) => {
  const { unrelated, launchers, env, directory, stop, stopped } =
    await armedFromRemovedWorktree(t);
  assert.deepEqual(receiptOf(await stop(directory)), stopped);

  const { directory: foreign } = receiptOf(
    await exec(process.execPath, [launchers.unrelated, "probe"], {
      cwd: unrelated,
      env,
    }),
  );
  await assert.rejects(stop(foreign), refused);
  rmSync(unrelated, { recursive: true });
  await assert.rejects(stop(foreign), refused);
  assert.equal(existsSync(join(foreign, "stop")), false);
});

test("stop still reaches the observer after the removed worktree's path is recreated empty", async (t) => {
  const { worktree, directory, stop, stopped } =
    await armedFromRemovedWorktree(t);
  mkdirSync(worktree);

  assert.deepEqual(receiptOf(await stop(directory)), stopped);
});

test("a different repository created at the removed worktree's path is refused the observer its predecessor armed", async (t) => {
  const { worktree, directory, stop, stopped } =
    await armedFromRemovedWorktree(t);
  mkdirSync(worktree);
  await exec("git", ["init", "-b", "main"], { cwd: worktree });
  deployRuntime(worktree);

  await assert.rejects(stop(directory, "worktree"), refused);
  assert.equal(existsSync(join(directory, "stop")), false);
  assert.deepEqual(receiptOf(await stop(directory)), stopped);
});

test("a mailbox without a recorded identity is read through its arming checkout", async (t) => {
  const { directory, stop, stopped } = await armedFromWorktree(t);
  const file = join(directory, "request.json");
  const { identity, ...request } = JSON.parse(readFileSync(file, "utf8"));
  assert.equal(typeof identity, "string");
  writeFileSync(`${file}.next`, JSON.stringify(request), { mode: 0o600 });
  renameSync(`${file}.next`, file);

  await assert.rejects(stop(directory, "unrelated"), refused);
  assert.equal(existsSync(join(directory, "stop")), false);
  assert.deepEqual(receiptOf(await stop(directory)), stopped);
});
