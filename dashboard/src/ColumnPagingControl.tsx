import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Ref } from "react";
import { Icon } from "./Icon.tsx";
import { entryCount, type ColumnSummary } from "./columnSummary.ts";

// The slim strip at one side of the Board's Columns while a column is
// hidden that way: it names the next hidden column and how many entries it
// holds, as that column's heading would, and moves the view one column. It
// is an ordinary button, named by what it shows.
export function ColumnPagingControl({
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
      className={`column-paging-control column-paging-control-${side}`}
      onClick={onMove}
    >
      <Icon icon={side === "left" ? ChevronLeft : ChevronRight} />
      <span className="column-paging-control-label">
        <span className="column-paging-control-name">{column.name}</span>{" "}
        <span className="column-paging-control-count">
          {entryCount(column.entries)}
        </span>
      </span>
    </button>
  );
}
