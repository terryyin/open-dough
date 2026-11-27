// Reads the selected file's diff and both texts from the story review's two
// trees (`./storyReviewContract.ts`). An unavailable answer can be retried.
// StyledFileDiff renders the lines and opens their menus. This component
// handles story notes and opens the Start session dialog for line Follow up.

import { useDiffStoryNote } from "./StoryDiffNote.tsx";
import { useState, type RefObject } from "react";
import type { DiffLineSide } from "./DiffLineNumber.tsx";
import {
  fileFollowUpTarget,
  useReviewedStoryFollowUp,
  StoryLineFollowUp,
} from "./StoryAnchoredFollowUp.tsx";
import { StyledFileDiff } from "./StyledFileDiff.tsx";
import {
  type ReviewedFile,
  type ReviewedFileDiff,
  type ReviewedFileText,
} from "./storyReviewContract.ts";
import { reviewedFileQuery, type ReviewedWork } from "./reviewedFileRead.ts";
import { useReviewRead } from "./useReviewRead.ts";
import { reviewedFilePaths } from "./reviewedFileContext.ts";

function reviewFileQuery(
  reviewed: ReviewedWork,
  from: string,
  tree: string,
  file: ReviewedFile,
) {
  return reviewedFileQuery({
    ...reviewed,
    baseline: from,
    tree,
    ...reviewedFilePaths(file),
  });
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
  syntaxHint,
  readingArea,
}: {
  readonly reviewed: ReviewedWork;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
  // Intent `syntax` hint when the path names no grammar (`./diffLineTokens.ts`).
  readonly syntaxHint?: string;
  readonly readingArea: RefObject<HTMLElement | null>;
}) {
  const note = useDiffStoryNote(reviewed, from, tree, file);
  const query = reviewFileQuery(reviewed, from, tree, file);
  const { answer, problem, reading } = useReviewRead("fileDiff", query, {
    fixed: diffFixed,
  });
  const [textRound, setTextRound] = useState(0);
  const [lineFollow, setLineFollow] = useState<{
    readonly line: number;
    readonly side: DiffLineSide;
    readonly opening: number;
  }>();
  const done = useReviewedStoryFollowUp(reviewed);
  const canLineFollow =
    done !== undefined &&
    fileFollowUpTarget(reviewed, from, tree, file) !== undefined;
  const textEnabled = answer?.kind === "diff";
  const textRead = useReviewRead("fileText", query, {
    round: textRound,
    enabled: textEnabled,
    fixed: textFixed,
  });
  const text = textRead.answer?.kind === "text" ? textRead.answer : undefined;
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
        <StyledFileDiff
          path={file.path}
          printed={answer.printed}
          {...(text === undefined ? {} : { text })}
          {...(syntaxHint === undefined ? {} : { syntaxHint })}
          {...(textProblem === undefined ? {} : { textProblem })}
          readingArea={readingArea}
          contextReading={textRead.reading}
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
                  setLineFollow((previous) => ({
                    line,
                    side,
                    opening: (previous?.opening ?? 0) + 1,
                  }));
                },
              }
            : {})}
        />
      )}
      {note.content}
      {lineFollow !== undefined && (
        <StoryLineFollowUp
          key={lineFollow.opening}
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
