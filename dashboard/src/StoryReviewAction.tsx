// A story's card action that opens its story review (`./storyReview.ts`) in
// the page's side panel (`./StoryReviewPanel.tsx`), in place of whatever the
// panel showed: offered while the card's story has a launch workspace to
// review, by the same rule the launch boundary resolves it with. Closing the
// review returns the keyboard to this action. It leads with a review glyph
// and ends with an arrow toward the panel, both decorative.

import type { LaunchRecord } from "./launchRecord.ts";
import type { WorkEntry } from "./publishedWork.ts";
import { reviewWorkspaceOf } from "./storyReview.ts";
import { useOpenStoryReview } from "./pageReviews.ts";
import { ArrowRight, GitCompare } from "lucide-react";
import { Icon } from "./Icon.tsx";
import "./story-review.css";

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
  const openReview = useOpenStoryReview();
  if (reviewWorkspaceOf(records, sourceId, work.identity) === undefined)
    return null;
  return (
    <div>
      <button
        type="button"
        className="start-launch-button"
        onClick={(event) => {
          openReview({
            source: sourceId,
            identity: work.identity,
            title: work.title,
            control: event.currentTarget,
          });
        }}
      >
        <Icon icon={GitCompare} />
        Review changes
        <Icon icon={ArrowRight} />
      </button>
    </div>
  );
}
