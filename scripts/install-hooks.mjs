import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Points this repository's common Git configuration at the tracked hooks so
// every checkout and worktree containing them runs them. Writes only when the
// value differs, and does nothing (exit 0) without Git or outside a checkout
// of this repository, such as an unpacked tarball.
const hooksPath = ".githooks";
const root = realpathSync(fileURLToPath(new URL("..", import.meta.url)));

function git(...args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  return result.error || result.status === null ? null : result;
}

const top = git("rev-parse", "--show-toplevel");
if (top?.status === 0 && realpathSync(top.stdout.trim()) === root) {
  const current = git("config", "--local", "--get", "core.hooksPath");
  if (current && current.stdout.trim() !== hooksPath) {
    git("config", "--local", "core.hooksPath", hooksPath);
  }
}
