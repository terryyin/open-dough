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

type SwitchChoice = ShownComparison | "landed" | "published";

export function ComparisonSwitch({
  shown,
  onSwitch,
  commits,
  landed = false,
  published = false,
  workspace = true,
}: {
  readonly shown: SwitchChoice;
  readonly onSwitch: (shown: SwitchChoice) => void;
  readonly commits: boolean;
  readonly landed?: boolean;
  readonly published?: boolean;
  readonly workspace?: boolean;
}) {
  const offered: readonly SwitchChoice[] = [
    ...(workspace ? ["all" as const] : []),
    ...(commits ? ["commits" as const] : []),
    ...(published ? ["published" as const] : []),
    ...(landed ? ["landed" as const] : []),
  ];
  return (
    <ComparisonChoices
      choices={offered.map((key) => ({
        key,
        label:
          key === "landed"
            ? "Landed runs"
            : key === "published"
              ? "Published completion"
              : comparisonWords[key],
      }))}
      shown={shown}
      onChoose={onSwitch}
    />
  );
}
