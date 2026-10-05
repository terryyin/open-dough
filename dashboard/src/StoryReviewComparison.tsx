// Which comparison of a marked story's snapshot its review
// (`./StoryReviewPanel.tsx`) shows: the changes since the review, or all
// changes against trunk. Both come with the one snapshot read, so switching
// reads nothing; native radios keep the choice keyboard-operable and say
// which is shown.

import { useId } from "react";

export type ShownComparison = "since" | "all";

const comparisonWords: Readonly<Record<ShownComparison, string>> = {
  since: "Since the review",
  all: "All changes",
};

export function ComparisonSwitch({
  shown,
  onSwitch,
}: {
  readonly shown: ShownComparison;
  readonly onSwitch: (shown: ShownComparison) => void;
}) {
  const name = useId();
  return (
    <div
      className="story-review-comparison"
      role="radiogroup"
      aria-label="Comparison"
    >
      {(["since", "all"] as const).map((option) => (
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
