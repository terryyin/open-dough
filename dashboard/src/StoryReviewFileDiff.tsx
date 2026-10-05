// The diff of one file a story review lists, read within the review's
// snapshot (`./storyReview.ts`) from its *from* tree in the comparison shown:
// lines marked `+` added and `-` removed in hunks whose long lines scroll
// within the diff, each beside its old and new line numbers, or that the
// file has no textual diff.

import type { CSSProperties } from "react";
import {
  reviewedFileDiffSchema,
  storyReviewFileEndpoint,
  type ReviewedFile,
  type ReviewedFileDiff,
} from "./storyReview.ts";
import {
  parsedUnifiedDiff,
  type DiffLine,
  type UnifiedDiff,
} from "./unifiedDiff.ts";
import { useReviewRead } from "./useReviewRead.ts";
import "./story-review-diff.css";

// The story whose review is open.
export type ReviewedStory = {
  readonly sourceId: string;
  readonly identity: string;
};

const lineMarkers: Record<DiffLine["kind"], string> = {
  added: "+",
  removed: "-",
  unchanged: " ",
};

// The widest line number in the diff's hunks, in digits.
function numberDigits(hunks: UnifiedDiff["hunks"]) {
  const numbers = hunks.flatMap(({ lines }) =>
    lines.flatMap((line) => [line.oldNumber ?? 0, line.newNumber ?? 0]),
  );
  return String(Math.max(0, ...numbers)).length;
}

// Git's diff of one file, its lines marked as Git marks them. Line numbers
// are data the stylesheet shows beside each line, outside its text, so
// copying code leaves them behind.
function DiffLines({ printed }: { readonly printed: string }) {
  const { binary, hunks } = parsedUnifiedDiff(printed);
  if (hunks.length === 0)
    return (
      <p>
        {binary
          ? "This file has no textual diff: Git reads it as binary."
          : "This file has no textual diff."}
      </p>
    );
  return (
    <div
      className="story-review-code"
      // Long lines scroll here, never the page; the keyboard can reach it.
      tabIndex={0}
      style={
        {
          "--line-number-digits": String(numberDigits(hunks)),
        } as CSSProperties
      }
    >
      {hunks.map((hunk, index) => (
        <ol
          // Hunks keep Git's order and never move within one diff.
          key={index}
          className="story-review-hunk"
          aria-label={hunk.header}
        >
          <li className="story-review-hunk-header" aria-hidden="true">
            {hunk.header}
          </li>
          {hunk.lines.flatMap((line, at) => [
            <li
              key={at}
              className={`story-review-line story-review-${line.kind}`}
              data-old={line.oldNumber}
              data-new={line.newNumber}
            >
              {lineMarkers[line.kind]}
              {line.text}
            </li>,
            ...(line.noNewlineAtEnd === true
              ? [
                  <li key={`${String(at)}-end`} className="story-review-note">
                    \ No newline at end of file
                  </li>,
                ]
              : []),
          ])}
        </ol>
      ))}
    </div>
  );
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
  const { answer, problem, reading } = useReviewRead<ReviewedFileDiff>(
    storyReviewFileEndpoint,
    {
      source: reviewed.sourceId,
      identity: reviewed.identity,
      baseline: from,
      tree,
      path: file.path,
      ...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),
    },
    reviewedFileDiffSchema,
  );
  return (
    <>
      <div role="status">
        {reading && <p>Reading the file&apos;s diff…</p>}
        {problem !== undefined && (
          <p>The file&apos;s diff could not be read: {problem}</p>
        )}
        {answer?.kind === "unavailable" && <p>{answer.explanation}</p>}
      </div>
      {answer?.kind === "diff" && <DiffLines printed={answer.printed} />}
    </>
  );
}
