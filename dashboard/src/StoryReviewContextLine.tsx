// A story review's context line (`./storyReviewContract.ts`), in its review
// details (`./StoryReviewToolbar.tsx`): the branch, the baseline the snapshot
// compares against, and the worktree.

import { useState } from "react";
import { shortRevision } from "./publishedWork.ts";
import {
  baselineRevision,
  reviewTargetName,
  type TakenStoryReview,
} from "./storyReviewContract.ts";

// The review's context in one line that never wraps: branch, short baseline
// with the `<remote>/<target>` it meets, and worktree. Values that do not fit
// are shortened. Activating the line shows every value in full, and activating
// it again returns to the one line. Its name reads every value in full in
// either state. A baseline with the story's published commits taken out
// names the trunk revision they were taken out of and how many; one this
// machine's Git kept them in reads as any baseline.
export function ContextLine({
  snapshot,
  storyStart,
}: {
  readonly snapshot: TakenStoryReview;
  readonly storyStart?: string | undefined;
}) {
  const [full, setFull] = useState(false);
  const { branch, workspace } = snapshot;
  const published =
    snapshot.published?.kept === undefined ? snapshot.published : undefined;
  const baseline = storyStart ?? baselineRevision(snapshot);
  const trunk = <code>{reviewTargetName(snapshot)}</code>;
  const noun = published?.commits === 1 ? "commit" : "commits";
  const commits =
    published === undefined
      ? undefined
      : `${String(published.commits)} story ${noun}`;
  const lessPublished =
    published === undefined
      ? undefined
      : `, less the story's ${String(published.commits)} published ${noun}`;
  return (
    <div className="story-review-context-line">
      <button
        type="button"
        className="story-review-context-values"
        aria-expanded={full}
        onClick={() => {
          setFull(!full);
        }}
      >
        <span className="story-review-context-value">
          <span className="story-review-context-label">Branch</span>{" "}
          <code>{branch}</code>
        </span>{" "}
        <span className="story-review-context-value story-review-context-baseline">
          <span className="story-review-context-label">Baseline</span>{" "}
          {storyStart !== undefined ? (
            <>
              <code title={storyStart} aria-hidden={!full}>
                {full ? storyStart : shortRevision(storyStart)}
              </code>
              {!full && <span className="visually-hidden">{storyStart}</span>}{" "}
              at the recorded story start
            </>
          ) : full ? (
            <>
              <code>{baseline}</code> where <code>{branch}</code> meets {trunk}
              {lessPublished}
            </>
          ) : (
            <>
              <code aria-hidden="true">{shortRevision(baseline)}</code>
              <span className="visually-hidden">
                {baseline} where {branch} meets
              </span>{" "}
              {commits === undefined ? (
                trunk
              ) : (
                <>
                  <span aria-hidden="true">
                    {trunk} less {commits}
                  </span>
                  <span className="visually-hidden">
                    {reviewTargetName(snapshot)}
                    {lessPublished}
                  </span>
                </>
              )}
            </>
          )}
        </span>{" "}
        <span className="story-review-context-value story-review-context-worktree">
          <span className="story-review-context-label">Worktree</span>{" "}
          <code>{workspace}</code>
        </span>
      </button>
    </div>
  );
}
