// A project folder whose installed skill establishes a start but whose start
// command only waits and reports nothing: the folder a page spec needs to see
// what the page says while a start is under way, without a real origin. The
// folder is a Git repository whose `origin` is spelled as the catalog
// repository, so the dashboard runs the command; its two scripts are the
// files the dashboard looks for, the start command holding for `holdMs`
// before it ends without a result (an unreadable one, which the launch
// answers as a refused start).

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export function installHeldStart(
  project: string,
  holdMs: number,
  repository = "terryyin/open-dough",
): void {
  const scripts = path.join(
    project,
    ".claude",
    "skills",
    "dough-execute-plan",
    "scripts",
  );
  mkdirSync(scripts, { recursive: true });
  writeFileSync(
    path.join(scripts, "execution-start.mjs"),
    `setTimeout(() => {}, ${String(holdMs)});\n`,
  );
  writeFileSync(path.join(scripts, "established-start.mjs"), "\n");
  execFileSync("git", ["init", "-b", "main", project], { stdio: "ignore" });
  execFileSync(
    "git",
    [
      "-C",
      project,
      "remote",
      "add",
      "origin",
      `https://github.com/${repository}.git`,
    ],
    { stdio: "ignore" },
  );
}
