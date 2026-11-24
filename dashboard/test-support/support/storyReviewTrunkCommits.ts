// Who authors the commits of Story A's Trunk Mode review
// (./storyReviewTrunkMode.ts) and how they reach `origin/main`: the roster
// agent Yui-chan, a preparation agent, or a checkout's own author, another
// developer. Each checkout pushes its head onto trunk or meets trunk before writing.

import { execFileSync } from "node:child_process";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { git } from "./storyReviewWorktree.ts";

export const yui = agentIdentity("Yui");
// A preparation agent, whose commits are never the story's.
export const mina = { agent: "Mina-chan", email: "mina-chan@example.org" };

type Author = { readonly agent: string; readonly email: string };

// The environment in which Git names the agent given as a commit's author,
// or else the checkout's own author.
export const authoredBy = (author?: Author) =>
  author === undefined
    ? process.env
    : {
        ...process.env,
        GIT_AUTHOR_NAME: author.agent,
        GIT_AUTHOR_EMAIL: author.email,
      };

// Commits everything in a checkout, authored by the agent given or else by
// the checkout's own author.
export function commitAllAs(cwd: string, message: string, author?: Author) {
  git(cwd, "add", "--all");
  execFileSync("git", ["commit", "--quiet", "-m", message], {
    cwd,
    env: authoredBy(author),
  });
}

export const push = (cwd: string) =>
  git(cwd, "push", "--quiet", "origin", "HEAD:main");

// Trunk as a checkout on it meets it before writing.
export const pull = (cwd: string) =>
  git(cwd, "pull", "--quiet", "--ff-only", "origin", "main");
