// Intent Gherkin layout: the height below the banner, left-edge location
// browser, and independent pane scrolling
// (`../intentGherkinBrowseFixtures.ts`, ../../src/IntentBrowser.tsx).

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { box } from "../partArrangement.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  doughnut,
  doughnutSettings,
  publishIntentProject,
} from "../intentGherkinBrowseFixtures.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "../intentPerspectivePage.ts";

test("Intent fills the height below the banner; the location browser meets the left edge and it and the reading pane scroll on their own", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  const cases = Object.fromEntries(
    [...Array(40).keys()].map((n) => [
      `e2e_test/features/area/case_${String(n).padStart(2, "0")}.feature`,
      n === 0
        ? `Feature: Long\n${"  Scenario: A step\n    Given a step\n".repeat(60)}`
        : `Feature: Case ${n}\n`,
    ]),
  );
  await publishIntentProject(page, doughnut, doughnutSettings, cases);

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, "e2e_test/features");
  await expandIntentFolders(intent, "e2e_test/features");
  await intent
    .getByRole("button", { name: "e2e_test/features/area/case_00.feature" })
    .click();
  await expect(
    intent.getByLabel("e2e_test/features/area/case_00.feature source"),
  ).toContainText("Feature: Long");

  const region = page.locator(".intent-scroll");
  const browser = page.locator(".intent-locations");
  const reading = page.locator(".intent-reading");
  expect(
    await region.evaluate((el) => el.scrollHeight > el.clientHeight),
    "the page below the banner does not scroll",
  ).toBe(false);
  const [column, browserBox, readingBox] = await Promise.all([
    box(page.locator(".page-column")),
    box(browser),
    box(reading),
  ]);
  expect(browserBox.x).toBe(column.x);
  expect(browserBox.y + browserBox.height).toBe(600);
  expect(readingBox.y + readingBox.height).toBe(600);

  const scrolledTo = (pane: typeof browser, top: number) =>
    pane.evaluate((el, to) => {
      el.scrollTo({ top: to });
    }, top);
  const topOf = (pane: typeof browser) => pane.evaluate((el) => el.scrollTop);
  await scrolledTo(browser, 200);
  expect([await topOf(browser), await topOf(reading)]).toEqual([200, 0]);
  await scrolledTo(reading, 300);
  expect([await topOf(browser), await topOf(reading)]).toEqual([200, 300]);
});
