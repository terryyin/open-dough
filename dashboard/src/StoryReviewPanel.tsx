// A story's review (`./storyReview.ts`) in the page's side panel
// (`./PageFrame.tsx`), beside the dashboard, which stays usable. It
// names the story and project, keeping one snapshot until Refresh. Its
// context, feedback and marking controls stay above the body. Opening
// places the keyboard in the named content; Refresh preserves focus and
// announces completion. Each opening owns its read, and read-only is the
// accessible description. Panel controls maximize, restore and close it.
// Mark reviewed marks the snapshot shown, never a newer state of the
// worktree, and the review then says the snapshot is marked and when
// (`./StoryReviewMark.tsx`); only that control marks. A marked story's
// review opens on the changes since the review, headed by what it compares
// and when the mark was made, leaving out what came only from trunk and
// saying when trunk was integrated since; marking there marks the whole
// snapshot. Its comparison switch (`./StoryReviewComparison.tsx`) shows the
// same snapshot against trunk and back; Refresh keeps the comparison shown,
// and each opening starts on the changes since the review. A mark that
// cannot be compared -- its snapshot can no longer be read, or this
// machine's Git cannot leave trunk's changes out of it -- is said beside all
// changes, with Commits still available when the snapshot lists commits,
// until Mark reviewed starts again. Commits lists the snapshot's first-parent
// line and compares a selected range from its oldest commit's parent tree
// to its newest tree, leaving out intervening trunk integrations.

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
import { MarkingControls, requestMarkReviewed } from "./StoryReviewMark.tsx";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import { ContextLine } from "./StoryReviewContextLine.tsx";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";
import { CommitList, RangeFeedback } from "./StoryReviewCommits.tsx";
import { useStoryReviewComparison } from "./useStoryReviewComparison.ts";
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
  const descriptionId = `${id}-description`;
  const body = useRef<HTMLDivElement>(null);
  // How many times Refresh asked for a new snapshot.
  const [round, setRound] = useState(0);
  const [browserShown, setBrowserShown] = useState(true);
  const browser = { id: `${id}-files`, shown: browserShown };
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
  const madeHere =
    made !== undefined && made.of === review ? made.answer : undefined;
  const snapshot = review?.kind === "snapshot" ? review : undefined;
  const {
    selectedCommits,
    trunkIntegrated,
    shown,
    since,
    range,
    comparison,
    tree,
    onSwitch,
    onSelect,
  } = useStoryReviewComparison({ source, identity, snapshot });
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
      aria-describedby={descriptionId}
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
      <p id={descriptionId} hidden>
        Read-only: what this story&apos;s worktree would add to trunk, as it was
        when the review opened or was last refreshed.
      </p>
      <div className="story-review-top">
        {snapshot !== undefined && (
          <ContextLine
            snapshot={snapshot}
            {...(comparison === undefined || comparison.files.length === 0
              ? {}
              : { browser })}
            onShowBrowser={setBrowserShown}
          />
        )}
        <div role="status">
          {shown === "commits" && <RangeFeedback range={range} />}
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
          <MarkingControls
            snapshot={snapshot}
            shown={shown}
            onSwitch={onSwitch}
            selectedCommits={selectedCommits}
            trunkIntegrated={trunkIntegrated}
            sinceReview={since !== undefined}
            stated={stated}
            busy={reading || marking}
            onMark={() => {
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
          />
        )}
      </div>
      <div ref={body} className="story-review-body" tabIndex={-1}>
        {snapshot !== undefined &&
          shown === "commits" &&
          selectedCommits.length > 0 && (
            <CommitList
              commits={snapshot.commits}
              selected={selectedCommits}
              onSelect={onSelect}
            />
          )}
        {snapshot !== undefined &&
          comparison !== undefined &&
          tree !== undefined && (
            <SnapshotView
              reviewed={{ sourceId: source, identity }}
              snapshot={snapshot}
              tree={tree}
              commitsReview={shown === "commits"}
              comparison={comparison}
              sinceReview={since !== undefined}
              headingId={headingId}
              browser={browser}
            />
          )}
      </div>
    </section>
  );
}
