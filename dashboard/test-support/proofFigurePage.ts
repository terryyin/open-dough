// One native definition list, read in DOM order with its container cardinality.
import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

export async function expectFigureDefinitions(
  group: Locator,
  columns: readonly string[],
  figures: readonly string[],
) {
  // Native parent and descendants are in DOM order. Keeping the parent in the
  // raw array detects missing or duplicate empty containers while polling.
  const parts = group
    .or(group.getByRole("term"))
    .or(group.getByRole("definition"));
  await expect
    .poll(() =>
      parts.evaluateAll((nodes) =>
        nodes.map((node, at) =>
          at === 0
            ? { parent: true }
            : {
                tag: node.tagName,
                role: node.getAttribute("role"),
                text: node.textContent
                  .replace(/[\u200b\u00ad]/g, "")
                  .trim()
                  .replace(/\s+/g, " "),
              },
        ),
      ),
    )
    .toEqual([
      { parent: true },
      ...columns.flatMap((text, at) => [
        { tag: "DT", role: null, text },
        { tag: "DD", role: null, text: figures[at] },
      ]),
    ]);
}
