// Summary retains the chosen sort while each story supplies a different table.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { developmentCard } from "./intent-ci-development-card-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
} from "./intent-summary-comparison-expected.ts";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  expectComparisonRows,
  openComparedFolder,
} from "./intent-summary-comparison-page.ts";
import {
  expectSortedBy,
  expectUnsortedRows,
  openSummary,
  scopeTable,
  sortButton,
} from "./intent-summary-proof-page.ts";

const entry = "dashboard/tests";
const folder = `${entry}/folder`;
const entryChildren = entryComparisonRows.slice(1).map(([name]) => name);
const landedDescending = [
  "folder/",
  "root.spec.ts",
  "added.spec.ts",
  "gone.spec.ts",
  "renamed.spec.ts",
];
const trunkChildren = [
  "folder/",
  "added.spec.ts",
  "later.spec.ts",
  "renamed.spec.ts",
  "root.spec.ts",
];

async function selectFromDevelopment(
  identity: string,
  title: string,
  previous: string,
) {
  await userEvent.click(
    page.getByRole("radio", { name: "Development", exact: true }),
  );
  const card = developmentCard(title);
  await card.toggle();
  await card.isSelected(true);
  await developmentCard(previous).isSelected(false);
  await userEvent.click(
    page.getByRole("radio", { name: "Intent", exact: true }),
  );
  await expect
    .element(page.getByRole("main", { name: "Intent", exact: true }))
    .toHaveAttribute("data-selected-story", identity);
}

test("Summary keeps its sort through drilling and story selection, falling back for missing columns and restoring it on return", async () => {
  const queued = makeMe.aComparedStory.ofQueuedStory().please();
  const facts = makeMe.aComparedStory.inSummaryScope().please();
  const trunk = "f".repeat(40);
  const work = makeMe.aPublishedWork
    .with({
      ...facts.work,
      revision: trunk,
      backlog: queued.work.backlog,
    })
    .please();
  const trunkLocations = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at(entry)
        .ofKind("typescript", ["**/*.spec.ts"])
        .selecting(
          `${folder}/a.spec.ts`,
          `${folder}/nested/c.spec.ts`,
          `${entry}/added.spec.ts`,
          `${entry}/later.spec.ts`,
          `${entry}/renamed.spec.ts`,
          `${entry}/root.spec.ts`,
        )
        .please(),
    )
    .please();
  const historicalLocations = makeMe.anIntentLocationsAnswer
    .locating(...(facts.scope?.locations ?? []))
    .please();
  await openSummaryComparison(
    { ...facts, work },
    {
      completion: facts.work.revision,
      readLocations: (...[, revision]) => {
        if (revision === trunk) {
          return Promise.resolve(trunkLocations);
        }
        if (revision === facts.work.revision) {
          return Promise.resolve(historicalLocations);
        }
        throw new Error(`Unexpected locations revision ${revision}`);
      },
    },
  );
  const summary = await openSummary(entry);
  const table = scopeTable(summary, entry);
  const landed = sortButton(table, "Landed");
  await userEvent.click(landed);
  await expect
    .element(table.getByRole("columnheader", { name: "Landed", exact: true }))
    .toHaveAttribute("aria-sort", "ascending");
  await userEvent.click(landed);
  await expectSortedBy(table, "Landed", "descending", landedDescending);

  await openComparedFolder(summary, folder);
  const [own, ...children] = folderComparisonRows;
  const descending = [...children].reverse();
  await expectComparisonRows(summary, [own, ...descending]);
  await expectSortedBy(
    scopeTable(summary, folder),
    "Landed",
    "descending",
    descending.map(([name]) => name),
  );

  async function selectQueued() {
    await selectFromDevelopment(queued.identity, "Story B", "Story A");
    const view = intentStoryCompare();
    await expect
      .element(view.viewTab("CI comparison"))
      .toHaveAttribute("aria-selected", "true");
    await openSummary(entry);
    await expect
      .element(table.getByRole("columnheader", { name: "Landed", exact: true }))
      .not.toBeInTheDocument();
    await expectUnsortedRows(table, trunkChildren);
  }

  async function returnToDone() {
    await selectFromDevelopment(facts.identity, "Story A", "Story B");
    await intentStoryCompare().listRevision();
    await openSummary(entry);
  }

  await selectQueued();
  await returnToDone();
  await expectSortedBy(table, "Landed", "descending", landedDescending);
  await selectQueued();
  await userEvent.click(sortButton(table, "Test execution time"));
  await expectSortedBy(
    table,
    "Test execution time",
    "ascending",
    trunkChildren,
  );
  await returnToDone();
  await expectUnsortedRows(table, entryChildren);
});
