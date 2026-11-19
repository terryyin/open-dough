// Story A's Trunk Mode review setup (own-changes, flagged, older-git specs)
// off a real bare origin (./startOrigin.ts): Yui-chan's claim, declared
// published attribution via `trunkModeStory`, rewrite actions via
// `publishRewrittenLine`, and the kept launch record (./storyLaunchRecord.ts).

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { Page } from "@playwright/test";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { withLocalState } from "../../../Distribution/tests/support/repository-local-state.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import type { StartRepository } from "./startOriginPreparation.ts";
import {
  commitAllAs,
  mina,
  pull,
  push,
  rebaseOntoTrunk,
  yui,
} from "./storyReviewTrunkCommits.ts";
import { branch, git, lines, writeAt } from "./storyReviewWorktree.ts";

// Yui-chan's profile naming the story she executes in Trunk Mode.
const yuiExecuting = (identity: string) =>
  makeMe.anAgentProfile
    .executing({ name: "Yui", identity, mode: "trunk", branch: "origin/main" })
    .please();

const byYui = { author: { name: yui.agent, email: yui.email } };
const byMina = { author: { name: mina.agent, email: mina.email } };

const aAfterS1 = lines("a").replace("a 0\n", "a one\n");
const aAfterO2 = aAfterS1.replace("a 11\n", "a last\n");

// Trunk up to Yui-chan's claim: `src/a.ts`, `src/b.ts` and `src/c.ts`, an
// earlier story she took, changed and closed, and then her claim, which moves
// Story A to Taken in Trunk Mode.
const trunkModeClaim = () =>
  queuedReadyRepository()
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
    });

// The worktree as the review's context line shows it.
export const shownWorkspace = "~/git/open-dough/.worktrees/story-a";

// Declared published history and Yui-chan's worktree; `unpublished` adds `u1`.
const notesUntracked = { untracked: { "notes.md": "notes\n" } } as const;
const unpublishedU1 = {
  ...byYui,
  files: { "src/g.ts": "g\n" },
} as const;

export function trunkModeStory({
  published,
  unpublished = false,
}: {
  readonly published: 0 | 1 | 2;
  readonly unpublished?: boolean;
}): StartRepository {
  const withNotes = (workspace: {
    please(): StartRepository;
    withUnpublishedRevision(
      name: "u1",
      facts: typeof unpublishedU1,
    ): { please(): StartRepository };
  }): StartRepository =>
    withLocalState(
      (unpublished
        ? workspace.withUnpublishedRevision("u1", unpublishedU1)
        : workspace
      ).please(),
      notesUntracked,
    );

  if (published === 0)
    return withNotes(
      trunkModeClaim().withWorkspace(branch, {
        from: "take Story A",
        agent: yui.agent,
      }),
    );

  const throughO2 = trunkModeClaim()
    .withRevision("s1", {
      ...byYui,
      files: { "src/a.ts": aAfterS1 },
    })
    .withRevision("o1", {
      files: { "src/b.ts": `${lines("b")}b more\n` },
    })
    .withRevision("prepare another story", {
      ...byMina,
      files: { "prep.md": "preparation\n" },
    })
    .withRevision("side work", {
      files: { "merged.md": "merged\n" },
    })
    .withRevision("merge side work", {
      ...byYui,
      parents: ["prepare another story", "side work"],
      files: { "merged.md": "merged\n" },
      message: "merge side work",
    })
    .withRevision("o2", {
      files: { "src/a.ts": aAfterO2 },
    });

  if (published === 1)
    return withNotes(
      throughO2.withWorkspace(branch, { from: "o2", agent: yui.agent }),
    );

  return withNotes(
    throughO2
      .withRevision("s2", {
        ...byYui,
        files: { "d.md": "story document\n" },
      })
      .withWorkspace(branch, { from: "s2", agent: yui.agent }),
  );
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
