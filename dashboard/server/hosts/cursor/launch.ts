// One Cursor session in the dashboard workspace. `create-chat` prints the id
// before any prompt. An instruction then starts one kept terminal client,
// `cursor-agent --workspace <path> --resume <id>` plus `--model` only when
// one was chosen. The instruction is written into that client when its
// screen is ready for one. The record stays uncertain until that write, and
// the client exiting does not accept it. The launch returns once the client
// is running and the first screen has been judged, or the launch wait
// aborts; that abort does not kill the client. Acceptance of a later screen
// is recorded after the return. An unattached session with no instruction
// still keeps the id and starts no client. The stored resume command never
// carries `--model`, and Default omits it. A blank start with a chosen
// model is refused before create-chat: no run would apply it. No worktree,
// trust, or approval flag is passed.

import { z } from "zod";
import { launchSubject } from "../../../src/agentLaunch.ts";
import type { CursorSession, FirstInput } from "../../../src/launchRecord.ts";
import { shellCommand } from "../../../src/sessionCapabilities.ts";
import type { LaunchHost } from "../../launchHosts.ts";
import type { HostLaunch } from "../../hostLaunch.ts";
import { cursorAgent, execCursor } from "./exec.ts";
import { keepCursorTerminal } from "./keptTerminal.ts";
import { cursorPrompt } from "./prompt.ts";
import {
  cursorKeptTerminal,
  cursorTerminalSize,
  spawnCursorPty,
} from "./terminal.ts";

// Abort can arrive during an await. A direct `signal.aborted` check is
// narrowed for the rest of the function, so read it through this call.
function aborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

function resumeFlags(workspace: string, sessionId: string): readonly string[] {
  return ["--workspace", workspace, "--resume", sessionId];
}

function notInstalled(): HostLaunch {
  return {
    kind: "failed",
    reason: "not-installed",
    explanation: `Cursor (\`${cursorAgent}\`) was not found on this machine. Install and authenticate it, then start again.`,
  };
}

function noSessionId(): HostLaunch {
  return {
    kind: "uncertain",
    reason: "unconfirmed",
    explanation: "Cursor did not print a session id. No prompt was submitted.",
  };
}

function timedOut(session: CursorSession | undefined): HostLaunch {
  const kept =
    session === undefined
      ? "No session id was printed."
      : `Session ${session.sessionId} is kept. Continue with \`${shellCommand(session.continuation.args)}\`.`;
  return {
    kind: "uncertain",
    reason: "timed-out",
    explanation: `Cursor did not answer in time. ${kept}`,
  };
}

function untilAbort(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    signal.addEventListener(
      "abort",
      () => {
        resolve();
      },
      { once: true },
    );
  });
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
  const created = await execCursor(["create-chat"], workspace, signal);
  if (aborted(signal)) return timedOut(undefined);
  if (created.error?.code === "ENOENT") return notInstalled();
  const printed = z.uuid().safeParse(created.stdout.trim());
  if (created.error !== null || !printed.success) return noSessionId();
  const session: CursorSession = {
    host: "cursor",
    sessionId: printed.data,
    name: `${source.label} · ${launchSubject(request).name} · ${request.title}`,
    continuation: {
      workspace,
      args: [cursorAgent, ...resumeFlags(workspace, printed.data)],
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
  let pty;
  try {
    pty = spawnCursorPty(
      cursorAgent,
      [
        ...resumeFlags(workspace, session.sessionId),
        ...(request.model === undefined ? [] : ["--model", request.model]),
      ],
      workspace,
      cursorTerminalSize,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return notInstalled();
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: `Cursor kept session ${session.sessionId}. The first prompt was not confirmed. Continue with \`${shellCommand(session.continuation.args)}\`.`,
    };
  }
  const firstScreen = keepCursorTerminal({
    pty,
    session,
    instruction: prompt,
    onEntered: () =>
      record.session(session, { state: "confirmed", instruction: prompt }),
    ...cursorKeptTerminal,
  });
  await Promise.race([firstScreen, untilAbort(signal)]);
  return { kind: "launched", session, sessionState: { kind: "unknown" } };
};
