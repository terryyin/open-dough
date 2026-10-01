// The Claude Code host commands for the local launch boundary, each a fixed
// `claude` argument array held here and run in the project folder:
// `claude --bg` for a launch, whose name and instruction `./launch.ts`
// supplies, Claude Code's own session listing, which confirms a launch and
// answers each recorded session's state, `claude stop` for Mark as done
// (`../../doneMarks.ts`), and `claude attach` through a PTY for the terminal
// boundary (`../../agentTerminals.ts`), since `execFile` cannot host Claude
// Code's interactive terminal. Raw stderr is never forwarded.

import { execFile, type ExecException } from "node:child_process";
import { spawn as spawnPty, type IPty } from "@lydell/node-pty";
import { z } from "zod";
import type {
  ClaudeSession,
  LaunchRecord,
  SessionState,
} from "../../../src/agentLaunch.ts";
import type { SessionObservation } from "../../hostLaunch.ts";
import type { ProjectFolder } from "../../projectFolders.ts";

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

// Claude Code's own session listing: `--all` includes sessions whose process
// has exited, `status` (busy, idle, or waiting) is present only while a
// session's process runs, and `waitingFor` says, when Claude Code reports it,
// what a blocked session waits for. A `waitingFor` that is not text is left
// out rather than refusing the whole listing, and so is an entry without a
// short id or state, such as an interactive session running in a terminal.
const listingArgs = ["agents", "--json", "--all"] as const;

const listedSession = z.looseObject({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  name: z.string().optional(),
  state: z.string(),
  status: z.string().nullish(),
  waitingFor: z.string().nullish().catch(undefined),
});

// Private Claude listing evidence also confirms launch identities and renames.
// Shared callers receive only normalized observations for their saved targets.
type ListedSession = {
  readonly session: ClaudeSession;
  readonly sessionState: Extract<SessionState, { kind: "available" }>;
};

function activityOf(
  state: string,
): Extract<SessionState, { kind: "available" }>["activity"] {
  switch (state) {
    case "working":
      return "working";
    case "blocked":
      return "waiting";
    case "done":
      return "review";
    case "failed":
      return "failed";
    case "stopped":
      return "interrupted";
    default:
      return "unknown";
  }
}

function parsedListing(stdout: string): readonly ListedSession[] | undefined {
  let listed: unknown;
  try {
    listed = JSON.parse(stdout);
  } catch {
    return undefined;
  }
  if (!Array.isArray(listed)) return undefined;
  return listed.flatMap((listedEntry) => {
    const parsed = listedSession.safeParse(listedEntry);
    if (!parsed.success) return [];
    const entry = parsed.data;
    return [
      {
        session: {
          host: "claude",
          sessionId: entry.sessionId,
          shortId: entry.id,
          name: entry.name ?? "",
        },
        sessionState: {
          kind: "available",
          availability:
            entry.status === undefined || entry.status === null
              ? "retained"
              : "loaded",
          activity: activityOf(entry.state),
          ...(activityOf(entry.state) === "unknown"
            ? {
                description: `Claude Code lists it as ${entry.state}`,
                unknownReason: "unrecognized",
              }
            : {}),
          ...(entry.waitingFor === undefined ||
          entry.waitingFor === null ||
          entry.waitingFor === ""
            ? {}
            : { waitingFor: entry.waitingFor }),
        },
      },
    ];
  });
}

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
