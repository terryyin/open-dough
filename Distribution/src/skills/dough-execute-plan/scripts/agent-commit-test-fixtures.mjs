// A Taken workspace and the guided commit entry point that its assigned agent
// runs there, with observations of what that entry point committed.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { queuedRepositoryWithTakenStoryA } from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { agentIdentity } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { exec, git } from "./publication-test-fixtures.mjs";
import { configureAgentAuthorship } from "./workspace-agent-authorship.mjs";
import { configureDeveloper } from "./workspace-publication-startup-test-fixtures.mjs";

const cli = fileURLToPath(new URL("./agent-commit.mjs", import.meta.url));

// Runs the guided commit entry point from `cwd`, through `entry` when another
// path reaches it; `input` is its standard input.
export async function agentCommit(cwd, args, input, entry = cli) {
  const running = exec(process.execPath, [entry, ...args], { cwd });
  running.child.stdin.end(input ?? "");
  try {
    const { stdout } = await running;
    return { code: 0, receipt: JSON.parse(stdout) };
  } catch (error) {
    return { code: error.code, receipt: JSON.parse(error.stdout) };
  }
}

export const head = async (cwd) =>
  (await git(cwd, "rev-parse", "HEAD")).stdout.trim();

// The refusal left HEAD where it was and the staged work still staged.
export async function assertNothingCommitted(
  cwd,
  before,
  { code, receipt },
  status,
) {
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
export async function takenWorkspace(t) {
  const agent = "Yui";
  const trunk = await materializeRepository(
    queuedRepositoryWithTakenStoryA({
      agent,
      committer: { name: "Dana Developer", email: "dana@example.test" },
    }).please(),
  );
  t.after(trunk.cleanup);
  await configureDeveloper(trunk.integration);
  const workspace = join(trunk.fixture, "start-trunk");
  await git(
    trunk.integration,
    "worktree",
    "add",
    "-b",
    "exec/trunk",
    workspace,
  );
  await configureAgentAuthorship(workspace, agentIdentity(agent));
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

export async function stageWork(workspace, name) {
  writeFileSync(join(workspace, name), `${name}\n`);
  await git(workspace, "add", name);
}
