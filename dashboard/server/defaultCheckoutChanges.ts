// The uncommitted changes in a project's default checkout, observed at the
// launch boundary before a launch that selects it starts anything: the paths
// Git status reports as staged, changed, deleted, or untracked (never their
// content), and a fingerprint of what was observed. A developer's
// confirmation names that fingerprint; a checkout whose observation no longer
// matches it needs a current confirmation. The fingerprint covers each
// path's size and modification time, read from the file system, so a file
// changed again after the warning is noticed without reading its content. It
// is a local comparison, never a kept confirmation.

import { createHash } from "node:crypto";
import { lstat } from "node:fs/promises";
import path from "node:path";
import {
  existingChangesShown,
  type ExistingChangesFound,
} from "../src/agentLaunch.ts";
import { runGit } from "./gitRunner.ts";
import type { ProjectFolder } from "./projectFolders.ts";

async function gitOutput(cwd: string, args: readonly string[]) {
  const { stdout } = await runGit(args, { cwd, maxBuffer: 64 * 1024 * 1024 });
  return stdout;
}

// The paths of `git status --porcelain=v1 -z` entries; a rename or copy names
// its new path, whose old one follows as its own field.
function statusPaths(status: string): string[] {
  const fields = status.split("\0").filter((field) => field !== "");
  const paths: string[] = [];
  for (let index = 0; index < fields.length; index += 1) {
    const entry = fields[index] ?? "";
    paths.push(entry.slice(3));
    if (/^[RC]/.test(entry)) index += 1;
  }
  return paths;
}

// What a path holds now, without its content.
async function pathState(checkout: string, file: string): Promise<string> {
  try {
    const { size, mtimeMs, ctimeMs } = await lstat(path.join(checkout, file));
    return `${String(size)}:${String(mtimeMs)}:${String(ctimeMs)}`;
  } catch {
    return "absent";
  }
}

// The default checkout's existing changes, or undefined when it holds none.
// A checkout Git cannot read is the start's to refuse.
export async function existingChanges(
  checkout: ProjectFolder,
): Promise<ExistingChangesFound | undefined> {
  let head: string;
  let status: string;
  try {
    head = await gitOutput(checkout.path, ["rev-parse", "--verify", "HEAD"]);
    status = await gitOutput(checkout.path, [
      "status",
      "--porcelain=v1",
      "-z",
      "--untracked-files=all",
    ]);
  } catch {
    return undefined;
  }
  const paths = statusPaths(status);
  if (paths.length === 0) return undefined;
  const fingerprint = createHash("sha256").update(head).update(status);
  for (const file of paths) {
    fingerprint.update(`\0${await pathState(checkout.path, file)}`);
  }
  return {
    kind: "existing-changes",
    paths: paths.slice(0, existingChangesShown),
    count: paths.length,
    fingerprint: fingerprint.digest("hex"),
  };
}
