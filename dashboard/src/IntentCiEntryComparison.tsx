// The CI entry timing comparison section of a selected story's CI comparison
// (`./IntentCiComparison.tsx`): its heading and framing, then one row per CI
// entry and compared unit in the homepage proof table (`./CiProofTable.tsx`)
// with Baseline's cumulative test execution time and Branch's and Landed's
// signed change from it, sortable by its columns, or why there are no rows
// yet.

import { CiProofTable, ScopePath, useCiProofSorting } from "./CiProofTable.tsx";
import type { ComparisonEntries } from "./storyCiComparisonEntries.ts";

function EntryRows({
  entries,
}: {
  readonly entries: ComparisonEntries | undefined;
}) {
  const sorting = useCiProofSorting();
  if (entries === undefined || entries.kind === "checking") {
    return (
      <p className="intent-ci-reading" role="status">
        Reading entry comparison…
      </p>
    );
  }
  if (entries.kind === "empty") {
    return (
      <p className="intent-ci-comparison-entries">{entries.explanation}</p>
    );
  }
  return (
    <CiProofTable
      label="CI entry timing comparison"
      scopeHeader="Entry"
      sorting={sorting}
      rows={entries.rows.map((row) => ({
        key: `${row.path}\0${row.cells.units ?? ""}`,
        scope: <ScopePath path={row.path} />,
        name: row.path,
        cells: row.cells,
      }))}
    />
  );
}

export function EntryComparison({
  entries,
}: {
  // Undefined while the endpoints' proofs are read.
  readonly entries: ComparisonEntries | undefined;
}) {
  return (
    <>
      <div className="intent-ci-comparison-section-head">
        <h3>CI entry timing comparison</h3>
        <p>Cumulative test time · New entries show measured time</p>
      </div>
      <EntryRows entries={entries} />
    </>
  );
}
