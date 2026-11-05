// The scenarios and outline example rows a published feature file runs, in
// source order and named as Cucumber proof names them
// (`./cucumberProof.ts`): each a case row (`./proofCases.ts`) named by the
// scenario as written and, for each row of an outline's Examples tables,
// varied by that row's cell values, each with the 1-based source line of its
// Scenario or Examples table row. Read from the text itself, never from
// runner IDs, as the Gherkin kind's rows (`./proofKinds.ts`). English Gherkin
// keywords only.

import type { CaseRow } from "./proofCases.ts";

const scenarioLine =
  /^(?:Scenario Outline|Scenario Template|Scenario|Example):(.*)$/;
const examplesLine = /^(?:Examples|Scenarios):/;
const sectionLine = /^(?:Feature|Rule|Background):/;

// A table row's cells, unescaped as Gherkin does (`\|`, `\\`, `\n`) and
// trimmed.
function cellsOf(row: string): string[] {
  const body = row.trim().replace(/^\|/, "");
  const cells: string[] = [];
  let cell = "";
  let escaped = false;
  for (const char of body) {
    if (escaped) {
      cell +=
        char === "n"
          ? "\n"
          : char === "|" || char === "\\"
            ? char
            : `\\${char}`;
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  return cells;
}

export function scenarioRowsOf(text: string): CaseRow[] {
  const rows: CaseRow[] = [];
  let scenario: string | undefined;
  // Where the current scenario's plain row stands until Examples make it an
  // outline.
  let plainAt = -1;
  let examples: "none" | "header" | "rows" = "none";
  let docString: string | undefined;
  for (const [at, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (docString !== undefined) {
      if (line.startsWith(docString)) docString = undefined;
      continue;
    }
    if (line.startsWith('"""') || line.startsWith("```")) {
      docString = line.slice(0, 3);
      continue;
    }
    if (line === "" || line.startsWith("#") || line.startsWith("@")) continue;
    const named = scenarioLine.exec(line);
    if (named !== null) {
      scenario = (named[1] ?? "").trim();
      plainAt = rows.length;
      rows.push({ name: scenario, line: at + 1 });
      examples = "none";
      continue;
    }
    if (sectionLine.test(line)) {
      scenario = undefined;
      examples = "none";
      continue;
    }
    if (examplesLine.test(line) && scenario !== undefined) {
      if (plainAt !== -1) {
        rows.splice(plainAt, 1);
        plainAt = -1;
      }
      examples = "header";
      continue;
    }
    if (line.startsWith("|") && scenario !== undefined && examples !== "none") {
      if (examples === "header") {
        examples = "rows";
      } else {
        rows.push({
          name: scenario,
          variant: cellsOf(line),
          line: at + 1,
        });
      }
    }
  }
  return rows;
}
