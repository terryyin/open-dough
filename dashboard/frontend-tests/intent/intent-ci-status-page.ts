// Colocated page objects for Intent's CI status region and Proof table.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { withoutBreakingHints } from "./intent-file-reading-page.ts";

const cleanText = (text: string | null | undefined) =>
  withoutBreakingHints(text).trim().replace(/\s+/g, " ");

export function intentCiStatus() {
  const panel = page.getByRole("region", { name: "CI status", exact: true });
  const status = panel.getByRole("status");
  const alert = panel.getByRole("alert");
  const checkAgainButton = panel.getByRole("button", {
    name: "Check again",
    exact: true,
  });
  const stateElement = () =>
    panel.query()?.querySelector<HTMLElement>(".intent-ci-state") ?? null;
  const checkingElement = () =>
    panel.query()?.querySelector<HTMLElement>(".intent-ci-checking") ?? null;
  const checkedTimeElement = () =>
    panel.query()?.querySelector<HTMLTimeElement>("time") ?? null;

  const ci = {
    panel,
    status,
    alert,
    checkAgainButton,
    async isAbsent() {
      await expect.element(panel).not.toBeInTheDocument();
      return ci;
    },
    async judges(branch: string) {
      await expect
        .element(
          panel.getByRole("heading", {
            name: `CI status of ${branch}`,
            exact: true,
          }),
        )
        .toBeVisible();
      return ci;
    },
    async answers(expected: string) {
      await expect
        .poll(() => cleanText(stateElement()?.textContent))
        .toBe(expected);
      return ci;
    },
    async showsChecked(): Promise<string> {
      await expect
        .poll(() => cleanText(status.query()?.textContent))
        .toMatch(/^Checked at /);
      const checkedAt = checkedTimeElement()?.getAttribute("datetime") ?? "";
      expect(checkedAt).toMatch(/^\d{4}-\d\d-\d\dT/);
      return checkedAt;
    },
    async showsOnlyChecking(branch: string) {
      await expect
        .poll(() => cleanText(status.query()?.textContent))
        .toBe(`Checking the CI of ${branch}…`);
      expect(checkingElement()?.checkVisibility()).toBe(true);
      expect(stateElement()).toBeNull();
      expect(panel.query()?.textContent ?? "").not.toContain(
        "Previously retrieved",
      );
      return ci;
    },
    async showsKept(expected: {
      readonly state: string;
      readonly checking: string;
      readonly checkedAt?: string;
    }) {
      await ci.answers(expected.state);
      await expect
        .poll(() => cleanText(status.query()?.textContent))
        .toContain("Previously retrieved at");
      if (expected.checkedAt !== undefined) {
        await expect
          .poll(() => checkedTimeElement()?.getAttribute("datetime"))
          .toBe(expected.checkedAt);
      }
      await expect
        .poll(() => cleanText(checkingElement()?.textContent))
        .toBe(expected.checking);
      expect(checkingElement()?.checkVisibility()).toBe(true);
      return ci;
    },
    async showsNoPreviousOrSpinner() {
      await expect.poll(() => checkingElement()).toBeNull();
      expect(cleanText(status.query()?.textContent)).not.toContain(
        "Previously retrieved",
      );
      return ci;
    },
    async checkAgain() {
      await userEvent.click(checkAgainButton);
      return ci;
    },
  };
  return ci;
}

export type ExpectedProofRow = readonly [
  entry: string,
  counts: string,
  executionTime: string,
];

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

  return {
    proof,
    table,
    sortButton,
    executionCells() {
      return [
        ...table
          .element()
          .querySelectorAll<HTMLTableCellElement>("tbody tr td:nth-of-type(2)"),
      ].map((cell) => page.elementLocator(cell));
    },
    async showsEvidenceLabel(words: string) {
      const labels = proof.getByRole("list", {
        name: "CI evidence",
        exact: true,
      });
      await expect
        .poll(() =>
          [
            ...labels
              .element()
              .querySelectorAll(".intent-evidence-label-heard"),
          ].map((node) => cleanText(node.textContent)),
        )
        .toContain(words);
    },
    async showsRows(rows: readonly ExpectedProofRow[]) {
      await expect
        .poll(() =>
          table
            .getByRole("columnheader")
            .elements()
            .map((header) => cleanText(header.textContent)),
        )
        .toEqual(["Entry", "Counts", "Test execution time"]);
      const bodyRows = [...table.element().querySelectorAll("tbody tr")];
      expect(bodyRows).toHaveLength(rows.length);
      for (const [at, [entry, counts, executionTime]] of rows.entries()) {
        const row = bodyRows[at];
        expect(cleanText(row?.querySelector("th")?.textContent)).toBe(entry);
        const cells = [...(row?.querySelectorAll("td") ?? [])];
        expect(cells).toHaveLength(2);
        expect(cleanText(cells[0]?.textContent)).toBe(counts);
        expect(cleanText(cells[1]?.textContent)).toBe(executionTime);
      }
    },
    async showsUnsorted(names: readonly string[]) {
      await expect
        .poll(() => ({
          sorted: table.element().querySelectorAll("th[aria-sort]").length,
          rows: [...table.element().querySelectorAll("tbody tr th")].map((th) =>
            cleanText(th.textContent),
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
              (row) => cleanText(row.textContent),
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
