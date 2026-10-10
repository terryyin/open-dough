// A story review's context line (`./storyReview.ts`), beneath its panel's
// header (`./StoryReviewPanel.tsx`): the branch, the baseline the snapshot
// compares against, and the worktree, beside the control that hides or shows
// the file browser (`./StoryReviewSnapshotView.tsx`) while the comparison
// shown lists files.

import { useState } from "react";
import { shortRevision } from "./publishedWork.ts";
import { reviewTargetName, type TakenStoryReview } from "./storyReview.ts";

// The file browser as the review places it: its element's id, and whether
// the developer shows it.
export type FileBrowserPlace = {
  readonly id: string;
  readonly shown: boolean;
};

// The review's context in one line that never wraps: branch, short baseline
// with the `<remote>/<target>` it meets, worktree, and, while the comparison
// shown lists files, Hide files or Show files. Values that do not fit are
// shortened. Activating the line shows every value in full, and activating
// it again returns to the one line. Its name reads every value in full in
// either state.
export function ContextLine({
  snapshot,
  browser,
  onShowBrowser,
}: {
  readonly snapshot: TakenStoryReview;
  readonly browser?: FileBrowserPlace;
  readonly onShowBrowser: (shown: boolean) => void;
}) {
  const [full, setFull] = useState(false);
  const { branch, baseline, workspace } = snapshot;
  const trunk = <code>{reviewTargetName(snapshot)}</code>;
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
          {full ? (
            <>
              <code>{baseline}</code> where <code>{branch}</code> meets {trunk}
            </>
          ) : (
            <>
              <code aria-hidden="true">{shortRevision(baseline)}</code>
              <span className="visually-hidden">
                {baseline} where {branch} meets
              </span>{" "}
              {trunk}
            </>
          )}
        </span>{" "}
        <span className="story-review-context-value story-review-context-worktree">
          <span className="story-review-context-label">Worktree</span>{" "}
          <code>{workspace}</code>
        </span>
      </button>
      {browser !== undefined && (
        <button
          type="button"
          className="start-launch-button"
          aria-expanded={browser.shown}
          aria-controls={browser.id}
          onClick={() => {
            onShowBrowser(!browser.shown);
          }}
        >
          {browser.shown ? "Hide files" : "Show files"}
        </button>
      )}
    </div>
  );
}
