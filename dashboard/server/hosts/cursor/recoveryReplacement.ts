// Starts one replacement Cursor chat when resume exits with cannot-load text.
import { z } from "zod";
import type { LaunchRecord } from "../../../src/agentLaunch.ts";
import type { CursorSession } from "../../../src/hostSession.ts";
import type { RecoverSessionAnswer } from "../../../src/sessionRecovery.ts";
import type { AgentLaunches } from "../../agentLaunches.ts";
import { replaceKeptSession } from "../../launchRecordStore.ts";
import type { PublishedSource } from "../../../src/publishedSource.ts";
import { cursorAgent } from "./exec.ts";
import { cursorRecoveryContinuation } from "./recoveryContinuation.ts";
import { execOnRunner, keepCursorClient } from "./runnerClient.ts";
import { cursorTerminalSize } from "./terminal.ts";

function resumeFlags(workspace: string, sessionId: string): readonly string[] {
  return ["--workspace", workspace, "--resume", sessionId];
}

function savedInstruction(record: LaunchRecord): string | undefined {
  const first = record.firstInput;
  if (first === undefined || first.state === "not-requested") return undefined;
  if (!("instruction" in first) || first.instruction === undefined) {
    return undefined;
  }
  const text = first.instruction.trim();
  return text === "" ? undefined : first.instruction;
}

function replacementInstruction(record: LaunchRecord): string | undefined {
  const parts = [
    savedInstruction(record),
    cursorRecoveryContinuation(record),
  ].filter((part): part is string => part !== undefined && part !== "");
  return parts.length === 0 ? undefined : parts.join("\n\n");
}

export async function replaceCannotLoadChat(
  source: PublishedSource,
  record: LaunchRecord,
  launches: AgentLaunches,
): Promise<RecoverSessionAnswer> {
  if (record.session.host !== "cursor") {
    throw new Error("Only a Cursor session can be replaced.");
  }
  const workspace = record.session.continuation.workspace;
  const created = await execOnRunner(
    ["create-chat"],
    workspace,
    AbortSignal.timeout(60_000),
  );
  if (created === undefined) {
    return {
      kind: "failed",
      explanation:
        "The Cursor runner on this machine could not be reached. No replacement agent was started.",
      record: await launches.stateOf(source, record),
    };
  }
  if (created.errorCode === "ENOENT") {
    return {
      kind: "failed",
      explanation: `Cursor (\`${cursorAgent}\`) was not found on this machine. No replacement agent was started.`,
      record: await launches.stateOf(source, record),
    };
  }
  const printed = z.uuid().safeParse(created.stdout.trim());
  if (created.failed || !printed.success) {
    return {
      kind: "failed",
      explanation:
        "Cursor did not print a replacement session id. No replacement agent was started.",
      record: await launches.stateOf(source, record),
    };
  }
  const previous = record.session;
  const session: CursorSession = {
    host: "cursor",
    sessionId: printed.data,
    name: previous.name,
    continuation: {
      workspace,
      args: [cursorAgent, ...resumeFlags(workspace, printed.data)],
    },
  };
  const instruction = replacementInstruction(record);
  const next: LaunchRecord = {
    ...record,
    session,
    ...(instruction === undefined
      ? { firstInput: { state: "not-requested", intent: "blank" as const } }
      : {
          firstInput: {
            state: "uncertain" as const,
            instruction,
            explanation:
              "Cursor has not confirmed the first prompt. Continue the recorded session before starting again.",
          },
        }),
  };
  const saved = await replaceKeptSession(source.id, previous, next);
  if (saved === undefined) {
    return {
      kind: "failed",
      explanation:
        "The launch record could not be updated for the replacement chat. No replacement agent was started.",
      record: await launches.stateOf(source, record),
    };
  }
  if (instruction === undefined) {
    return { kind: "recovered", record: await launches.stateOf(source, saved) };
  }
  const kept = await keepCursorClient({
    command: cursorAgent,
    args: [...resumeFlags(workspace, session.sessionId)],
    cwd: workspace,
    cols: cursorTerminalSize.cols,
    rows: cursorTerminalSize.rows,
    sourceId: source.id,
    session,
    instruction,
    idleComposer: true,
  });
  if (kept.kind === "unreachable" || kept.kind === "missing") {
    return {
      kind: "failed",
      explanation:
        kept.kind === "missing"
          ? `Cursor (\`${cursorAgent}\`) was not found on this machine. No replacement agent was left running.`
          : "The Cursor runner on this machine could not be reached. No replacement agent was left running.",
      record: await launches.stateOf(source, saved),
    };
  }
  if (kept.kind === "failed" || kept.kind === "exited") {
    return {
      kind: "failed",
      explanation:
        kept.kind === "exited" && kept.text.trim() !== ""
          ? kept.text.trim()
          : "Cursor could not start the replacement session. No replacement agent was left running.",
      record: await launches.stateOf(source, saved),
    };
  }
  return { kind: "recovered", record: await launches.stateOf(source, saved) };
}
