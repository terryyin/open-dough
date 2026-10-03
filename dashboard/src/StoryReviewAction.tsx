// A story's card action that opens its story review (`./storyReview.ts`):
// offered while the card's story has a launch workspace to review, by the
// same rule the launch boundary resolves it with. The review is a read-only
// dialog that takes its snapshot when it opens, names the worktree, its
// branch and the baseline it compares against, and lists the story's changed
// files with their change kinds in a file browser whose long paths scroll
// within it. Closing it returns the keyboard to the action on the card.

import { useEffect, useId, useRef, useState } from "react";
import type { LaunchRecord } from "./launchRecord.ts";
import type { WorkEntry } from "./publishedWork.ts";
import {
  reviewWorkspaceOf,
  storyReviewEndpoint,
  storyReviewSchema,
  type ReviewedFile,
  type StoryReview as Snapshot,
} from "./storyReview.ts";
import "./story-review.css";

const kindWords: Record<ReviewedFile["kind"], string> = {
  added: "Added",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
};

function ReviewedFileEntry({ file }: { readonly file: ReviewedFile }) {
  return (
    <li>
      <span className="story-review-kind">{kindWords[file.kind]}</span>{" "}
      {file.kind === "renamed" ? (
        <>
          <code>{file.oldPath}</code> → <code>{file.path}</code>
        </>
      ) : (
        <code>{file.path}</code>
      )}
    </li>
  );
}

function SnapshotView({
  snapshot,
  headingId,
}: {
  readonly snapshot: Extract<Snapshot, { kind: "snapshot" }>;
  readonly headingId: string;
}) {
  const count = snapshot.files.length;
  const listName = `${String(count)} changed ${count === 1 ? "file" : "files"}`;
  return (
    <>
      <dl className="story-review-facts">
        <div>
          <dt>Worktree</dt>
          <dd>
            <code>{snapshot.workspace}</code>
          </dd>
        </div>
        <div>
          <dt>Branch</dt>
          <dd>
            <code>{snapshot.branch}</code>
          </dd>
        </div>
        <div>
          <dt>Baseline</dt>
          <dd>
            <code>{snapshot.baseline}</code>, where{" "}
            <code>{snapshot.branch}</code> meets{" "}
            <code>
              {snapshot.remote}/{snapshot.target}
            </code>
          </dd>
        </div>
      </dl>
      <section
        className="story-review-files"
        aria-labelledby={`${headingId}-files`}
        // Long paths scroll here, never the page; the keyboard can reach it.
        tabIndex={0}
      >
        <h3 id={`${headingId}-files`}>{listName}</h3>
        <ul aria-label={listName}>
          {snapshot.files.map((file) => (
            <ReviewedFileEntry key={file.path} file={file} />
          ))}
        </ul>
      </section>
    </>
  );
}

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
  const [review, setReview] = useState<Snapshot | undefined>();
  const [problem, setProblem] = useState<string | undefined>();
  useEffect(() => {
    dialog.current?.showModal();
    body.current?.focus();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ source: sourceId, identity });
    void fetch(`${storyReviewEndpoint}?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const answer: unknown = await response.json();
        if (!response.ok) {
          const said = (answer as { error?: unknown }).error;
          throw new Error(
            typeof said === "string" ? said : "The review was refused.",
          );
        }
        return storyReviewSchema.parse(answer);
      })
      .then(setReview, (error: unknown) => {
        if (!controller.signal.aborted)
          setProblem(
            `The review could not be read: ${error instanceof Error ? error.message : String(error)}`,
          );
      });
    return () => {
      controller.abort();
    };
  }, [sourceId, identity]);
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
          {problem !== undefined && <p>{problem}</p>}
          {review?.kind === "unavailable" && (
            <p>
              {review.explanation} Worktree <code>{review.workspace}</code>.
            </p>
          )}
        </div>
        {review?.kind === "snapshot" && (
          <SnapshotView snapshot={review} headingId={headingId} />
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
