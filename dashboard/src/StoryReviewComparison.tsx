// All changes comes with the workspace snapshot; Commits reads the selected
// points. Native radios also offer available historical comparisons.

import { useId, type ReactNode } from "react";

export type ShownComparison = "all" | "commits";

export const comparisonWords: Readonly<Record<ShownComparison, string>> = {
  all: "All changes",
  commits: "Commits",
};

// The Comparison switch itself: one native radio per choice, in order.
export function ComparisonChoices<Key extends string>({
  choices,
  shown,
  onChoose,
}: {
  readonly choices: readonly {
    readonly key: Key;
    readonly label: ReactNode;
  }[];
  readonly shown: Key | undefined;
  readonly onChoose: (key: Key) => void;
}) {
  const name = useId();
  return (
    <div
      className="story-review-comparison"
      role="radiogroup"
      aria-label="Comparison"
    >
      {choices.map(({ key, label }) => (
        <label key={key}>
          <input
            type="radio"
            name={name}
            value={key}
            checked={shown === key}
            onChange={() => {
              onChoose(key);
            }}
          />{" "}
          {label}
        </label>
      ))}
    </div>
  );
}

// A comparison the switch offers: of the workspace, or a fixed historical one.
export type ComparisonChoice = ShownComparison | "landed" | "published";

// A comparison's name, in the switch and in the review's toolbar.
export const comparisonName = (shown: ComparisonChoice) =>
  shown === "landed"
    ? "Landed runs"
    : shown === "published"
      ? "Published completion"
      : comparisonWords[shown];

export function ComparisonSwitch({
  shown,
  onSwitch,
  commits,
  landed = false,
  published = false,
  workspace = true,
}: {
  readonly shown: ComparisonChoice;
  readonly onSwitch: (shown: ComparisonChoice) => void;
  readonly commits: boolean;
  readonly landed?: boolean;
  readonly published?: boolean;
  readonly workspace?: boolean;
}) {
  const offered: readonly ComparisonChoice[] = [
    ...(workspace ? ["all" as const] : []),
    ...(commits ? ["commits" as const] : []),
    ...(published ? ["published" as const] : []),
    ...(landed ? ["landed" as const] : []),
  ];
  return (
    <ComparisonChoices
      choices={offered.map((key) => ({
        key,
        label: comparisonName(key),
      }))}
      shown={shown}
      onChoose={onSwitch}
    />
  );
}
