// A story's review (`./storyReview.ts`) in the page's side panel
// (`./PageFrame.tsx`), beside the dashboard, which stays usable. It
// names the story and its project's identity, takes its snapshot when it
// opens and shows it (`./StoryReviewSnapshotView.tsx`) unchanged until the
// developer uses Refresh, which takes a new one in its place, keeps the
// keyboard where it is, and announces when it is done. Opening it, or asking
// again for the review shown, places the keyboard in its named content
// without holding it there; the panel's own controls (`./PanelControls.tsx`)
// maximize or restore it and close it. Each opening is its own read, so a
// read of the story the panel showed before can never answer this one.
// Mark reviewed marks the snapshot shown, never a newer state of the
// worktree, and the review then says the snapshot is marked and when; only
// that control marks.

import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { postJson, refusal } from "./agentLaunchClient.ts";
import { IconButton } from "./Icon.tsx";
import { Moment } from "./Moment.tsx";
import { PanelControls } from "./PanelControls.tsx";
import { shortRevision } from "./publishedWork.ts";
import {
  markReviewedAnswerSchema,
  markUnavailable,
  storyReviewEndpoint,
  storyReviewMarkEndpoint,
  storyReviewSchema,
  type MarkReviewedAnswer,
  type MarkReviewedRequest,
  type StoryReview,
  type TakenStoryReview,
} from "./storyReview.ts";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";
import type { StoryReviewRequest } from "./pageReviews.ts";
import { useReviewRead } from "./useReviewRead.ts";
import { SidePanelEdge } from "./SidePanelEdge.tsx";
import "./frame-controls.css";
import "./side-panel.css";
import "./story-review.css";

// Asks the boundary to mark the snapshot named reviewed: the story's mark,
// or why it could not be marked.
async function requestMarkReviewed(
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

// What the review says of the story's mark: the snapshot shown is marked, or
// an earlier one is, and when; nothing without a mark.
function MarkStatement({ snapshot }: { readonly snapshot: TakenStoryReview }) {
  const { mark } = snapshot;
  if (mark === undefined) return null;
  const at = <Moment at={new Date(mark.markedAt)} />;
  return mark.tree === snapshot.tree ? (
    <p>This snapshot is marked reviewed, {at}.</p>
  ) : (
    <p>An earlier snapshot is marked reviewed, {at}.</p>
  );
}

export function StoryReviewPanel({
  request,
  maximized,
  onMaximize,
  onClose,
}: {
  readonly request: StoryReviewRequest;
  readonly maximized: boolean;
  readonly onMaximize: (maximized: boolean) => void;
  readonly onClose: () => void;
}) {
  const { source, identity, title } = request;
  const id = useId();
  const headingId = `${id}-heading`;
  const body = useRef<HTMLDivElement>(null);
  // How many times Refresh asked for a new snapshot.
  const [round, setRound] = useState(0);
  const {
    answer: review,
    problem,
    reading,
  } = useReviewRead<StoryReview>(
    storyReviewEndpoint,
    { source, identity },
    storyReviewSchema,
    round,
  );
  // Mark reviewed's answer for the review it marked, and whether a mark is
  // still being made.
  const [made, setMade] = useState<{
    readonly of: StoryReview;
    readonly answer: MarkReviewedAnswer;
  }>();
  const [marking, setMarking] = useState(false);
  const madeHere =
    made !== undefined && made.of === review ? made.answer : undefined;
  // The review shown, with the mark made on it since it was read.
  const shown: StoryReview | undefined =
    review?.kind === "snapshot" && madeHere?.kind === "marked"
      ? { ...review, mark: madeHere.mark }
      : review;
  useEffect(() => {
    body.current?.focus();
  }, [request]);
  return (
    <section
      className="side-panel story-review-panel"
      aria-label="Review changes"
    >
      <SidePanelEdge />
      <header className="side-panel-header">
        <div className="side-panel-names">
          <h2 id={headingId}>{title}</h2>
          <p className="quiet">
            Review changes <code>{identity}</code>
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
          <PanelControls
            maximized={maximized}
            onMaximize={onMaximize}
            onClose={onClose}
          />
        </div>
      </header>
      <div ref={body} className="story-review-body" tabIndex={-1}>
        <p className="quiet">
          Read-only: what this story&apos;s worktree would add to trunk, as it
          was when the review opened or was last refreshed.
        </p>
        <div role="status">
          {reading && review?.kind !== "snapshot" && (
            <p>Reading the story&apos;s changes…</p>
          )}
          {reading && review?.kind === "snapshot" && (
            <p>
              Refreshing the review… What is shown is still the snapshot taken
              earlier.
            </p>
          )}
          {!reading &&
            round > 0 &&
            madeHere === undefined &&
            review?.kind === "snapshot" && (
              <p>
                Review refreshed: {changedFiles(review.files.length)} against
                baseline <code>{shortRevision(review.baseline)}</code>.
              </p>
            )}
          {madeHere?.kind === "marked" && <p>Marked reviewed.</p>}
          {madeHere?.kind === "unavailable" && <p>{madeHere.explanation}</p>}
          {problem !== undefined && (
            <p>The review could not be read: {problem}</p>
          )}
          {review?.kind === "unavailable" && (
            <p>
              {review.explanation} Worktree <code>{review.workspace}</code>.
            </p>
          )}
        </div>
        {shown?.kind === "snapshot" && (
          <>
            <div className="story-review-mark">
              <MarkStatement snapshot={shown} />
              {/* Unavailable while reading or marking, yet still focusable,
                  so the keyboard stays on it. */}
              <button
                type="button"
                className="start-launch-button"
                aria-disabled={reading || marking}
                onClick={() => {
                  if (reading || marking) return;
                  if (review?.kind !== "snapshot") return;
                  const of = review;
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
              >
                Mark reviewed
              </button>
            </div>
            <SnapshotView
              reviewed={{ sourceId: source, identity }}
              snapshot={shown}
              headingId={headingId}
            />
          </>
        )}
      </div>
    </section>
  );
}
