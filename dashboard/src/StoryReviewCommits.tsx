// The snapshot's first-parent line, newest first, with a contiguous range
// chosen by its two ends. Every item within the range states its membership.
import { Moment } from "./Moment.tsx";
import { reviewItemId, type ReviewItem } from "./storyReviewContract.ts";
import { shortRevision } from "./publishedWork.ts";
import "./story-review-commits.css";

export function CommitList({
  items,
  selected,
  onSelect,
}: {
  readonly items: readonly ReviewItem[];
  readonly selected: readonly ReviewItem[];
  readonly onSelect: (id: string) => void;
}) {
  return (
    <section className="story-review-commits" aria-label="Story commits">
      <h3>Story commits</h3>
      <ul aria-label="Story commits">
        {items.map((item) => (
          <li key={reviewItemId(item)}>
            <button
              type="button"
              aria-pressed={selected.some(
                (selectedItem) =>
                  reviewItemId(selectedItem) === reviewItemId(item),
              )}
              onClick={() => {
                onSelect(reviewItemId(item));
              }}
            >
              <ReviewItemName item={item} />
              {item.kind === "commit" && (
                <>
                  {" "}
                  <Moment at={new Date(item.committedAt)} />
                  {item.merge && <span> · Integrated trunk</span>}
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CommitRangeHeading({
  selected,
  trunkIntegrated,
  includesMergedChanges,
  pair,
}: {
  readonly selected: readonly ReviewItem[];
  readonly trunkIntegrated: boolean;
  readonly includesMergedChanges: boolean;
  readonly pair: { readonly from: string; readonly tree: string } | undefined;
}) {
  const newest = selected[0];
  const oldest = selected.at(-1);
  if (newest === undefined || oldest === undefined) {
    return null;
  }
  const count = selected.filter((item) => item.kind === "commit").length;
  const uncommitted = selected.some((item) => item.kind === "uncommitted");
  return (
    <div className="story-review-range-heading">
      <h3>
        {count === 0 ? (
          "Uncommitted changes"
        ) : (
          <>
            Changes in {count} {count === 1 ? "commit" : "commits"}
            {uncommitted && " and Uncommitted changes"}
          </>
        )}
      </h3>
      <p>
        From <ReviewItemName item={oldest} /> to{" "}
        <ReviewItemName item={newest} />.
      </p>
      {pair !== undefined && (
        <p>
          Baseline <code title={pair.from}>{shortRevision(pair.from)}</code>
          {" · "}End tree{" "}
          <code title={pair.tree}>{shortRevision(pair.tree)}</code>.
        </p>
      )}
      {trunkIntegrated && (
        <p>
          {includesMergedChanges
            ? "Trunk was integrated within the range. Incoming trunk changes are included."
            : "Trunk was integrated within the range: changes that came only from trunk are left out."}
        </p>
      )}
    </div>
  );
}

function ReviewItemName({ item }: { readonly item: ReviewItem }) {
  return item.kind === "uncommitted" ? (
    <>Uncommitted changes</>
  ) : (
    <>
      <code>{item.shortRevision}</code> {item.subject}
    </>
  );
}
