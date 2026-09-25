// Recorded slice progress as a Taken card shows it: one segment per slice,
// filled for each slice recorded complete, and the count in words. It is a
// count of recorded statuses, not an estimate of how complete the story is,
// shown with when the current slice started, and where those slices
// were published when that is not plainly trunk. When the plan there records
// its execution as complete, the card says it awaits wrap-up and how long ago
// it completed instead, or shows the record's gap. The slices, the record,
// and the clock's start come from whatever the snapshot already read; nothing
// here reads or interprets a plan.

import { useId } from "react";
import type { ProgressSource } from "./progressSource.ts";
import { shortRevision } from "./publishedWork.ts";
import { CompletionClock, SliceClock } from "./SliceClock.tsx";
import type { SliceClock as Clock } from "./sliceClockStart.ts";
import {
  recordedCompleteCount,
  type PlanCompletion,
  type WorkPlanSlices,
} from "./storyPlan.ts";
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

// Where recorded slices were read, when it is not plainly trunk: trunk's copy
// when no profile says where the work is published, or the recorded story
// branch, which is never work in trunk. Shared by the card and the detail.
export function ProgressSourceLabel({
  progressSource,
}: {
  progressSource: ProgressSource | undefined;
}) {
  switch (progressSource?.kind) {
    case undefined:
    case "trunk":
      return null;
    case "trunk-copy":
      return (
        <p className="progress-source">
          {progressSource.branchUnknown === "not-recorded"
            ? "Trunk copy; execution branch not recorded."
            : "Trunk copy; execution branch unknown because agent profiles could not be read."}
        </p>
      );
    case "branch":
      return (
        <p className="progress-source">
          From branch <code>{progressSource.branch}</code> at{" "}
          <code title={progressSource.head}>
            {shortRevision(progressSource.head)}
          </code>
          ; not in trunk.
        </p>
      );
  }
}

// What follows the count: the current slice's clock while no completion is
// recorded; once it is, the complete state with how long ago it completed, or
// the record's gap.
function SliceProgressState({
  completion,
  sliceClock,
}: {
  completion: PlanCompletion | undefined;
  sliceClock: Clock | undefined;
}) {
  if (completion === undefined) {
    return <SliceClock clock={sliceClock} />;
  }
  if ("problem" in completion) {
    return <p className="preparation-problem">{completion.problem}</p>;
  }
  return (
    <>
      <p className="execution-complete">Execution complete, awaiting wrap-up</p>
      <CompletionClock clock={sliceClock} />
    </>
  );
}

export function SliceProgress({
  planSlices,
  progressSource,
  sliceClock,
}: {
  planSlices: WorkPlanSlices | undefined;
  progressSource: ProgressSource | undefined;
  sliceClock: Clock | undefined;
}) {
  const countId = useId();
  if (planSlices === undefined) {
    return null;
  }
  if (planSlices.status !== "interpreted") {
    return (
      <div className="card-progress">
        <ProgressSourceLabel progressSource={progressSource} />
        <PlanSlicesNote planSlices={planSlices} />
      </div>
    );
  }
  const { slices, completion } = planSlices;
  const done = recordedCompleteCount(slices);
  return (
    <div className="card-progress">
      <ProgressSourceLabel progressSource={progressSource} />
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
        {done} of {slices.length} slices recorded complete
      </p>
      <SliceProgressState completion={completion} sliceClock={sliceClock} />
    </div>
  );
}
