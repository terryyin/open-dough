// A finished dashboard launch in Claude Code session `claude` that the
// developer goes on replying to. Responses run Claude Opus 5.5 (list prices
// read 2026-11-15: input $4, cache read $0.20, output $20 per 1M tokens), so
// 1,000 uncached, 9,000 read and O output tokens weigh
// (1,000×4 + 9,000×0.20 + O×20) / 4 = 1,450 + 5×O input tokens.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../support/launchStore.ts";
import {
  nativeFile,
  readImported,
  runImport,
  writeClaudeSession,
} from "./importHarness.ts";
import { day, usageServer } from "./tokenIndexHarness.ts";

export const reference = "ca7430bd-0d52-499d-a1bd-000000000001";
// A finished launch of story `identity` in session `claude` at `launchedAt`,
// reporting through `launchReference`.
export const launchIn = (
  identity: string,
  launchReference: string,
  launchedAt = "2026-11-14T09:00:00.000Z",
) =>
  makeMe.aLaunchRecord
    .executing({ identity, title: `Story ${identity}` })
    .inClaudeSession({ sessionId: "claude" })
    .launchedAt(launchedAt)
    .reportingThrough({
      origin: "http://localhost:4318",
      reference: launchReference,
      command: "report",
    })
    .completedWith({ message: "", receivedAt: day(15) })
    .please();
export const claudeLaunch = launchIn("SEED-7#claude", reference);
export const response = (uuid: string, output: number) => ({
  uuid,
  messageId: `msg-${uuid}`,
  model: "claude-opus-5-5",
  usage: {
    input_tokens: 1_000,
    cache_read_input_tokens: 9_000,
    cache_creation_input_tokens: 0,
    output_tokens: output,
    speed: "standard",
  },
});
// The launch's session: its launch input answered with 100 output tokens.
export const claudeSession = () =>
  makeMe.aClaudeTranscript
    .forSession("claude")
    .withLaunchInput({ reference, command: "report" })
    .withAssistant(response("first", 100));
// The launch's session after a developer reply answered with 300 output tokens.
export const repliedSession = () =>
  claudeSession()
    .withUser({ uuid: "reply", content: "Resume" })
    .withAssistant(response("after-reply", 300));
// The session's input returning the worker `writeWorker` writes.
export const workerResult = {
  uuid: "worker-result",
  toolUseResult: { agentId: "worker" },
  content: [{ type: "tool_result", tool_use_id: "tool-1", content: "" }],
};

const transcripts = (home: string) =>
  path.join(home, ".claude/projects/open-dough");
// Writes the session `rows` over the launch's session transcript.
export const writeLaunchSession = (home: string, rows: object[]) =>
  writeClaudeSession(transcripts(home), rows);
// The launch's worker transcript, answered with 100 output tokens.
export function writeWorker(home: string) {
  nativeFile(
    path.join(transcripts(home), "claude", "subagents"),
    "agent-worker",
    makeMe.aClaudeTranscript
      .forSession("claude")
      .asSidechain({ agentId: "worker" })
      .withUser({ uuid: "worker-input", parentUuid: null, content: "work" })
      .withAssistant(response("worker", 100))
      .please(),
  );
}

// Imports the Claude Code session `rows` beside `launches`.
export function importClaude(
  home: string,
  rows: object[],
  launches = [claudeLaunch],
) {
  const projects = path.join(home, ".claude/projects");
  keepLaunchStore(home, { "open-dough": launches });
  writeLaunchSession(home, rows);
  runImport(home, path.join(home, ".codex/sessions"), [
    "--claude-root",
    projects,
  ]);
  return readImported(home);
}

// Each Claude Code task's Token index once a Refresh of `machine` ends.
export async function refreshedClaudeIndex(
  machine: Parameters<typeof usageServer>[0],
) {
  const usage = await usageServer(machine);
  await usage.refresh();
  const chart = await usage.chart("?tool=claude");
  return chart.tasks.map(({ identity, index }) => [identity, index]);
}
