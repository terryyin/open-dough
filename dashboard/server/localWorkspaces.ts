// The linked worktrees of each configured project's local checkout that hold
// a story's claim on this machine, read from local Git alone: the checkout's
// worktree list, each worktree's own author config
// (`workspace-agent-authorship.mjs` writes it for an owned workspace), the
// profile its head commits for that agent beside the backlog, and the
// profile the project's trunk on `origin` publishes for that agent as last
// fetched. A worktree whose author is a known agent and whose head's profile
// for that agent names a story holds that story's claim while trunk's profile
// for the agent names the same story, whether or not a dashboard launch
// started it. The main worktree and a worktree without a branch are passed
// over. A Git failure on one worktree passes that worktree over, and a
// failure listing a project's worktrees leaves that project without any.
// Nothing is fetched, nothing is kept between reads and nothing is published.

import { realpath } from "node:fs/promises";
import path from "node:path";
import type { LocalWorkspace } from "../src/localWorkspace.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  agentIdentity,
  agentNameOf,
  parseAgentProfileFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { shownStartWorkspace } from "./launchWorkspace.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import { folderExists, projectFolder } from "./projectFolders.ts";
import { agentProfileDirectoryOf } from "./recordsBesideBacklog.ts";

// How long one project's worktrees may take to read.
const scanWaitMs = 10_000;

// A found worktree with the folder its Git runs in.
export type FoundWorkspace = LocalWorkspace & { readonly path: string };

// The linked worktrees `git worktree list --porcelain` printed after the
// main one, each with its branch's short name when it is on one.
function linkedWorktrees(
  printed: string,
): { readonly path: string; readonly branch?: string }[] {
  return printed
    .split("\n\n")
    .slice(1)
    .flatMap((block) => {
      const lines = block.split("\n");
      const worktree = lines.find((line) => line.startsWith("worktree "));
      if (worktree === undefined) return [];
      const branch = lines
        .find((line) => line.startsWith("branch refs/heads/"))
        ?.slice("branch refs/heads/".length);
      return [
        {
          path: worktree.slice("worktree ".length),
          ...(branch === undefined ? {} : { branch }),
        },
      ];
    });
}

// The worktrees of the project's local checkout holding a story's claim.
export async function localWorkspacesOf(
  source: PublishedSource,
): Promise<FoundWorkspace[]> {
  const project = projectFolder(source);
  if (!(await folderExists(project))) return [];
  const signal = AbortSignal.timeout(scanWaitMs);
  const git = async (cwd: string, ...args: string[]) =>
    (
      await runGit(args, { cwd, signal, maxBuffer: defaultGitOutputLimit })
    ).stdout.trim();
  const profiles = agentProfileDirectoryOf(source);
  try {
    // Git lists worktrees by their resolved paths; the project's folder is
    // named as configured, so each is placed under it again.
    const resolved = await realpath(project.path);
    const listed = linkedWorktrees(
      await git(project.path, "worktree", "list", "--porcelain"),
    );
    const found = await Promise.all(
      listed.map(async ({ path: listedPath, branch }) => {
        if (branch === undefined) return [];
        try {
          const name = agentNameOf(
            await git(
              listedPath,
              "config",
              "--worktree",
              "--get",
              "author.name",
            ),
          );
          if (name === undefined) return [];
          const { agent, path: profilePath } = agentIdentity(name);
          const fileName = path.posix.basename(profilePath);
          const profileAt = async (revision: string) => {
            const read = parseAgentProfileFile(
              fileName,
              await git(
                listedPath,
                "show",
                `${revision}:${profiles}/${fileName}`,
              ),
            ) as { ok: boolean; profile?: { identity: string } };
            return read.ok ? read.profile : undefined;
          };
          const held = await profileAt("HEAD");
          if (held === undefined) return [];
          // Trunk publishes the agent for the story the head names.
          const published = await profileAt(`origin/${source.ref}`);
          if (published?.identity !== held.identity) return [];
          const relative = path.relative(resolved, listedPath);
          const workspace =
            relative.split(path.sep)[0] === ".." || path.isAbsolute(relative)
              ? listedPath
              : path.join(project.path, relative);
          return [
            {
              source: source.id,
              identity: held.identity,
              agent,
              workspace: shownStartWorkspace(project, workspace),
              branch,
              path: workspace,
            },
          ];
        } catch {
          return [];
        }
      }),
    );
    return found.flat();
  } catch {
    return [];
  }
}

// Every configured project's found worktrees, as the sessions answer carries
// them: without this machine's own path when the page shows another.
export async function localWorkspaces(): Promise<LocalWorkspace[]> {
  const found = await Promise.all(configuredProjects().map(localWorkspacesOf));
  return found.flat().map(({ source, identity, agent, workspace, branch }) => ({
    source,
    identity,
    agent,
    workspace,
    branch,
  }));
}
