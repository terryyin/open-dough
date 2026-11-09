// A selected entry's or folder's own CI figures in its Summary
// (`./IntentScopeProof.tsx`), above the table of its immediate folders and
// files: one labelled group of counts and test execution time or the Baseline,
// Branch and Landed times, plus parts completeness (`./CiProofFigures.tsx`),
// for each unit of results it shows, its label naming the unit when it shows
// several.
// A timing gap shows its short label with its full explanation on hover and
// as its description, as in a table cell. A comparison group carries the
// scope's change cues, as a compared row does. While no CI proof can be given,
// each figure says why.

import { figureHeadersOf, figureOf } from "./CiProofFigures.tsx";
import type { CiProofCells } from "./ciProofWording.ts";
import { scopeCueElementAttrs } from "./ciScopeComparisonCuePresentation.ts";
import {
  isComparisonCells,
  type ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";

// The label of a Summary's table of PATH's immediate folders and files, below
// PATH's own figures.
export const scopeTableLabel = (path: string) =>
  `CI proof of the immediate folders and files of ${path}`;

export function ScopeFigures({
  path,
  cells,
  unit,
}: {
  readonly path: string;
  readonly cells: CiProofCells | ComparisonEntryCells;
  // The unit's name ("test cases") when the scope shows several units.
  readonly unit?: string;
}) {
  return (
    <div
      role="group"
      aria-label={
        unit === undefined
          ? `CI proof of ${path}`
          : `CI proof of ${path}: ${unit}`
      }
      {...scopeCueElementAttrs(
        "intent-scope-figures",
        isComparisonCells(cells) ? cells.cues : undefined,
      )}
    >
      <dl>
        {figureHeadersOf(cells).map(({ column, label }) => {
          const { words, title } = figureOf(cells, column);
          return (
            <div key={column} className="intent-scope-figure">
              <dt>{label}</dt>
              <dd title={title}>{words}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
