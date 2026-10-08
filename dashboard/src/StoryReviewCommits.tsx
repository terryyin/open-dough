// The snapshot's first-parent line, newest first. Until ranges across trunk
// integrations are supported, only a single same-baseline commit is chosen.
import { Moment } from "./Moment.tsx";
import type { ReviewCommit, ReviewRange } from "./storyReview.ts";
import "./story-review-commits.css";

export function CommitList({
  commits,
  selected,
  onSelect,
}: {
  readonly commits: readonly ReviewCommit[];
  readonly selected: ReviewCommit | undefined;
  readonly onSelect: (revision: string) => void;
}) {
  return (
    <section className="story-review-commits" aria-label="Story commits">
      <h3>Story commits</h3>
      <ul aria-label="Story commits">
        {commits.map((commit) => (
          <li key={commit.revision}>
            <button
              type="button"
              aria-pressed={selected?.revision === commit.revision}
              disabled={commit.fromBaseline !== commit.baseline}
              onClick={() => {
                onSelect(commit.revision);
              }}
            >
              <code>{commit.shortRevision}</code> {commit.subject}{" "}
              <Moment at={new Date(commit.committedAt)} />
              {commit.merge && <span> · Integrated trunk</span>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Range feedback is rendered in the panel's one status region.
export function RangeFeedback({
  range,
}: {
  readonly range: {
    readonly reading: boolean;
    readonly problem?: string;
    readonly answer?: ReviewRange;
  };
}) {
  return (
    <>
      {range.reading && <p>Reading the chosen commit&apos;s changes…</p>}
      {range.problem !== undefined && (
        <p>The chosen commits could not be read: {range.problem}</p>
      )}
      {!range.reading && range.answer?.kind === "unavailable" && (
        <p>{range.answer.explanation}</p>
      )}
    </>
  );
}

export function CommitRangeHeading({
  commit,
}: {
  readonly commit: ReviewCommit;
}) {
  return (
    <div className="story-review-since">
      <h3>Changes in 1 commit</h3>
      <p>
        From <code>{commit.shortRevision}</code> {commit.subject} to{" "}
        <code>{commit.shortRevision}</code> {commit.subject}.
      </p>
    </div>
  );
}
