import { fileComparisonCell } from "../../tests/intentFileProofPage.ts";
import { proofTableRowsNamed } from "../../tests/proofTablePage.ts";
// Scope-relative scales and Show % are rendered by the production scope frame.
import { test, expect } from "../../tests/support/pageTest.ts";
import { renderComparison } from "../../tests/support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../../tests/support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../../tests/support/comparisonScopeFacts.ts";
import {
  scopeComparisonFigure,
  scopeComparisonCell,
  scopeTable,
} from "../../tests/intentScopeProofPage.ts";
import {
  expectMark,
  markGeometry,
  relativePresentation,
} from "../../tests/support/relativeTimingMarks.ts";
import { rowNames } from "../../tests/support/expectSortedColumns.ts";

const examples = [
  {
    path: "dashboard/tests",
    own: "+9.5 s",
    percent: "+79%",
    reach: 1,
    child: "folder/",
    childReach: 7070 / 10340 / (9470 / 12040),
  },
  {
    path: "dashboard/tests/folder",
    own: "+7.1 s",
    percent: "+68%",
    reach: 7070 / 10340 / 0.7,
    child: "a.spec.ts",
    childReach: 1,
  },
  {
    path: "dashboard/tests/folder/nested",
    own: "+70 ms",
    percent: "+21%",
    reach: 70 / 340 / 0.5,
    child: "c.spec.ts",
    childReach: 70 / 340 / 0.5,
  },
];

for (const example of examples) {
  test(`Summary ${example.path} shares its precise relative scale with immediate children`, async ({
    page,
    comparisonRenderer,
  }) => {
    const facts = summaryScopeFacts();
    const rendered = comparisonRenderFacts(facts, facts.entries);
    await renderComparison(page, comparisonRenderer, {
      ...rendered,
      scope: {
        ...facts.scope,
        selection: {
          path: example.path,
          scope: example.path === "dashboard/tests" ? "location" : "folder",
        },
      },
    });
    const summary = page.getByRole("region", { name: "Summary", exact: true });
    const own = scopeComparisonFigure(summary, example.path, "Branch");
    const child = scopeComparisonCell(
      summary,
      example.path,
      example.child,
      "Branch",
    );
    await expect(own).toHaveText(example.own);
    await expectMark(own, "slower", example.reach);
    await expectMark(child, "slower", example.childReach);
    await renderComparison(
      page,
      comparisonRenderer,
      {
        ...rendered,
        scope: {
          ...facts.scope,
          selection: {
            path: example.path,
            scope: example.path === "dashboard/tests" ? "location" : "folder",
          },
        },
      },
      { showPercent: true },
    );
    await expect(own).toHaveText(example.own + example.percent);
  });
}

test("file Proof toggles precise percentages without changing its timing geometry", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: {
      ...facts.scope,
      selection: {
        path: "dashboard/tests/folder/nested/c.spec.ts",
        scope: "file",
      },
    },
  });
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  const branch = fileComparisonCell(
    proof,
    "dashboard/tests/folder/nested/c.spec.ts",
    "Branch",
  );
  await renderComparison(
    page,
    comparisonRenderer,
    {
      ...rendered,
      scope: {
        ...facts.scope,
        selection: {
          path: "dashboard/tests/folder/nested/c.spec.ts",
          scope: "file",
        },
      },
    },
    { showPercent: true },
  );
  await expect(branch).toHaveText("+70 ms+21%");
  const before = await expectMark(branch, "slower", 70 / 340 / 0.5);
  await renderComparison(
    page,
    comparisonRenderer,
    {
      ...rendered,
      scope: {
        ...facts.scope,
        selection: {
          path: "dashboard/tests/folder/nested/c.spec.ts",
          scope: "file",
        },
      },
    },
    { showPercent: false },
  );
  await expect(branch).toHaveText("+70 ms");
  expect(await markGeometry(branch)).toEqual(before);
});

test("added and unchanged historical file Proofs distinguish absence from a measured zero", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: {
      ...facts.scope,
      selection: { path: "dashboard/tests/added.spec.ts", scope: "file" },
    },
  });
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  await renderComparison(
    page,
    comparisonRenderer,
    {
      ...rendered,
      scope: {
        ...facts.scope,
        selection: { path: "dashboard/tests/added.spec.ts", scope: "file" },
      },
    },
    { showPercent: true },
  );
  await expect(
    fileComparisonCell(proof, "dashboard/tests/added.spec.ts", "Branch"),
  ).toHaveText("800 ms");
  await expect(relativePresentation(proof)).toHaveCount(0);
  await renderComparison(
    page,
    comparisonRenderer,
    {
      ...rendered,
      scope: {
        ...facts.scope,
        selection: { path: "dashboard/tests/root.spec.ts", scope: "file" },
      },
    },
    { showPercent: true },
  );
  const zero = fileComparisonCell(
    proof,
    "dashboard/tests/root.spec.ts",
    "Branch",
  );
  await expect(zero).toHaveText("0 ms0%");
  await expectMark(zero, "none", 0);
});

test("Show % keeps Summary sort and removed files have no relative marks or later-only rows", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, "dashboard/tests");
  await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "landed", direction: "ascending" },
  });
  const order = await rowNames(table).allTextContents();
  await renderComparison(page, comparisonRenderer, rendered, {
    showPercent: true,
    sort: { column: "landed", direction: "ascending" },
  });
  await renderComparison(page, comparisonRenderer, rendered, {
    showPercent: false,
    sort: { column: "landed", direction: "ascending" },
  });
  await expect(rowNames(table)).toHaveText(order);
  const removed = proofTableRowsNamed(table, "gone.spec.ts");
  await expect(removed).toContainText("removed");
  await expect(relativePresentation(removed)).toHaveCount(0);
  await expect(rowNames(table)).not.toContainText(["later.spec.ts"]);
});
