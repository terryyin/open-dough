// The Claude Code host commands for the local launch boundary, each a fixed
// `claude` argument array held here and run in the project folder:
// `claude --bg` for a launch, whose name and instruction `./claudeLaunch.ts`
// supplies, Claude Code's own session listing, which confirms a launch and
// answers each recorded session's state, `claude stop` for Mark as done
// (`./doneMarks.ts`), and `claude attach` through a PTY for the terminal
// boundary (`./agentTerminals.ts`), since `execFile` cannot host Claude
// Code's interactive terminal. Raw stderr is never forwarded.

import { execFile, type ExecException } from "node:child_process";
import { spawn as spawnPty, type IPty } from "@lydell/node-pty";
import { z } from "zod";
import type { HostSession, SessionState } from "../src/agentLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";

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

// `claude --bg --name <name> <instruction>` in the project folder: one
// background session, whose short id it prints.
export function startClaudeInBackground(
  name: string,
  instruction: string,
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<ClaudeRun> {
  return execClaude(["--bg", "--name", name, instruction], folder, signal);
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
  await execClaude(["stop", shortId], folder, signal);
}

// Claude Code's own session listing: `--all` includes sessions whose process
// has exited, and `status` (busy or idle) is present only while a session's
// process runs.
const listingArgs = ["agents", "--json", "--all"] as const;

const listedSessions = z.array(
  z.looseObject({
    id: z.string().min(1),
    sessionId: z.string().min(1),
    name: z.string().optional(),
    state: z.string(),
    status: z.string().nullish(),
  }),
);

// One session Claude Code lists, and its state as listed.
export type ListedSession = {
  readonly session: HostSession;
  readonly sessionState: Extract<SessionState, { readonly kind: "listed" }>;
};

function parsedListing(stdout: string): readonly ListedSession[] | undefined {
  let listed: unknown;
  try {
    listed = JSON.parse(stdout);
  } catch {
    return undefined;
  }
  const sessions = listedSessions.safeParse(listed);
  return sessions.success
    ? sessions.data.map((entry) => ({
        session: {
          host: "claude",
          sessionId: entry.sessionId,
          shortId: entry.id,
          name: entry.name ?? "",
        },
        sessionState: {
          kind: "listed",
          state: entry.state,
          ...(entry.status === undefined || entry.status === null
            ? {}
            : { status: entry.status }),
        },
      }))
    : undefined;
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
