import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RepositoryRevision } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import type { StartRepository } from "./startOriginPreparation.ts";
import {
  addStoryWorktree,
  branch,
  commitAll,
  git,
  lines,
  writeAt,
} from "./storyReviewWorktree.ts";

// A file's lines, by its word, with its sixth line as given.
export const sixth = (word: string, line = `${word} 5`) =>
  lines(word).replace(`${word} 5\n`, `${line}\n`);

// Story A's worktree starts from trunk's `README.md` and
// `src/{a,b,c}.ts`, a committed slice adding `landed.txt`, then its change to
// `src/c.ts`'s sixth line, `c story`.
export function worktreeWithStoryCommits(origin: StartOrigin) {
  const project = origin.project;
  writeAt(project, "README.md", sixth("readme"));
  for (const word of ["a", "b", "c"])
    writeAt(project, `src/${word}.ts`, sixth(word));
  commitAll(project, "trunk files");
  git(project, "push", "--quiet", "origin", "main");

  const workspace = addStoryWorktree(project);
  writeAt(workspace, "landed.txt", "landed slice\n");
  commitAll(workspace, "landed slice");
  const landed = git(workspace, "rev-parse", "HEAD");
  writeAt(workspace, "src/c.ts", sixth("c", "c story"));
  commitAll(workspace, "story changes c");
  return { workspace, landed };
}

// Story A's declared history: trunk's `README.md` and `src/{a,b,c}.ts`, then
// the landed slice `landed` trunk takes, where the story's worktree starts,
// and trunk's `trunk changes` to `README.md` — with a `settled` line, also to
// `src/a.ts` and `src/c.ts`'s sixth line `c trunk`. The story commits
// `story changes c` (its sixth line `c story`), then any given `story`
// revision, then `merge trunk` with parents story then trunk, whose declared
// bytes settle `src/c.ts` with the line given, or merge cleanly without one,
// overridden by any `merged` files.
export function trunkIntegrationRepository(
  settled?: string,
  {
    story,
    merged = {},
  }: {
    readonly story?: RepositoryRevision;
    readonly merged?: Record<string, string>;
  } = {},
): StartRepository {
  const trunk = {
    "README.md": sixth("readme", "readme trunk"),
    ...(settled !== undefined && {
      "src/a.ts": sixth("a", "a trunk"),
      "src/c.ts": sixth("c", "c trunk"),
    }),
  };
  const described = queuedReadyRepository()
    .withRevision("trunk files", {
      files: {
        "README.md": sixth("readme"),
        ...Object.fromEntries(
          ["a", "b", "c"].map((word) => [`src/${word}.ts`, sixth(word)]),
        ),
      },
    })
    .withRevision("landed", { files: { "landed.txt": "landed slice\n" } })
    .withRevision("trunk changes", { files: trunk })
    .withWorkspace(branch, { from: "landed" })
    .withUnpublishedRevision("story changes c", {
      files: { "src/c.ts": sixth("c", "c story") },
    });
  const storyHead = story?.name ?? "story changes c";
  return (
    story ? described.withUnpublishedRevision(story.name, story) : described
  )
    .withUnpublishedRevision("merge trunk", {
      parents: [storyHead, "trunk changes"],
      files: {
        ...trunk,
        ...(settled !== undefined && { "src/c.ts": sixth("c", settled) }),
        ...merged,
      },
    })
    .please();
}
