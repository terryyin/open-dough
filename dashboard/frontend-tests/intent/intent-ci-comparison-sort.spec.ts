// The entry table's real sortable headers, operated by native Enter and Space,
// over production endpoint proof and the production in-memory sort choice.
import { expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountComparison, rowTextsOf } from "./intent-ci-comparison-page.ts";

// The entry names in TABLE's shown order, and each sorted header's direction.
function sortReadingOf(table: Locator) {
  return {
    order: () => rowTextsOf(table).map(([name]) => name),
    sortedBy: () =>
      [...table.element().querySelectorAll("th[aria-sort]")]
        .filter((th) => th.getAttribute("aria-sort") !== "none")
        .map(
          (th) => `${th.textContent.trim()} ${th.getAttribute("aria-sort")}`,
        ),
    // Focus COLUMN's header button and press KEY on it.
    press: async (column: string, key: string) => {
      const button = table.getByRole("button", { name: column, exact: true });
      await expect.element(button).toBeVisible();
      (button.element() as HTMLElement).focus();
      await userEvent.keyboard(key);
    },
  };
}

test("native Enter and Space on the entry headers sort Baseline and Counts by their own values both ways with gaps last", async () => {
  const { entryTable } = await mountComparison(
    makeMe.aComparedStory.wallTimed().withMixedEntries().please(),
  );
  const { order, sortedBy, press } = sortReadingOf(entryTable);
  await press("Baseline", "{Enter}");
  await expect.poll(sortedBy).toEqual(["Baseline ascending"]);
  expect(order()).toEqual(["tests", "dashboard/tests", "src/skills"]);
  await press("Baseline", "{Enter}");
  await expect.poll(sortedBy).toEqual(["Baseline descending"]);
  expect(order()).toEqual(["dashboard/tests", "tests", "src/skills"]);
  await press("Counts", " ");
  await expect.poll(sortedBy).toEqual(["Counts ascending"]);
  expect(order()).toEqual(["src/skills", "tests", "dashboard/tests"]);
  await press("Counts", " ");
  await expect.poll(sortedBy).toEqual(["Counts descending"]);
  expect(order()).toEqual(["dashboard/tests", "tests", "src/skills"]);
});

// Fresh canonical endpoint entries; each change's sign, size and percentage
// order differently, so only a signed-change sort gives down, small, big.
function signedEntries() {
  const untimed = makeMe.aCiProofEntry.at("e/untimed").please();
  const timed = (path: string, ms: number) =>
    makeMe.aCiProofEntry.at(path).counting(1).timed(ms).please();
  return (
    [
      [600_000, 60_000, 300_000],
      [660_000, 90_000, 280_000, 5_000],
      [720_000, 100_000, 240_000, 5_000],
    ] as const
  ).map(([big, small, down, added]) => [
    timed("e/big", big),
    timed("e/small", small),
    timed("e/down", down),
    untimed,
    ...(added === undefined ? [] : [timed("e/added", added)]),
  ]);
}

const signedStory = () =>
  makeMe.aComparedStory.wallTimed().withEntries(signedEntries()).please();

test("signed entry figures keep their precise words and authored initial order", async () => {
  const { entryRows } = await mountComparison(signedStory());
  const tests = "1 test case (no change)";
  await expect.poll(entryRows).toEqual([
    ["e/big", tests, "10 min", "+1 min", "+2 min"],
    ["e/small", tests, "1 min", "+30 s", "+40 s"],
    ["e/down", tests, "5 min", "−20 s", "−1 min"],
    ["e/untimed", tests, "No timings", "No timings", "No timings"],
    ["e/added", "added → 1 test case", "added", "5 s", "5 s"],
  ]);
});

test("native Enter and Space on Branch and Landed sort signed changes rather than duration or percentage, with gaps last both ways", async () => {
  const { entryTable } = await mountComparison(signedStory());
  const { order, sortedBy, press } = sortReadingOf(entryTable);
  const ascending = ["e/down", "e/small", "e/big", "e/untimed", "e/added"];
  const descending = ["e/big", "e/small", "e/down", "e/untimed", "e/added"];
  await press("Branch", "{Enter}");
  await expect.poll(sortedBy).toEqual(["Branch vs baseline ascending"]);
  expect(order()).toEqual(ascending);
  await press("Branch", " ");
  await expect.poll(sortedBy).toEqual(["Branch vs baseline descending"]);
  expect(order()).toEqual(descending);
  await press("Landed", " ");
  await expect.poll(sortedBy).toEqual(["Landed vs baseline ascending"]);
  expect(order()).toEqual(ascending);
  await press("Landed", "{Enter}");
  await expect.poll(sortedBy).toEqual(["Landed vs baseline descending"]);
  expect(order()).toEqual(descending);
});
