import { ComparisonChoices } from "./StoryReviewComparison.tsx";

export function publishedRangeKeys(ranges: number) {
  const positions = Array.from({ length: ranges }).keys();
  return Array.from(positions, String);
}

// The ranges a published close record names, chosen by position.
export function PublishedRangeSwitch({
  ranges,
  selected,
  onSelect,
}: {
  readonly ranges: number;
  readonly selected: string | undefined;
  readonly onSelect: (key: string) => void;
}) {
  return (
    <ComparisonChoices
      label="Published ranges"
      choices={publishedRangeKeys(ranges).map((key, position) => ({
        key,
        label: `Published range ${String(position + 1)} of ${String(ranges)}`,
      }))}
      shown={selected}
      onChoose={onSelect}
    />
  );
}
