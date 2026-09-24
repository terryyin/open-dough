import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { setTimeout as pause } from "node:timers/promises";
import { completingFixture } from "./ci-codex-lifecycle-test-fixtures.mjs";
import { createCustomBridgeFixture } from "./ci-custom-bridge-test-fixtures.mjs";
import {
  blockingGithubEnvironment,
  waitForFile,
  waitForPidExit,
} from "./watch-ci-test-fixtures.mjs";
import { waitForFixtureRelease } from "./ci-process-lifetime-test-fixtures.mjs";

test(
  "stream fixture completes even when filesystem watch notifications are lost",
  { timeout: 5000 },
  async (t) => {
    const root = mkdtempSync(join(tmpdir(), "ci-fixture-notifications-"));
    const shim =
      "import fs from 'node:fs'; import {syncBuiltinESMExports} from 'node:module'; const watch=fs.watch; fs.watch=(path)=>watch(path,()=>{}); syncBuiltinESMExports();";
    const child = spawn(
      process.execPath,
      ["--import", `data:text/javascript,${shim}`, completingFixture, root],
      {
        env: { ...process.env, DOUGH_CI_MAILBOX_ROOT: root, TMPDIR: root },
      },
    );
    t.after(() => {
      child.kill("SIGKILL");
      rmSync(root, { recursive: true, force: true });
    });
    const closed = once(child, "close");
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    await waitForFile(join(root, "first-failure-recorded"));
    // Publish after watch registration/recheck, exercising a missed notification.
    await pause(100);
    writeFileSync(join(root, "release-second-failure"), "");
    assert.equal((await closed)[0], 0);
    assert.equal(output.split("CI_FAILURE").length - 1, 2);
  },
);

for (const kind of ["github", "adapter"]) {
  for (const loss of ["parent", "directory"]) {
    test(
      `${kind} fixture exits after losing its ${loss}`,
      { timeout: 10000 },
      async (t) => {
        let root, command, env, ready;
        if (kind === "github") {
          env = blockingGithubEnvironment(t);
          root = env.CI_TEST_ROOT;
          command = [join(root, "bin/gh")];
          ready = join(root, "github-request-started");
        } else {
          const fixture = await createCustomBridgeFixture();
          root = fixture.fixture;
          command = [join(root, "adapter.mjs")];
          env = fixture.env;
          ready = fixture.calls;
          t.after(fixture.cleanup);
        }
        const parent = spawn(
          process.execPath,
          [
            "-e",
            `
        const { spawn } = require('node:child_process');
        const child = spawn(process.execPath, ${JSON.stringify(command)}, { stdio: ['pipe', 'ignore', 'ignore'] });
        child.stdin.end(JSON.stringify({ operation: 'discover' }));
        console.log(child.pid);
        setInterval(() => {}, 1000);
      `,
          ],
          { env },
        );
        const [chunk] = await once(parent.stdout, "data");
        const pid = Number(String(chunk).trim());
        t.after(() => {
          parent.kill("SIGKILL");
          try {
            process.kill(pid, "SIGKILL");
          } catch (error) {
            if (error.code !== "ESRCH") throw error;
          }
        });
        await waitForFile(ready);
        if (loss === "parent") parent.kill("SIGKILL");
        else rmSync(root, { recursive: true, force: true });
        assert.equal(
          await waitForPidExit(pid),
          true,
          "disposable command must not become an orphan",
        );
      },
    );
  }
}

test("a missing fixture release fails within its deadline", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ci-fixture-deadline-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  await assert.rejects(
    waitForFixtureRelease(join(root, "missing"), { timeoutMs: 40 }),
    /Missing fixture release/,
  );
});
