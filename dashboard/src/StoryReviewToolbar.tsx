// Review changes' toolbar (`./StoryReview.tsx`), under the panel's header and
// above the work area: the file sidebar's toggle at its far left while the
// comparison shown lists files, then that comparison's name beside the eye
// that reveals the review details, an inline section under the toolbar.

import type { ReactNode, Ref } from "react";
import { Eye, EyeOff, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import {
  fileBrowserToggle,
  type FileBrowserPlace,
} from "./FileBrowserToggle.tsx";
import {
  reviewsLanding,
  type ReviewComparison,
  type StoryReview,
} from "./storyReviewContract.ts";
import {
  comparisonName,
  type ComparisonChoice,
} from "./StoryReviewComparison.tsx";
import "./story-review-toolbar.css";

// Whether the comparison actually shown lists files for the sidebar.
export function reviewListsFiles(
  review: StoryReview | undefined,
  comparison: ReviewComparison | undefined,
) {
  if (review?.kind === "snapshot")
    return comparison !== undefined && comparison.files.length > 0;
  return (
    (review?.kind === "landed" ||
      review?.kind === "published" ||
      review?.kind === "session-commits") &&
    review.files.length > 0
  );
}

// The toolbar's name for the comparison shown: a session's commits by their
// context's heading, every landing as Landed runs, else the switch's words.
export const toolbarComparisonName = (
  review: StoryReview | undefined,
  shown: ComparisonChoice,
) =>
  review?.kind === "session-commits"
    ? "Session commits"
    : comparisonName(reviewsLanding(review) ? "landed" : shown);

// The review details as the review places them: the section's id, whether
// the developer reveals them, and the eye that takes the keyboard back.
export type ReviewDetailsPlace = {
  readonly id: string;
  readonly shown: boolean;
  readonly eye: Ref<HTMLButtonElement>;
  readonly onShow: (shown: boolean, focusEye?: boolean) => void;
};

// The details the eye reveals: the comparison choices, the run picker, the
// context of the comparison shown and the uncommitted check. Escape from
// inside hides them and returns the keyboard to the eye.
export function ReviewDetails({
  details,
  children,
}: {
  readonly details: ReviewDetailsPlace;
  readonly children: ReactNode;
}) {
  return (
    <div
      id={details.id}
      className="story-review-details"
      role="group"
      aria-label="Review details"
      hidden={!details.shown}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        details.onShow(false, true);
      }}
    >
      {children}
    </div>
  );
}

export function ReviewToolbar({
  name,
  browser,
  onShowBrowser,
  details,
}: {
  readonly details: ReviewDetailsPlace;
  // The comparison shown, in the Comparison switch's words.
  readonly name: string;
  // The file sidebar, while the comparison shown lists files.
  readonly browser: FileBrowserPlace | undefined;
  readonly onShowBrowser: (shown: boolean) => void;
}) {
  return (
    <div
      className="story-review-toolbar"
      role="group"
      aria-label="Review toolbar"
    >
      {browser !== undefined && (
        <IconButton
          {...fileBrowserToggle(browser, onShowBrowser)}
          icon={browser.shown ? PanelLeftClose : PanelLeftOpen}
          align="start"
        />
      )}
      <span className="story-review-toolbar-name">{name}</span>
      <IconButton
        ref={details.eye}
        label={details.shown ? "Hide review details" : "Show review details"}
        icon={details.shown ? EyeOff : Eye}
        aria-controls={details.id}
        aria-expanded={details.shown}
        onClick={() => {
          details.onShow(!details.shown);
        }}
      />
    </div>
  );
}
