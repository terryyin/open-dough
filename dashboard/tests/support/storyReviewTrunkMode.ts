// Story A held in Trunk Mode for its review
// (../story-review-trunk-own-changes.spec.ts), off a real bare origin
// (./startOrigin.ts): the roster agent Yui-chan's claim on trunk moves Story
// A to Taken, and her worktree authors its commits as her through its own
// Git config. She publishes each story commit from the worktree onto
// `origin/main`, where other developers' commits, a preparation agent's, and
// a merge she authored interleave with them; the worktree is rebased onto
// fetched trunk, so its head is trunk's. An earlier story she closed stays
// on trunk before the claim. Its kept launch record names the worktree
// (./storyLaunchRecord.ts).

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { backlogOf } from "../../../tests/support/product-backlog-fixture.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { originMain } from "./sessionDialog.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  type StartOrigin,
} from "./startOrigin.ts";
import {
  addStoryWorktree,
  git,
  lines,
  writeAt,
} from "./storyReviewWorktree.ts";

const yui = agentIdentity("Yui");
// A preparation agent, whose commits are never the story's.
const mina = { agent: "Mina-chan", email: "mina-chan@example.org" };

type Author = { readonly agent: string; readonly email: string };

// The environment in which Git names the agent given as a commit's author,
// or else the checkout's own author.
const authoredBy = (author?: Author) =>
  author === undefined
    ? process.env
    : {
        ...process.env,
        GIT_AUTHOR_NAME: author.agent,
        GIT_AUTHOR_EMAIL: author.email,
      };

// Commits everything in a checkout, authored by the agent given or else by
// the checkout's own author.
function commitAllAs(cwd: string, message: string, author?: Author) {
  git(cwd, "add", "--all");
  execFileSync("git", ["commit", "--quiet", "-m", message], {
    cwd,
    env: authoredBy(author),
  });
}

const push = (cwd: string) =>
  git(cwd, "push", "--quiet", "origin", "HEAD:main");

// Yui-chan's profile on trunk naming the story she executes in Trunk Mode.
function writeClaim(project: string, identity: string) {
  writeAt(
    project,
    `.planning/${yui.path}`,
    renderAgentProfile({
      name: "Yui",
      identity,
      mode: "trunk",
      branch: "origin/main",
    }),
  );
}

// Story A's Trunk Mode worktree. Published, it holds `s1`, the first line of
// `src/a.ts`, and `s2`, adding `d.md`, on trunk, with `o1` changing
// `src/b.ts`, Mina-chan's `prep.md`, a merge Yui-chan authored bringing
// `merged.md`, and `o2`, the last line of `src/a.ts`, between them. Either
// way `notes.md` is untracked and the head is trunk's, which is returned.
export function trunkModeStory(
  origin: StartOrigin,
  { published }: { readonly published: boolean },
) {
  const project = origin.project;
  for (const word of ["a", "b"])
    writeAt(project, `src/${word}.ts`, lines(word));
  commitAllAs(project, "trunk files");

  // An earlier story Yui-chan took, changed and closed.
  writeClaim(project, "SEED-OLD#old");
  commitAllAs(project, "take the earlier story", yui);
  writeAt(project, "old.md", "earlier story\n");
  commitAllAs(project, "earlier story", yui);
  rmSync(path.join(project, `.planning/${yui.path}`));
  commitAllAs(project, "close the earlier story", yui);

  // The claim: Story A is Taken, by Yui-chan in Trunk Mode.
  writeAt(
    project,
    ".planning/PRODUCT-BACKLOG.md",
    backlogOf(
      [`- [Story A](seeds/A.md#a) — ${queuedIdentity}`],
      [`- [Story B](seeds/B.md#b) — ${otherQueuedIdentity}`],
    ),
  );
  writeClaim(project, queuedIdentity);
  commitAllAs(project, "take Story A", yui);
  push(project);

  const workspace = addStoryWorktree(project);
  git(workspace, "config", "extensions.worktreeConfig", "true");
  git(workspace, "config", "--worktree", "author.name", yui.agent);
  git(workspace, "config", "--worktree", "author.email", yui.email);
  // Trunk as another developer's checkout meets it before writing.
  const pull = () =>
    git(project, "pull", "--quiet", "--ff-only", "origin", "main");
  if (published) {
    writeAt(workspace, "src/a.ts", lines("a").replace("a 0\n", "a one\n"));
    commitAllAs(workspace, "s1");
    push(workspace);

    pull();
    writeAt(project, "src/b.ts", `${lines("b")}b more\n`);
    commitAllAs(project, "o1");
    writeAt(project, "prep.md", "preparation\n");
    commitAllAs(project, "prepare another story", mina);
    git(project, "checkout", "--quiet", "-b", "side");
    writeAt(project, "merged.md", "merged\n");
    commitAllAs(project, "side work");
    git(project, "checkout", "--quiet", "main");
    execFileSync(
      "git",
      ["merge", "--quiet", "--no-ff", "-m", "merge side work", "side"],
      { cwd: project, env: authoredBy(yui) },
    );
    git(project, "branch", "--quiet", "-D", "side");
    writeAt(
      project,
      "src/a.ts",
      lines("a").replace("a 0\n", "a one\n").replace("a 11\n", "a last\n"),
    );
    commitAllAs(project, "o2");
    push(project);

    git(workspace, "fetch", "--quiet", "origin", "main");
    git(workspace, "rebase", "--quiet", "origin/main");
    writeAt(workspace, "d.md", "story document\n");
    commitAllAs(workspace, "s2");
    push(workspace);
    git(workspace, "fetch", "--quiet", "origin", "main");
  }
  writeAt(workspace, "notes.md", "notes\n");
  return { workspace, trunk: git(workspace, "rev-parse", "origin/main") };
}

// Yui-chan's unpublished commit `u1`, adding `src/g.ts` and leaving the
// worktree's untracked file as it is.
export function commitUnpublished(workspace: string) {
  writeAt(workspace, "src/g.ts", "g\n");
  git(workspace, "add", "src/g.ts");
  git(workspace, "commit", "--quiet", "-m", "u1");
}

// Story A's card in Taken, on a page reading the real bare origin as GitHub
// would.
export async function openTaken(page: Page, origin: StartOrigin) {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: await originMain(origin),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  return parts(page).taken.getByRole("article", { name: "Story A" });
}
