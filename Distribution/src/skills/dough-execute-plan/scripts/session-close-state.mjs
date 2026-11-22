// A Land close's local recovery state, one file per session at the Git path
// `open-dough/session-close/<sessionId>.json`, so several sessions sharing one
// checkout each keep their own. It holds the exact `candidate` and
// `suffixBase` saved before each work push and, once sealed, the `record`
// saved before it is published. The state stays local; only the record is
// published.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function closeStatePath(workspace, sessionId) {
  const found = execFileSync(
    "git",
    ["rev-parse", "--git-path", `open-dough/session-close/${sessionId}.json`],
    { cwd: workspace, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return resolve(workspace, found.trim());
}

// The session's saved close state, or undefined when none was saved here.
export function readCloseState(workspace, sessionId) {
  try {
    return JSON.parse(
      readFileSync(closeStatePath(workspace, sessionId), "utf8"),
    );
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
}

// Merges `facts` into the session's saved close state, replacing the file
// whole so an interruption leaves the previous state intact.
export function saveCloseState(workspace, sessionId, facts) {
  const file = closeStatePath(workspace, sessionId);
  mkdirSync(dirname(file), { recursive: true });
  const state = { ...readCloseState(workspace, sessionId), ...facts };
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`);
  renameSync(temporary, file);
}
