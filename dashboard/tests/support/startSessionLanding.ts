// What the unattached Start session specs share on a real start origin
// (./startOrigin.ts): the installed start's invocations recorded as they
// happen, the start an unattached session's place is established by, in the
// default checkout or a new workspace, and the "Established session" block
// its first input carries.

import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { installedSkillPath } from "../../server/launchHosts.ts";
import type { EstablishedSession } from "../../src/unattachedSession.ts";
import type { StartOrigin } from "./startOrigin.ts";

type Host = "claude" | "codex" | "cursor";
type Landing = EstablishedSession["landing"];

export type StartCall = {
  readonly argv: readonly string[];
  readonly cwd: string;
};

const installedScripts = (origin: StartOrigin, host: Host) =>
  installedSkillPath(
    host,
    { path: origin.project, shown: origin.project },
    "dough-execute-plan",
    "scripts",
  );

// Commits and publishes the project's edited installation, so the default
// checkout stays clean and level with origin.
function publishInstallation(origin: StartOrigin, message: string) {
  for (const args of [
    ["add", "."],
    ["commit", "-m", message],
    ["push", "origin", "main"],
  ])
    execFileSync("git", ["-C", origin.project, ...args], { stdio: "ignore" });
}

// Leaves the host's installation unable to establish a session: it ships no
// formatter of the session's block.
export function withoutSessionFormatter(
  origin: StartOrigin,
  host: Host = "claude",
) {
  rmSync(path.join(installedScripts(origin, host), "established-session.mjs"));
  publishInstallation(origin, "no session formatter");
}

// Puts a recorder in front of the project's installed start, published, and
// answers the invocations recorded so far: the arguments and the folder each
// ran in. The real start still runs, with the same arguments and result.
export function recordStarts(origin: StartOrigin, host: Host = "claude") {
  const scripts = installedScripts(origin, host);
  const log = path.join(origin.machine, "start-calls.jsonl");
  const real = path.join(scripts, "execution-start-recorded.mjs");
  renameSync(path.join(scripts, "execution-start.mjs"), real);
  writeFileSync(
    path.join(scripts, "execution-start.mjs"),
    [
      'import { spawnSync } from "node:child_process";',
      'import { appendFileSync } from "node:fs";',
      "const argv = process.argv.slice(2);",
      `appendFileSync(${JSON.stringify(log)}, JSON.stringify({ argv, cwd: process.cwd() }) + "\\n");`,
      `const run = spawnSync(process.execPath, [${JSON.stringify(real)}, ...argv], { stdio: "inherit" });`,
      "process.exitCode = run.status ?? 1;",
      "",
    ].join("\n"),
  );
  publishInstallation(origin, "record starts");
  return (): StartCall[] =>
    existsSync(log)
      ? readFileSync(log, "utf8")
          .split("\n")
          .filter((line) => line !== "")
          .map((line) => JSON.parse(line) as StartCall)
      : [];
}

// The start that establishes an unattached session in the project's default
// checkout: the one-shot start with no identity or publisher, with
// publication authority only for an automatic landing.
export const defaultMainStart = (project: string, landing: Landing) => [
  "start",
  ...(landing === "auto-land" ? ["--push-authorized"] : []),
  "--one-shot",
  "--default-main",
  ...(landing === "auto-land" ? ["--auto-land"] : []),
  "--workspace",
  project,
  "--branch",
  "main",
  "--mode",
  "story-branch",
  "--remote",
  "origin",
  "--target",
  "main",
  "--workspace-authorized",
];

// A new workspace of the project under `.worktrees/`.
export const worktree = (project: string, slug: string) =>
  path.join(project, ".worktrees", slug);

// The start that establishes an unattached session in a new workspace: the
// same one-shot start, given the project as its integration checkout and the
// workspace and branch the dashboard chose on the host's namespace.
export const isolatedStart = (
  project: string,
  slug: string,
  landing: Landing,
  host: Host = "claude",
) => [
  "start",
  "--integration",
  project,
  ...(landing === "auto-land" ? ["--push-authorized"] : []),
  "--one-shot",
  ...(landing === "auto-land" ? ["--auto-land"] : []),
  "--workspace",
  worktree(project, slug),
  "--branch",
  `${host}/${slug}`,
  "--mode",
  "story-branch",
  "--remote",
  "origin",
  "--target",
  "main",
  "--workspace-authorized",
];

// What a session established in a new workspace at `revision`, the fetched
// trunk its worktree was created at, is recorded as, and the block its first
// input carries. Its start reports no separate fetched trunk.
export const isolatedSession = (
  project: string,
  slug: string,
  landing: Landing,
  revision: string,
  host: Host = "claude",
): EstablishedSession => ({
  workspace: worktree(project, slug),
  role: "isolated",
  branch: `${host}/${slug}`,
  remote: "origin",
  target: "main",
  landing,
  startingRevision: revision,
  created: true,
});

// What a session established in the project's default checkout at `revision`
// is recorded as, and the block its first input carries.
export const defaultMainSession = (
  project: string,
  landing: Landing,
  revision: string,
): EstablishedSession => ({
  workspace: project,
  role: "default-checkout",
  branch: "main",
  remote: "origin",
  target: "main",
  landing,
  startingRevision: revision,
  fetched: revision,
  created: false,
});

export const sessionBlock = (session: EstablishedSession) =>
  [
    "Established session:",
    `- workspace: ${session.workspace}`,
    `- workspace role: ${session.role}`,
    `- branch: ${session.branch}`,
    `- remote: ${session.remote}`,
    `- target: ${session.target}`,
    `- landing: ${session.landing}`,
    `- startingRevision: ${session.startingRevision ?? ""}`,
    ...(session.fetched === undefined ? [] : [`- fetched: ${session.fetched}`]),
  ].join("\n");

export const git = (folder: string, ...args: string[]) =>
  execFileSync("git", ["-C", folder, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

// Every branch origin holds, with its revision.
export const originHeads = (origin: StartOrigin) =>
  origin.originGit("for-each-ref", "--format=%(refname) %(objectname)");

// The project's linked worktrees, as their folders under `.worktrees/`.
export const worktrees = (project: string) =>
  git(project, "worktree", "list", "--porcelain")
    .split("\n")
    .filter(
      (line) => line.startsWith("worktree ") && line.includes("/.worktrees/"),
    )
    .map((line) => line.slice(line.lastIndexOf("/") + 1));

// The new workspace as the start left it: its branch and revision.
export const established = (project: string, named: string) => ({
  branch: git(worktree(project, named), "branch", "--show-current"),
  revision: git(worktree(project, named), "rev-parse", "HEAD"),
});
