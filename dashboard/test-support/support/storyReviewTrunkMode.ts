// Story A's published Trunk changes, mixed attribution, and dirty writer fixture.

import type { Page } from "@playwright/test";
import { withLocalState } from "../../../Distribution/tests/support/repository-local-state.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import type { StartRepository } from "./startOriginPreparation.ts";
import {
  byMina,
  byYui,
  trunkModeClaimBuilder,
} from "./storyReviewTrunkAmbiguity.ts";
import { yui } from "./storyReviewTrunkCommits.ts";
import { branch, lines } from "./storyReviewWorktree.ts";

const aAfterS1 = lines("a").replace("a 0\n", "a one\n");
const aAfterO2 = aAfterS1.replace("a 11\n", "a last\n");

// `src/c.ts` with the lines given in place of its own, by line number.
const cWith = (changed: Readonly<Record<number, string>>) =>
  Object.entries(changed).reduce(
    (text, [line, now]) => text.replace(`c ${line}\n`, `${now}\n`),
    lines("c"),
  );

const cNine = { 9: "c nine" } as const;
const cStory = { ...cNine, 3: "c story" } as const;
const cTrunk = { ...cNine, 3: "c trunk" } as const;

// Declared published history and Yui-chan's worktree; `unpublished` adds `u1`.
const notesUntracked = { untracked: { "notes.md": "notes\n" } } as const;
const unpublishedU1 = {
  ...byYui,
  files: { "src/g.ts": "g\n" },
} as const;

type WorkspaceChain = {
  please(): StartRepository;
  withUnpublishedRevision(
    name: "u1",
    facts: typeof unpublishedU1,
  ): { please(): StartRepository };
};

const withNotes = (
  workspace: WorkspaceChain,
  unpublished: boolean,
): StartRepository =>
  withLocalState(
    (unpublished
      ? workspace.withUnpublishedRevision("u1", unpublishedU1)
      : workspace
    ).please(),
    notesUntracked,
  );

const throughO2 = () =>
  trunkModeClaimBuilder()
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

export function trunkModeStory(
  options:
    | {
        readonly published: 2;
        readonly unpublished?: boolean;
      }
    | {
        readonly rewritten: true;
        readonly unpublished?: boolean;
      },
): StartRepository {
  const unpublished = options.unpublished ?? false;

  if ("rewritten" in options)
    return withNotes(
      throughO2()
        .withRevision("s1 more", {
          ...byYui,
          files: { "src/c.ts": cWith(cNine) },
        })
        .withRevision("s2", {
          ...byYui,
          files: {
            "src/c.ts": cWith(cStory),
            "d.md": "story document\n",
          },
        })
        .withRevision("o3", {
          files: { "src/c.ts": cWith(cTrunk) },
        })
        .withWorkspace(branch, { from: "o3", agent: yui.agent }),
      unpublished,
    );

  return withNotes(
    throughO2()
      .withRevision("s2", {
        ...byYui,
        files: { "d.md": "story document\n" },
      })
      .withWorkspace(branch, { from: "s2", agent: yui.agent }),
    unpublished,
  );
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
