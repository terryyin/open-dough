// All changes comes with the workspace snapshot; Commits reads the selected
// points. Native radios also offer available historical comparisons.

import { useId } from "react";

export type ShownComparison = "all" | "commits";

export const comparisonWords: Readonly<Record<ShownComparison, string>> = {
  all: "All changes",
  commits: "Commits",
};

export function ComparisonSwitch({
  shown,
  onSwitch,
  commits,
  landed = false,
  published = false,
  workspace = true,
}: {
  readonly shown: ShownComparison | "landed" | "published";
  readonly onSwitch: (shown: ShownComparison | "landed" | "published") => void;
  readonly commits: boolean;
  readonly landed?: boolean;
  readonly published?: boolean;
  readonly workspace?: boolean;
}) {
  const name = useId();
  return (
    <div
      className="story-review-comparison"
      role="radiogroup"
      aria-label="Comparison"
    >
      {[
        ...(workspace ? ["all" as const] : []),
        ...(commits ? ["commits" as const] : []),
        ...(published ? ["published" as const] : []),
        ...(landed ? ["landed" as const] : []),
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
          {option === "landed"
            ? "Landed runs"
            : option === "published"
              ? "Published completion"
              : comparisonWords[option]}
        </label>
      ))}
    </div>
  );
}
