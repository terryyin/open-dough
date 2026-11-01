// Intent browses and reads configured Gherkin source at the observed revision
// (../src/IntentPerspective.tsx): Doughnut-like and Pygardon-like locations,
// nested folders after expand, exact text with line numbers and Gherkin
// styling, Proof unavailable, project change, PNG omitted, and dual-pane
// scroll.

import { expect, test } from "./dashboardTest.ts";
import { chooseProject, parts, shortRevision } from "./dashboardPage.ts";
import {
  expandIntentGroup,
  expectAddress,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
} from "./intentPerspectivePage.ts";
import { colourOf } from "./pageColours.ts";
import { box } from "./partArrangement.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  doughnut,
  doughnutSettings,
  packagedFeature,
  publishIntentProject,
  pygardon,
  pygardonSettings,
  recallFeature,
} from "./intentGherkinBrowseFixtures.ts";

test("Intent browses Doughnut and Pygardon Gherkin locations, reads exact text with line numbers, and replaces content on project change", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, doughnut, doughnutSettings, {
    "e2e_test/features/recall/recall_note.feature": recallFeature,
    "e2e_test/features/recall/__image_snapshots__/recall.png": "png-bytes",
  });
  await publishIntentProject(page, pygardon, pygardonSettings, {
    "e2e_test/features/smoke/smoke.feature": "Feature: Smoke\n",
    "e2e_test/packaged/features/packaged.feature": packagedFeature,
  });

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expect(intent.getByRole("heading", { level: 2 })).toHaveCount(0);
  await expect(intentGroupToggle(intent, "e2e_test/features")).toBeVisible();
  await expect(intentGroupToggle(intent, "e2e_test/features")).toContainText(
    "gherkin",
  );
  await expectIntentGroupsCollapsed(intent);

  await test.step("selecting a nested feature shows exact text, line numbers and the observed revision", async () => {
    await expandIntentGroup(intent, "e2e_test/features");
    await expect(
      intent.getByRole("button", { name: "recall", exact: true }),
    ).toBeVisible();
    const feature = intent.getByRole("button", {
      name: "e2e_test/features/recall/recall_note.feature",
      exact: true,
    });
    await expect(feature).toBeVisible();
    await expect(
      intent.getByRole("button", { name: /recall\.png/ }),
    ).toHaveCount(0);
    await feature.click();
    const source = intent.getByLabel(
      "e2e_test/features/recall/recall_note.feature source",
    );
    await expect(source).toContainText("Feature: Recall a note");
    await expect(source).toContainText("Given a notebook with a note titled");
    await expect(source.locator(".source-line-number").first()).toHaveText("1");
    await expect(intent).toContainText(
      `at revision ${shortRevision(doughnut.revision)}`,
    );
    await expect(intent.getByRole("region", { name: "Proof" })).toContainText(
      "Proof is not recorded for this project.",
    );
    await expect(
      intent.getByRole("region", { name: "Proof" }),
    ).not.toContainText(/passed|failed|no tests/i);
  });

  await test.step("Gherkin keywords and steps are styled; line text equals the source; copy excludes line numbers", async () => {
    const source = intent.getByLabel(
      "e2e_test/features/recall/recall_note.feature source",
    );
    const keyword = source
      .locator(".source-line-text span")
      .filter({ hasText: /^Feature$/ });
    const step = source
      .locator(".source-line-text span")
      .filter({ hasText: /^Given $/ });
    const plain = source
      .locator(".source-line-text span")
      .filter({ hasText: /^a notebook with a note titled $/ });
    await expect(keyword).toBeVisible();
    await expect(step).toBeVisible();
    await expect(plain).toBeVisible();
    const keywordColour = await colourOf(keyword);
    const stepColour = await colourOf(step);
    const plainColour = await colourOf(plain);
    expect(keywordColour).not.toBe(plainColour);
    expect(stepColour).not.toBe(plainColour);
    expect(keywordColour).toBe(stepColour);

    const lineText = await source
      .locator(".source-line-text")
      .evaluateAll((els) => els.map((el) => el.textContent).join("\n"));
    expect(lineText).toBe(recallFeature);

    const selected = await source.evaluate((pre) => {
      const selection = window.getSelection();
      if (selection === null) return "";
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(pre);
      selection.addRange(range);
      return selection.toString();
    });
    expect(selected).toBe(recallFeature);
    expect(selected).not.toMatch(/(^|\n)\d+(\n|$)/);
  });

  await test.step("choosing Pygardon replaces Doughnut's tree and text; both locations browse", async () => {
    await chooseProject(page, "Pygardon");
    await expect(intent).not.toContainText("Feature: Recall a note");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
      }),
    ).toHaveCount(0);
    await expect(intentGroupToggle(intent, "e2e_test/features")).toBeVisible();
    await expect(
      intentGroupToggle(intent, "e2e_test/packaged/features"),
    ).toBeVisible();
    await expectIntentGroupsCollapsed(intent);
    await expect(
      intent.getByText("Select a feature file to read its Purpose."),
    ).toBeVisible();
    await expandIntentGroup(intent, "e2e_test/packaged/features");
    await intent
      .getByRole("button", {
        name: "e2e_test/packaged/features/packaged.feature",
      })
      .click();
    await expect(
      intent.getByLabel("e2e_test/packaged/features/packaged.feature source"),
    ).toContainText("Feature: Packaged feature");
    await expect(intent).toContainText(
      `at revision ${shortRevision(pygardon.revision)}`,
    );
    expectAddress(page, { project: "pygardon", perspective: "intent" });
  });
});

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
