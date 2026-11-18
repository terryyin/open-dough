// One story review selects a workspace, captured run or published completion.
// Refresh preserves selection; the common body and frame keep navigation and focus.
import { SidePanelHeader } from "./SidePanelHeader.tsx";
import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { SidePanelControls } from "./SidePanelControls.tsx";
import { reviewDescription } from "./StoryReviewContext.tsx";
import { ReviewBody } from "./StoryReviewBody.tsx";
import { ReviewFeedback } from "./StoryReviewFeedback.tsx";
import { useStoryReviewComparison } from "./useStoryReviewComparison.ts";
import type { StoryReviewRequest } from "./pageStoryReviews.ts";
import { useStoryReviewRequest } from "./useStoryReviewRequest.ts";
import { CommitRangeHeading } from "./StoryReviewCommits.tsx";
import {
  ReviewToolbar,
  reviewListsFiles,
  toolbarComparisonName,
} from "./StoryReviewToolbar.tsx";
import {
  StoryReviewDetailsSection,
  reviewHoldsDetails,
} from "./StoryReviewDetailsSection.tsx";
import { PanelDivider } from "./PanelDivider.tsx";
import {
  StoryReviewHeading,
  storyReviewPanelLabel,
} from "./StoryReviewHeading.tsx";
import { StoryNotes } from "./StoryNotesControl.tsx";
import { isReviewedSessionSubject } from "./reviewedWorkSubject.ts";
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
  const { subject, title } = request;
  const id = useId();
  const headingId = `${id}-heading`;
  const descriptionId = `${id}-description`;
  const body = useRef<HTMLDivElement>(null);
  // How many times Refresh asked for a new snapshot.
  const [round, setRound] = useState(0);
  const [browserShown, setBrowserShown] = useState(true);
  const browser = { id: `${id}-files`, shown: browserShown };
  const [detailsShown, setDetailsShown] = useState(false);
  const eye = useRef<HTMLButtonElement>(null);
  const details = {
    id: `${id}-details`,
    shown: detailsShown,
    eye,
    onShow: (show: boolean, focusEye = false) => {
      setDetailsShown(show);
      if (focusEye) eye.current?.focus();
    },
  };
  const {
    review,
    problem,
    reading,
    runs,
    selectedRun,
    sessionRuns,
    runKey,
    snapshot: workspace,
    published: availablePublished,
    chosen,
    onWorkspace,
    onRun,
    includeUncommitted,
    setIncludeUncommitted,
  } = useStoryReviewRequest(request, round);
  const published = review?.kind === "published" ? review : undefined;
  const {
    items,
    selectedItems,
    trunkIntegrated,
    shown,
    committed,
    committedOnly,
    range,
    comparison,
    tree,
    onSelect,
  } = useStoryReviewComparison({
    subject,
    snapshot: workspace,
    chosen,
    includeUncommitted,
    active: selectedRun === undefined,
  });
  const shownComparison =
    selectedRun !== undefined
      ? "landed"
      : published === undefined
        ? shown
        : "published";
  const holdsDetails = reviewHoldsDetails({
    review,
    runs,
    workspaceChoices: items.length > 0,
    sessionRuns,
    selectedRun,
  });
  useEffect(() => {
    body.current?.focus();
  }, [request]);
  return (
    <section
      className="side-panel story-review"
      aria-label={storyReviewPanelLabel(subject)}
      aria-describedby={descriptionId}
    >
      <PanelDivider />
      <SidePanelHeader>
        <StoryReviewHeading
          subject={subject}
          title={title}
          headingId={headingId}
        />
        <div className="side-panel-actions">
          {!isReviewedSessionSubject(subject) && (
            <StoryNotes
              sourceId={subject.source}
              identity={subject.identity}
              title={title}
            />
          )}
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
      </SidePanelHeader>
      <p id={descriptionId} hidden>
        {reviewDescription(review)}
      </p>
      <ReviewToolbar
        name={toolbarComparisonName(review, shownComparison)}
        browser={reviewListsFiles(review, comparison) ? browser : undefined}
        onShowBrowser={setBrowserShown}
        details={holdsDetails ? details : undefined}
      />
      <StoryReviewDetailsSection
        details={details}
        review={review}
        runs={runs}
        items={items}
        sessionRuns={sessionRuns}
        selectedRun={selectedRun}
        runKey={runKey}
        shownComparison={shownComparison}
        workspace={workspace}
        availablePublished={availablePublished}
        committed={committed}
        includeUncommitted={includeUncommitted}
        onWorkspace={onWorkspace}
        onRun={onRun}
        setIncludeUncommitted={setIncludeUncommitted}
      />
      <div className="story-review-top">
        <ReviewFeedback
          review={review}
          reading={reading}
          problem={problem}
          range={range}
          shown={selectedRun === undefined ? shown : "all"}
          comparison={comparison}
          round={round}
        />
        {review?.kind === "snapshot" &&
          shown === "commits" &&
          selectedItems.length > 0 && (
            <CommitRangeHeading
              selected={selectedItems}
              trunkIntegrated={trunkIntegrated}
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
          subject={subject}
          headingId={headingId}
          browser={browser}
          committedOnly={committedOnly}
        />
      </div>
    </section>
  );
}
