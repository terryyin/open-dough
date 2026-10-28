// Continue for a Cursor launch whose first prompt was never confirmed.
// A client the runner still holds starts nothing. A start whose client
// already exited keeps that session: Continue shows the recorded ending
// and creates no other session id. Once a client is gone without that
// ending, Continue creates a new chat in the recorded scope and submits
// the same prompt. It does not resume the exited session id.
import { z } from "zod";
import type { LaunchRecord } from "../../../src/launchRecord.ts";
import type { CursorSession } from "../../../src/hostSession.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import type { LaunchHost } from "../../launchHosts.ts";
import { cursorAgent } from "./exec.ts";
import {
  aborted,
  noSessionId,
  missingLaunchPath,
  runnerUnreachable,
  sessionHasEnded,
  timedOut,
} from "./launchOutcomes.ts";
import { keptSession } from "../../launchRecordStore.ts";
import {
  execOnRunner,
  keepCursorClient,
  readCursorRunnerSessions,
} from "./runnerClient.ts";
import { recordedCursorSessionScope } from "./sessionScope.ts";
import { cursorTerminalSize } from "./terminal.ts";

const stillHeld =
  "This launch's recorded conversation has a first input that is not confirmed, so no other conversation was started. Check the recorded conversation for that input.";

function resumeFlags(workspace: string, sessionId: string): readonly string[] {
  return ["--workspace", workspace, "--resume", sessionId];
}

function savedInstruction(record: LaunchRecord): string | undefined {
  const first = record.firstInput;
  if (first === undefined || first.state === "not-requested") return undefined;
  if (first.instruction === undefined) return undefined;
  const text = first.instruction.trim();
  return text === "" ? undefined : first.instruction;
}

export const recoverUnconfirmedCursor: NonNullable<
  LaunchHost["recover"]
> = async (record, signal, recording) => {
  if (record.session.host !== "cursor") {
    return {
      kind: "failed",
      reason: "refused",
      explanation:
        "Only a Cursor session can be started again this way. Nothing was started.",
    };
  }
  const held = await readCursorRunnerSessions();
  if (held.kind === "unreachable") return runnerUnreachable();
  const running =
    held.kind === "running" &&
    held.sessions.some(
      (client) => sessionKey(client.session) === sessionKey(record.session),
    );
  if (running) {
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: stillHeld,
    };
  }
  const ended = record.firstInput?.explanation;
  if (sessionHasEnded(ended)) {
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: ended,
    };
  }
  const instruction = savedInstruction(record);
  if (instruction === undefined) {
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: stillHeld,
    };
  }
  const scope = recordedCursorSessionScope(
    record.session.continuation.configScope,
  );
  if (scope.kind === "unavailable") {
    return {
      kind: "failed",
      reason: "unavailable",
      explanation: scope.explanation,
    };
  }
  if (aborted(signal)) return timedOut(record.session);
  const workspace = record.session.continuation.workspace;
  const created = await execOnRunner(["create-chat"], workspace, signal);
  if (aborted(signal)) return timedOut(record.session);
  if (created === undefined) return runnerUnreachable();
  if (created.errorCode === "ENOENT") return missingLaunchPath(workspace);
  const printed = z.uuid().safeParse(created.stdout.trim());
  if (created.failed || !printed.success) return noSessionId();
  const previous = record.session;
  const session: CursorSession = {
    host: "cursor",
    sessionId: printed.data,
    name: previous.name,
    continuation: {
      workspace,
      args: [cursorAgent, ...resumeFlags(workspace, printed.data)],
      ...(scope.kind === "ready" ? { configScope: scope.scope } : {}),
    },
  };
  await recording.session(session, {
    state: "uncertain",
    instruction,
    explanation:
      "Cursor has not confirmed the first prompt. Continue the recorded session before starting again.",
  });
  const kept = await keepCursorClient({
    command: cursorAgent,
    args: [...resumeFlags(workspace, session.sessionId)],
    cwd: workspace,
    cols: cursorTerminalSize.cols,
    rows: cursorTerminalSize.rows,
    sourceId: record.request.source,
    session,
    ...(scope.kind === "ready" ? { configScope: scope.scope } : {}),
    instruction,
  });
  if (kept.kind === "unreachable") return runnerUnreachable();
  if (kept.kind === "missing") return missingLaunchPath(workspace);
  const confirmed = await keptSession(record.request.source, session);
  const entered = confirmed?.firstInput;
  if (
    (kept.kind !== "kept" && kept.kind !== "already-held") ||
    entered?.state !== "confirmed"
  ) {
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: `Cursor kept session ${session.sessionId}. The first prompt was not confirmed.`,
    };
  }
  await recording.session(session, entered);
  return {
    kind: "launched",
    session,
    sessionState: { kind: "unknown" },
  };
};
