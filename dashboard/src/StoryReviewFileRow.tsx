// A changed file's words and row details for Intent's story tree
// (`./IntentTreeFileRow.tsx`) and file heading
// (`./StoryReviewFileHeader.tsx`): each file's kind and path in words, the
// trunk-includes flag, the changed-file count wording, and added/removed line
// counts that describe the file's control.

import { useId } from "react";
import type { ReviewedFile } from "./storyReviewContract.ts";

export const kindWords: Record<ReviewedFile["kind"], string> = {
  added: "Added",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
};

// The flag of a file that includes trunk's changes.
export const includesTrunkWords = "includes trunk's changes";

// A file's kind and full path in words, and its flag, as its control is
// named.
export const reviewedFileWords = (file: ReviewedFile) =>
  `${kindWords[file.kind]} ${
    file.kind === "renamed" ? `${file.oldPath} → ${file.path}` : file.path
  }${file.includesTrunkFrom === undefined ? "" : `, ${includesTrunkWords}`}`;

const changedFileWords = (count: number) =>
  count === 1 ? "changed file" : "changed files";

// How many files a snapshot lists, in words.
export const changedFiles = (count: number) =>
  `${String(count)} ${changedFileWords(count)}`;

const lineWords = (count: number, change: string) =>
  `${String(count)} ${count === 1 ? "line" : "lines"} ${change}`;

export function useReviewFileDetails(file: ReviewedFile | undefined) {
  const countsId = useId();
  const lines = file?.lines;
  const counted =
    lines !== undefined && lines.added + lines.removed > 0 ? lines : undefined;
  return {
    descriptionId: counted === undefined ? undefined : countsId,
    details: (
      <>
        {file?.includesTrunkFrom !== undefined && (
          <span className="story-review-trunk"> {includesTrunkWords}</span>
        )}
        {counted === undefined ? null : (
          <>
            {" "}
            <span className="story-review-line-counts">
              <span className="story-review-lines-added">+{counted.added}</span>{" "}
              <span className="story-review-lines-removed">
                −{counted.removed}
              </span>
              <span id={countsId} hidden>
                {`${lineWords(counted.added, "added")}, ${lineWords(counted.removed, "removed")}`}
              </span>
            </span>
          </>
        )}
      </>
    ),
  };
}
