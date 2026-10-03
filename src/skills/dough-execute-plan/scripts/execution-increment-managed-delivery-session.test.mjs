// Managed-delivery session input: explicit identity stays authoritative over
// the ambient Claude Code session, malformed input is not rescued, and other
// hosts never adopt the Claude variable. A Cursor coordinator is identified by
// its own conversation variable and keeps its real generation as the gate.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  createManagedFixture,
  waitForFailureEvent,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  claudeHookInput,
  cursorHookInput,
  deliverThroughCli,
  invokeInstalledClaudeHook,
  invokeInstalledCursorHook,
} from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";
const ambient = "ambient-claude-session";

test("explicit session JSON, including its owner metadata, wins over a different ambient Claude session", async (t) => {
  const fixture = await createManagedFixture({ platforms: [".claude"] });
  t.after(fixture.cleanup);
  const env = { ...fixture.env, CLAUDE_CODE_SESSION_ID: ambient };
  const explicit = { session_id: "explicit-owner", agent_id: "explicit-agent" };

  const { delivered } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    extra: ["--session-json", JSON.stringify(explicit)],
    env,
  });
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "attached");

  fixture.releaseFailure(delivered.receipt.sha, "main");
  await waitForFailureEvent(delivered.observation.directory);
  const hook = (input) => invokeInstalledClaudeHook(fixture, input, env);
  assert.deepEqual(await hook(claudeHookInput(ambient)), {});
  assert.deepEqual(await hook(claudeHookInput(explicit.session_id)), {});
  const owned = await hook(
    claudeHookInput(explicit.session_id, { agent_id: explicit.agent_id }),
  );
  assert.match(owned.hookSpecificOutput.additionalContext, /CI_FAILURE/);
});

test("malformed explicit session JSON is refused rather than replaced by the ambient Claude session", async (t) => {
  const fixture = await createManagedFixture({ platforms: [".claude"] });
  t.after(fixture.cleanup);

  const result = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    extra: ["--session-json", "{not json"],
    env: { ...fixture.env, CLAUDE_CODE_SESSION_ID: ambient },
  });
  assert.equal(result.code, 2);
  assert.equal(result.delivered, null);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );
  assert.equal(existsSync(fixture.storage), false);
});

test("Cursor and Codex delivery never adopt the ambient Claude session", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const env = { ...fixture.env, CLAUDE_CODE_SESSION_ID: ambient };
  delete env.CURSOR_CONVERSATION_ID;

  const cursor = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    env,
    session: null,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  assert.equal(cursor.publication, "accepted");
  assert.equal(cursor.observation.state, "unobserved");
  assert.match(cursor.observation.reason, /CURSOR_CONVERSATION_ID is unset/);
  assert.equal(existsSync(fixture.storage), false);

  const codex = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    host: "codex",
    env,
    session: null,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: cursor.receipt.sha,
    targetRef: trunkTarget,
    repo,
  });
  assert.equal(codex.publication, "accepted");
  assert.equal(codex.observation.state, "unobserved");
  assert.match(
    codex.observation.reason,
    /no live Codex yielded stream observes owner\/project main/,
  );
  assert.equal(existsSync(fixture.storage), false);
});

for (const receipt of ["with", "without"]) {
  test(`a Cursor coordinator's delivery from its own Shell is observed in its real generation, ${receipt} the deliver receipt in the hook output`, async (t) => {
    const fixture = await createManagedFixture();
    t.after(fixture.cleanup);
    const env = { ...fixture.env, CURSOR_CONVERSATION_ID: "conv-1" };
    delete env.CLAUDE_CODE_SESSION_ID;

    const { delivered, stdout } = await deliverThroughCli(fixture, {
      host: "cursor",
      base: fixture.trunkSha,
      env,
    });
    assert.equal(delivered.publication, "accepted");
    assert.equal(delivered.observation.state, "attached");

    fixture.releaseFailure(delivered.receipt.sha, "main");
    await waitForFailureEvent(delivered.observation.directory);
    const output = receipt === "with" ? stdout : "";
    const notified = await invokeInstalledCursorHook(
      fixture,
      cursorHookInput("conv-1", "coordinator-real-turn", output),
      env,
    );
    assert.match(notified.additional_context ?? "", /CI_FAILURE/);
    assert.match(
      notified.additional_context,
      new RegExp(delivered.receipt.sha, "i"),
    );
  });
}

test("a Cursor delivery without its conversation identity reports a gap naming CURSOR_CONVERSATION_ID and keeps publication", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const env = { ...fixture.env };
  delete env.CURSOR_CONVERSATION_ID;
  delete env.CLAUDE_CODE_SESSION_ID;

  const { delivered } = await deliverThroughCli(fixture, {
    host: "cursor",
    base: fixture.trunkSha,
    env,
  });
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "unobserved");
  assert.match(delivered.observation.reason, /CURSOR_CONVERSATION_ID is unset/);
  assert.match(delivered.observation.reason, /--session-json/);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    delivered.receipt.sha,
  );
  assert.equal(existsSync(fixture.storage), false);
});
