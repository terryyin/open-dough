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

import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { PanelControls } from "./PanelControls.tsx";
import { shortRevision } from "./publishedWork.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "./storyReview.ts";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";
import type { StoryReviewRequest } from "./pageReviews.ts";
import { useReviewRead } from "./useReviewRead.ts";
import { SidePanelEdge } from "./SidePanelEdge.tsx";
import "./frame-controls.css";
import "./side-panel.css";
import "./story-review.css";

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
          {!reading && round > 0 && review?.kind === "snapshot" && (
            <p>
              Review refreshed: {changedFiles(review.files.length)} against
              baseline <code>{shortRevision(review.baseline)}</code>.
            </p>
          )}
          {problem !== undefined && (
            <p>The review could not be read: {problem}</p>
          )}
          {review?.kind === "unavailable" && (
            <p>
              {review.explanation} Worktree <code>{review.workspace}</code>.
            </p>
          )}
        </div>
        {review?.kind === "snapshot" && (
          <SnapshotView
            reviewed={{ sourceId: source, identity }}
            snapshot={review}
            headingId={headingId}
          />
        )}
      </div>
    </section>
  );
}
