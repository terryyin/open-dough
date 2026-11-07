// Intent location-tree file control with optional shared CI comparison cues
// (`./intentTreeComparison.ts`): Proof's Counts and after-side words join the
// existing path or change-kind label in the accessible name; cue attrs match
// Summary and Proof rows.

import { scopeCueRowAttrs } from "./ciScopeComparisonCuePresentation.ts";
import type { ComparisonEntryCells } from "./storyCiComparisonEntries.ts";
import type { TreeComparisonReading } from "./intentTreeComparison.ts";
import {
  treeComparisonAccessibleName,
  treeFileCellsOf,
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
  const cells: ComparisonEntryCells | undefined = treeFileCellsOf(
    reading,
    path,
    treeFile,
  );
  const accessible =
    cells === undefined || reading.kind !== "comparison"
      ? label
      : treeComparisonAccessibleName(label, cells, reading.afterSide);
  return (
    <button
      type="button"
      aria-label={accessible}
      title={accessible}
      aria-pressed={selected}
      {...(cells === undefined ? {} : scopeCueRowAttrs(cells.cues))}
      onClick={onSelect}
    >
      <code>{name}</code>
    </button>
  );
}
