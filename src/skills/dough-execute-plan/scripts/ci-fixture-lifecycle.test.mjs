import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { completingFixture } from "./ci-codex-lifecycle-test-fixtures.mjs";
import { createCustomBridgeFixture } from "./ci-custom-bridge-test-fixtures.mjs";
import {
  blockingGithubEnvironment,
  waitForFile,
  waitForPidExit,
} from "./watch-ci-test-fixtures.mjs";
import { waitForFixtureRelease } from "./ci-process-lifetime-test-fixtures.mjs";
import {
  deferChildExit,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { awaitProcessExit } from "./process-lifetime-test-fixtures.mjs";

test(
  "stream fixture completes even when filesystem watch notifications are lost",
  { timeout: 5000 },
  async (t) => {
    const root = mkdtempSync(join(tmpdir(), "ci-fixture-notifications-"));
    const teardown = fixtureTeardown(root);
    t.after(teardown.cleanup);
    const shim =
      "import fs from 'node:fs'; import {syncBuiltinESMExports} from 'node:module'; const watch=fs.watch; fs.watch=(path)=>watch(path,()=>{}); syncBuiltinESMExports();";
    const child = spawn(
      process.execPath,
      ["--import", `data:text/javascript,${shim}`, completingFixture, root],
      {
        env: { ...process.env, DOUGH_CI_MAILBOX_ROOT: root, TMPDIR: root },
      },
    );
    deferChildExit(teardown, child, "SIGKILL");
    const closed = once(child, "close");
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    // The fixture announces this only after its first check for the release,
    // so the release below can only be found by the later polling.
    await waitForFile(join(root, "first-failure-recorded"));
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
        let root, command, env, ready, teardown;
        if (kind === "github") {
          ({ env, teardown } = blockingGithubEnvironment(t));
          root = env.CI_TEST_ROOT;
          command = [join(root, "bin/gh")];
          ready = join(root, "github-request-started");
        } else {
          const fixture = await createCustomBridgeFixture();
          root = fixture.fixture;
          command = [join(root, "adapter.mjs")];
          env = fixture.env;
          ready = fixture.calls;
          teardown = fixtureTeardown(root);
          t.after(teardown.cleanup);
        }
        const parent = spawn(
          process.execPath,
          [
            "-e",
            `
        const { spawn } = require('node:child_process');
        const child = spawn(process.execPath, ${JSON.stringify(command)}, { stdio: ['pipe', 'ignore', 'ignore'] });
        child.stdin.end(JSON.stringify({ operation: 'discover' }));
        // Raw write: console.log colors numbers when FORCE_COLOR is set.
        process.stdout.write(child.pid + '\\n');
        setInterval(() => {}, 1000);
      `,
          ],
          { env },
        );
        deferChildExit(teardown, parent, "SIGKILL");
        const [chunk] = await once(parent.stdout, "data");
        const pid = Number(String(chunk).trim());
        teardown.defer(async () => {
          try {
            process.kill(pid, "SIGKILL");
          } catch (error) {
            if (error.code !== "ESRCH") throw error;
          }
          await awaitProcessExit(pid);
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
