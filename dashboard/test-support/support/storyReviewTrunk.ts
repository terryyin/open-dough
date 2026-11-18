import type { StartOrigin } from "./startOrigin.ts";
import {
  addStoryWorktree,
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

// Trunk takes the landed slice and changes `README.md`,
// `src/a.ts`, and `src/c.ts`'s sixth line to `c trunk`; the story merges
// trunk, settling `src/c.ts`'s conflict with the sixth line given. Without
// one, trunk changes `README.md` only and the story merges it cleanly.
export function integrateTrunk(
  origin: StartOrigin,
  { workspace, landed }: { workspace: string; landed: string },
  settled?: string,
) {
  const project = origin.project;
  git(project, "merge", "--quiet", "--ff-only", landed);
  writeAt(project, "README.md", sixth("readme", "readme trunk"));
  if (settled !== undefined) {
    writeAt(project, "src/a.ts", sixth("a", "a trunk"));
    writeAt(project, "src/c.ts", sixth("c", "c trunk"));
  }
  commitAll(project, "trunk changes");
  git(project, "push", "--quiet", "origin", "main");

  git(workspace, "fetch", "--quiet", "origin", "main");
  if (settled === undefined) {
    git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
    return;
  }
  try {
    git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
    return;
  } catch {
    // `src/c.ts` conflicts; the story settles it.
  }
  writeAt(workspace, "src/c.ts", sixth("c", settled));
  commitAll(workspace, "merge trunk");
}
