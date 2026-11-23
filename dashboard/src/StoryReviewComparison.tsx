// All changes comes with the workspace snapshot, its uncommitted changes
// included or left out; Commits reads the selected points. Native radios also
// offer available historical comparisons.

import { useId, type ReactNode } from "react";
import type { StoryReview } from "./storyReviewContract.ts";

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
  label = "Comparison",
}: {
  readonly choices: readonly {
    readonly key: Key;
    readonly label: ReactNode;
  }[];
  readonly shown: Key | undefined;
  readonly onChoose: (key: Key) => void;
  readonly label?: string;
}) {
  const name = useId();
  return (
    <div
      className="story-review-comparison"
      role="radiogroup"
      aria-label={label}
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

// The choice a review shows: a chosen landed run, the published completion
// read, or the workspace's comparison.
export const shownChoice = (
  shown: ShownComparison,
  review: StoryReview | undefined,
  selectedRun: unknown,
): ComparisonChoice =>
  selectedRun !== undefined
    ? "landed"
    : review?.kind === "published"
      ? "published"
      : shown;

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
  // Whether the workspace holds commits to choose among.
  readonly commits: boolean;
  readonly landed?: boolean;
  readonly published?: boolean;
  readonly workspace?: boolean;
}) {
  const offered: readonly ComparisonChoice[] = [
    ...(workspace ? ["all" as const] : []),
    ...(workspace && commits ? ["commits" as const] : []),
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

export function ComparisonInclusion({
  label,
  included,
  disabled,
  onInclude,
}: {
  readonly label: string;
  readonly included: boolean;
  readonly disabled?: boolean;
  readonly onInclude: (include: boolean) => void;
}) {
  return (
    <div className="story-review-inclusion">
      <label>
        <input
          type="checkbox"
          checked={included}
          disabled={disabled}
          onChange={(event) => {
            onInclude(event.target.checked);
          }}
        />{" "}
        {label}
      </label>
    </div>
  );
}
