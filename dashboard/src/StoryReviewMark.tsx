// What a story's review (`./StoryReviewPanel.tsx`) says of the story's mark
// (`./storyReview.ts`), and Mark reviewed's request to make it: the snapshot
// shown is marked, or an earlier one is, and when; or, heading the changes
// since the review, the mark they compare with and when it was made.

import { postJson, refusal } from "./agentLaunchClient.ts";
import { Moment } from "./Moment.tsx";
import {
  markReviewedAnswerSchema,
  markUnavailable,
  storyReviewMarkEndpoint,
  type MarkReviewedAnswer,
  type MarkReviewedRequest,
  type ReviewMark,
} from "./storyReview.ts";

// Asks the boundary to mark the snapshot named reviewed: the story's mark,
// or why it could not be marked.
export async function requestMarkReviewed(
  request: MarkReviewedRequest,
): Promise<MarkReviewedAnswer> {
  try {
    const response = await postJson(storyReviewMarkEndpoint, request);
    const body: unknown = await response.json().catch(() => undefined);
    const answer = markReviewedAnswerSchema.safeParse(body);
    if (response.ok && answer.success) return answer.data;
    const refused = refusal.safeParse(body);
    return markUnavailable(
      refused.success ? refused.data.error : "no trustworthy answer came.",
    );
  } catch {
    return markUnavailable("the dashboard could not be reached.");
  }
}

// The mark stated against the snapshot's tree: this snapshot is marked, or an
// earlier one is, and when; nothing without a mark to state.
export function MarkStatement({
  mark,
  tree,
}: {
  readonly mark: ReviewMark | undefined;
  readonly tree: string;
}) {
  if (mark === undefined) return null;
  const at = <Moment at={new Date(mark.markedAt)} />;
  return mark.tree === tree ? (
    <p>This snapshot is marked reviewed, {at}.</p>
  ) : (
    <p>An earlier snapshot is marked reviewed, {at}.</p>
  );
}

// The changes since the review, headed by the mark they compare with.
export function SinceTheReviewHeading({ mark }: { readonly mark: ReviewMark }) {
  return (
    <div className="story-review-since">
      <h3>Changes since the review</h3>
      <p>
        From the snapshot marked reviewed{" "}
        <Moment at={new Date(mark.markedAt)} /> to this snapshot.
      </p>
    </div>
  );
}
