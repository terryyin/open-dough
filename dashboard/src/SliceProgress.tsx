// Recorded slice progress as a Taken card shows it: one segment per slice,
// filled for each recorded-done slice, and the count in words. It is a count
// of recorded statuses, not an estimate of how complete the story is. The
// slices come from whichever plan the snapshot already read; nothing here
// reads or interprets a plan.

import { useId } from "react";
import { recordedCompleteCount, type WorkPlanSlices } from "./storyPlan";
import "./slice-progress.css";

// Plan slices that cannot be counted yet or at all: still being read, no
// associated plan, a plan that could not be read, or one the shared reader
// could not interpret.
type UncountedPlanSlices = Exclude<
  WorkPlanSlices,
  { readonly status: "interpreted" }
>;

// The one wording for uncounted plan slices, shared by the card and the
// detail slice list.
export function PlanSlicesNote({
  planSlices,
}: {
  planSlices: UncountedPlanSlices;
}) {
  switch (planSlices.status) {
    case "loading":
      return <p className="quiet">Reading plan slices…</p>;
    case "absent":
      return (
        <p>
          Plan slices: No associated plan is recorded for this story. This is
          not zero recorded completion.
        </p>
      );
    case "unavailable":
      return <p className="preparation-problem">{planSlices.problem}</p>;
    case "uninterpretable":
      return (
        <p className="preparation-problem">
          Plan slices uninterpretable: {planSlices.problem}
        </p>
      );
  }
}

export function SliceProgress({
  planSlices,
}: {
  planSlices: WorkPlanSlices | undefined;
}) {
  const countId = useId();
  if (planSlices === undefined) {
    return null;
  }
  if (planSlices.status !== "interpreted") {
    return (
      <div className="card-progress">
        <PlanSlicesNote planSlices={planSlices} />
      </div>
    );
  }
  const { slices } = planSlices;
  const done = recordedCompleteCount(slices);
  return (
    <div className="card-progress">
      <div className="slice-bar" role="img" aria-labelledby={countId}>
        {slices.map((slice) => (
          <span
            key={`${slice.index}-${slice.name}`}
            className={
              slice.status === "done"
                ? "slice-segment slice-segment-done"
                : "slice-segment"
            }
            data-slice-status={slice.status}
          />
        ))}
      </div>
      <p id={countId} className="slice-count">
        {done} of {slices.length} slices recorded done
      </p>
    </div>
  );
}
