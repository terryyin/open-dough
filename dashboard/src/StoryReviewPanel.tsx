// A story's review (`./storyReview.ts`) in the page's side panel
// (`./PageFrame.tsx`), beside the dashboard, which stays usable. It
// names the story and its project's identity, takes its snapshot when it
// opens and shows it (`./StoryReviewSnapshotView.tsx`) unchanged until the
// developer uses Refresh, which takes a new one in its place, keeps the
// keyboard where it is, and announces when it is done. Opening it, or asking
// again for the review shown, places the keyboard in its named content
// without holding it there; the panel's own controls (`./PanelControls.tsx`)
// maximize or restore it and close it. Each opening is its own read, so a
// read of the story the panel showed before can never answer this one.
// Mark reviewed marks the snapshot shown, never a newer state of the
// worktree, and the review then says the snapshot is marked and when
// (`./StoryReviewMark.tsx`); only that control marks. A marked story's
// review opens on the changes since the review, headed by what it compares
// and when the mark was made, leaving out what came only from trunk and
// saying when trunk was integrated since; marking there marks the whole
// snapshot. Its comparison switch (`./StoryReviewComparison.tsx`) shows the
// same snapshot against trunk and back; Refresh keeps the comparison shown,
// and each opening starts on the changes since the review. A mark whose
// snapshot can no longer be read is said beside all changes, without the
// switch, until Mark reviewed starts again.

import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { PanelControls } from "./PanelControls.tsx";
import { shortRevision } from "./publishedWork.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type MarkReviewedAnswer,
  type StoryReview,
} from "./storyReview.ts";
import {
  MarkStatement,
  requestMarkReviewed,
  SinceTheReviewHeading,
} from "./StoryReviewMark.tsx";
import {
  ComparisonSwitch,
  type ShownComparison,
} from "./StoryReviewComparison.tsx";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";
import type { StoryReviewRequest } from "./pageReviews.ts";
import { useReviewRead } from "./useReviewRead.ts";
import { SidePanelEdge } from "./SidePanelEdge.tsx";
import "./frame-controls.css";
import "./side-panel.css";
import "./story-review.css";

export function StoryReviewPanel({
  request,
  maximized,
  onMaximize,
  onClose,
}: {
  readonly request: StoryReviewRequest;
  readonly maximized: boolean;
  readonly onMaximize: (maximized: boolean) => void;
  readonly onClose: () => void;
}) {
  const { source, identity, title } = request;
  const id = useId();
  const headingId = `${id}-heading`;
  const body = useRef<HTMLDivElement>(null);
  // How many times Refresh asked for a new snapshot.
  const [round, setRound] = useState(0);
  const {
    answer: review,
    problem,
    reading,
  } = useReviewRead<StoryReview>(
    storyReviewEndpoint,
    { source, identity },
    storyReviewSchema,
    round,
  );
  // Mark reviewed's answer for the review it marked, and whether a mark is
  // still being made.
  const [made, setMade] = useState<{
    readonly of: StoryReview;
    readonly answer: MarkReviewedAnswer;
  }>();
  const [marking, setMarking] = useState(false);
  // The comparison chosen; a review without changes since the review shows
  // all changes whatever was chosen.
  const [chosen, setChosen] = useState<ShownComparison>("since");
  const madeHere =
    made !== undefined && made.of === review ? made.answer : undefined;
  const snapshot = review?.kind === "snapshot" ? review : undefined;
  const offered = snapshot?.since;
  const since = chosen === "since" ? offered : undefined;
  // The mark the review states: one made on the review shown since it was
  // read, or the one it was read with unless the changes since the review
  // are headed by it.
  const stated =
    madeHere?.kind === "marked"
      ? madeHere.mark
      : since === undefined
        ? snapshot?.mark
        : undefined;
  useEffect(() => {
    body.current?.focus();
  }, [request]);
  return (
    <section
      className="side-panel story-review-panel"
      aria-label="Review changes"
    >
      <SidePanelEdge />
      <header className="side-panel-header">
        <div className="side-panel-names">
          <h2 id={headingId}>{title}</h2>
          <p className="quiet">
            Review changes <code>{identity}</code>
          </p>
        </div>
        <div className="side-panel-actions">
          {/* Unavailable while reading, yet still focusable, so the
              keyboard stays on it. */}
          <IconButton
            label="Refresh"
            icon={RefreshCw}
            aria-disabled={reading}
            onClick={() => {
              if (!reading) setRound(round + 1);
            }}
          />
          <PanelControls
            maximized={maximized}
            onMaximize={onMaximize}
            onClose={onClose}
          />
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
          {!reading &&
            round > 0 &&
            madeHere === undefined &&
            snapshot !== undefined &&
            (since === undefined ? (
              <p>
                Review refreshed: {changedFiles(snapshot.files.length)} against
                baseline <code>{shortRevision(snapshot.baseline)}</code>.
              </p>
            ) : (
              <p>
                Review refreshed: {changedFiles(since.files.length)} since the
                review.
              </p>
            ))}
          {madeHere?.kind === "marked" && <p>Marked reviewed.</p>}
          {madeHere?.kind === "unavailable" && <p>{madeHere.explanation}</p>}
          {problem !== undefined && (
            <p>The review could not be read: {problem}</p>
          )}
          {review?.kind === "unavailable" && (
            <p>
              {review.explanation} Worktree <code>{review.workspace}</code>.
            </p>
          )}
        </div>
        {snapshot !== undefined && (
          <>
            {offered !== undefined && (
              <ComparisonSwitch shown={chosen} onSwitch={setChosen} />
            )}
            {since !== undefined && snapshot.mark !== undefined && (
              <SinceTheReviewHeading
                mark={snapshot.mark}
                baseline={snapshot.baseline}
              />
            )}
            <div className="story-review-mark">
              <MarkStatement
                mark={stated}
                tree={snapshot.tree}
                unreadable={snapshot.markUnreadable === true}
              />
              {/* Unavailable while reading or marking, yet still focusable,
                  so the keyboard stays on it. */}
              <button
                type="button"
                className="start-launch-button"
                aria-disabled={reading || marking}
                onClick={() => {
                  if (reading || marking) return;
                  const of = snapshot;
                  setMarking(true);
                  void requestMarkReviewed({
                    source,
                    identity,
                    tree: of.tree,
                    baseline: of.baseline,
                  }).then((answer) => {
                    setMade({ of, answer });
                    setMarking(false);
                  });
                }}
              >
                Mark reviewed
              </button>
            </div>
            <SnapshotView
              reviewed={{ sourceId: source, identity }}
              snapshot={snapshot}
              comparison={
                since ?? { from: snapshot.baseline, files: snapshot.files }
              }
              sinceReview={since !== undefined}
              headingId={headingId}
            />
          </>
        )}
      </div>
    </section>
  );
}
