// The large comparison's changed-file facts. Git and review actions stay in
// storyReviewWorktree.ts and its journeys.
import { makeMe } from "../../../tests/support/makeMe.mjs";

export const longA = "long-a.txt";
export const longB = "long-b.txt";

export function largeReviewRevision(first: string, second: string) {
  return makeMe.aRepository
    .withRevision("large changes", {
      backlog: null,
      files: {
        ...Object.fromEntries(
          ["many", "more"].flatMap((folder) =>
            [...Array(30).keys()].map((at) => [
              `${folder}/file-${String(at).padStart(2, "0")}.txt`,
              `${folder} ${String(at)}\n`,
            ]),
          ),
        ),
        [`a-file-named-${"at-length-".repeat(6)}.txt`]: "long name\n",
        [longA]: first,
        [longB]: second,
      },
    })
    .please().revisions[0];
}
