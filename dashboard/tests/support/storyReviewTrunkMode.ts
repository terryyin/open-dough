// Story A held in Trunk Mode for its review
// (../../../e2e/review/story-review-trunk-own-changes.spec.ts,
// ../../../e2e/review/story-review-trunk-own-flagged.spec.ts,
// ../../../e2e/review/story-review-trunk-own-older-git.spec.ts,
// ../../../e2e/review/story-review-trunk-own-since.spec.ts), off a real bare origin
// (./startOrigin.ts): the roster agent Yui-chan's claim on trunk moves Story
// A to Taken, and her worktree authors its commits as her through its own
// Git config (./storyReviewTrunkCommits.ts). She publishes each story commit from the worktree onto
// `origin/main`, where other developers' commits, a preparation agent's, and
// a merge she authored interleave with them; the worktree is rebased onto
// fetched trunk, so its head is trunk's. An earlier story she closed stays
// on trunk before the claim. Another developer can also rewrite the very
// line her second commit changed. Its kept launch record names the worktree
// (./storyLaunchRecord.ts). Specs start their origin from
// `trunkModeRepository`, which holds trunk up to her claim.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { execFileSync } from "node:child_process";
import type { Page } from "@playwright/test";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import {
  authoredBy,
  commitAllAs,
  mina,
  pull,
  push,
  rebaseOntoTrunk,
  yui,
} from "./storyReviewTrunkCommits.ts";
import {
  addStoryWorktree,
  git,
  lines,
  writeAt,
} from "./storyReviewWorktree.ts";

// Yui-chan's profile naming the story she executes in Trunk Mode.
const yuiExecuting = (identity: string) =>
  makeMe.anAgentProfile
    .executing({ name: "Yui", identity, mode: "trunk", branch: "origin/main" })
    .please();

const byYui = { author: { name: yui.agent, email: yui.email } };

// Trunk up to Yui-chan's claim: `src/a.ts`, `src/b.ts` and `src/c.ts`, an
// earlier story she took, changed and closed, and then her claim, which moves
// Story A to Taken in Trunk Mode.
export const trunkModeRepository = queuedReadyRepository()
  .withRevision("trunk files", {
    files: Object.fromEntries(
      ["a", "b", "c"].map((word) => [`src/${word}.ts`, lines(word)]),
    ),
  })
  .withRevision("take the earlier story", {
    ...byYui,
    agentProfiles: [yuiExecuting("SEED-OLD#old")],
  })
  .withRevision("earlier story", {
    ...byYui,
    files: { "old.md": "earlier story\n" },
  })
  .withRevision("close the earlier story", {
    ...byYui,
    remove: [`.planning/${yui.path}`],
  })
  .withRevision("take Story A", {
    ...byYui,
    backlog: { direction, taken: [storyA], queued: [storyB] },
    agentProfiles: [yuiExecuting(storyA.identity)],
  })
  .please();

// The worktree as the review's context line shows it.
export const shownWorkspace = "~/git/open-dough/.worktrees/story-a";

// Story A's Trunk Mode worktree, on an origin started from
// `trunkModeRepository`, with as many story commits published as said. The
// first is `s1`, the first line of `src/a.ts`, followed on trunk by `o1`
// changing `src/b.ts`, Mina-chan's `prep.md`, a merge Yui-chan
// authored bringing `merged.md`, and `o2`, the last line of `src/a.ts`; the
// second is `s2`, adding `d.md`. Either way `notes.md` is untracked and the
// head is trunk's, which is returned.
export function trunkModeStory(
  origin: StartOrigin,
  { published }: { readonly published: 0 | 1 | 2 },
) {
  const project = origin.project;
  const workspace = addStoryWorktree(project);
  git(workspace, "config", "extensions.worktreeConfig", "true");
  git(workspace, "config", "--worktree", "author.name", yui.agent);
  git(workspace, "config", "--worktree", "author.email", yui.email);
  if (published > 0) {
    writeAt(workspace, "src/a.ts", lines("a").replace("a 0\n", "a one\n"));
    commitAllAs(workspace, "s1");
    push(workspace);

    pull(project);
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
  pull(origin.project);
  writeAt(origin.project, "src/c.ts", cWith({ ...kept, 3: "c trunk" }));
  commitAllAs(origin.project, "o3");
  push(origin.project);
  return { trunk: rebaseOntoTrunk(workspace), beforeStory };
}

// Yui-chan's later story commit `s3`, adding `src/e.ts`, reaches trunk from
// the project's checkout, leaving the worktree's own commit unpublished, then
// with `trunkToo` another developer's `o4`, adding `src/f.ts`. Returns trunk.
export function publishLater(
  project: string,
  workspace: string,
  trunkToo: boolean,
) {
  pull(project);
  writeAt(project, "src/e.ts", "e\n");
  commitAllAs(project, "s3", yui);
  if (trunkToo) {
    writeAt(project, "src/f.ts", "f\n");
    commitAllAs(project, "o4");
  }
  push(project);
  return rebaseOntoTrunk(workspace);
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
