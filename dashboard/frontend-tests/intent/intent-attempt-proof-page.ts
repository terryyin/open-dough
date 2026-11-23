import { expect } from "vitest";
import { page } from "vitest/browser";
import { intentReadingPane } from "./intent-browser-page.ts";
import { withoutBreakingHints } from "./intent-file-reading-page.ts";

const proofColumns = ["Entry", "Counts", "Test execution time"] as const;

export const ciReadingText = (text: string | null | undefined) =>
  withoutBreakingHints(text).trim().replace(/\s+/g, " ");

type ExpectedProofCell = string | readonly string[];

export type ExpectedProofRow = readonly [
  entry: string,
  counts: ExpectedProofCell,
  executionTime: ExpectedProofCell,
];

function expectProofCell(
  cell: Element | undefined,
  expected: ExpectedProofCell,
) {
  if (typeof expected === "string") {
    expect(ciReadingText(cell?.textContent)).toBe(expected);
  } else {
    const lines = cell?.querySelectorAll(".intent-ci-proof-unit-line") ?? [];
    expect(
      Array.from(lines, (line) => line.getAttribute("aria-label")),
    ).toEqual(expected);
  }
}

export function intentCiProof() {
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  const table = proof.getByRole("table", {
    name: "CI proof by declared entry",
    exact: true,
  });
  const sortHeader = (name: string) =>
    table.getByRole("columnheader", { name, exact: true });
  const sortButton = (name: string) =>
    sortHeader(name).getByRole("button", { name, exact: true });
  const evidenceLabels = proof.getByRole("list", {
    name: "CI evidence",
    exact: true,
  });

  return {
    proof,
    table,
    evidenceLabels,
    sortButton,
    sortButtons: () => proofColumns.map(sortButton),
    entryButton: (name: string) =>
      table
        .getByRole("rowheader", { name, exact: true })
        .getByRole("button", { name, exact: true }),
    attemptLink: (name: string) =>
      evidenceLabels.getByRole("link", { name, exact: true }),
    checking: proof.getByText("Checking the CI proof of this run…", {
      exact: true,
    }),
    unitLine: (name: string) => proof.getByLabelText(name, { exact: true }),
    executionCells() {
      return [
        ...table
          .element()
          .querySelectorAll<HTMLTableCellElement>("tbody tr td:nth-of-type(2)"),
      ].map((cell) => page.elementLocator(cell));
    },
    async showsEvidenceLabel(words: string) {
      await expect
        .poll(() =>
          [
            ...evidenceLabels
              .element()
              .querySelectorAll(".intent-evidence-label-heard"),
          ].map((node) => ciReadingText(node.textContent)),
        )
        .toContain(words);
    },
    async showsAttemptAndRevision(attempt: string, revision: string) {
      await expect
        .poll(() =>
          evidenceLabels
            .getByRole("listitem")
            .elements()
            .slice(0, 2)
            .map((item) => ({
              heard: Array.from(
                item.querySelectorAll(".intent-evidence-label-heard"),
                (label) => ciReadingText(label.textContent),
              ),
              ariaLabel: item.getAttribute("aria-label"),
            })),
        )
        .toEqual([
          { heard: [attempt], ariaLabel: null },
          { heard: [`Revision ${revision}`], ariaLabel: null },
        ]);
    },
    async showsRows(rows: readonly ExpectedProofRow[]) {
      await expect
        .poll(() =>
          table
            .getByRole("columnheader")
            .elements()
            .map((header) => ciReadingText(header.textContent)),
        )
        .toEqual(proofColumns);
      const bodyRows = table
        .getByRole("row")
        .elements()
        .filter((row) => row.closest("tbody") !== null);
      expect(bodyRows).toHaveLength(rows.length);
      for (const [at, [entry, counts, executionTime]] of rows.entries()) {
        const row = bodyRows[at];
        if (row === undefined) throw new Error(`No proof row at ${at}`);
        const shown = page.elementLocator(row);
        expect(
          shown
            .getByRole("rowheader")
            .elements()
            .map((header) => ciReadingText(header.textContent)),
        ).toEqual([entry]);
        const cells = shown.getByRole("cell").elements();
        expect(cells).toHaveLength(2);
        expectProofCell(cells[0], counts);
        expectProofCell(cells[1], executionTime);
      }
    },
    async showsUnsorted(names: readonly string[]) {
      await expect
        .poll(() => ({
          sorted: table.element().querySelectorAll("th[aria-sort]").length,
          rows: [...table.element().querySelectorAll("tbody tr th")].map((th) =>
            ciReadingText(th.textContent),
          ),
        }))
        .toEqual({ sorted: 0, rows: [...names] });
    },
    async showsSortedBy(
      column: string,
      direction: "ascending" | "descending",
      names: readonly string[],
    ) {
      const header = sortHeader(column);
      await expect.element(header).toHaveAttribute("aria-sort", direction);
      await expect
        .poll(() => {
          const th = header.element();
          const marks = [...th.querySelectorAll(".intent-ci-sort-mark")];
          const arrows = [...th.querySelectorAll(".intent-ci-sort-mark svg")];
          return {
            tag: th.tagName,
            scope: th.getAttribute("scope"),
            sortedHeaders: table.element().querySelectorAll("th[aria-sort]")
              .length,
            directions: marks.map((mark) =>
              mark.getAttribute("data-direction"),
            ),
            visibleArrows: arrows
              .filter((svg) => svg.checkVisibility())
              .map((svg) => svg.getAttribute("aria-hidden")),
            rows: [...table.element().querySelectorAll("tbody tr th")].map(
              (row) => ciReadingText(row.textContent),
            ),
          };
        })
        .toEqual({
          tag: "TH",
          scope: "col",
          sortedHeaders: 1,
          directions: [direction],
          visibleArrows: ["true"],
          rows: [...names],
        });
    },
  };
}

export async function showsAttemptSummary(path: string) {
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expect
    .poll(
      () => summary.query()?.querySelector(".intent-summary-path")?.textContent,
    )
    .toBe(path);
  await expect.poll(() => document.activeElement).toBe(intentReadingPane());
}

// The table box fits inside Intent's pane, with no horizontal overflow of
// that box or the page itself.
export function proofTableFit(table: Element) {
  const box = table.closest(".intent-proof-table");
  const pane = intentReadingPane();
  if (box === null || pane === null) throw new Error("No proof reading pane");
  const shown = box.getBoundingClientRect();
  const reading = pane.getBoundingClientRect();
  return {
    sideways: box.scrollWidth - box.clientWidth,
    inPane: shown.left >= reading.left && shown.right <= reading.right,
    pageSideways:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  };
}

// Each nonspace token drawn on more than one line, measured in Chromium.
export function wordsBrokenApart(part: Element, within: string) {
  const broken: string[] = [];
  for (const element of part.querySelectorAll(within)) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const word of (node.textContent ?? "").matchAll(/\S+/gu)) {
        const range = document.createRange();
        range.setStart(node, word.index);
        range.setEnd(node, word.index + word[0].length);
        const lines = new Set(
          Array.from(range.getClientRects(), (rect) => Math.round(rect.top)),
        );
        if (lines.size > 1) broken.push(word[0]);
      }
    }
  }
  return broken;
}
