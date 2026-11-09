// Intent location-tree file control with optional shared CI comparison cues
// (`./intentTreeComparison.ts`): Proof's Counts and after-side words, row by
// row, join the existing path or change-kind label in the accessible name;
// cue attrs match Summary and Proof rows.

import { scopeCueRowAttrs } from "./ciScopeComparisonCuePresentation.ts";
import type { TreeComparisonReading } from "./intentTreeComparison.ts";
import {
  treeComparisonAccessibleName,
  treeFileComparisonOf,
} from "./intentTreeComparison.ts";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";

export function IntentTreeFileRow({
  label,
  name,
  selected,
  onSelect,
  reading,
  path,
  treeFile,
}: {
  readonly label: string;
  readonly name: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly reading: TreeComparisonReading;
  readonly path: string;
  readonly treeFile: IntentTreeFile;
}) {
  const comparison = treeFileComparisonOf(reading, path, treeFile);
  const accessible =
    comparison === undefined
      ? label
      : treeComparisonAccessibleName(label, comparison);
  return (
    <button
      type="button"
      aria-label={accessible}
      title={accessible}
      aria-pressed={selected}
      {...(comparison === undefined ? {} : scopeCueRowAttrs(comparison.cues))}
      onClick={onSelect}
    >
      <code>{name}</code>
    </button>
  );
}
