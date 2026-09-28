// The Claude Code host for the local launch boundary (`./agentLaunches.ts`):
// the instruction a session starts with, the fixed `claude` argument array,
// confirming the session `claude --bg` started through `claude agents --json`,
// and classifying failure into fixed categories. Raw stderr may name local
// paths or echo configuration and is never forwarded, as with the `gh`
// boundary (`./ghRead.ts`). No model, permission, effort, or session id is
// passed: the developer's own Claude Code settings apply, and `--bg` chooses
// its own session id, which it prints.

import { execFile, type ExecException } from "node:child_process";
import { stripVTControlCharacters } from "node:util";
import { z } from "zod";
import type {
  AgentLaunchRequest,
  HostSession,
  LaunchResult,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ProjectFolder } from "./projectFolders.ts";

export type HostLaunch =
  | { readonly kind: "launched"; readonly session: HostSession }
  | Exclude<LaunchResult, { readonly kind: "launched" }>;

// The execution skill on the work item's identity; the developer's own
// instruction, when there is one, follows after a blank line.
function claudeInstruction(request: AgentLaunchRequest): string {
  const execution = `/dough-execute-plan ${request.identity}`;
  const own = request.instruction?.trim();
  return own ? `${execution}\n\n${own}` : execution;
}

function claudeSessionName(
  source: PublishedSource,
  request: AgentLaunchRequest,
): string {
  return `${source.label} · ${request.title}`;
}

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

// `claude --bg` reports its session as `backgrounded · <id> · <name>`, the id
// colored for a terminal.
const backgroundedLine = /^\s*backgrounded\s+·\s+([A-Za-z0-9-]{1,64})\s+·/m;

function printedShortId(stdout: string): string | undefined {
  return backgroundedLine.exec(stripVTControlCharacters(stdout))?.[1];
}

const listedSessions = z.array(
  z.looseObject({
    id: z.string().min(1),
    sessionId: z.string().min(1),
    name: z.string().optional(),
  }),
);

function listedSession(stdout: string, shortId: string): HostSession | null {
  let listed: unknown;
  try {
    listed = JSON.parse(stdout);
  } catch {
    return null;
  }
  const sessions = listedSessions.safeParse(listed);
  const session = sessions.success
    ? sessions.data.find((entry) => entry.id === shortId)
    : undefined;
  return session === undefined
    ? null
    : {
        host: "claude",
        sessionId: session.sessionId,
        shortId: session.id,
        name: session.name ?? "",
      };
}

const checkAgents = "Check `claude agents` for it before starting again.";

function timedOut(): HostLaunch {
  return {
    kind: "uncertain",
    reason: "timed-out",
    explanation: `Claude Code did not answer in time, so the session may or may not have started. ${checkAgents}`,
  };
}

function unconfirmed(): HostLaunch {
  return {
    kind: "uncertain",
    reason: "unconfirmed",
    explanation: `Claude Code reported no session this dashboard could confirm. ${checkAgents}`,
  };
}

// The folder was checked before `claude` ran, so a missing executable is the
// only `ENOENT`.
function failedLaunch(
  error: ExecException,
  stderr: string,
  folder: ProjectFolder,
): HostLaunch {
  if (error.code === "ENOENT") {
    return {
      kind: "failed",
      reason: "not-installed",
      explanation:
        "Claude Code (`claude`) was not found on this machine. Install it, then start again.",
    };
  }
  if (typeof error.code === "number") {
    return /\bWorkspace not trusted\b/.test(stderr)
      ? {
          kind: "failed",
          reason: "folder-not-trusted",
          explanation: `Claude Code does not trust ${folder.shown} yet. Run \`claude\` in that folder once and accept the trust prompt, then start again.`,
        }
      : {
          kind: "failed",
          reason: "refused",
          explanation: `Claude Code refused to start a session in ${folder.shown}. Run \`claude\` in that folder once to see why, then start again.`,
        };
  }
  return {
    kind: "failed",
    reason: "unavailable",
    explanation: "Claude Code could not be run. Nothing was launched.",
  };
}

// Read afresh after each `claude` run: the launch wait may expire while either
// the launch or its confirmation is running.
function expired(signal: AbortSignal): boolean {
  return signal.aborted;
}

// Starts one background session and confirms it in Claude Code's own listing.
// An abort (the launch wait expiring) leaves it uncertain whether a session
// started.
export async function launchClaude(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<HostLaunch> {
  const launch = await execClaude(
    [
      "--bg",
      "--name",
      claudeSessionName(source, request),
      claudeInstruction(request),
    ],
    folder,
    signal,
  );
  if (expired(signal)) {
    return timedOut();
  }
  if (launch.error) {
    return failedLaunch(launch.error, launch.stderr, folder);
  }
  const shortId = printedShortId(launch.stdout);
  if (shortId === undefined) {
    return unconfirmed();
  }
  const listing = await execClaude(["agents", "--json"], folder, signal);
  if (expired(signal)) {
    return timedOut();
  }
  const session = listing.error ? null : listedSession(listing.stdout, shortId);
  return session === null ? unconfirmed() : { kind: "launched", session };
}
