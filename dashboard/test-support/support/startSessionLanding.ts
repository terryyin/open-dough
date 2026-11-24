// What the unattached Start session specs share on a real start origin
// (./startOrigin.ts): the installed start's invocations recorded as they
// happen, the start that establishes a session in the execution checkout,
// what a session in either workspace is recorded as, and the "Established
// session" block its first input carries. An isolated session's admitting
// start is in ./isolatedSessionAdmissionProof.ts.

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
// ran in. The real start still runs, with the same arguments and result,
// unless a hold (./keptSessionStart.ts) keeps it from beginning or from answering.
export function recordStarts(origin: StartOrigin, host: Host = "claude") {
  const scripts = installedScripts(origin, host);
  const log = path.join(origin.machine, "start-calls.jsonl");
  const real = path.join(scripts, "execution-start-recorded.mjs");
  renameSync(path.join(scripts, "execution-start.mjs"), real);
  writeFileSync(
    path.join(scripts, "execution-start.mjs"),
    [
      'import { spawnSync } from "node:child_process";',
      'import { appendFileSync, existsSync, writeFileSync } from "node:fs";',
      "const argv = process.argv.slice(2);",
      `if (argv[0] === "start") appendFileSync(${JSON.stringify(log)}, JSON.stringify({ argv, cwd: process.cwd() }) + "\\n");`,
      "const held = (when) => {",
      `  const hold = ${JSON.stringify(path.join(origin.machine, "start-hold-"))} + when;`,
      "  if (!existsSync(hold)) return;",
      '  writeFileSync(hold + "-reached", "");',
      "  const wait = new Int32Array(new SharedArrayBuffer(4));",
      "  // Bounded, so a failed case's server can still close.",
      "  for (let waited = 0; existsSync(hold) && waited < 600; waited += 1) Atomics.wait(wait, 0, 0, 50);",
      "};",
      'if (argv[0] === "start") held("before");',
      `const run = spawnSync(process.execPath, [${JSON.stringify(real)}, ...argv], { stdio: ["ignore", "pipe", "inherit"] });`,
      'if (argv[0] === "start") held("after");',
      "process.stdout.write(run.stdout);",
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
export const executionCheckoutStart = (project: string, landing: Landing) => [
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

// What a session established in a new workspace at `revision`, the revision
// its worktree starts from, is recorded as, and the block its first input
// carries. Its start reports no separate fetched trunk.
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
});

// What a session established in the project's execution checkout at `revision`
// is recorded as, and the block its first input carries.
export const executionCheckoutSession = (
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
