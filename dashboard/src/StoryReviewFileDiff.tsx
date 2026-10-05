// The diff of one file a story review lists, read within the review's
// snapshot (`./storyReview.ts`) from its *from* tree in the comparison shown:
// lines marked `+` added and `-` removed in
// hunks whose long lines scroll within the diff, or that the file has no
// textual diff.

import {
  reviewedFileDiffSchema,
  storyReviewFileEndpoint,
  type ReviewedFile,
  type ReviewedFileDiff,
} from "./storyReview.ts";
import { parsedUnifiedDiff, type DiffLine } from "./unifiedDiff.ts";
import { useReviewRead } from "./useReviewRead.ts";

// The story whose review is open.
export type ReviewedStory = {
  readonly sourceId: string;
  readonly identity: string;
};

const lineMarkers: Record<DiffLine["kind"], string> = {
  added: "+",
  removed: "-",
  context: " ",
};

// Git's diff of one file, its lines marked as Git marks them.
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
