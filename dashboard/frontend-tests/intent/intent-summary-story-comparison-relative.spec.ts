import { fileComparisonCell } from "../../test-support/intentFileProofPage.ts";
import { proofTableRowsNamed } from "../../test-support/proofTablePage.ts";
// Scope-relative scales and Show % are rendered by the production scope frame.
import { test, expect } from "../../test-support/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  scopeComparisonFigure,
  scopeComparisonCell,
  scopeTable,
} from "../../test-support/intentScopeProofPage.ts";
import {
  expectMark,
  markGeometry,
  relativePresentation,
} from "../../test-support/support/relativeTimingMarks.ts";
import { rowNames } from "../../test-support/support/expectSortedColumns.ts";

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
    renderComparison,
  }) => {
    const story = makeMe.aComparedStory
      .inSummaryScope()
      .selecting(
        example.path,
        example.path === "dashboard/tests" ? "location" : "folder",
      )
      .please();
    await renderComparison(story);
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
    await renderComparison(story, { showPercent: true });
    await expect(own).toHaveText(example.own + example.percent);
  });
}

test("file Proof toggles precise percentages without changing its timing geometry", async ({
  page,
  renderComparison,
}) => {
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .selecting("dashboard/tests/folder/nested/c.spec.ts", "file")
    .please();
  await renderComparison(story);
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  const branch = fileComparisonCell(
    proof,
    "dashboard/tests/folder/nested/c.spec.ts",
    "Branch",
  );
  await renderComparison(story, { showPercent: true });
  await expect(branch).toHaveText("+70 ms+21%");
  const before = await expectMark(branch, "slower", 70 / 340 / 0.5);
  await renderComparison(story, { showPercent: false });
  await expect(branch).toHaveText("+70 ms");
  expect(await markGeometry(branch)).toEqual(before);
});

test("added and unchanged historical file Proofs distinguish absence from a measured zero", async ({
  page,
  renderComparison,
}) => {
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .selecting("dashboard/tests/added.spec.ts", "file");
  await renderComparison(story.please());
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  await renderComparison(story.please(), { showPercent: true });
  await expect(
    fileComparisonCell(proof, "dashboard/tests/added.spec.ts", "Branch"),
  ).toHaveText("800 ms");
  await expect(relativePresentation(proof)).toHaveCount(0);
  await renderComparison(
    story.selecting("dashboard/tests/root.spec.ts", "file").please(),
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
  renderComparison,
}) => {
  const story = makeMe.aComparedStory.inSummaryScope().please();
  await renderComparison(story);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, "dashboard/tests");
  await renderComparison(story, {
    sort: { column: "landed", direction: "ascending" },
  });
  const order = await rowNames(table).allTextContents();
  await renderComparison(story, {
    showPercent: true,
    sort: { column: "landed", direction: "ascending" },
  });
  await renderComparison(story, {
    showPercent: false,
    sort: { column: "landed", direction: "ascending" },
  });
  await expect(rowNames(table)).toHaveText(order);
  const removed = proofTableRowsNamed(table, "gone.spec.ts");
  await expect(removed).toContainText("removed");
  await expect(relativePresentation(removed)).toHaveCount(0);
  await expect(rowNames(table)).not.toContainText(["later.spec.ts"]);
});
