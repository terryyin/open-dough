// A managed-delivery receipt names the session whose tool calls receive its
// observer's events, through the installed `deliver` and Claude Code hook
// with real workers and a controlled CI provider: a caller naming another
// session receives none of that observer's events, and an observer claimed
// with an `agent_id` is kept only by a caller naming that agent.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createManagedFixture,
  waitForFailureEvent,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  claudeHookInput,
  deliverThroughCli,
  invokeInstalledClaudeHook,
} from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  commitIncrement,
  coverage,
  revisions,
} from "./execution-increment-managed-delivery-owner-test-fixtures.mjs";

test("a delivery that names another session reuses that session's observer, says so on its receipt, and its failure reaches the named session's hook and never the caller's", async (t) => {
  const fixture = await createManagedFixture({ platforms: [".claude"] });
  t.after(fixture.cleanup);
  const as = (session) => ({ ...fixture.env, CLAUDE_CODE_SESSION_ID: session });

  const { delivered: first } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    env: as("earlier-session"),
  });
  assert.equal(first.observation.state, "attached");
  assert.match(
    first.observation.notifies,
    /^Claude Code session earlier-session, named by CLAUDE_CODE_SESSION_ID/,
  );

  await commitIncrement(fixture, "second");
  const { delivered } = await deliverThroughCli(fixture, {
    base: first.receipt.sha,
    extra: [
      "--session-json",
      JSON.stringify({ session_id: "earlier-session" }),
    ],
    env: as("later-session"),
  });
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "reused");
  assert.equal(delivered.observation.directory, first.observation.directory);
  assert.match(
    delivered.observation.notifies,
    /^Claude Code session earlier-session, named by --session-json; a caller that is not that coordinator receives none of this observer's events/,
  );

  fixture.releaseFailure(delivered.receipt.sha, "main");
  await waitForFailureEvent(delivered.observation.directory);
  assert.deepEqual(
    await invokeInstalledClaudeHook(
      fixture,
      claudeHookInput("later-session"),
      as("later-session"),
    ),
    {},
  );
  const named = await invokeInstalledClaudeHook(
    fixture,
    claudeHookInput("earlier-session"),
    as("earlier-session"),
  );
  assert.match(named.hookSpecificOutput.additionalContext, /CI_FAILURE/);
});

test("a Claude Code caller that names an agent_id keeps one observer whose failure reaches that agent alone; without it the receipt names the session alone and that observer stays unused", async (t) => {
  const fixture = await createManagedFixture({ platforms: [".claude"] });
  t.after(fixture.cleanup);
  // The ambient variable names the session without an agent.
  const env = { ...fixture.env, CLAUDE_CODE_SESSION_ID: "parent-session" };
  const child = { session_id: "parent-session", agent_id: "child-agent" };
  const named = ["--session-json", JSON.stringify(child)];
  const recipient =
    /^Claude Code session parent-session agent child-agent, named by --session-json/;

  const { delivered: first } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    extra: named,
    env,
  });
  assert.equal(first.observation.state, "attached");
  assert.match(first.observation.notifies, recipient);
  const own = first.observation.directory;

  await commitIncrement(fixture, "second");
  const { delivered: second } = await deliverThroughCli(fixture, {
    base: first.receipt.sha,
    extra: named,
    env,
  });
  assert.equal(second.observation.state, "reused");
  assert.equal(second.observation.directory, own);
  assert.match(second.observation.notifies, recipient);
  assert.deepEqual(
    coverage(own),
    revisions(first.receipt.sha, second.receipt.sha),
  );

  fixture.releaseFailure(second.receipt.sha, "main");
  await waitForFailureEvent(own);
  const hook = (input) => invokeInstalledClaudeHook(fixture, input, env);
  assert.deepEqual(await hook(claudeHookInput("parent-session")), {});
  const notified = await hook(
    claudeHookInput("parent-session", { agent_id: "child-agent" }),
  );
  assert.match(notified.hookSpecificOutput.additionalContext, /CI_FAILURE/);

  await commitIncrement(fixture, "third");
  const { delivered: ambient } = await deliverThroughCli(fixture, {
    base: second.receipt.sha,
    env,
  });
  assert.equal(ambient.publication, "accepted");
  assert.equal(ambient.observation.state, "attached");
  assert.notEqual(ambient.observation.directory, own);
  assert.match(
    ambient.observation.notifies,
    /^Claude Code session parent-session, named by CLAUDE_CODE_SESSION_ID; an observer claimed with an agent_id is named only by --session-json with that session_id and agent_id/,
  );
  assert.deepEqual(
    coverage(own),
    revisions(first.receipt.sha, second.receipt.sha),
  );
});
