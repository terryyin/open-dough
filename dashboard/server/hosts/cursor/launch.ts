// One Cursor session in the dashboard workspace. `create-chat` prints the id
// before any prompt; a prompt is then `cursor-agent --workspace <path>
// --resume <id> <prompt>`. That process is the session: exit 0 confirms the
// first input, any other exit leaves it unconfirmed, and a client still
// running when the launch wait ends stays running until that process exits.
// That later exit does not confirm the first input. An unattached session
// with no instruction still keeps that id and submits no prompt. A chosen
// model is `--model <id>` on the prompted run only; Cursor also saves it as
// its setting. The kept resume command never carries it, and Default omits
// it. A blank start with a chosen model is refused before create-chat: no
// run would apply it. No worktree, trust, or approval flag is passed.

import { z } from "zod";
import { launchSubject } from "../../../src/agentLaunch.ts";
import type { CursorSession, FirstInput } from "../../../src/launchRecord.ts";
import { shellCommand } from "../../../src/sessionCapabilities.ts";
import type { LaunchHost } from "../../launchHosts.ts";
import type { HostLaunch } from "../../hostLaunch.ts";
import { cursorAgent, execCursor } from "./exec.ts";
import { cursorPrompt } from "./prompt.ts";
import { aborted, submitPrompt } from "./runningPrompt.ts";

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
  // One save covers both launches. Blank keeps the id and submits no prompt.
  // A prompt stays unconfirmed until that process exits 0 before the launch
  // wait ends. A client still running then is kept until it exits, and that
  // later exit does not confirm the first input.
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
  const submitted = await submitPrompt(
    session.sessionId,
    cursorAgent,
    [
      ...resumeFlags(workspace, session.sessionId),
      ...(request.model === undefined ? [] : ["--model", request.model]),
      prompt,
    ],
    workspace,
    signal,
  );
  if (submitted.kind === "not-started") return timedOut(session);
  if (submitted.kind === "running") {
    return { kind: "launched", session, sessionState: { kind: "unknown" } };
  }
  if (submitted.kind === "not-installed") return notInstalled();
  if (submitted.kind === "unconfirmed") {
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: `Cursor kept session ${session.sessionId}. The first prompt was not confirmed. Continue with \`${shellCommand(session.continuation.args)}\`.`,
    };
  }
  await record.session(session, { state: "confirmed", instruction: prompt });
  return { kind: "launched", session, sessionState: { kind: "unknown" } };
};
