// The selected file's heading in Intent's story changes: its kind and
// path (`ReviewedFileName`), and, for a Done story's Published completion or
// landed run, Follow up beside that path (`./StoryAnchoredFollowUp.tsx`).

import { useDiffStoryNote } from "./StoryDiffNote.tsx";
import type { ReactNode } from "react";
import { StoryFileFollowUp } from "./StoryAnchoredFollowUp.tsx";
import type { ReviewedFile } from "./storyReviewFiles.ts";
import type { ReviewedWork } from "./reviewedFileRead.ts";
import { includesTrunkWords, kindWords } from "./StoryReviewFileRow.tsx";

export function ReviewedFileName({ file }: { readonly file: ReviewedFile }) {
  return (
    <>
      <span className="story-review-kind">{kindWords[file.kind]}</span>{" "}
      {file.kind === "renamed" ? (
        <>
          <code>{file.oldPath}</code> → <code>{file.path}</code>
        </>
      ) : (
        <code>{file.path}</code>
      )}
      {file.includesTrunkFrom !== undefined && (
        <span className="story-review-trunk">, {includesTrunkWords}</span>
      )}
    </>
  );
}

export function ReviewedFileHeader({
  reviewed,
  from,
  tree,
  file,
  moves,
}: {
  readonly reviewed: ReviewedWork;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
  readonly moves: ReactNode;
}) {
  const note = useDiffStoryNote(reviewed, from, tree, file);
  return (
    <div className="story-review-diff-heading">
      <h3>
        <ReviewedFileName file={file} />
      </h3>
      <StoryFileFollowUp
        reviewed={reviewed}
        from={from}
        tree={tree}
        file={file}
      />
      {note.available && (
        <button
          type="button"
          className="frame-button"
          onClick={() => {
            note.open();
          }}
        >
          Add note
        </button>
      )}
      {note.content}
      {moves}
    </div>
  );
}
