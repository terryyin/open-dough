// The snapshot's first-parent line, newest first, with a contiguous range
// chosen by its two ends. Every item within the range states its membership.
import { Moment } from "./Moment.tsx";
import type { ReviewCommit, ReviewRange } from "./storyReview.ts";
import "./story-review-commits.css";

export function CommitList({
  commits,
  selected,
  onSelect,
}: {
  readonly commits: readonly ReviewCommit[];
  readonly selected: readonly ReviewCommit[];
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
              aria-pressed={selected.some(
                (item) => item.revision === commit.revision,
              )}
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
      {range.reading && <p>Reading the chosen commits&apos; changes…</p>}
      {!range.reading && range.problem !== undefined && (
        <p>The chosen commits could not be read: {range.problem}</p>
      )}
      {!range.reading && range.answer?.kind === "unavailable" && (
        <p>{range.answer.explanation}</p>
      )}
    </>
  );
}

export function CommitRangeHeading({
  selected,
  trunkIntegrated,
}: {
  readonly selected: readonly ReviewCommit[];
  readonly trunkIntegrated: boolean;
}) {
  const newest = selected[0];
  const oldest = selected.at(-1);
  if (newest === undefined || oldest === undefined) {
    return null;
  }
  return (
    <div className="story-review-since">
      <h3>
        Changes in {selected.length}{" "}
        {selected.length === 1 ? "commit" : "commits"}
      </h3>
      <p>
        From <code>{oldest.shortRevision}</code> {oldest.subject} to{" "}
        <code>{newest.shortRevision}</code> {newest.subject}.
      </p>
      {trunkIntegrated && (
        <p>
          Trunk was integrated within the range: changes that came only from
          trunk are left out.
        </p>
      )}
    </div>
  );
}
