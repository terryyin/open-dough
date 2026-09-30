// The start an execution launch runs before its session: the project's own
// installed `execution-start.mjs start` (`.claude/skills/dough-execute-plan`),
// which fetches trunk, creates the workspace, and publishes the Take, run as a
// subprocess and never reimplemented here. This module is the only place its
// argument array is spelled and the only reader of its one-line JSON result.
// It also owns whether a project can be started at all: the installed skill
// must ship the start command and the formatter (`established-start.mjs`) that
// hands an established start to the session, and the project's `origin` must
// be the catalog repository, since the Take is published there. A project
// whose skill cannot continue from a start is launched as before, with no
// claim and no workspace.
// The workspace is chosen by the host's convention (`./claudeWorkspace.ts`).
// A running start is never aborted: only a script that finishes reports
// what it published.

import { execFile, spawn } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { hostname } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import {
  type EstablishedStart,
  type StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  branchPrefix,
  claudeWorkspace,
  worktreesFolder,
} from "./claudeWorkspace.ts";
import type { ProjectFolder } from "./projectFolders.ts";

const skillScripts = path.join(
  ".claude",
  "skills",
  "dough-execute-plan",
  "scripts",
);
const startScript = "execution-start.mjs";
const formatterScript = "established-start.mjs";

// What the start command reported, read from its one line of JSON.
export type StartResult =
  | {
      readonly kind: "accepted";
      readonly publishedSha: string;
      readonly startingRevision?: string;
      readonly candidateSha?: string;
      readonly agent?: string;
      readonly plan?: string;
    }
  | {
      readonly kind: "stopped";
      readonly status: string;
      readonly error?: string;
      readonly recovery?: {
        readonly workspace: string;
        readonly branch: string;
      };
    }
  | { readonly kind: "unreadable" };

const acceptedSchema = z.looseObject({
  ok: z.literal(true),
  publishedSha: z.string().min(1),
  startingRevision: z.string().min(1).optional(),
  candidateSha: z.string().min(1).optional(),
  agent: z.string().min(1).optional(),
  plan: z.string().min(1).optional(),
});

const stoppedSchema = z.looseObject({
  ok: z.literal(false),
  status: z.string().min(1),
  error: z.string().optional(),
  recovery: z
    .looseObject({ workspace: z.string(), branch: z.string() })
    .optional()
    .catch(undefined),
});

// The command's stdout, as the typed result; a stop without JSON, or with
// JSON of another shape, is unreadable.
export function readStartResult(stdout: string): StartResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout.trim().split("\n").at(-1) ?? "");
  } catch {
    return { kind: "unreadable" };
  }
  const accepted = acceptedSchema.safeParse(parsed);
  if (accepted.success) {
    const facts = accepted.data;
    return {
      kind: "accepted",
      publishedSha: facts.publishedSha,
      ...(facts.startingRevision === undefined
        ? {}
        : { startingRevision: facts.startingRevision }),
      ...(facts.candidateSha === undefined
        ? {}
        : { candidateSha: facts.candidateSha }),
      ...(facts.agent === undefined ? {} : { agent: facts.agent }),
      ...(facts.plan === undefined ? {} : { plan: facts.plan }),
    };
  }
  const stopped = stoppedSchema.safeParse(parsed);
  if (!stopped.success) {
    return { kind: "unreadable" };
  }
  const { status, error, recovery } = stopped.data;
  return {
    kind: "stopped",
    status,
    ...(error === undefined ? {} : { error }),
    ...(recovery === undefined
      ? {}
      : {
          recovery: { workspace: recovery.workspace, branch: recovery.branch },
        }),
  };
}

export type StartAttempt =
  | { readonly kind: "established"; readonly start: EstablishedStart }
  | { readonly kind: "refused"; readonly explanation: string };

export type PlannedStart =
  // The installed skill cannot continue from a start: launch as before.
  | { readonly kind: "not-applicable" }
  | { readonly kind: "refused"; readonly explanation: string }
  // The script is running in `workspace` on `branch`; `attempt` settles when
  // it ends, however long that takes.
  | {
      readonly kind: "running";
      readonly workspace: ProjectFolder;
      readonly branch: string;
      readonly attempt: Promise<StartAttempt>;
    };

