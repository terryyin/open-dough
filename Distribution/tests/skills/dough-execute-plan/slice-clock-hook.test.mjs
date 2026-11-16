import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  limitReport,
  limitReportsOf,
} from "../../support/slice-clock-limit-reports.mjs";
import {
  clockRecord,
  executionWorktree,
} from "../../support/slice-clock-fixture.mjs";

const story = "SEED-367#count-slice-active-time-deterministically";
const { overrun } = limitReportsOf(story);
const startSlice = ["start", "--identity", story, "--slice", "4"];

const told = (elapsedMinutes) =>
  `dough-execute-plan slice clock: slice 4 of ${story} reached the 15-minute limit: ${elapsedMinutes} active minutes. Stop and return the unfinished work with the elapsed time.`;

// Host hook input in the shapes the hosts were observed to send.
function claudeToolCall(checkout, agent = {}) {
  return {
    hook_event_name: "PostToolUse",
    session_id: "coordinator-session",
    cwd: checkout,
    tool_name: "Bash",
    ...agent,
  };
}

function claudeSubagent(agentId) {
  return { agent_id: agentId, agent_type: "general-purpose" };
}

function cursorToolCall(checkout, conversation) {
  return {
    hook_event_name: "postToolUse",
    conversation_id: conversation,
    cwd: "",
    workspace_roots: [checkout],
    cursor_version: "2026.11.13",
    tool_name: "Shell",
  };
}

const claudeContext = (message) => ({
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: message,
  },
});

test("on Claude Code an implementer past the limit is told once after its next tool call, and so is the coordinator, while the story counts one overrun", async (t) => {
  const { worktree, time, clock, hook } = await executionWorktree(t);
  const implementer = claudeToolCall(worktree, claudeSubagent("implementer"));
  await clock(worktree, ...startSlice);

  time.at(14);
  const underLimit = await hook("claude", implementer);
  const untouched = (await clockRecord(worktree)).stories[story];
  time.at(16);
  const coordinator = await hook("claude", claudeToolCall(worktree));
  time.at(17);
  const first = await hook("claude", implementer);
  const again = await hook("claude", implementer);
  const other = await hook(
    "claude",
    claudeToolCall(worktree, claudeSubagent("reviewer")),
  );
  const status = await clock(worktree, "status");

  assert.deepEqual(underLimit.result, {});
  assert.equal(untouched.overruns, undefined);
  assert.deepEqual(coordinator.result, claudeContext(told(16)));
  assert.deepEqual(first.result, claudeContext(told(17)));
  assert.deepEqual(again.result, {});
  assert.deepEqual(other.result, claudeContext(told(17)));
  assert.deepEqual(limitReport(status), overrun("4", 17, 1));
  assert.equal((await clockRecord(worktree)).stories[story].overruns.length, 1);
});

test("on Cursor an implementer past the limit is told once after its next tool call, and a second conversation still gets its own message", async (t) => {
  const { worktree, time, clock, hook } = await executionWorktree(t);
  const implementer = cursorToolCall(worktree, "implementer-conversation");
  await clock(worktree, ...startSlice);

  time.at(14);
  const underLimit = await hook("cursor", implementer);
  time.at(15);
  const first = await hook("cursor", implementer);
  const again = await hook("cursor", implementer);
  time.at(18);
  const coordinator = await hook(
    "cursor",
    cursorToolCall(worktree, "coordinator-conversation"),
  );
  const throughClaudeSettings = await hook(
    "claude",
    cursorToolCall(worktree, "third-conversation"),
  );
  const status = await clock(worktree, "status");

  assert.deepEqual(underLimit.result, {});
  assert.deepEqual(first.result, { additional_context: told(15) });
  assert.deepEqual(again.result, {});
  assert.deepEqual(coordinator.result, { additional_context: told(18) });
  assert.deepEqual(throughClaudeSettings.result, {});
  assert.deepEqual(limitReport(status), overrun("4", 18, 1));
});

test("an overrun a clock command already reported is still told to the agent after its next tool call, counted once", async (t) => {
  const { worktree, time, clock, hook } = await executionWorktree(t);
  await clock(worktree, ...startSlice);
  time.at(16);

  const status = await clock(worktree, "status");
  const next = await hook("cursor", cursorToolCall(worktree, "implementer"));
  const later = await clock(worktree, "status");

  assert.deepEqual(limitReport(status), overrun("4", 16, 1));
  assert.deepEqual(next.result, { additional_context: told(16) });
  assert.deepEqual(limitReport(later), overrun("4", 16, 1));
});

test("a tool call with no running slice passes without a message", async (t) => {
  const { main, worktree, time, clock, hook } = await executionWorktree(t);
  const idle = await hook("claude", claudeToolCall(worktree));
  await clock(worktree, ...startSlice);
  time.at(16);

  const otherCheckout = await hook("claude", claudeToolCall(main));
  await clock(worktree, "pause");
  const paused = await hook("cursor", cursorToolCall(worktree, "implementer"));

  assert.deepEqual(idle, { exitStatus: 0, stderr: "", result: {} });
  assert.deepEqual(otherCheckout.result, {});
  assert.deepEqual(paused.result, {});
  assert.equal(
    (await clockRecord(worktree)).stories[story].slices["4"].overrunReportedTo,
    undefined,
  );
});

test("a tool call the clock cannot serve still passes", async (t) => {
  const { worktree, hook } = await executionWorktree(t);
  const outside = mkdtempSync(join(tmpdir(), "slice-clock-outside-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  const passes = { exitStatus: 0, stderr: "", result: {} };

  const notACheckout = await hook("claude", claudeToolCall(outside));
  const unknownHost = await hook("codex", claudeToolCall(worktree));
  const noInput = await hook("claude", undefined);
  const noAgent = await hook("cursor", { hook_event_name: "postToolUse" });

  assert.deepEqual(notACheckout, passes);
  assert.deepEqual(unknownHost, passes);
  assert.deepEqual(noAgent, passes);
  assert.deepEqual(noInput, passes);
});
