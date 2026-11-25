// One session review selects a comparison from its kept or published evidence.
// Refresh preserves selection; the common body and frame keep navigation and focus.
import { SidePanelHeader } from "./SidePanelHeader.tsx";
import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { SidePanelControls } from "./SidePanelControls.tsx";
import { reviewDescription } from "./StoryReviewContext.tsx";
import { ReviewBody } from "./StoryReviewBody.tsx";
import { ReviewFeedback } from "./StoryReviewFeedback.tsx";
import type { SessionReviewRequest } from "./pageSessionReviews.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";
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
import { useReviewFiles } from "./ReviewFilesDrawer.tsx";
import { StoryReviewHeading } from "./StoryReviewHeading.tsx";
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
  readonly request: SessionReviewRequest;
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
  const files = useReviewFiles(`${id}-files`, body);
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
  const { review, problem, reading, runKey, onRun } = useStoryReviewSelection({
    subject,
    round,
  });
  const holdsDetails = reviewHoldsDetails(review);
  useEffect(() => {
    body.current?.focus();
  }, [request]);
  return (
    <section
      className="side-panel story-review"
      aria-label="Session review"
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
        name={toolbarComparisonName(review)}
        browser={reviewListsFiles(review) ? files : undefined}
        onShowBrowser={files.onShow}
        details={holdsDetails ? details : undefined}
      />
      <div className="story-review-above">
        <StoryReviewDetailsSection
          details={details}
          review={review}
          runKey={runKey}
          onRun={onRun}
        />
        <div className="story-review-top">
          <ReviewFeedback
            review={review}
            reading={reading}
            problem={problem}
            round={round}
          />
        </div>
      </div>
      {files.backdrop}
      <div ref={body} className="story-review-body" tabIndex={-1}>
        <ReviewBody
          review={review}
          subject={subject}
          headingId={headingId}
          browser={files}
          onFileChosen={files.onFileChosen}
        />
      </div>
    </section>
  );
}
