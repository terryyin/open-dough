// Story A held in Trunk Mode for its review
// (../story-review-trunk-own-changes.spec.ts,
// ../story-review-trunk-own-flagged.spec.ts), off a real bare origin
// (./startOrigin.ts): the roster agent Yui-chan's claim on trunk moves Story
// A to Taken, and her worktree authors its commits as her through its own
// Git config. She publishes each story commit from the worktree onto
// `origin/main`, where other developers' commits, a preparation agent's, and
// a merge she authored interleave with them; the worktree is rebased onto
// fetched trunk, so its head is trunk's. An earlier story she closed stays
// on trunk before the claim. Another developer can also rewrite the very
// line her second commit changed. Its kept launch record names the worktree
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

// The worktree as the review's context line shows it.
export const shownWorkspace = "~/git/open-dough/.worktrees/story-a";

// Story A's Trunk Mode worktree, with as many story commits published as
// said. The first is `s1`, the first line of `src/a.ts`, followed on trunk
// by `o1` changing `src/b.ts`, Mina-chan's `prep.md`, a merge Yui-chan
// authored bringing `merged.md`, and `o2`, the last line of `src/a.ts`; the
// second is `s2`, adding `d.md`. Either way `notes.md` is untracked and the
// head is trunk's, which is returned.
export function trunkModeStory(
  origin: StartOrigin,
  { published }: { readonly published: 0 | 1 | 2 },
) {
  const project = origin.project;
  for (const word of ["a", "b", "c"])
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
  if (published > 0) {
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

    rebaseOntoTrunk(workspace);
  }
  if (published > 1) publishSecond(workspace);
  writeAt(workspace, "notes.md", "notes\n");
  return { workspace, trunk: git(workspace, "rev-parse", "origin/main") };
}

// The worktree's commits replayed onto freshly fetched trunk.
function rebaseOntoTrunk(workspace: string) {
  git(workspace, "fetch", "--quiet", "origin", "main");
  git(workspace, "rebase", "--quiet", "origin/main");
}

// Yui-chan publishes `s2`, adding `d.md` and holding the changed files also
// named, leaving the worktree's untracked file as it is.
function publishSecond(workspace: string, ...also: string[]) {
  writeAt(workspace, "d.md", "story document\n");
  git(workspace, "add", "d.md", ...also);
  git(workspace, "commit", "--quiet", "-m", "s2");
  push(workspace);
  git(workspace, "fetch", "--quiet", "origin", "main");
}

// `src/c.ts` with the lines given in place of its own, by line number.
const cWith = (changed: Readonly<Record<number, string>>) =>
  Object.entries(changed).reduce(
    (text, [line, now]) => text.replace(`c ${line}\n`, `${now}\n`),
    lines("c"),
  );

// Yui-chan publishes `s2`, which here also changes a line of `src/c.ts`, and
// another developer's `o3` then rewrites that very line; the worktree is
// rebased onto fetched trunk. With `earlier`, she first publishes a story
// commit changing another line of that file. Returns trunk and the tree
// before her first change to the file.
export function publishRewrittenLine(
  origin: StartOrigin,
  workspace: string,
  { earlier = false }: { readonly earlier?: boolean } = {},
) {
  const beforeStory = git(workspace, "rev-parse", "HEAD^{tree}");
  const kept = earlier ? { 9: "c nine" } : {};
  if (earlier) {
    writeAt(workspace, "src/c.ts", cWith(kept));
    git(workspace, "add", "src/c.ts");
    git(workspace, "commit", "--quiet", "-m", "s1 more");
    push(workspace);
  }
  writeAt(workspace, "src/c.ts", cWith({ ...kept, 3: "c story" }));
  publishSecond(workspace, "src/c.ts");
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  writeAt(origin.project, "src/c.ts", cWith({ ...kept, 3: "c trunk" }));
  commitAllAs(origin.project, "o3");
  push(origin.project);
  rebaseOntoTrunk(workspace);
  return { trunk: git(workspace, "rev-parse", "origin/main"), beforeStory };
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
