// The diff of one file a story review lists, read within the review's
// snapshot (`./storyReviewContract.ts`) from its *from* tree in the comparison shown:
// printed hunks via `./StoryReviewDiffLines.tsx`, with omitted unchanged lines
// available from the same comparison's file text (`./diffContextExpansion.ts`)
// as disposable presentation state, and every line's code syntax-styled from
// that text by the file's path (`./diffLineTokens.ts`). Both are fixed by the
// two trees, so the page asks each once (`./useReviewRead.ts`); an
// unavailable answer is asked again. When a Done story offers line Follow up,
// DiffLines opens that line's menu and this file mounts the same Start
// session dialog for the line.

import { useDiffStoryNote } from "./StoryDiffNote.tsx";
import { useState } from "react";
import { textLines } from "./diffContextExpansion.ts";
import { useDiffLineTokens } from "./diffLineTokens.ts";
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
import {
  reviewedStoryIdentity,
  reviewedWorkQuery,
  type ReviewedWorkSubject,
} from "./reviewedWorkSubject.ts";
import { useReviewRead } from "./useReviewRead.ts";
import { reviewedFilePaths } from "./reviewedFileContext.ts";

// The reviewed work whose file diff is open: a story or ad hoc session,
// with the retained pair a historical comparison names.
export type ReviewedWork = {
  readonly subject: ReviewedWorkSubject;
  readonly reference?: string;
  readonly completion?: string;
};

function reviewFileQuery(
  reviewed: ReviewedWork,
  from: string,
  tree: string,
  file: ReviewedFile,
) {
  return {
    ...reviewedWorkQuery(reviewed.subject),
    ...(reviewed.reference === undefined
      ? {}
      : { reference: reviewed.reference }),
    ...(reviewed.completion === undefined
      ? {}
      : { completion: reviewed.completion }),
    baseline: from,
    tree,
    ...reviewedFilePaths(file),
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
  readonly reviewed: ReviewedWork;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
}) {
  const note = useDiffStoryNote(reviewed, from, tree, file);
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
  const done = useDoneStoryFollowUp(reviewedStoryIdentity(reviewed.subject));
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
  const text = textRead.answer?.kind === "text" ? textRead.answer : undefined;
  const sides =
    text === undefined
      ? undefined
      : { baseline: textLines(text.baseline), tree: textLines(text.tree) };
  const lineTokens = useDiffLineTokens(file.path, text);
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
          lineTokens={lineTokens}
          contextReading={textRead.reading}
          {...(sides === undefined && textProblem !== undefined
            ? { textProblem }
            : {})}
          onRetryText={() => {
            setTextRound((round) => round + 1);
          }}
          {...(note.available
            ? {
                onLineAddNote: (
                  side: DiffLineSide,
                  number: number,
                  text: string,
                ) => {
                  note.open({ side, number, text });
                },
              }
            : {})}
          {...(canLineFollow
            ? {
                onLineFollowUp: (side: DiffLineSide, line: number) => {
                  setLineFollow({ line, side });
                },
              }
            : {})}
        />
      )}
      {note.content}
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
