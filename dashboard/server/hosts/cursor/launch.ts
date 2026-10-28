// One Cursor session in the dashboard workspace. `create-chat` prints the id
// before any prompt. An instruction then starts one kept terminal client in
// the machine-local Cursor runner, `cursor-agent --workspace <path>
// --resume <id>` plus `--model` only when one was chosen. This process does
// not spawn that agent. The instruction is written into that client when its
// screen is ready for one. The record stays uncertain until that write, and
// the client exiting does not accept it. The launch returns once the client
// is running and the first screen has been judged, or the launch wait
// aborts while keep is still open — that abort answers uncertain/timed-out
// for unconfirmed instruction delivery and does not kill the client.
// Acceptance of a later screen is recorded after the return. An unattached
// session with no instruction still keeps the id and starts no client. The
// stored resume command never carries `--model`, and Default omits it. A
// blank start with a chosen model is refused before create-chat: no run
// would apply it. A chosen model first establishes its session
// configuration scope (./sessionScope.ts), cloned from the developer's
// current Cursor configuration and recorded on the continuation, and the
// first client is kept with that scope; when the scope cannot be
// established the launch is refused before create-chat rather than run
// against the shared configuration. Default launches create no scope. No
// worktree, trust, or approval flag is passed. When the runner cannot be
// reached, no `cursor-agent` is started.

import { z } from "zod";
import { launchSubject } from "../../../src/agentLaunch.ts";
import type { CursorSession, FirstInput } from "../../../src/launchRecord.ts";
import { shellCommand } from "../../../src/sessionCapabilities.ts";
import type { LaunchHost } from "../../launchHosts.ts";
import type { HostLaunch } from "../../hostLaunch.ts";
import { cursorAgent } from "./exec.ts";
import {
  aborted,
  keptClientTimedOut,
  noSessionId,
  sessionEndedExplanation,
  missingLaunchPath,
  runnerUnreachable,
  timedOut,
  untilAbort,
} from "./launchOutcomes.ts";
import { cursorPrompt } from "./prompt.ts";
import {
  establishCursorSessionScope,
  removeCursorSessionScope,
} from "./sessionScope.ts";
import { setRecordPendingInputExplanation } from "../../launchRecordStore.ts";
import { execOnRunner, keepCursorClient } from "./runnerClient.ts";
import { terminalHandoffRequested } from "../../terminalHandoff.ts";
import { cursorTerminalSize } from "./terminal.ts";

function resumeFlags(workspace: string, sessionId: string): readonly string[] {
  return ["--workspace", workspace, "--resume", sessionId];
}

export const launchCursor: LaunchHost["launch"] = async (
  source,
  request,
  folder,
  signal,
  established,
  record,
): Promise<HostLaunch> => {
  if (record === undefined) {
    throw new Error("Durable launch recording is required.");
  }
  const prompt = cursorPrompt(request, established?.handoff);
  // Only a blank unattached session has no prompt. Any other missing prompt
  // is refused before create-chat, so a skill launch is never recorded empty.
  if (prompt === undefined && request.workflow !== "ad-hoc") {
    return {
      kind: "failed",
      reason: "unavailable",
      explanation: "Cursor was not given a first prompt. Nothing was launched.",
    };
  }
  if (prompt === undefined && request.model !== undefined) {
    return {
      kind: "failed",
      reason: "refused",
      explanation:
        "Cursor applies a chosen model with the first instruction. Add an instruction, or use your Cursor setting. Nothing was launched.",
    };
  }
  const workspace = established?.workspace.path ?? folder.path;
  // A chosen model establishes its scope before create-chat, so Cursor's
  // persistence lands in the scope from the first turn. Failure refuses
  // here rather than launching against the shared configuration.
  const configScope =
    request.model === undefined
      ? undefined
      : await establishCursorSessionScope();
  if (request.model !== undefined && configScope === undefined) {
    return {
      kind: "failed",
      reason: "unavailable",
      explanation:
        "Cursor's current configuration could not be copied into a configuration for this session, so the chosen model was not started. Check your Cursor configuration, then start again. Nothing was launched.",
    };
  }
  const created = await execOnRunner(["create-chat"], workspace, signal);
  // No session was recorded on these paths, so no record remembers the
  // scope; remove it instead of stranding it.
  const abandonScope = async (): Promise<void> => {
    if (configScope !== undefined) {
      await removeCursorSessionScope(configScope).catch(() => undefined);
    }
  };
  if (aborted(signal)) {
    await abandonScope();
    return timedOut(undefined);
  }
  if (created === undefined) {
    await abandonScope();
    return runnerUnreachable();
  }
  if (created.errorCode === "ENOENT") {
    await abandonScope();
    return missingLaunchPath(workspace);
  }
  const printed = z.uuid().safeParse(created.stdout.trim());
  if (created.failed || !printed.success) {
    await abandonScope();
    return noSessionId();
  }
  const session: CursorSession = {
    host: "cursor",
    sessionId: printed.data,
    name: `${source.label} · ${launchSubject(request).name} · ${request.title}`,
    continuation: {
      workspace,
      args: [cursorAgent, ...resumeFlags(workspace, printed.data)],
      ...(configScope === undefined ? {} : { configScope }),
    },
  };
  // Blank keeps the id and starts no client. A prompt stays uncertain until
  // it is written into a screen that is ready for an instruction.
  const first: FirstInput =
    prompt === undefined
      ? { state: "not-requested", intent: "blank" }
      : {
          state: "uncertain",
          instruction: prompt,
          explanation:
            "Cursor has not confirmed the first prompt. Continue the recorded session before starting again.",
        };
  try {
    await record.session(session, first);
  } catch {
    await abandonScope();
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: `Cursor printed session ${session.sessionId}, and the dashboard could not save it. No prompt was submitted. Continue with \`${shellCommand(session.continuation.args)}\`.`,
    };
  }
  if (prompt === undefined) {
    return { kind: "launched", session, sessionState: { kind: "unknown" } };
  }
  if (aborted(signal)) return timedOut(session);
  // Start session opens a terminal for this client. The follow-up prompt
  // keeps that process, including when this launch does not open a terminal.
  const attachTerminal = terminalHandoffRequested();
  const kept = keepCursorClient({
    command: cursorAgent,
    args: [
      ...resumeFlags(workspace, session.sessionId),
      ...(request.model === undefined ? [] : ["--model", request.model]),
    ],
    cwd: workspace,
    cols: cursorTerminalSize.cols,
    rows: cursorTerminalSize.rows,
    sourceId: source.id,
    session,
    ...(configScope === undefined ? {} : { configScope }),
    instruction: prompt,
    ...(attachTerminal ? { handoff: true } : {}),
  });
  const outcome = await Promise.race([
    kept,
    untilAbort(signal).then(() => "aborted" as const),
  ]);
  if (outcome === "aborted") {
    return keptClientTimedOut(source.id, session);
  }
  if (outcome.kind !== "kept" && outcome.kind !== "already-held") {
    if (outcome.kind === "unreachable") {
      return runnerUnreachable();
    }
    if (outcome.kind === "missing") {
      return missingLaunchPath(workspace);
    }
    if (outcome.kind === "exited") {
      const explanation = sessionEndedExplanation(outcome.text);
      await setRecordPendingInputExplanation(source.id, session, explanation);
      return {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation,
      };
    }
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: `Cursor kept session ${session.sessionId}. The first prompt was not confirmed. Continue with \`${shellCommand(session.continuation.args)}\`.`,
    };
  }
  return { kind: "launched", session, sessionState: { kind: "unknown" } };
};
