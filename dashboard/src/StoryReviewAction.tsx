// A Story card opens its Changes in Intent when its comparison is offered.

import type { LaunchRecord } from "./launchRecord.ts";
import { storyReviewOffered } from "./storyReviewLandedRun.ts";
import { useOpenStoryChanges } from "./pageStoryReviewOpening.tsx";
import { ReviewChangesButton } from "./ReviewChangesButton.tsx";
import "./story-review.css";

export function StoryReviewAction({
  records,
  sourceId,
  work,
  completed = false,
  taken = false,
}: {
  // This machine's kept launch records.
  readonly records: readonly LaunchRecord[] | undefined;
  readonly sourceId: string;
  readonly work: { readonly identity: string };
  readonly completed?: boolean;
  readonly taken?: boolean;
}) {
  const openStoryChanges = useOpenStoryChanges();
  if (!storyReviewOffered(records, sourceId, work.identity, completed || taken))
    return null;
  return (
    <ReviewChangesButton
      onClick={() =>
        openStoryChanges?.({ project: sourceId, identity: work.identity })
      }
    />
  );
}
