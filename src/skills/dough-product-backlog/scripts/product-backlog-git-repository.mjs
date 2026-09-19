#!/usr/bin/env node
// The Git repository primitives the Git-aware backlog adapters share:
// resolving the real repository root a caller means, running real `git`
// commands against it, and registering the shared resolver as a custom merge
// driver for one attributed path. Nothing here knows about the backlog's own
// content or invariants; `product-backlog-git-merge.mjs` and its driver own
// that.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { BacklogError } from "./product-backlog-refusal.mjs";

const driverName = "dough-product-backlog";
const driverScript = fileURLToPath(
  new URL("./product-backlog-git-driver.mjs", import.meta.url),
);

// Every real Git call this adapter makes, in one place: `cwd` is always the
// resolved repository root, never the caller's own working directory, so a
// launch from a subdirectory of the repository still names paths Git and
// this tool agree on.
export function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

export function gitLine(args, cwd) {
  return git(args, cwd).trim();
}

// The same call, reporting failure instead of throwing, for the calls whose
// non-zero exit is an ordinary outcome this adapter reads rather than a
// crash: a merge that left conflicts, or a commit Git refuses because
// something unrelated is still unresolved.
export function gitOutcome(args, cwd) {
  try {
    return { code: 0, stdout: git(args, cwd) };
  } catch (error) {
    return {
      code: typeof error.status === "number" ? error.status : 1,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
    };
  }
}

export function repositoryRoot(cwd) {
  try {
    return gitLine(["rev-parse", "--show-toplevel"], cwd);
  } catch {
    throw new BacklogError(`${cwd} is not inside a Git repository.`);
  }
}

// Registers this one path to be reconciled by the shared resolver for every
// future content merge Git attempts on it in this checkout. Both the
// attribute and the driver command are written to this checkout's own
// `.git/` directory — never to a file a project tracks or ships — because
// registering the driver for every checkout a project might have, on every
// install, is a separate, later concern; this adapter only needs the
// mechanism to be in effect for the merge it is about to run.
export function ensureDriverRegistered(repoRoot, file) {
  const attributesPath = join(repoRoot, ".git", "info", "attributes");
  const line = `/${file} merge=${driverName}`;
  const existing = existsSync(attributesPath)
    ? readFileSync(attributesPath, "utf8")
    : "";
  if (!existing.split("\n").includes(line)) {
    const separator = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
    writeFileSync(attributesPath, `${existing}${separator}${line}\n`, "utf8");
  }
  git(
    [
      "config",
      `merge.${driverName}.name`,
      "Reconcile the product backlog through its shared resolver",
    ],
    repoRoot,
  );
  git(
    [
      "config",
      `merge.${driverName}.driver`,
      `${process.execPath} ${driverScript} %O %A %B %P`,
    ],
    repoRoot,
  );
}
