// Linked worktrees of a start origin's project (./startOrigin.ts) that a
// known agent authors, each added by Git and configured through the real
// per-worktree authorship (`workspace-agent-authorship.mjs`), as local Git
// finds them for a story's review.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { configureAgentAuthorship } from "../../../src/skills/dough-execute-plan/scripts/workspace-agent-authorship.mjs";
import {
  agentIdentity,
  agentNameOf,
  renderAgentProfile,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";

// The agent's known name and identity, as its profile and author config
// spell them.
function identityOf(agent: string) {
  const name = agentNameOf(agent);
  if (name === undefined) throw new Error(`${agent} is no known agent.`);
  return agentIdentity(name) as {
    readonly name: string;
    readonly email: string;
    readonly path: string;
  };
}

// Another linked worktree of the project on `exec/<slug>` at a commit, which
// the agent authors as an owned workspace's real authorship configures it.
export async function agentWorktree(
  origin: StartOrigin,
  agent: string,
  slug: string,
  at: string,
) {
  const workspace = path.join(origin.project, ".worktrees", slug);
  git(
    origin.project,
    ...["worktree", "add", "--quiet", "-b", `exec/${slug}`, workspace, at],
  );
  expect(
    await configureAgentAuthorship(workspace, {
      agent,
      email: identityOf(agent).email,
    }),
  ).toBe("configured");
  return workspace;
}

// Such a worktree, left at the agent's own claim of a story: its head commits
// the agent's profile naming the story, which nothing publishes to trunk.
export async function claimWorktree(
  origin: StartOrigin,
  agent: string,
  slug: string,
  at: string,
  identity: string,
) {
  const workspace = await agentWorktree(origin, agent, slug, at);
  const { name, path: profile } = identityOf(agent);
  writeAt(
    workspace,
    path.join(".planning", profile),
    renderAgentProfile({
      name,
      identity,
      mode: "trunk",
      branch: "origin/main",
    }),
  );
  writeFileSync(path.join(workspace, `${slug}.txt`), `${slug}\n`);
  commitAll(workspace, `claim ${identity}`);
  return workspace;
}
