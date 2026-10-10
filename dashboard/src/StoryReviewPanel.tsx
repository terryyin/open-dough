// One side panel selects a live workspace comparison or a landed run.
// Refresh preserves selection; the common body and frame keep navigation and focus.
import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { PanelControls } from "./PanelControls.tsx";
import { type MarkReviewedAnswer, type StoryReview } from "./storyReview.ts";
import { MarkingControls, requestMarkReviewed } from "./StoryReviewMark.tsx";
import { LandedContext } from "./StoryReviewLandedContext.tsx";
import { ContextLine } from "./StoryReviewContextLine.tsx";
import { ReviewBody } from "./StoryReviewBody.tsx";
import { ReviewFeedback } from "./StoryReviewFeedback.tsx";
import { useStoryReviewComparison } from "./useStoryReviewComparison.ts";
import type { StoryReviewRequest } from "./pageReviews.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";
import { RunChoice } from "./StoryReviewRunChoice.tsx";
import { ComparisonSwitch } from "./StoryReviewComparison.tsx";
import { SidePanelEdge } from "./SidePanelEdge.tsx";
import { preferredReviewRun } from "./storyReviewLandedRun.ts";
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
    review,
    problem,
    reading,
    runs,
    selectedRun,
    snapshot: workspace,
    chosen,
    onWorkspace,
    onRun,
  } = useStoryReviewSelection(source, identity, round);
  // Mark reviewed's answer for the review it marked, and whether a mark is
  // still being made.
  const [made, setMade] = useState<{
    readonly of: StoryReview;
    readonly answer: MarkReviewedAnswer;
  }>();
  const [marking, setMarking] = useState(false);
  const madeHere =
    made !== undefined && made.of === review ? made.answer : undefined;
  const landed = review?.kind === "landed" ? review : undefined;
  const snapshot = review?.kind === "snapshot" ? review : undefined;
  const {
    items,
    selectedItems,
    trunkIntegrated,
    shown,
    since,
    range,
    comparison,
    tree,
    onSelect,
  } = useStoryReviewComparison({
    source,
    identity,
    snapshot: workspace,
    chosen,
    active: selectedRun === undefined,
  });
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
        {review?.kind !== "landed" && review?.kind !== "landing-unavailable"
          ? "Read-only: what this story's worktree would add to trunk, as it was when the review opened or was last refreshed."
          : "Read-only: this landed run's fixed delivered change from its captured base to its accepted revision."}
      </p>
      <div className="story-review-top">
        {(runs.length > 0 ||
          workspace?.since !== undefined ||
          items.length > 0) && (
          <ComparisonSwitch
            shown={selectedRun === undefined ? shown : "landed"}
            onSwitch={(choice) => {
              if (choice !== "landed") onWorkspace(choice);
              else {
                const newest = preferredReviewRun(
                  runs,
                  (run) => run.comparison,
                );
                if (newest !== undefined) onRun(newest.key);
              }
            }}
            workspace={workspace !== undefined}
            since={workspace?.since !== undefined}
            commits={workspace !== undefined && items.length > 0}
            landed={runs.length > 0}
          />
        )}
        {selectedRun !== undefined && (
          <RunChoice runs={runs} selected={selectedRun} onSelect={onRun} />
        )}

        {landed !== undefined && (
          <LandedContext
            landing={landed.landing}
            {...(landed.files.length === 0 ? {} : { browser })}
            onShowBrowser={setBrowserShown}
          />
        )}
        {snapshot !== undefined && (
          <ContextLine
            snapshot={snapshot}
            {...(comparison === undefined || comparison.files.length === 0
              ? {}
              : { browser })}
            onShowBrowser={setBrowserShown}
          />
        )}
        <ReviewFeedback
          review={review}
          reading={reading}
          problem={problem}
          range={range}
          shown={selectedRun === undefined ? shown : "all"}
          comparison={comparison}
          since={since}
          round={round}
          made={madeHere}
        />
        {snapshot !== undefined && (
          <MarkingControls
            snapshot={snapshot}
            shown={shown}
            selectedItems={selectedItems}
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
        <ReviewBody
          landed={landed}
          snapshot={snapshot}
          shown={shown}
          items={items}
          selectedItems={selectedItems}
          onSelect={onSelect}
          comparison={comparison}
          tree={tree}
          source={source}
          identity={identity}
          headingId={headingId}
          browser={browser}
          since={since}
        />
      </div>
    </section>
  );
}
