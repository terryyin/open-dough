import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { timeFileSetting } from "../../src/skills/dough-execute-plan/scripts/slice-clock-record.mjs";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

const scripts = new URL(
  "../../src/skills/dough-execute-plan/scripts/",
  import.meta.url,
);
const script = fileURLToPath(new URL("slice-clock.mjs", scripts));
const hookScript = fileURLToPath(new URL("slice-clock-hook.mjs", scripts));
const dispatchedAt = Date.parse("2026-11-16T09:00:00Z");

function isoAt(minute) {
  return new Date(dispatchedAt + minute * 60_000).toISOString();
}

// The record the clock keeps in the Git state of the worktree `checkout` is in.
export async function clockRecord(checkout) {
  const found = await git(
    checkout,
    ...["rev-parse", "--git-path", "open-dough/slice-clock"],
  );
  return JSON.parse(
    readFileSync(resolve(checkout, found.stdout.trim()), "utf8"),
  );
}

// The files a run through the clock leaves for whoever waits for the proof.
export function proofFiles(scratch, name) {
  const log = join(scratch, `${name}.log`);
  const exitFile = join(scratch, `${name}.exit`);
  return { log, exitFile, flags: ["--log", log, "--exit-file", exitFile] };
}

// Runs a shell script through the clock, leaving `files` for its proof.
export function shellThroughClock(clock, worktree, files, script) {
  return clock(worktree, "run", ...files.flags, "--", "sh", "-c", script);
}

// A repository with a linked worktree, where an execution runs, and the clock
// time both read: minutes after the dispatch, moved only by the case.
export async function executionWorktree(t) {
  const repository = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("start", { backlog: null, files: { "README.md": "x\n" } })
      .please(),
  );
  const scratch = mkdtempSync(join(tmpdir(), "slice-clock-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const worktree = join(scratch, "execution");
  await git(
    repository.integration,
    ...["worktree", "add", "--quiet", "-b", "execution", worktree],
  );
  const timeFile = join(scratch, "now");
  const time = {
    // The clock reads `minute` minutes after the dispatch from now on.
    at: (minute) => writeFileSync(timeFile, `${isoAt(minute)}\n`),
    // A shell step that moves the clock time, for a command that takes time.
    shellStepTo: (minute) => `echo ${isoAt(minute)} > "$${timeFileSetting}"`,
  };
  time.at(0);
  // Runs a real clock script in `cwd` as its own process.
  const node = (cwd, args, stdin = "") =>
    new Promise((done, failed) => {
      const child = spawn(process.execPath, args, {
        cwd,
        env: { ...process.env, [timeFileSetting]: timeFile },
      });
      t.after(() => child.kill("SIGKILL"));
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
      child.on("error", failed);
      child.on("close", (exitStatus) => {
        const lines = stdout.split("\n").filter(Boolean);
        done({
          exitStatus,
          stderr,
          result: lines.length === 1 ? JSON.parse(lines[0]) : lines,
        });
      });
      child.stdin.end(stdin);
    });
  const clock = (cwd, ...args) => node(cwd, [script, ...args]);
  // Answers one host tool call: the host's hook input goes in on stdin. The
  // hook runs outside the worktree, so only its input names the checkout.
  const hook = (host, input) =>
    node(scratch, [hookScript, host], JSON.stringify(input));
  return {
    main: repository.integration,
    worktree,
    scratch,
    time,
    clock,
    hook,
  };
}
