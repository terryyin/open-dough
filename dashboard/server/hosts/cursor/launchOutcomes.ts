// Terminal outcomes of one Cursor launch (./launch.ts): the explanations
// a launch ends with when Cursor, the runner, or recording does not carry
// it to a kept client, and the abort wait that races the keep.
import type { CursorSession } from "../../../src/launchRecord.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import type { HostLaunch } from "../../hostLaunch.ts";
import { setRecordPendingInputExplanation } from "../../launchRecordStore.ts";
import { directoryState } from "../../sessionWorkspace.ts";
import { cursorAgent } from "./exec.ts";
import { instructionDeliveryTimedOutExplanation } from "./instructionDelivery.ts";
import { readCursorRunnerSessions } from "./runnerClient.ts";
import { cursorWorkspaceTrustExplanation } from "./workspaceTrust.ts";

// Abort can arrive during an await. A direct `signal.aborted` check is
// narrowed for the rest of the function, so read it through this call.
export function aborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

export function notInstalled(): HostLaunch {
  return {
    kind: "failed",
    reason: "not-installed",
    explanation: `Cursor (\`${cursorAgent}\`) was not found on this machine. Install and authenticate it, then start again.`,
  };
}

// ENOENT can name the process working directory as well as its executable.
export function missingLaunchPath(workspace: string): HostLaunch {
  if (directoryState(workspace).kind === "missing") {
    return {
      kind: "failed",
      reason: "folder-not-found",
      explanation: `The Cursor workspace ${workspace} was not found on this machine. No agent was started.`,
    };
  }
  return notInstalled();
}

export function runnerUnreachable(): HostLaunch {
  return {
    kind: "failed",
    reason: "unavailable",
    explanation:
      "The Cursor runner on this machine could not be reached. No agent was started.",
  };
}

// Cursor printed this and left. The text is Cursor's own, including an empty
// print when it printed nothing, and the session is recorded as ended.
const sessionEnded = "The session ended.";

export function sessionEndedExplanation(text: string): string {
  const printed = text.trim();
  return printed === "" ? sessionEnded : `${printed}\n${sessionEnded}`;
}

export function sessionHasEnded(
  explanation: string | undefined,
): explanation is string {
  return explanation?.includes(sessionEnded) === true;
}

export function noSessionId(): HostLaunch {
  return {
    kind: "uncertain",
    reason: "unconfirmed",
    explanation: "Cursor did not print a session id. No prompt was submitted.",
  };
}

export function timedOut(session: CursorSession | undefined): HostLaunch {
  if (session === undefined) {
    return {
      kind: "uncertain",
      reason: "timed-out",
      explanation: "Cursor did not answer in time. No session id was printed.",
    };
  }
  return {
    kind: "uncertain",
    reason: "timed-out",
    explanation: instructionDeliveryTimedOutExplanation(session),
  };
}

export async function keptClientTimedOut(
  sourceId: string,
  session: CursorSession,
): Promise<HostLaunch> {
  const held = await readCursorRunnerSessions();
  const trust =
    held.kind === "running" &&
    held.sessions.some(
      (client) =>
        sessionKey(client.session) === sessionKey(session) &&
        client.workspaceTrust === true,
    );
  if (trust) {
    const recorded = await setRecordPendingInputExplanation(
      sourceId,
      session,
      cursorWorkspaceTrustExplanation,
    );
    if (recorded?.firstInput?.state === "uncertain") {
      return {
        kind: "uncertain",
        reason: "timed-out",
        explanation: cursorWorkspaceTrustExplanation,
      };
    }
  }
  return timedOut(session);
}

export function untilAbort(signal: AbortSignal): Promise<void> {
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
