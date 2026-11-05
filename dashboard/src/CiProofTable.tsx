// CI proof figures in aligned columns: one row per scope, in the order the
// caller gives, naming the scope and its counts with their unit, cumulative
// test execution time and completeness with any gaps
// (`./ciProofWording.ts`'s `ciProofCellsOf`). Intent's homepage Proof
// (`./IntentCiProof.tsx`) gives one row per declared entry. A scope path
// wraps after a `/`, or within a part only in a narrow reading pane, so the
// columns fit with their words whole; the shared Proof table box keeps any
// overflow inside it (`./ci-proof-table.css`). CI wall time is the attempt's
// own and never a column here.

import { Fragment, type ReactNode } from "react";
import type { CiProofCells } from "./ciProofWording.ts";
import "./ci-proof-table.css";

export type CiProofTableRow = {
  readonly key: string;
  // The scope the row's figures describe, shown as its row header.
  readonly scope: ReactNode;
  readonly cells: CiProofCells;
};

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

const ciProofColumnHeaders = [
  "Counts",
  "Test execution time",
  "Parts",
] as const;

export function CiProofTable({
  label,
  scopeHeader,
  rows,
}: {
  readonly label: string;
  readonly scopeHeader: string;
  readonly rows: readonly CiProofTableRow[];
}) {
  return (
    <div className="intent-proof-table intent-ci-proof-box">
      <table className="intent-proof-rows">
        <caption className="visually-hidden">{label}</caption>
        <thead>
          <tr>
            <th scope="col">{scopeHeader}</th>
            {ciProofColumnHeaders.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, scope, cells }) => (
            <tr key={key}>
              <th scope="row">{scope}</th>
              <td>{cells.counts}</td>
              <td>{cells.executionTime}</td>
              <td>
                {cells.completeness}
                {cells.gaps.map((gap) => (
                  <Fragment key={gap}>
                    {"; "}
                    <span className="intent-ci-proof-gap">{gap}</span>
                  </Fragment>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
