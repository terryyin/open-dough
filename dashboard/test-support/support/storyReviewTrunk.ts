import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RepositoryRevision } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import type { StartRepository } from "./startOriginPreparation.ts";
import { branch, git, lines } from "./storyReviewWorktree.ts";

// A file's lines, by its word, with its sixth line as given.
export const sixth = (word: string, line = `${word} 5`) =>
  lines(word).replace(`${word} 5\n`, `${line}\n`);

// Whether Git merging two named parents conflicts: `merge-tree` exits 1; any
// other failure is not an answer.
export function declaredParentsConflict(
  origin: StartOrigin,
  first: string,
  second: string,
) {
  try {
    git(
      origin.project,
      "merge-tree",
      "--write-tree",
      origin.revision(first),
      origin.revision(second),
    );
    return false;
  } catch (error) {
    if ((error as { status?: number }).status === 1) return true;
    throw error;
  }
}

// Whether Git, merging the story merge's named `story` parent with trunk's
// `trunk changes` itself, conflicts.
export function parentsConflict(origin: StartOrigin, story: string) {
  return declaredParentsConflict(origin, story, "trunk changes");
}

// Story A's declared history: trunk's `README.md` and `src/{a,b,c}.ts`, then
// the landed slice `landed` trunk takes, where the story's worktree starts,
// and trunk's `trunk changes` to `README.md` — with a `settled` line, also to
// `src/a.ts` and `src/c.ts`'s sixth line `c trunk`. The story commits
// `story changes c` (its sixth line `c story`), then any given `story`
// revision, then `merge trunk` with parents story then trunk, whose declared
// bytes settle `src/c.ts` — or the story's `renamed` path for it — with the
// line given, or merge cleanly without one, overridden by any `merged` files;
// then any given `after` revision.
export function trunkIntegrationRepository(
  settled?: string,
  {
    story,
    renamed,
    merged = {},
    after,
  }: {
    readonly story?: RepositoryRevision;
    readonly renamed?: string;
    readonly merged?: Record<string, string>;
    readonly after?: RepositoryRevision;
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
  // A story that renamed `src/c.ts` keeps trunk's edit only at its new path.
  const trunkKept = Object.fromEntries(
    Object.entries(trunk).filter(([file]) => !renamed || file !== "src/c.ts"),
  );
  const integrated = (
    story ? described.withUnpublishedRevision(story.name, story) : described
  ).withUnpublishedRevision("merge trunk", {
    parents: [storyHead, "trunk changes"],
    files: {
      ...trunkKept,
      ...(settled !== undefined && {
        [renamed ?? "src/c.ts"]: sixth("c", settled),
      }),
      ...merged,
    },
  });
  return (
    after ? integrated.withUnpublishedRevision(after.name, after) : integrated
  ).please();
}
