// Accessible comparison choices for published completions and retained runs.

import { useId, type ReactNode } from "react";

export type ComparisonChoice = "landed" | "published";
export const comparisonName = (choice: ComparisonChoice) =>
  choice === "landed" ? "Landed runs" : "Published completion";

// The Comparison switch itself: one native radio per choice, in order.
export function ComparisonChoices<Key extends string>({
  choices,
  shown,
  onChoose,
  onReselect,
  label = "Comparison",
}: {
  readonly choices: readonly {
    readonly key: Key;
    readonly label: ReactNode;
  }[];
  readonly shown: Key | undefined;
  readonly onChoose: (key: Key) => void;
  readonly onReselect?: (key: Key) => void;
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
            onClick={
              shown === key && onReselect
                ? () => {
                    onReselect(key);
                  }
                : undefined
            }
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
