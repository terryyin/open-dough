// What the start reads from git: the project's origin, the slugs its
// workspaces already use, the Agent that owns a claim on origin's trunk, and
// the arguments that resume a start lost with the server.

import { hostDescriptions } from "../src/hostDescription.ts";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { worktreesFolder } from "./launchWorkspace.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// What git printed, or "" when the call failed.
export async function git(
  project: Pick<ProjectFolder, "path">,
  args: readonly string[],
): Promise<string> {
  try {
    const { stdout } = await runGit(args, {
      cwd: project.path,
      maxBuffer: defaultGitOutputLimit,
    });
    return stdout;
  } catch {
    return "";
  }
}

// `owner/name` of a GitHub remote URL, however it is spelled.
export function repositoryOf(url: string): string | undefined {
  return /github\.com[:/]([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/i
    .exec(url.trim())?.[1]
    ?.toLowerCase();
}

// Slugs a new workspace must not reuse: the folders under `.worktrees/` and
// the branches for every supported host, whichever exists.
export async function takenSlugs(project: ProjectFolder): Promise<Set<string>> {
  const folders = await readdir(path.join(project.path, worktreesFolder)).catch(
    (): string[] => [],
  );
  const namespaces = Object.values(hostDescriptions).map(
    ({ branchNamespace }) => branchNamespace,
  );
  const branches = (
    await git(project, [
      "for-each-ref",
      "--format=%(refname:short)",
      ...namespaces.map((namespace) => `refs/heads/${namespace}`),
    ])
  )
    .split("\n")
    .flatMap((name) => {
      const namespace = namespaces.find((prefix) => name.startsWith(prefix));
      return namespace === undefined ? [] : [name.slice(namespace.length)];
    });
  return new Set([...folders, ...branches]);
}

// The Agent whose profile on origin's trunk names the story, once the start
// has fetched it.
export async function ownerOf(
  project: ProjectFolder,
  ref: string,
  identity: string,
): Promise<string | undefined> {
  const listed = await git(project, [
    "ls-tree",
    "--name-only",
    ref,
    ".planning/agents/",
  ]);
  for (const file of listed.split("\n").filter((name) => name !== "")) {
    try {
      const profile = JSON.parse(
        await git(project, ["show", `${ref}:${file}`]),
      ) as {
        agent?: unknown;
        identity?: unknown;
      };
      if (profile.identity === identity && typeof profile.agent === "string") {
        return profile.agent;
      }
    } catch {
      // A profile that is not JSON names no owner.
    }
  }
  return undefined;
}

// The script arguments that resume a start lost with the server, read from
// its kept workspace: the candidate is the workspace HEAD and the starting
// revision its parent, only when that workspace is on the kept branch. The
// script validates them against the claim commit's trailers and stops with
// its own reason when the workspace is not the isolated claim.
export async function lostStartArguments(
  workspace: string,
  branch: string,
): Promise<string[]> {
  const at = { path: workspace };
  const [current, head, parent] = (
    await Promise.all([
      git(at, ["rev-parse", "--abbrev-ref", "HEAD"]),
      git(at, ["rev-parse", "HEAD"]),
      git(at, ["rev-parse", "HEAD^"]),
    ])
  ).map((line) => line.trim());
  return current === branch && head && parent
    ? ["--starting-revision", parent, "--candidate-sha", head]
    : [];
}
