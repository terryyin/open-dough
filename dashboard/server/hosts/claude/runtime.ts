// The Claude Code host commands for the local launch boundary, each a fixed
// `claude` argument array held here and run in the project folder:
// `claude --bg` for a launch, whose name and instruction `./launch.ts`
// supplies, Claude Code's own session listing, which confirms a launch and
// answers each recorded session's state, `claude stop` or, for an exited
// session, `claude rm` for Mark as done (`../../doneMarks.ts`), and `claude
// attach` through a PTY (`execFile` cannot host its interactive terminal) for
// the terminal boundary (`../../agentTerminals.ts`). Raw stderr stays private.

import { execFile, type ExecException } from "node:child_process";
import { spawn as spawnPty, type IPty } from "@lydell/node-pty";
import type { LaunchRecord } from "../../../src/agentLaunch.ts";
import {
  HostOperationFailure,
  type SessionObservation,
} from "../../hostLaunch.ts";
import type { ProjectFolder } from "../../projectFolders.ts";
import { parsedListing, type ListedSession } from "./listing.ts";

type ClaudeRun = {
  readonly error: ExecException | null;
  readonly stdout: string;
  readonly stderr: string;
};

// One `claude` invocation in the project folder, settled whatever its exit.
// Its stdin is closed at once: a background launch never reads it.
function execClaude(
  args: readonly string[],
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<ClaudeRun> {
  return new Promise((resolve) => {
    const child = execFile(
      "claude",
      [...args],
      {
        cwd: folder.path,
        signal,
        maxBuffer: 8 * 1024 * 1024,
        encoding: "utf8",
      },
      (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      },
    );
    child.stdin?.end();
  });
}

// `claude --bg --name <name> [--model <alias>] [<instruction>]` in the project
// folder: one background session, whose short id it prints. With no
// instruction the session starts without a first prompt; with no model,
// Claude Code's own setting applies.
export function startClaudeInBackground(
  name: string,
  {
    instruction,
    model,
  }: {
    readonly instruction: string | undefined;
    readonly model: string | undefined;
  },
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<ClaudeRun> {
  return execClaude(
    [
      "--bg",
      "--name",
      name,
      ...(model === undefined ? [] : ["--model", model]),
      ...(instruction === undefined ? [] : [instruction]),
    ],
    folder,
    signal,
  );
}

// `claude attach <short id>` in the project folder, in a terminal of this
// size: the only interactive process this dashboard runs. Ending it detaches
// only; the session keeps running.
export function attachClaude(
  shortId: string,
  folder: ProjectFolder,
  size: { readonly cols: number; readonly rows: number },
): IPty {
  return spawnPty("claude", ["attach", shortId], {
    name: "xterm-256color",
    cwd: folder.path,
    cols: size.cols,
    rows: size.rows,
  });
}

// `claude stop <short id>` in the project folder, for a session Mark as done
// ends; Claude Code keeps its conversation.
export async function stopClaude(
  shortId: string,
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<void> {
  const result = await execClaude(["stop", shortId], folder, signal);
  if (result.error !== null || signal.aborted)
    throw new Error("The native stop could not be confirmed.");
}

// `claude rm <short id>` in the project folder, for an exited session Mark as
// done removes from Claude Code's jobs. The short id alone: never a flag that
// discards commits or removes a worktree. A failure names its one cause: the
// folder exists, so `ENOENT` is the missing executable, as for a launch
// (`./launch.ts`); what made Claude Code refuse is not read from its stderr.
export async function removeClaude(
  shortId: string,
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<void> {
  const { error } = await execClaude(["rm", shortId], folder, signal);
  if (error === null && !signal.aborted) return;
  throw new HostOperationFailure(
    signal.aborted
      ? "Claude Code did not answer within 10 seconds."
      : error?.code === "ENOENT"
        ? "Claude Code is not installed where this dashboard runs."
        : "Claude Code refused to remove the session.",
  );
}

// `claude agents --json --all`, parsed by `./listing.ts`.
const listingArgs = ["agents", "--json", "--all"] as const;

// Every session Claude Code lists, running or not, as it answers in the
// project folder, or undefined when its listing could not be read. Both a
// launch's confirmation and a read of the launch records ask this.
export async function claudeSessions(
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<readonly ListedSession[] | undefined> {
  const listing = await execClaude(listingArgs, folder, signal);
  return listing.error || signal.aborted
    ? undefined
    : parsedListing(listing.stdout);
}

// One machine-wide listing answers only the recorded conversations requested.
// Listing failure says nothing about existence; a readable omission confirms
// absence. Native launch and rename confirmation reuse the private listing.
export async function observeClaudeSessions(
  records: readonly LaunchRecord[],
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<readonly SessionObservation[]> {
  const listed = await claudeSessions(folder, signal);
  return records.map(({ session }) => ({
    session,
    sessionState:
      listed === undefined
        ? { kind: "unknown" }
        : (listed.find((entry) => entry.session.sessionId === session.sessionId)
            ?.sessionState ?? { kind: "unavailable" }),
  }));
}
