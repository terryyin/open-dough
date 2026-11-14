// The large comparison's changed-file facts. Git and review actions stay in
// storyReviewWorktree.ts and its journeys.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { lines } from "./storyReviewWorktree.ts";

// Two long files; the first ends in a line wider than the diff.
export const longA = "long-a.txt";
export const longB = "long-b.txt";

// What a consumer's assertions need of the comparison, stated where the
// consumer arranges it.
type LargeReviewFacts = {
  // How many one-line files each named folder holds.
  readonly filesPerFolder: Readonly<Record<string, number>>;
  // A file whose name is wider than the browser, where a consumer reads one.
  readonly wideName?: string;
  // Lines in each long file, before the first one's wide line.
  readonly longLines: number;
  readonly wideLine: string;
};

export function largeReviewRevision({
  filesPerFolder,
  wideName,
  longLines,
  wideLine,
}: LargeReviewFacts) {
  return makeMe.aRepository
    .withRevision("large changes", {
      backlog: null,
      files: {
        ...Object.fromEntries(
          Object.entries(filesPerFolder).flatMap(([folder, count]) =>
            [...Array(count).keys()].map((at) => [
              `${folder}/file-${String(at).padStart(2, "0")}.txt`,
              `${folder} ${String(at)}\n`,
            ]),
          ),
        ),
        ...(wideName === undefined ? {} : { [wideName]: "long name\n" }),
        [longA]: `${lines("first", longLines)}${wideLine}\n`,
        [longB]: lines("second", longLines),
      },
    })
    .please().revisions[0];
}
