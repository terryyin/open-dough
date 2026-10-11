// What the unattached Start session specs share on a real start origin
// (./startOrigin.ts): the installed start's invocations recorded as they
// happen, the start an unattached session's place is established by, and the
// "Established session" block its first input carries.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
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

// Puts a recorder in front of the project's installed start, committed and
// published so the default checkout stays clean and level with origin, and
// answers the invocations recorded so far: the arguments and the folder each
// ran in. The real start still runs, with the same arguments and result.
export function recordStarts(origin: StartOrigin, host: Host = "claude") {
  const folder = { path: origin.project, shown: origin.project };
  const scripts = installedSkillPath(
    host,
    folder,
    "dough-execute-plan",
    "scripts",
  );
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
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", origin.project, ...args], { stdio: "ignore" });
  git("add", ".");
  git("commit", "-m", "record starts");
  git("push", "origin", "main");
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
    `- fetched: ${session.fetched ?? ""}`,
  ].join("\n");
