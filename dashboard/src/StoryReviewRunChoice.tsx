// Run choices use native controls, ordered by the retained launch read.
import { useId } from "react";
import { launchKindName } from "./launchWorkflow.ts";
import { reviewTargetName } from "./storyReview.ts";
import type { ReviewRunChoice } from "./storyReviewOneShot.ts";
export function RunChoice({
  runs,
  selected,
  onSelect,
}: {
  readonly runs: readonly ReviewRunChoice[];
  readonly selected: ReviewRunChoice;
  readonly onSelect: (key: string) => void;
}) {
  const id = useId();
  return (
    <div className="story-review-run-choice">
      <label htmlFor={id}>One-shot run</label>{" "}
      <select
        id={id}
        size={Math.max(2, Math.min(runs.length, 3))}
        value={selected.key}
        onChange={(event) => {
          onSelect(event.currentTarget.value);
        }}
      >
        {runs.map((run) => (
          <option key={run.key} value={run.key}>
            {launchKindName(run.workflow)}
            {" — "}
            {new Date(run.launchedAt).toLocaleString()}
            {" — "}
            {run.comparison?.revision.slice(0, 8) ?? "No captured comparison"}
          </option>
        ))}
      </select>
      {selected.comparison === undefined && (
        <p>
          {launchKindName(selected.workflow)} launched{" "}
          <time dateTime={selected.launchedAt}>
            {new Date(selected.launchedAt).toLocaleString()}
          </time>
          , target <code>{reviewTargetName(selected)}</code>.
        </p>
      )}
    </div>
  );
}
