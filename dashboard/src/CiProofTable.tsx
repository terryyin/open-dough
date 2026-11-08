// CI proof figures in aligned columns: one row per scope, in the order the
// caller gives, naming the scope and its counts with their unit and cumulative
// test execution time, including timing gaps
// (`./ciProofWording.ts`'s `ciProofCellsOf`). Intent's homepage Proof
// (`./IntentCiProof.tsx`) gives one row per declared entry. A story CI
// comparison (`./IntentCiComparison.tsx`) reuses this table with Baseline,
// Branch and Landed timing columns in place of a single Test execution time
// column, keeping Counts. A Summary's story comparison
// (`./IntentScopeComparisonTable.tsx`) adds Change after the scope, its cells
// narrowing their padding sooner for the extra column. A scope path wraps
// after a `/`, or within a part only in a narrow reading pane, so the columns
// fit with their words whole; the shared Proof table box keeps any overflow
// inside it
// (`./ci-proof-table.css`). CI wall time is the attempt's own and never a
// column here. A caller that gives `sorting` makes each column header a
// button that sorts the rows by that column's figures (`./ciProofSort.ts`),
// marking the sorted header with `aria-sort` and a direction arrow; the
// caller holds the sort choice in memory, as CI status does
// (`useCiProofSorting`) and a Summary does with Intent's reading place
// (`./IntentScopeProof.tsx`). A sort by a column this table lacks is cleared,
// so the rows keep their given order. Without `sorting` the headers stay
// plain. The figure columns and each figure's words come from
// `./CiProofFigures.tsx`, which a Summary's own figures above the table share
// (`./IntentScopeFigures.tsx`).

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Icon } from "./Icon.tsx";
import { nextSort, sortedRows, type ColumnSort } from "./ciProofSort.ts";
import { scopeCueRowAttrs } from "./ciScopeComparisonCuePresentation.ts";
import type { CiProofCells } from "./ciProofWording.ts";
import {
  figureHeadersFor,
  figureOf,
  type FigureHeader,
} from "./CiProofFigures.tsx";
import {
  isComparisonCells,
  type ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";
import "./ci-proof-table.css";
import "./intent-ci-cues.css";

export type CiProofTableRow = {
  readonly key: string;
  // The scope the row's figures describe, shown as its row header.
  readonly scope: ReactNode;
  // The scope's path name, by which its column sorts.
  readonly name?: string;
  readonly cells: CiProofCells | ComparisonEntryCells;
  // A row that is not one of the scopes, kept last under any sort.
  readonly pinned?: true;
};

// A sortable table's sort choice and how to change it.
export type CiProofSorting = {
  readonly sort: ColumnSort | undefined;
  readonly onSort: (sort: ColumnSort | undefined) => void;
};

// An in-memory sort choice, unsorted until a header is activated.
export function useCiProofSorting(): CiProofSorting {
  const [sort, onSort] = useState<ColumnSort>();
  return { sort, onSort };
}

// A repository path as a row's scope, breakable after each `/`; each part
// between them stays on one line, hyphens included, unless the pane is narrow.
export function ScopePath({ path }: { readonly path: string }) {
  return (
    <code>
      {path.split(/(?<=\/)/).map((part, at) => (
        <Fragment key={at}>
          {at > 0 && <wbr />}
          <span className="intent-ci-scope-part">{part}</span>
        </Fragment>
      ))}
    </code>
  );
}

// A column header: plain, or a button sorting by its column whose arrow shows
// the direction (`aria-sort` announces it, so the arrow stays decorative).
function ColumnHeader({
  header,
  sorting,
}: {
  readonly header: FigureHeader;
  readonly sorting: CiProofSorting | undefined;
}) {
  if (sorting === undefined) return <th scope="col">{header.label}</th>;
  const direction =
    sorting.sort?.column === header.column ? sorting.sort.direction : undefined;
  const arrow =
    direction === "ascending"
      ? ArrowUp
      : direction === "descending"
        ? ArrowDown
        : ArrowUpDown;
  return (
    <th
      scope="col"
      {...(direction === undefined ? {} : { "aria-sort": direction })}
    >
      <button
        type="button"
        className="intent-ci-sort"
        onClick={() => {
          sorting.onSort(nextSort(sorting.sort, header.column));
        }}
      >
        {header.label}
        <span
          className="intent-ci-sort-mark"
          data-direction={direction ?? "none"}
        >
          <Icon icon={arrow} />
        </span>
      </button>
    </th>
  );
}

export function CiProofTable({
  label,
  scopeHeader,
  rows,
  sorting,
  changes = false,
}: {
  readonly label: string;
  readonly scopeHeader: string;
  readonly rows: readonly CiProofTableRow[];
  readonly sorting?: CiProofSorting;
  // Whether a story comparison's rows show their story change under Change.
  readonly changes?: boolean;
}) {
  const comparison = rows.some((row) => isComparisonCells(row.cells));
  const headers = figureHeadersFor(comparison, changes);
  // A sort by a column this table lacks, such as a timing column kept from
  // another table, gives way to the given order.
  const lacked =
    rows.length > 0 &&
    sorting?.sort !== undefined &&
    sorting.sort.column !== "scope" &&
    !headers.some((header) => header.column === sorting.sort?.column);
  const onSort = sorting?.onSort;
  useEffect(() => {
    if (lacked) onSort?.(undefined);
  }, [lacked, onSort]);
  const shown = sortedRows(rows, lacked ? undefined : sorting?.sort);
  return (
    <div
      className={`intent-proof-table intent-ci-proof-box${changes ? " intent-ci-proof-changes" : ""}`}
    >
      <table className="intent-proof-rows">
        <caption className="visually-hidden">{label}</caption>
        <thead>
          <tr>
            {[{ column: "scope", label: scopeHeader } as const, ...headers].map(
              (header) => (
                <ColumnHeader
                  key={header.column}
                  header={header}
                  sorting={sorting}
                />
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {shown.map(({ key, scope, cells }) => (
            <tr
              key={key}
              {...(isComparisonCells(cells)
                ? scopeCueRowAttrs(cells.cues)
                : {})}
            >
              <th scope="row">{scope}</th>
              {headers.map(({ column }) => {
                const { words, title } = figureOf(cells, column);
                return (
                  <td key={column} title={title}>
                    {words}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
