// A story's card action that opens its story review (`./storyReview.ts`):
// offered while the card's story has a launch workspace to review, by the
// same rule the launch boundary resolves it with. The review is a read-only
// dialog that takes its snapshot when it opens and shows it
// (`./StoryReviewSnapshotView.tsx`). Closing the review returns the keyboard
// to the action on the card.

import { useEffect, useId, useRef, useState } from "react";
import type { LaunchRecord } from "./launchRecord.ts";
import type { WorkEntry } from "./publishedWork.ts";
import {
  reviewWorkspaceOf,
  storyReviewEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "./storyReview.ts";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";
import { useReviewRead } from "./useReviewRead.ts";
import "./story-review.css";

// The review of one story, taken when it opens.
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
  const { answer: review, problem } = useReviewRead<StoryReview>(
    storyReviewEndpoint,
    { source: sourceId, identity },
    storyReviewSchema,
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
        <button
          type="button"
          className="start-launch-button"
          onClick={() => {
            dialog.current?.close();
          }}
        >
          Close
        </button>
      </header>
      <div ref={body} className="story-review-body" tabIndex={-1}>
        <p className="quiet">
          Read-only: what this story&apos;s worktree would add to trunk, as it
          was when the review opened.
        </p>
        <div role="status">
          {review === undefined && problem === undefined && (
            <p>Reading the story&apos;s changes…</p>
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
