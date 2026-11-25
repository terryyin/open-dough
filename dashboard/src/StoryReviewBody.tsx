// A session's kept or published comparison uses the shared diff and file tree.
import type { FileBrowserPlace } from "./FileBrowserToggle.tsx";
import type { SessionReviewSubject } from "./pageSessionReviews.ts";
import { reviewIntentSettingsRevision } from "./reviewDiffSyntaxHint.ts";
import { storyComparisonShown } from "./storyComparisonShown.ts";
import type { StoryReview } from "./storyReviewContract.ts";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";

export function ReviewBody({
  review,
  subject,
  headingId,
  browser,
  onFileChosen,
}: {
  readonly review: StoryReview | undefined;
  readonly subject: SessionReviewSubject;
  readonly headingId: string;
  readonly browser: FileBrowserPlace;
  readonly onFileChosen: () => void;
}) {
  const shown = storyComparisonShown({
    subject,
    review,
  });
  if (shown === undefined) return null;
  const settingsRevision = reviewIntentSettingsRevision(review);
  return (
    <SnapshotView
      key={shown.reviewed.reference ?? shown.tree}
      reviewed={shown.reviewed}
      comparison={shown.comparison}
      tree={shown.tree}
      headingId={headingId}
      browser={browser}
      onFileChosen={onFileChosen}
      {...(settingsRevision === undefined ? {} : { settingsRevision })}
    />
  );
}
