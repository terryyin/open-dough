// The diff of one file a story review lists, read within the review's
// snapshot (`./storyReviewContract.ts`) from its *from* tree in the comparison shown:
// printed hunks via `./StoryReviewDiffLines.tsx`, with omitted unchanged lines
// available from the same comparison's file text (`./diffContextExpansion.ts`)
// as disposable presentation state. Both are fixed by the two trees, so the
// page asks each once (`./useReviewRead.ts`); an unavailable answer is asked
// again. When a Done story offers line Follow up, DiffLines opens that line's
// menu and this file mounts the same Start session dialog for the line.

import { useState } from "react";
import { textLines } from "./diffContextExpansion.ts";
import type { DiffLineSide } from "./DiffLineNumber.tsx";
import { useDoneStoryFollowUp } from "./doneStoryFollowUp.ts";
import {
  fileFollowUpParts,
  StoryLineFollowUp,
} from "./StoryAnchoredFollowUp.tsx";
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

const diffFixed = (answer: ReviewedFileDiff) => answer.kind === "diff";
const textFixed = (answer: ReviewedFileText) => answer.kind === "text";

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
    { fixed: diffFixed },
  );
  const [textRound, setTextRound] = useState(0);
  const [lineFollow, setLineFollow] = useState<{
    readonly line: number;
    readonly side: DiffLineSide;
  }>();
  const done = useDoneStoryFollowUp(reviewed.identity);
  const canLineFollow =
    done !== undefined &&
    fileFollowUpParts(reviewed, from, tree, file) !== undefined;
  const textEnabled = answer?.kind === "diff";
  const textRead = useReviewRead<ReviewedFileText>(
    storyReviewFileTextEndpoint,
    query,
    reviewedFileTextSchema,
    { round: textRound, enabled: textEnabled, fixed: textFixed },
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
          contextReading={textRead.reading}
          {...(sides === undefined && textProblem !== undefined
            ? { textProblem }
            : {})}
          onRetryText={() => {
            setTextRound((round) => round + 1);
          }}
          {...(canLineFollow
            ? {
                onLineFollowUp: (side: DiffLineSide, line: number) => {
                  setLineFollow({ line, side });
                },
              }
            : {})}
        />
      )}
      {lineFollow !== undefined && (
        <StoryLineFollowUp
          reviewed={reviewed}
          from={from}
          tree={tree}
          file={file}
          line={lineFollow.line}
          side={lineFollow.side}
          onClosed={() => {
            setLineFollow(undefined);
          }}
        />
      )}
    </>
  );
}
