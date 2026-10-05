// What a story's review (`./StoryReviewPanel.tsx`) says of the story's mark
// (`./storyReview.ts`), and Mark reviewed's request to make it: the snapshot
// shown is marked, or an earlier one is, and when -- and why the earlier
// review cannot be compared when its snapshot cannot be read or this
// machine's Git cannot leave trunk's changes out of it; or, heading
// the changes since the review, the mark they compare with and when it was
// made, and whether trunk was integrated since: its baseline is not the
// snapshot's. The review's marking controls gather these, with its
// comparison switch (`./StoryReviewComparison.tsx`) and Mark reviewed, in
// its fixed top beneath the context line.

import { postJson, refusal } from "./agentLaunchClient.ts";
import { Moment } from "./Moment.tsx";
import {
  ComparisonSwitch,
  type ShownComparison,
} from "./StoryReviewComparison.tsx";
import {
  markReviewedAnswerSchema,
  markUnavailable,
  storyReviewMarkEndpoint,
  type MarkReviewedAnswer,
  type MarkReviewedRequest,
  type MarkUncomparable,
  trunkIntegratedSince,
  type ReviewMark,
  type TakenStoryReview,
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
// earlier one is, and when, and why that earlier one cannot be compared;
// nothing without a mark to state.
export function MarkStatement({
  mark,
  tree,
  uncomparable,
}: {
  readonly mark: ReviewMark | undefined;
  readonly tree: string;
  readonly uncomparable: MarkUncomparable | undefined;
}) {
  if (mark === undefined) return null;
  const at = <Moment at={new Date(mark.markedAt)} />;
  if (mark.tree === tree) return <p>This snapshot is marked reviewed, {at}.</p>;
  switch (uncomparable) {
    case "unreadable":
      return (
        <p>
          An earlier snapshot is marked reviewed, {at}, but it can no longer be
          read, so the earlier review cannot be compared: all changes are shown.
        </p>
      );
    case "not-restated":
      return (
        <p>
          An earlier snapshot is marked reviewed, {at}, but this machine&apos;s
          Git cannot leave out trunk&apos;s changes integrated since, so the
          earlier review cannot be compared across them: all changes are shown.
        </p>
      );
    case undefined:
      return <p>An earlier snapshot is marked reviewed, {at}.</p>;
  }
}

// The changes since the review of a snapshot from `baseline`, headed by the
// mark they compare with.
export function SinceTheReviewHeading({
  mark,
  baseline,
}: {
  readonly mark: ReviewMark;
  readonly baseline: string;
}) {
  return (
    <div className="story-review-since">
      <h3>Changes since the review</h3>
      <p>
        From the snapshot marked reviewed{" "}
        <Moment at={new Date(mark.markedAt)} /> to this snapshot.
      </p>
      {trunkIntegratedSince(mark, baseline) && (
        <p>
          Trunk was integrated since the mark: changes that came only from trunk
          are left out.
        </p>
      )}
    </div>
  );
}

// A snapshot's marking controls: the comparison switch while the changes
// since the review are offered, their heading while shown, the mark stated,
// and Mark reviewed, which marks the snapshot shown.
export function MarkingControls({
  snapshot,
  shown,
  onSwitch,
  sinceReview,
  stated,
  busy,
  onMark,
}: {
  readonly snapshot: TakenStoryReview;
  readonly shown: ShownComparison;
  readonly onSwitch: (shown: ShownComparison) => void;
  // Whether the changes since the review are shown.
  readonly sinceReview: boolean;
  readonly stated: ReviewMark | undefined;
  // Whether the review is being read or marked.
  readonly busy: boolean;
  readonly onMark: () => void;
}) {
  return (
    <div className="story-review-marking">
      {snapshot.since !== undefined && (
        <ComparisonSwitch shown={shown} onSwitch={onSwitch} />
      )}
      {sinceReview && snapshot.mark !== undefined && (
        <SinceTheReviewHeading
          mark={snapshot.mark}
          baseline={snapshot.baseline}
        />
      )}
      <div className="story-review-mark">
        <MarkStatement
          mark={stated}
          tree={snapshot.tree}
          uncomparable={snapshot.markUncomparable}
        />
        {/* Unavailable while reading or marking, yet still focusable, so
            the keyboard stays on it. */}
        <button
          type="button"
          className="start-launch-button"
          aria-disabled={busy}
          onClick={() => {
            if (!busy) onMark();
          }}
        >
          Mark reviewed
        </button>
      </div>
    </div>
  );
}
