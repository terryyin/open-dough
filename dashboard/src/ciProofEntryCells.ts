// Homepage Proof cells for one declared entry (`./IntentCiProof.tsx`): a
// single unit keeps `ciProofCellsOf`; several stay as labeled `unitLines`
// whose counts and times never sum (`./ciProofWording.ts`, `./ciProofUnits.ts`).

import type { CiProofEntry } from "./ciProof.ts";
import {
  ciProofCellsOf,
  type CiProofCells,
  type CiProofUnitLine,
} from "./ciProofWording.ts";

export type { CiProofUnitLine };

// ENTRY's homepage Proof cells: one unit keeps its flat reading; several as
// labeled lines. `unitLines` always names each unit for whole-row sorting.
export function entryProofCellsOf(entry: CiProofEntry): CiProofCells {
  const byUnit = entry.evidence.map((unit) => ({
    unit: unit.unit,
    cells: ciProofCellsOf(unit),
  }));
  const unitLines: CiProofUnitLine[] = byUnit.map(({ unit, cells }) => ({
    unit,
    counts: cells.counts,
    countedResults: cells.countedResults,
    executionTime: cells.executionTime,
  }));
  const [only] = byUnit;
  if (byUnit.length === 1 && only !== undefined) {
    return { ...only.cells, unitLines };
  }
  return {
    counts: unitLines.map((line) => line.counts).join("\n"),
    countedResults: undefined,
    executionTime: {
      text: unitLines.map((line) => line.executionTime.text).join("\n"),
    },
    completeness: "",
    gaps: [],
    unitLines,
  };
}
