// Shared semantic observation of proof tables. Expected columns and rows stay independent.
import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

// One observation of a native proof table's semantic parts. Role locators
// exclude hidden output; tags/scopes preserve column/row-header/cell identity.
// Expected words remain the caller's independent columns and rows.
// The parent marker retains container cardinality in the same readiness read.
export async function expectProofTableRows(
  table: Locator,
  columns: readonly string[],
  rows: readonly (readonly string[])[],
) {
  const body = table.locator("tbody");
  const parts = table
    .or(table.getByRole("columnheader"))
    .or(body.getByRole("row"))
    .or(body.getByRole("rowheader"))
    .or(body.getByRole("cell"));
  const expected = (
    tag: string,
    scope: string | null,
    text: string | null,
  ) => ({
    tag,
    scope,
    role: null,
    text,
  });
  await expect
    .poll(() =>
      parts.evaluateAll((nodes) =>
        nodes.map((node, at) =>
          at === 0
            ? { parent: true }
            : {
                tag: node.tagName,
                scope: node.getAttribute("scope"),
                role: node.getAttribute("role"),
                text:
                  node.tagName === "TR"
                    ? null
                    : node.textContent
                        .replace(/[\u200b\u00ad]/g, "")
                        .trim()
                        .replace(/\s+/g, " "),
              },
        ),
      ),
    )
    .toEqual([
      { parent: true },
      ...columns.map((text) => expected("TH", "col", text)),
      ...rows.flatMap(([scope, ...cells]) => [
        expected("TR", null, null),
        expected("TH", "row", scope ?? ""),
        ...cells.map((text) => expected("TD", null, text)),
      ]),
    ]);
}
