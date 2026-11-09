// Scope-relative scales and Show % are rendered by the production scope frame.
import {
  test,
  expect,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import {
  summaryScopeFacts,
  serveComparison,
} from "../support/comparisonScopeFacts.ts";
import { scopeFigures, scopeTable } from "../intentScopeProofPage.ts";
import {
  expectMark,
  markGeometry,
  showPercent,
} from "../support/relativeTimingMarks.ts";
import { rowNames, sortButton } from "../support/expectSortedColumns.ts";

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
    comparisonServer,
    comparisonServices,
  }) => {
    const facts = summaryScopeFacts();
    serveComparison(comparisonServices, facts, facts.entries);
    await mountComparison(page, comparisonServer, {
      ...facts,
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
    await showPercent(summary).focus();
    await page.keyboard.press("Space");
    await expect(own).toHaveText(example.own + example.percent);
    expect(comparisonServices.comparisons).toBe(1);
    expect(comparisonServices.proofs).toBe(3);
  });
}

test("file Proof toggles precise percentages without changing its timing geometry", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, {
    ...facts,
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
  await showPercent(proof).check();
  await expect(branch).toHaveText("+70 ms+21%");
  const before = await expectMark(branch, "slower", 70 / 340 / 0.5);
  await showPercent(proof).uncheck();
  await expect(branch).toHaveText("+70 ms");
  expect(await markGeometry(branch)).toEqual(before);
});

test("added and unchanged historical file Proofs distinguish absence from a measured zero", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, {
    ...facts,
    scope: {
      ...facts.scope,
      selection: { path: "dashboard/tests/added.spec.ts", scope: "file" },
    },
  });
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  await showPercent(proof).check();
  await expect(proof.getByRole("table").getByRole("cell").nth(2)).toHaveText(
    "800 ms",
  );
  await expect(
    proof.locator(".intent-ci-time-mark,.intent-ci-time-percent"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: /^dashboard\/tests\/root.spec.ts,/ })
    .click();
  const zero = proof.getByRole("table").getByRole("cell").nth(2);
  await expect(zero).toHaveText("0 ms0%");
  await expectMark(zero, "none", 0);
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(3);
});

test("Show % keeps Summary sort and removed files have no relative marks or later-only rows", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, "dashboard/tests");
  await sortButton(table, "Landed").click();
  const order = await rowNames(table).allTextContents();
  await showPercent(summary).check();
  await showPercent(summary).uncheck();
  await expect(rowNames(table)).toHaveText(order);
  const removed = table.locator("tbody tr").filter({
    has: page.getByRole("rowheader", { name: "gone.spec.ts", exact: true }),
  });
  await expect(removed).toContainText("removed");
  await expect(
    removed.locator(".intent-ci-time-mark,.intent-ci-time-percent"),
  ).toHaveCount(0);
  await expect(rowNames(table)).not.toContainText(["later.spec.ts"]);
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(3);
});
