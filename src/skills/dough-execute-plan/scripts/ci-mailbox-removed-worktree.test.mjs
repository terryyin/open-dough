import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { installedCheckouts } from "./ci-installed-checkouts-test-fixtures.mjs";
import {
  awaitWorkerSignal,
  deferObserverStop,
} from "./watch-ci-test-fixtures.mjs";

const exec = promisify(execFile);
const receiptOf = ({ stdout }) =>
  JSON.parse(stdout.slice("CI_OBSERVER ".length));

test("stop from the default checkout reaches an observer armed from a removed worktree", async (t) => {
  const { fixture, teardown, checkout, worktree, unrelated, launchers, env } =
    await installedCheckouts(t, "ci-mailbox-removed-worktree-");
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
  await exec("git", ["worktree", "remove", "--force", worktree], {
    cwd: checkout,
  });
  assert.equal(existsSync(worktree), false);

  const stop = (mailbox) =>
    exec(process.execPath, [launchers.checkout, "stop", mailbox], {
      cwd: checkout,
      env,
    });
  assert.deepEqual(receiptOf(await stop(directory)), {
    directory,
    terminal: {
      status: "stopped",
      coverage: { state: "ended", pendingCi: "unobserved" },
      evidence: { recordedThrough: 0, deliveredThrough: 0, unread: 0 },
    },
  });

  const { directory: foreign } = receiptOf(
    await exec(process.execPath, [launchers.unrelated, "probe"], {
      cwd: unrelated,
      env,
    }),
  );
  await assert.rejects(stop(foreign), /CI mailbox belongs to another checkout/);
  rmSync(unrelated, { recursive: true });
  await assert.rejects(stop(foreign), /CI mailbox belongs to another checkout/);
  assert.equal(existsSync(join(foreign, "stop")), false);
});
