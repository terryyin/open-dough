// The diff of one file a story review lists, read within the review's
// snapshot (`./storyReviewContract.ts`) from its *from* tree in the comparison shown:
// printed hunks via `./StoryReviewDiffLines.tsx`, with omitted unchanged lines
// available from the same comparison's file text (`./diffContextExpansion.ts`)
// as disposable presentation state.

import { useState } from "react";
import { textLines } from "./diffContextExpansion.ts";
import { DiffLines } from "./StoryReviewDiffLines.tsx";
import {
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  type ReviewedFile,
  type ReviewedFileDiff,
  type ReviewedFileText,
} from "./storyReviewContract.ts";
import { useReviewRead } from "./useReviewRead.ts";

// The story whose review is open.
export type ReviewedStory = {
  readonly sourceId: string;
  readonly identity: string;
  readonly reference?: string;
  readonly completion?: string;
};

function reviewFileQuery(
  reviewed: ReviewedStory,
  from: string,
  tree: string,
  file: ReviewedFile,
) {
  return {
    source: reviewed.sourceId,
    identity: reviewed.identity,
    ...(reviewed.reference === undefined
      ? {}
      : { reference: reviewed.reference }),
    ...(reviewed.completion === undefined
      ? {}
      : { completion: reviewed.completion }),
    baseline: from,
    tree,
    path: file.path,
    ...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),
  };
}

// The selected file's diff from its *from* tree in the comparison shown to
// the snapshot's tree.
export function FileDiff({
  reviewed,
  from,
  tree,
  file,
}: {
  readonly reviewed: ReviewedStory;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
}) {
  const query = reviewFileQuery(reviewed, from, tree, file);
  const { answer, problem, reading } = useReviewRead<ReviewedFileDiff>(
    storyReviewFileEndpoint,
    query,
    reviewedFileDiffSchema,
  );
  const [textRound, setTextRound] = useState(0);
  const textEnabled = answer?.kind === "diff";
  const textRead = useReviewRead<ReviewedFileText>(
    storyReviewFileTextEndpoint,
    query,
    reviewedFileTextSchema,
    textRound,
    textEnabled,
  );
  const sides =
    textRead.answer?.kind === "text"
      ? {
          baseline: textLines(textRead.answer.baseline),
          tree: textLines(textRead.answer.tree),
        }
      : undefined;
  const textProblem =
    textRead.problem ??
    (textRead.answer?.kind === "unavailable"
      ? textRead.answer.explanation
      : undefined);

  return (
    <>
      <div role="status">
        {reading && <p>Reading the file&apos;s diff…</p>}
        {problem !== undefined && (
          <p>The file&apos;s diff could not be read: {problem}</p>
        )}
        {answer?.kind === "unavailable" && <p>{answer.explanation}</p>}
      </div>
      {answer?.kind === "diff" && (
        <DiffLines
          printed={answer.printed}
          sides={sides}
          {...(sides === undefined && textProblem !== undefined
            ? { textProblem }
            : {})}
          onRetryText={() => {
            setTextRound((round) => round + 1);
          }}
        />
      )}
    </>
  );
}
