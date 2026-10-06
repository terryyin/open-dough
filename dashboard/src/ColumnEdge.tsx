import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Ref } from "react";
import { Icon } from "./Icon.tsx";
import { entryCount } from "./WorkStages.tsx";

// A dashboard column as an edge control names it: its name and how many
// entries it holds, as the column itself shows them.
export type ColumnSummary = {
  readonly name: string;
  readonly entries: number;
};

// The slim strip at one side of the dashboard columns while a column is
// hidden that way: it names the next hidden column and how many entries it
// holds, as that column's heading would, and moves the view one column. It
// is an ordinary button, named by what it shows.
export function ColumnEdge({
  side,
  column,
  onMove,
  ref,
}: {
  readonly side: "left" | "right";
  readonly column: ColumnSummary;
  readonly onMove: () => void;
  readonly ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      className={`column-edge column-edge-${side}`}
      onClick={onMove}
    >
      <Icon icon={side === "left" ? ChevronLeft : ChevronRight} />
      <span className="column-edge-label">
        <span className="column-edge-name">{column.name}</span>{" "}
        <span className="column-edge-count">{entryCount(column.entries)}</span>
      </span>
    </button>
  );
}
