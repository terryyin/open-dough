// Developer-requested recovery of one unfinished Cursor launch the runner
// does not hold. Observation never starts the runner; this action uses
// cursorRunnerPort, which may. It resumes the recorded command, types one
// continuation only when first input is already confirmed (LaunchInstruction
// writes that only on the idle composer), and starts one replacement when
// resume exits with the cannot-load sentence. When keep has not settled by
// the shared launch wait, Recover answers failed for unconfirmed delivery
// and does not kill the client.
import type { LaunchRecord } from "../../../src/agentLaunch.ts";
import { showsCursorCannotLoad } from "../../../src/cursorCannotLoad.ts";
import type { RecoverSessionAnswer } from "../../../src/sessionRecovery.ts";
import type { AgentLaunches } from "../../agentLaunches.ts";
import { launchTimeoutMs } from "../../launchRun.ts";
import type { PublishedSource } from "../../../src/publishedSource.ts";
import { directoryState } from "../../sessionWorkspace.ts";
import { cursorAgent } from "./exec.ts";
import { instructionDeliveryTimedOutExplanation } from "./instructionDelivery.ts";
import { cursorRecoveryContinuation } from "./recoveryContinuation.ts";
import { replaceCannotLoadChat } from "./recoveryReplacement.ts";
import {
  hangupCursorClient,
  keepCursorClient,
  type CursorKeepResult,
} from "./runnerClient.ts";
import { cursorTerminalSize } from "./terminal.ts";

function untilLaunchWait(): Promise<"timed-out"> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("timed-out");
    }, launchTimeoutMs());
  });
}

const trustPhrases = [
  "Workspace Trust Required",
  "Do you trust this workspace?",
] as const;

function showsTrust(screen: string): boolean {
  return trustPhrases.some((phrase) => screen.includes(phrase));
}

function resumeArgs(record: LaunchRecord): {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
} {
  if (record.session.host !== "cursor") {
    throw new Error("Only a Cursor session can be recovered.");
  }
  const { continuation } = record.session;
  const [command, ...args] = continuation.args;
  return {
    command: command ?? cursorAgent,
    args,
    cwd: continuation.workspace,
  };
}

async function afterKeep(
  source: PublishedSource,
  record: LaunchRecord,
  launches: AgentLaunches,
  kept: CursorKeepResult,
): Promise<RecoverSessionAnswer> {
  const joined = () => launches.stateOf(source, record);
  if (kept.kind === "unreachable") {
    return {
      kind: "failed",
      explanation:
        "The Cursor runner on this machine could not be reached. No agent was started.",
      record: await joined(),
    };
  }
  if (kept.kind === "missing") {
    return {
      kind: "failed",
      explanation: `Cursor (\`${cursorAgent}\`) was not found on this machine. No agent was started.`,
      record: await joined(),
    };
  }
  if (kept.kind === "failed") {
    return {
      kind: "failed",
      explanation:
        "Cursor could not resume this session. No agent was left running.",
      record: await joined(),
    };
  }
  if (kept.kind === "already-held") {
    return { kind: "recovered", record: await joined() };
  }
  if (kept.kind === "exited") {
    const text = kept.text.trim();
    if (showsCursorCannotLoad(text)) {
      return replaceCannotLoadChat(source, record, launches);
    }
    return {
      kind: "failed",
      explanation:
        text === ""
          ? "Cursor exited before the session could be recovered. No agent was left running."
          : text,
      record: await joined(),
    };
  }
  const screen = kept.screen ?? "";
  if (showsTrust(screen)) {
    if (record.session.host === "cursor") {
      await hangupCursorClient(record.session);
    }
    return {
      kind: "failed",
      explanation:
        "Workspace trust is required. No agent was left running, and no replacement was started.",
      record: await joined(),
    };
  }
  // Composer with confirmed first input already received the continuation
  // through keep's LaunchInstruction. Working, waiting, and other held
  // screens typed nothing.
  return { kind: "recovered", record: await joined() };
}

export async function recoverCursorSession(
  source: PublishedSource,
  record: LaunchRecord,
  launches: AgentLaunches,
): Promise<RecoverSessionAnswer> {
  if (record.session.host !== "cursor") {
    return {
      kind: "failed",
      explanation: "Only a Cursor session can be recovered this way.",
    };
  }
  const workspace = record.session.continuation.workspace;
  const state = directoryState(workspace);
  if (state.kind !== "available") {
    return {
      kind: "failed",
      explanation:
        state.kind === "missing"
          ? `The recorded workspace ${workspace} was not found on this machine. No agent was started.`
          : `The recorded workspace ${workspace} could not be read. No agent was started.`,
      record: await launches.stateOf(source, record),
    };
  }
  const { command, args, cwd } = resumeArgs(record);
  const confirmed = record.firstInput?.state === "confirmed";
  const instruction = confirmed
    ? cursorRecoveryContinuation(record)
    : undefined;
  const kept = keepCursorClient({
    command,
    args: [...args],
    cwd,
    cols: cursorTerminalSize.cols,
    rows: cursorTerminalSize.rows,
    sourceId: source.id,
    session: record.session,
    ...(instruction === undefined ? {} : { instruction, idleComposer: true }),
  });
  const outcome = await Promise.race([kept, untilLaunchWait()]);
  if (outcome === "timed-out") {
    return {
      kind: "failed",
      explanation: instructionDeliveryTimedOutExplanation(record.session),
      record: await launches.stateOf(source, record),
    };
  }
  return afterKeep(source, record, launches, outcome);
}