async function isFile(file: string): Promise<boolean> {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

function git(project: ProjectFolder, args: readonly string[]): Promise<string> {
  return new Promise((resolve) => {
    execFile(
      "git",
      ["-C", project.path, ...args],
      { encoding: "utf8" },
      (error, stdout) => {
        resolve(error ? "" : stdout);
      },
    );
  });
}

// `owner/name` of a GitHub remote URL, however it is spelled.
function repositoryOf(url: string): string | undefined {
  return /github\.com[:/]([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/i
    .exec(url.trim())?.[1]
    ?.toLowerCase();
}

// Slugs a new workspace must not reuse: the folders under `.worktrees/` and
// the `claude/` branches, whichever exists.
async function takenSlugs(project: ProjectFolder): Promise<Set<string>> {
  const folders = await readdir(path.join(project.path, worktreesFolder)).catch(
    (): string[] => [],
  );
  const branches = (
    await git(project, [
      "for-each-ref",
      "--format=%(refname:short)",
      `refs/heads/${branchPrefix}`,
    ])
  )
    .split("\n")
    .filter((name) => name.startsWith(branchPrefix))
    .map((name) => name.slice(branchPrefix.length));
  return new Set([...folders, ...branches]);
}

// One stable publisher per machine and project: the same start asked again is
// this publisher's own claim, never another agent's.
function publisherId(source: PublishedSource): string {
  return `dashboard-${hostname()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")}-${source.id}`;
}

function runScript(
  args: readonly string[],
  project: ProjectFolder,
): Promise<StartResult> {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [path.join(project.path, skillScripts, startScript), "start", ...args],
      { cwd: project.path, stdio: ["ignore", "pipe", "ignore"] },
    );
    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    // A command that could not run leaves no result to read.
    child.on("error", () => {
      resolve({ kind: "unreadable" });
    });
    child.on("close", () => {
      resolve(readStartResult(stdout));
    });
  });
}

function refusal(result: StartResult): string {
  if (result.kind !== "stopped") {
    return "The start command gave no result this dashboard could read, so the story may or may not be Taken. Check origin before starting again. Nothing was launched.";
  }
  const where = result.recovery
    ? ` Workspace ${result.recovery.workspace} on branch ${result.recovery.branch}.`
    : "";
  return `The start stopped (${result.status})${result.error ? `: ${result.error}` : ""}.${where} Nothing was launched.`;
}

// Whether the project's installed skill can continue from a start: it ships
// the start command and the formatter. The one check both a launch and the
// machine's answer to the page read.
export async function establishesStart(
  project: ProjectFolder,
): Promise<boolean> {
  const scripts = path.join(project.path, skillScripts);
  return (
    (await isFile(path.join(scripts, startScript))) &&
    (await isFile(path.join(scripts, formatterScript)))
  );
}

// Runs the start for one execution launch, or says why not.
export async function beginStart(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: ProjectFolder,
): Promise<PlannedStart> {
  if (!(await establishesStart(project))) {
    return { kind: "not-applicable" };
  }
  const origin = await git(project, ["config", "--get", "remote.origin.url"]);
  if (repositoryOf(origin) !== source.repository.toLowerCase()) {
    return {
      kind: "refused",
      explanation: `The origin of ${project.shown} is not ${source.repository}, where the Take would be published. Nothing was started or launched.`,
    };
  }
  const { workspace, branch } = claudeWorkspace(
    project,
    request.title,
    await takenSlugs(project),
  );
  const facts = {
    identity: request.identity,
    publisherId: publisherId(source),
    workspace: workspace.path,
    branch,
    mode: "story-branch",
    remote: "origin",
    target: source.ref,
  } as const;
  const attempt = runScript(
    [
      "--integration",
      project.path,
      "--workspace",
      facts.workspace,
      "--branch",
      facts.branch,
      "--identity",
      facts.identity,
      "--publisher-id",
      facts.publisherId,
      "--mode",
      facts.mode,
      "--remote",
      facts.remote,
      "--target",
      facts.target,
      "--push-authorized",
      "--workspace-authorized",
      "--host",
      "claude",
      ...(request.model === undefined ? [] : ["--model", request.model]),
    ],
    project,
  ).then((result): StartAttempt => {
    if (result.kind !== "accepted") {
      return { kind: "refused", explanation: refusal(result) };
    }
    return {
      kind: "established",
      start: {
        ...facts,
        publishedSha: result.publishedSha,
        ...(result.agent === undefined ? {} : { agent: result.agent }),
        ...(result.plan === undefined ? {} : { plan: result.plan }),
        ...(result.startingRevision === undefined
          ? {}
          : { startingRevision: result.startingRevision }),
        ...(result.candidateSha === undefined
          ? {}
          : { candidateSha: result.candidateSha }),
      },
    };
  });
  return { kind: "running", workspace, branch, attempt };
}

// The established start as the session's instruction carries it, written by
// the formatter the project's installed skill ships beside its start
// command, so the skill reads what its own version wrote.
export async function formattedStart(
  project: ProjectFolder,
  start: EstablishedStart,
): Promise<string> {
  const file = path.join(project.path, skillScripts, formatterScript);
  // Keyed by its modification time, so a skill updated while the server runs
  // is read anew.
  const url = `${pathToFileURL(file).href}?modified=${String((await stat(file)).mtimeMs)}`;
  const formatter = (await import(/* @vite-ignore */ url)) as {
    formatEstablishedStart: (start: EstablishedStart) => string;
  };
  return formatter.formatEstablishedStart(start);
}
