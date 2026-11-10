// Another agent's Take on a start origin: the real start where a spec proves
// it, or a declared Take revision where a spec only needs the claim. Either
// leaves the claim checked out where a start leaves it:
// `another-agent-workspace` on `claude/another-agent` for Story Branch Mode,
// `.worktrees/<slug>` of the project on `exec/<slug>` for Trunk Mode.

import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { agentIdentity } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  takeRevision,
  type storyA,
} from "../../../tests/support/queued-repository.mjs";
import type { RevisionFacts } from "../../../tests/support/repositoryTestData.mjs";
import { queuedIdentity } from "./queuedStories.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";

const exec = promisify(execFile);

type BacklogEntry = typeof storyA;

type Placement =
  | { readonly mode: "story-branch" }
  | { readonly mode: "trunk"; readonly slug: string };

// Who takes which story, what stays queued, and in which mode.
// `publisher` becomes Claim-Publisher on the Take; default matches prior tests.
export type DeclaredTake = {
  readonly agent: string;
  readonly story: BacklogEntry;
  readonly queued: readonly BacklogEntry[];
  readonly publisher?: string;
} & Placement;

export type TakenStart = {
  readonly agent: string;
  readonly workspace: string;
  readonly branch: string;
};

async function git(cwd: string, ...args: string[]): Promise<string> {
  return (await exec("git", args, { cwd })).stdout;
}

export function anotherAgentTakes({
  machine,
  project,
  host,
  takenProfiles,
  publishRevision,
}: {
  readonly machine: string;
  readonly project: string;
  readonly host: "claude" | "codex" | "cursor";
  readonly takenProfiles: () => Promise<Record<string, unknown>[]>;
  readonly publishRevision: (revision: RevisionFacts) => Promise<string>;
}) {
  const placed = (placement: Placement) =>
    placement.mode === "trunk"
      ? {
          workspace: path.join(project, ".worktrees", placement.slug),
          branch: `exec/${placement.slug}`,
        }
      : {
          workspace: path.join(machine, "another-agent-workspace"),
          branch: "claude/another-agent",
        };
  // Runs the real start for another publisher and returns the claimed agent.
  const realStart = async (identity: string, placement: Placement) => {
    const { workspace, branch } = placed(placement);
    const scripts = installedSkillPath(
      host,
      { path: project, shown: project },
      "dough-execute-plan",
      "scripts",
    );
    await exec(
      process.execPath,
      [
        path.join(scripts, "execution-start.mjs"),
        "start",
        "--integration",
        project,
        "--workspace",
        workspace,
        "--branch",
        branch,
        "--identity",
        identity,
        "--publisher-id",
        "another-publisher",
        "--mode",
        placement.mode,
        "--remote",
        "origin",
        "--target",
        "main",
        "--push-authorized",
        "--workspace-authorized",
        "--host",
        "claude",
      ],
      { cwd: project },
    );
    const taken = (await takenProfiles()).find(
      (profile) => profile["identity"] === identity,
    );
    return { agent: String(taken?.["agent"]), workspace, branch };
  };
  return {
    async takenByAnotherAgent(identity = queuedIdentity) {
      return (await realStart(identity, { mode: "story-branch" })).agent;
    },
    async takenInTrunkMode(slug: string, identity = queuedIdentity) {
      return realStart(identity, { mode: "trunk", slug });
    },
    async publishTake({
      agent,
      story,
      queued,
      publisher = "another-publisher",
      ...placement
    }: DeclaredTake): Promise<TakenStart> {
      const { workspace, branch } = placed(placement);
      await publishRevision(
        takeRevision({
          story,
          queued,
          agent,
          committer: dashboardDeveloper,
          host: "claude",
          publisher,
          ...(placement.mode === "story-branch" && { branch }),
        }),
      );
      await git(project, "config", "extensions.worktreeConfig", "true");
      await git(project, "worktree", "add", "--quiet", "-b", branch, workspace);
      const author = agentIdentity(agent);
      await git(workspace, "config", "--worktree", "author.name", author.agent);
      await git(
        workspace,
        "config",
        "--worktree",
        "author.email",
        author.email,
      );
      return { agent: author.agent, workspace, branch };
    },
  };
}
