// Review changes' toolbar (`./StoryReview.tsx`), under the panel's header and
// above the work area: the file sidebar's toggle at its far left while the
// comparison shown lists files, then that comparison's name.

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import {
  fileBrowserToggle,
  type FileBrowserPlace,
} from "./FileBrowserToggle.tsx";
import type { ReviewComparison, StoryReview } from "./storyReviewContract.ts";
import "./story-review-toolbar.css";

// Whether the comparison actually shown lists files for the sidebar.
export function reviewListsFiles(
  review: StoryReview | undefined,
  comparison: ReviewComparison | undefined,
) {
  if (review?.kind === "snapshot")
    return comparison !== undefined && comparison.files.length > 0;
  return (
    (review?.kind === "landed" || review?.kind === "published") &&
    review.files.length > 0
  );
}

export function ReviewToolbar({
  name,
  browser,
  onShowBrowser,
}: {
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
    </div>
  );
}
