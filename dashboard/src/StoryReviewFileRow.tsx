// Review changes' file row and count wording for the shared folder tree
// (`./StoryReviewFileTree.tsx`, `./StoryReviewSnapshotView.tsx`): each file's
// kind and path in words, optional trunk-includes flag, and added/removed
// line counts that describe the control.

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

export const changedFileWords = (count: number) =>
  count === 1 ? "changed file" : "changed files";

// How many files a snapshot lists, in words.
export const changedFiles = (count: number) =>
  `${String(count)} ${changedFileWords(count)}`;

const lineWords = (count: number, change: string) =>
  `${String(count)} ${count === 1 ? "line" : "lines"} ${change}`;

// A file's control: its name, and its line counts when its diff adds or
// removes any, which describe the control in words.
export function FileRow({
  file,
  name,
  selected,
  onSelect,
}: {
  readonly file: ReviewedFile;
  readonly name: string;
  readonly selected: boolean;
  readonly onSelect: (path: string) => void;
}) {
  const countsId = useId();
  const counted =
    file.lines !== undefined && file.lines.added + file.lines.removed > 0
      ? file.lines
      : undefined;
  return (
    <button
      type="button"
      aria-label={reviewedFileWords(file)}
      aria-describedby={counted === undefined ? undefined : countsId}
      title={reviewedFileWords(file)}
      aria-pressed={selected}
      onClick={() => {
        onSelect(file.path);
      }}
    >
      <code>{name}</code>
      {file.includesTrunkFrom !== undefined && (
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
    </button>
  );
}
