// Ordinary work an assigned agent commits in its owned workspace through the
// guided commit entry point: the agent authors it, the configured developer
// is credited once beside existing co-authors, and the checkout's own Git
// hooks still run.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { exec, git } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  coAuthors,
  configureDeveloper,
  developer,
} from "./workspace-publication-startup-test-fixtures.mjs";

const model = "Claude Opus 5.5 (1M context) <noreply@anthropic.com>";
const people = "--format=%an <%ae>|%cn <%ce>";
const cli = fileURLToPath(new URL("./agent-commit.mjs", import.meta.url));

// Runs the installed entry point from `cwd`; `input` is its standard input.
async function agentCommit(cwd, args, input) {
  const running = exec(process.execPath, [cli, ...args], { cwd });
  running.child.stdin.end(input ?? "");
  try {
    const { stdout } = await running;
    return { code: 0, receipt: JSON.parse(stdout) };
  } catch (error) {
    return { code: error.code, receipt: JSON.parse(error.stdout) };
  }
}

const head = async (cwd) => (await git(cwd, "rev-parse", "HEAD")).stdout.trim();

// The refusal left HEAD where it was and the staged work still staged.
async function assertNothingCommitted(cwd, before, { code, receipt }, status) {
  assert.equal(code, 1, JSON.stringify(receipt));
  assert.equal(receipt.ok, false);
  assert.equal(receipt.status, status);
  assert.equal(await head(cwd), before);
  assert.equal(
    (await git(cwd, "diff", "--cached", "--name-only")).stdout,
    "slice.txt\n",
  );
}

// A Taken workspace with the developer configured and a commit-msg hook that
// keeps a copy of each message it checks.
async function takenWorkspace(t) {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await configureDeveloper(trunk.integration);
  const { receipt, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  const common = (
    await git(
      workspace,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    )
  ).stdout.trim();
  const checked = join(trunk.fixture, "checked-message");
  writeFileSync(
    join(common, "hooks", "commit-msg"),
    `#!/bin/sh\ncp "$1" '${checked}'\n`,
    { mode: 0o755 },
  );
  return { trunk, workspace, checked };
}

async function stageWork(workspace, name) {
  writeFileSync(join(workspace, name), `${name}\n`);
  await git(workspace, "add", name);
}

test("guided work commit is authored by the agent, credits the developer once beside the model, and runs the commit-msg hook, also when the message already credits the developer", async (t) => {
  const { workspace, checked } = await takenWorkspace(t);
  await stageWork(workspace, "slice.txt");
  const { code, receipt } = await agentCommit(
    workspace,
    ["-F", "-"],
    `Slice work\n\nCo-Authored-By: ${model}\n`,
  );
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.deepEqual(receipt, {
    ok: true,
    status: "committed",
    agent: "Yui-chan",
    sha: await head(workspace),
  });
  assert.equal(
    (await git(workspace, "log", "-1", people)).stdout.trim(),
    `Yui-chan <yui-chan@example.org>|${developer}`,
  );
  assert.equal(await coAuthors(workspace, "HEAD"), `${model}\n${developer}`);
  assert.match(readFileSync(checked, "utf8"), /Co-authored-by: Dana Developer/);
  // A message that already credits the developer keeps a single credit.
  await stageWork(workspace, "more.txt");
  const again = await agentCommit(workspace, [
    "-m",
    "More slice work",
    "-m",
    `Co-Authored-By: ${model}\nCo-authored-by: ${developer}`,
  ]);
  assert.equal(again.code, 0, JSON.stringify(again.receipt));
  assert.equal(await coAuthors(workspace, "HEAD"), `${model}\n${developer}`);
});

test("guided work commit is refused and commits nothing when the committer is the agent itself", async (t) => {
  const { workspace } = await takenWorkspace(t);
  await stageWork(workspace, "slice.txt");
  await git(
    workspace,
    "config",
    "--worktree",
    "user.email",
    "yui-chan@example.org",
  );
  const before = await head(workspace);
  const result = await agentCommit(workspace, ["-m", "Slice work"]);
  await assertNothingCommitted(
    workspace,
    before,
    result,
    "developer-identity-refused",
  );
  assert.match(result.receipt.error, /agent's own/);
});

test("guided work commit is refused and commits nothing in a checkout that names no agent", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await configureDeveloper(trunk.integration);
  await stageWork(trunk.integration, "slice.txt");
  const before = await head(trunk.integration);
  const result = await agentCommit(trunk.integration, ["-m", "Slice work"]);
  await assertNothingCommitted(
    trunk.integration,
    before,
    result,
    "no-workspace-agent",
  );
});
