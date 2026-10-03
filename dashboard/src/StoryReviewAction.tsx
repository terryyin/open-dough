// A story's card action that opens its story review (`./storyReview.ts`):
// offered while the card's story has a launch workspace to review, by the
// same rule the launch boundary resolves it with. The review is a read-only
// dialog that takes its snapshot when it opens and shows it
// (`./StoryReviewSnapshotView.tsx`) unchanged until the developer uses
// Refresh, which takes a new one in its place, keeps the keyboard where it
// is, and announces when it is done. Closing the review returns the keyboard
// to the action on the card.

import { useEffect, useId, useRef, useState } from "react";
import type { LaunchRecord } from "./launchRecord.ts";
import { shortRevision, type WorkEntry } from "./publishedWork.ts";
import {
  reviewWorkspaceOf,
  storyReviewEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "./storyReview.ts";
import { changedFiles, SnapshotView } from "./StoryReviewSnapshotView.tsx";
import { useReviewRead } from "./useReviewRead.ts";
import "./story-review.css";

// The review of one story, taken when it opens and again on Refresh.
function StoryReviewDialog({
  sourceId,
  identity,
  title,
  onClose,
}: {
  readonly sourceId: string;
  readonly identity: string;
  readonly title: string;
  readonly onClose: () => void;
}) {
  const id = useId();
  const headingId = `${id}-heading`;
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  // How many times Refresh asked for a new snapshot.
  const [round, setRound] = useState(0);
  const {
    answer: review,
    problem,
    reading,
  } = useReviewRead<StoryReview>(
    storyReviewEndpoint,
    { source: sourceId, identity },
    storyReviewSchema,
    round,
  );
  useEffect(() => {
    dialog.current?.showModal();
    body.current?.focus();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="story-review"
      aria-labelledby={headingId}
      onClose={onClose}
    >
      <header className="story-review-header">
        <div>
          <h2 id={headingId}>Review changes</h2>
          <p className="story-review-subject">
            <strong>{title}</strong>{" "}
            <span className="card-identity">{identity}</span>
          </p>
        </div>
        <div className="story-review-header-actions">
          {/* Unavailable while reading, yet still focusable, so the
              keyboard stays on it. */}
          <button
            type="button"
            className="start-launch-button"
            aria-disabled={reading}
            onClick={() => {
              if (!reading) setRound(round + 1);
            }}
          >
            Refresh
          </button>
          <button
            type="button"
            className="start-launch-button"
            onClick={() => {
              dialog.current?.close();
            }}
          >
            Close
          </button>
        </div>
      </header>
      <div ref={body} className="story-review-body" tabIndex={-1}>
        <p className="quiet">
          Read-only: what this story&apos;s worktree would add to trunk, as it
          was when the review opened or was last refreshed.
        </p>
        <div role="status">
          {reading && review?.kind !== "snapshot" && (
            <p>Reading the story&apos;s changes…</p>
          )}
          {reading && review?.kind === "snapshot" && (
            <p>
              Refreshing the review… What is shown is still the snapshot taken
              earlier.
            </p>
          )}
          {!reading && round > 0 && review?.kind === "snapshot" && (
            <p>
              Review refreshed: {changedFiles(review.files.length)} against
              baseline <code>{shortRevision(review.baseline)}</code>.
            </p>
          )}
          {problem !== undefined && (
            <p>The review could not be read: {problem}</p>
          )}
          {review?.kind === "unavailable" && (
            <p>
              {review.explanation} Worktree <code>{review.workspace}</code>.
            </p>
          )}
        </div>
        {review?.kind === "snapshot" && (
          <SnapshotView
            reviewed={{ sourceId, identity }}
            snapshot={review}
            headingId={headingId}
          />
        )}
      </div>
    </dialog>
  );
}

export function StoryReviewAction({
  records,
  sourceId,
  work,
}: {
  // This machine's kept launch records.
  readonly records: readonly LaunchRecord[] | undefined;
  readonly sourceId: string;
  readonly work: Pick<WorkEntry, "identity" | "title">;
}) {
  const [open, setOpen] = useState(false);
  const action = useRef<HTMLButtonElement>(null);
  if (reviewWorkspaceOf(records, sourceId, work.identity) === undefined)
    return null;
  return (
    <div className="story-review-action">
      <button
        ref={action}
        type="button"
        className="start-launch-button"
        aria-haspopup="dialog"
        onClick={() => {
          setOpen(true);
        }}
      >
        Review changes
      </button>
      {open && (
        <StoryReviewDialog
          sourceId={sourceId}
          identity={work.identity}
          title={work.title}
          onClose={() => {
            setOpen(false);
            action.current?.focus();
          }}
        />
      )}
    </div>
  );
}
