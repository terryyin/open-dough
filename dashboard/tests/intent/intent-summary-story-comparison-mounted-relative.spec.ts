// Scope-relative scales and Show % are rendered by the production scope frame.
import { test, expect } from "../support/pageTest.ts";
import { renderComparison } from "../support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../support/comparisonScopeFacts.ts";
import { scopeFigures, scopeTable } from "../intentScopeProofPage.ts";
import { expectMark, markGeometry } from "../support/relativeTimingMarks.ts";
import { rowNames } from "../support/expectSortedColumns.ts";

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
    const own = scopeFigures(summary, example.path)
      .getByRole("definition")
      .nth(2);
    const table = scopeTable(summary, example.path);
    const child = table
      .locator("tbody tr")
      .filter({
        has: page.getByRole("rowheader", { name: example.child, exact: true }),
      })
      .getByRole("cell")
      .nth(3);
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
  const branch = proof.getByRole("table").getByRole("cell").nth(2);
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
  await expect(proof.getByRole("table").getByRole("cell").nth(2)).toHaveText(
    "800 ms",
  );
  await expect(
    proof.locator(".intent-ci-time-mark,.intent-ci-time-percent"),
  ).toHaveCount(0);
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
  const zero = proof.getByRole("table").getByRole("cell").nth(2);
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
  const removed = table.locator("tbody tr").filter({
    has: page.getByRole("rowheader", { name: "gone.spec.ts", exact: true }),
  });
  await expect(removed).toContainText("removed");
  await expect(
    removed.locator(".intent-ci-time-mark,.intent-ci-time-percent"),
  ).toHaveCount(0);
  await expect(rowNames(table)).not.toContainText(["later.spec.ts"]);
});
