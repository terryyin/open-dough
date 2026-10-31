// One story review selects a workspace, captured run or published completion.
// Refresh preserves selection; the common body and frame keep navigation and focus.
import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { SidePanelControls } from "./SidePanelControls.tsx";
import { SidePanelTitle } from "./SidePanelTitle.tsx";
import type * as Review from "./storyReviewContract.ts";
import { MarkingControls, requestMarkReviewed } from "./StoryReviewMark.tsx";
import { ReviewContext, reviewDescription } from "./StoryReviewContext.tsx";
import { ReviewBody } from "./StoryReviewBody.tsx";
import { ReviewFeedback } from "./StoryReviewFeedback.tsx";
import { useStoryReviewComparison } from "./useStoryReviewComparison.ts";
import type { StoryReviewRequest } from "./pageStoryReviews.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";
import { RunChoice } from "./StoryReviewRunChoice.tsx";
import { ComparisonSwitch } from "./StoryReviewComparison.tsx";
import { PanelDivider } from "./PanelDivider.tsx";
import { preferredReviewRun } from "./storyReviewLandedRun.ts";
import "./frame-controls.css";
import "./side-panel.css";
import "./story-review.css";
import "./story-review-touch.css";

export function StoryReview({
  request,
  maximized,
  onMaximize,
  offerMaximize,
  onClose,
}: {
  readonly request: StoryReviewRequest;
  readonly maximized: boolean;
  readonly onMaximize: (maximized: boolean) => void;
  // False while covering: Maximize/Restore is not offered.
  readonly offerMaximize: boolean;
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
  // Whether all changes include uncommitted changes: on at every opening.
  const [includeUncommitted, setIncludeUncommitted] = useState(true);
  const browser = { id: `${id}-files`, shown: browserShown };
  const {
    review,
    problem,
    reading,
    runs,
    selectedRun,
    snapshot: workspace,
    published: availablePublished,
    chosen,
    onWorkspace,
    onRun,
  } = useStoryReviewSelection(source, identity, round, request.completed);
  // A snapshot without uncommitted changes offers no check; the next that
  // holds some offers it on.
  if (!includeUncommitted && workspace !== undefined && !workspace.committed)
    setIncludeUncommitted(true);
  // Mark reviewed's answer for the review it marked, and whether a mark is
  // still being made.
  const [made, setMade] = useState<{
    readonly of: Review.StoryReview;
    readonly answer: Review.MarkReviewedAnswer;
  }>();
  const [marking, setMarking] = useState(false);
  const madeHere =
    made !== undefined && made.of === review ? made.answer : undefined;
  const published = review?.kind === "published" ? review : undefined;
  const snapshot = review?.kind === "snapshot" ? review : undefined;
  const {
    items,
    selectedItems,
    trunkIntegrated,
    shown,
    since,
    committed,
    committedOnly,
    range,
    comparison,
    tree,
    onSelect,
  } = useStoryReviewComparison({
    source,
    identity,
    snapshot: workspace,
    chosen,
    includeUncommitted,
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
      className="side-panel story-review"
      aria-label="Story review"
      aria-describedby={descriptionId}
    >
      <PanelDivider />
      <header className="side-panel-header">
        <div className="side-panel-names">
          <SidePanelTitle title={title} id={headingId} />
          <p className="quiet">
            Story review <code>{identity}</code>
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
          <SidePanelControls
            maximized={maximized}
            onMaximize={onMaximize}
            offerMaximize={offerMaximize}
            onClose={onClose}
          />
        </div>
      </header>
      <p id={descriptionId} hidden>
        {reviewDescription(review)}
      </p>
      <div className="story-review-top">
        {(runs.length > 0 ||
          workspace?.since !== undefined ||
          items.length > 0) && (
          <ComparisonSwitch
            shown={
              selectedRun === undefined
                ? published === undefined
                  ? shown
                  : "published"
                : "landed"
            }
            onSwitch={(choice) => {
              if (choice === "published") onWorkspace("all");
              else if (choice !== "landed") onWorkspace(choice);
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
            published={availablePublished !== undefined}
          />
        )}
        {selectedRun !== undefined && (
          <RunChoice runs={runs} selected={selectedRun} onSelect={onRun} />
        )}

        <ReviewContext
          review={review}
          comparison={comparison}
          browser={browser}
          onShowBrowser={setBrowserShown}
        />
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
            {...(committed === undefined
              ? {}
              : {
                  uncommitted: {
                    included: includeUncommitted,
                    onInclude: setIncludeUncommitted,
                  },
                })}
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
          review={review}
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
          committedOnly={committedOnly}
        />
      </div>
    </section>
  );
}
