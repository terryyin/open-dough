// Old or new side of a printed story-review diff line, and the spoken name
// its line-number control uses (`./DiffLineNumber.tsx`).

export type DiffLineSide = "old" | "new";

export function lineNumberLabel(side: DiffLineSide, line: number) {
  return `${side === "old" ? "Old" : "New"} line ${String(line)}`;
}
