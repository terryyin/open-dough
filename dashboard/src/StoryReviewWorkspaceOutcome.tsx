import { shortRevision } from "./publishedWork.ts";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import {
  baselineRevision,
  type TakenStoryReview,
} from "./storyReviewContract.ts";

export function EmptyWorkspaceComparison({
  snapshot,
  commitsReview,
  committedOnly,
}: {
  readonly snapshot: TakenStoryReview;
  readonly commitsReview: boolean;
  readonly committedOnly: boolean;
}) {
  if (commitsReview) return <p>The chosen commits changed nothing.</p>;
  if (committedOnly)
    return (
      <p>
        Nothing is committed yet: every change in this worktree is uncommitted.
      </p>
    );
  return (
    <p>
      No changes: the worktree matches baseline{" "}
      <code>{shortRevision(baselineRevision(snapshot))}</code>.
    </p>
  );
}

export function RefreshedWorkspaceComparison({
  snapshot,
  count,
  commitsReview,
}: {
  readonly snapshot: TakenStoryReview;
  readonly count: number;
  readonly commitsReview: boolean;
}) {
  return (
    <p>
      Review refreshed: {changedFiles(count)}{" "}
      {commitsReview ? (
        "in the chosen range."
      ) : (
        <>
          against baseline{" "}
          <code>{shortRevision(baselineRevision(snapshot))}</code>.
        </>
      )}
    </p>
  );
}
