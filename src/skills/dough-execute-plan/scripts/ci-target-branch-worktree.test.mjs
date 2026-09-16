import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { diagnosticExcerptBytes } from "./ci-command-adapter.mjs";
import {
  createTargetBranchWorktreeFixture,
  deliverHostHook,
  deliveryContext,
  hookInput,
  observerReceipt,
  waitFor,
} from "./ci-target-branch-worktree-test-fixtures.mjs";

const exec = promisify(execFile);

test("worktree launch observes target-branch final SHA and ignores old coverage", async (t) => {
  const fixture = await createTargetBranchWorktreeFixture();
  t.after(fixture.cleanup);
  const {
    adapterCalls,
    branch,
    claimSha,
    env,
    execution,
    finalSha,
    hook,
    launcher,
    oldSha,
    siblingSha,
  } = fixture;
  assert.notEqual(oldSha, finalSha);
  assert.notEqual(oldSha, claimSha);
  assert.notEqual(finalSha, siblingSha);
  assert.equal(branch, "exec/story");

  const launched = await exec(
    process.execPath,
    [launcher, "start", "--execution", "owner/project", "main", "60000"],
    { cwd: execution, env },
  );
  const directory = observerReceipt(launched.stdout).directory;
  t.after(async () => {
    await exec(process.execPath, [launcher, "stop", directory], {
      cwd: execution,
      env,
    }).catch(() => undefined);
  });
  const request = JSON.parse(
    readFileSync(join(directory, "request.json"), "utf8"),
  );
  assert.equal(request.branch, "main");
  assert.equal(realpathSync(request.root), realpathSync(execution));
  assert.notEqual(request.branch, branch);

  await assert.rejects(
    exec(
      process.execPath,
      [launcher, "register-push", directory, "not-a-sha"],
      {
        cwd: execution,
        env,
      },
    ),
    /full Git revision/,
  );

  const register = async (sha) => {
    const { stdout } = await exec(
      process.execPath,
      [launcher, "register-push", directory, sha],
      { cwd: execution, env },
    );
    assert.equal(observerReceipt(stdout).revision.sha, sha);
  };
  await register(claimSha);
  await register(finalSha);
  fixture.publishAttempts([
    {
      runId: "run:old",
      attemptId: "old",
      sha: oldSha,
      outcome: "failure",
    },
    {
      runId: "run:sibling",
      attemptId: "other",
      sha: siblingSha,
      outcome: "failure",
    },
    {
      runId: "run:final",
      attemptId: "ours",
      sha: finalSha,
      outcome: "failure",
      url: "https://ci.example.test/run/final",
    },
    {
      runId: "run:claim",
      attemptId: "claim",
      sha: claimSha,
      outcome: "success",
    },
  ]);
  fixture.releaseDiscovery();

  const attached = await deliverHostHook(
    hook,
    "cursor",
    hookInput("cursor", launched.stdout),
    env,
    execution,
  );
  assert.match(
    deliveryContext(attached),
    /CI observer attached to this coordinator/,
  );
  await waitFor(
    () => existsSync(join(directory, "events", "000000000001.json")),
    "owned failure event",
  );
  const delivered = await deliverHostHook(
    hook,
    "cursor",
    hookInput("cursor"),
    env,
    execution,
  );
  const event = JSON.parse(deliveryContext(delivered).split("\n")[1]);
  assert.equal(event.type, "CI_FAILURE");
  assert.equal(event.sha, finalSha);
  assert.equal(event.branch, "main");
  assert.equal(event.runId, "run:final");
  assert.equal(
    Buffer.byteLength(event.diagnostic.excerpt) <= diagnosticExcerptBytes,
    true,
  );
  const recorded = JSON.parse(
    readFileSync(join(directory, "events", "000000000001.json"), "utf8"),
  ).event;
  assert.equal(recorded.sha, finalSha);
  assert.equal(
    JSON.parse(readFileSync(adapterCalls, "utf8").trim().split("\n")[0]).check
      .branch,
    "main",
  );
  const coverage = JSON.parse(
    readFileSync(join(directory, "coverage", `${finalSha}.json`), "utf8"),
  );
  assert.equal(coverage.sha, finalSha);
  assert.equal(
    existsSync(join(directory, "coverage", `${oldSha}.json`)),
    false,
  );
  assert.equal(
    existsSync(join(directory, "coverage", `${siblingSha}.json`)),
    false,
  );
});
