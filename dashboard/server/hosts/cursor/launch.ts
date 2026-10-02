// One Cursor session in the dashboard workspace. `create-chat` prints the id
// before any prompt; a prompt is then `cursor-agent --workspace <path>
// --resume <id> <prompt>`. An unattached session with no instruction still
// keeps that id and submits no prompt. Default omits `--model`. No worktree,
// trust, or approval flag is passed.

import { execFile, type ExecException } from "node:child_process";
import { z } from "zod";
import { launchSubject } from "../../../src/agentLaunch.ts";
import type { CursorSession, FirstInput } from "../../../src/launchRecord.ts";
import { shellCommand } from "../../../src/sessionCapabilities.ts";
import type { LaunchHost } from "../../launchHosts.ts";
import type { HostLaunch } from "../../hostLaunch.ts";
import { cursorPrompt } from "./prompt.ts";

const cursorAgent = "cursor-agent";

// Abort can arrive during an await. A direct `signal.aborted` check is
// narrowed for the rest of the function, so read it through this call.
function aborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

type CursorRun = {
  readonly error: ExecException | null;
  readonly stdout: string;
  readonly stderr: string;
};

function execCursor(
  args: readonly string[],
  cwd: string,
  signal: AbortSignal,
): Promise<CursorRun> {
  return new Promise((resolve) => {
    try {
      const child = execFile(
        cursorAgent,
        [...args],
        {
          cwd,
          signal,
          maxBuffer: 8 * 1024 * 1024,
          encoding: "utf8",
        },
        (error, stdout, stderr) => {
          resolve({ error, stdout, stderr });
        },
      );
      child.stdin?.end();
    } catch (error) {
      resolve({
        error: error as ExecException,
        stdout: "",
        stderr: "",
      });
    }
  });
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
  // One save covers both launches. Blank keeps the id and submits no prompt.
  // A prompt stays unconfirmed until that process exits 0.
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
  const submitted = await execCursor(
    [...resumeFlags(workspace, session.sessionId), prompt],
    workspace,
    signal,
  );
  if (aborted(signal)) return timedOut(session);
  if (submitted.error?.code === "ENOENT") return notInstalled();
  if (submitted.error !== null) {
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: `Cursor kept session ${session.sessionId}. The first prompt was not confirmed. Continue with \`${shellCommand(session.continuation.args)}\`.`,
    };
  }
  await record.session(session, { state: "confirmed", instruction: prompt });
  return { kind: "launched", session, sessionState: { kind: "unknown" } };
};
