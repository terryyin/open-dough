// Work and closure an assigned agent commits or amends in its owned workspace
// through the guided commit entry point: the agent authors it, the configured
// developer is credited once beside existing co-authors, and the checkout's
// own Git hooks still run.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  agentCommit,
  assertNothingCommitted,
  head,
  stageWork,
  takenWorkspace,
} from "./agent-commit-test-fixtures.mjs";
import { git } from "./publication-test-fixtures.mjs";
import { installLinkedSkills } from "./symlinked-skill-test-fixtures.mjs";
import { createQueuedTrunk } from "./workspace-publication-fixtures.mjs";
import {
  coAuthors,
  configureDeveloper,
  developer,
  profilePath,
} from "./workspace-publication-startup-test-fixtures.mjs";

const model = "Claude Opus 5.5 (1M context) <noreply@anthropic.com>";
const people = "--format=%an <%ae>|%cn <%ce>";

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

test("a wrap-up closure commit that deletes spent history is authored by the agent and credits the developer once", async (t) => {
  const { workspace } = await takenWorkspace(t);
  // Completing the story deletes its spent records, such as the agent profile.
  await git(workspace, "rm", "--quiet", profilePath("Yui"));
  const closed = await agentCommit(
    workspace,
    ["-F", "-"],
    `Close the story and delete spent history\n\nCo-Authored-By: ${model}\n`,
  );
  assert.equal(closed.code, 0, JSON.stringify(closed.receipt));
  assert.equal(
    (await git(workspace, "log", "-1", people)).stdout.trim(),
    `Yui-chan <yui-chan@example.org>|${developer}`,
  );
  assert.equal(await coAuthors(workspace, "HEAD"), `${model}\n${developer}`);
  assert.equal(
    (
      await git(workspace, "show", "--name-status", "--format=", "HEAD")
    ).stdout.trim(),
    `D\t${profilePath("Yui")}`,
  );
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

test("amending an owned commit keeps its co-authors and credits the developer once, with or without a new message", async (t) => {
  const { workspace } = await takenWorkspace(t);
  await stageWork(workspace, "slice.txt");
  const first = await agentCommit(workspace, [
    "-m",
    "Slice work",
    "-m",
    `Co-Authored-By: ${model}`,
  ]);
  assert.equal(first.code, 0, JSON.stringify(first.receipt));
  // Without a message the amend replays HEAD's own, already credited one.
  await stageWork(workspace, "fixup.txt");
  const kept = await agentCommit(workspace, ["--amend"]);
  assert.equal(kept.code, 0, JSON.stringify(kept.receipt));
  assert.equal(kept.receipt.status, "amended");
  assert.equal(
    (await git(workspace, "log", "-1", `--format=%s|%an <%ae>`)).stdout.trim(),
    "Slice work|Yui-chan <yui-chan@example.org>",
  );
  assert.equal(await coAuthors(workspace, "HEAD"), `${model}\n${developer}`);
  // A new message may already credit the developer under another key case,
  // email case, or display name; the developer is still credited once.
  for (const spelled of [
    `Co-Authored-By: ${developer}`,
    "co-authored-by: Dana Developer <DANA@example.test>",
    "Co-authored-by: Dana D. <dana@example.test>",
  ]) {
    const renamed = await agentCommit(workspace, [
      "--amend",
      "-m",
      "Slice work, reworded",
      "-m",
      `Co-Authored-By: ${model}\n${spelled}`,
    ]);
    assert.equal(renamed.code, 0, JSON.stringify(renamed.receipt));
    assert.equal(
      await coAuthors(workspace, "HEAD"),
      `${model}\n${spelled.replace(/^[^:]*: /, "")}`,
    );
  }
});

test("guided work commit through a symlinked skill directory commits, or refuses, exactly as through its real path", async (t) => {
  const { trunk, workspace } = await takenWorkspace(t);
  const { real, linked } = installLinkedSkills(trunk.fixture)(
    "dough-execute-plan/scripts/agent-commit.mjs",
  );
  await stageWork(workspace, "slice.txt");
  const throughLink = await agentCommit(
    workspace,
    ["-m", "Slice work"],
    "",
    linked,
  );
  assert.equal(throughLink.code, 0, JSON.stringify(throughLink.receipt));
  assert.deepEqual(throughLink.receipt, {
    ok: true,
    status: "committed",
    agent: "Yui-chan",
    sha: await head(workspace),
  });
  await stageWork(workspace, "more.txt");
  const throughReal = await agentCommit(
    workspace,
    ["-m", "More work"],
    "",
    real,
  );
  assert.deepEqual(
    { ...throughReal, receipt: { ...throughReal.receipt, sha: undefined } },
    { ...throughLink, receipt: { ...throughLink.receipt, sha: undefined } },
  );
  assert.equal(
    (await git(workspace, "log", "-2", people)).stdout.trim(),
    `Yui-chan <yui-chan@example.org>|${developer}\n`.repeat(2).trim(),
  );
  // A checkout that names no agent refuses the same way through either path.
  await stageWork(trunk.integration, "slice.txt");
  const before = await head(trunk.integration);
  const refusals = [];
  for (const entry of [linked, real]) {
    const result = await agentCommit(
      trunk.integration,
      ["-m", "Slice work"],
      "",
      entry,
    );
    await assertNothingCommitted(
      trunk.integration,
      before,
      result,
      "no-workspace-agent",
    );
    refusals.push(result);
  }
  assert.deepEqual(refusals[0], refusals[1]);
});
