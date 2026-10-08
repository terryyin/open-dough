// Which comparison of a story's snapshot its review
// (`./StoryReviewPanel.tsx`) shows: the changes since the review, or all
// changes against trunk, or selected commits. All changes and Since the
// review come with the snapshot; Commits reads the selected points. Native
// radios keep the choice keyboard-operable and say
// which is shown.

import { useId } from "react";

export type ShownComparison = "since" | "all" | "commits";

const comparisonWords: Readonly<Record<ShownComparison, string>> = {
  since: "Since the review",
  all: "All changes",
  commits: "Commits",
};

export function ComparisonSwitch({
  shown,
  onSwitch,
  since,
  commits,
}: {
  readonly shown: ShownComparison;
  readonly onSwitch: (shown: ShownComparison) => void;
  readonly since: boolean;
  readonly commits: boolean;
}) {
  const name = useId();
  return (
    <div
      className="story-review-comparison"
      role="radiogroup"
      aria-label="Comparison"
    >
      {[
        ...(since ? ["since" as const] : []),
        "all" as const,
        ...(commits ? ["commits" as const] : []),
      ].map((option) => (
        <label key={option}>
          <input
            type="radio"
            name={name}
            value={option}
            checked={shown === option}
            onChange={() => {
              onSwitch(option);
            }}
          />{" "}
          {comparisonWords[option]}
        </label>
      ))}
    </div>
  );
}
