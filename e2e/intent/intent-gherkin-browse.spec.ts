import {
  fileSource,
  sourceFile,
  sourceLineNumbers,
  sourceText,
} from "../../dashboard/tests/intentCodeBrowsePage.ts";
// Intent browses and reads configured Gherkin source at the observed revision
// (../../dashboard/src/IntentPerspective.tsx): Doughnut-like and Pygardon-like locations,
// nested folders after expand, exact text with line numbers and Gherkin
// styling, and project change. Layout scrolling lives in
// `../../dashboard/tests/intent/intent-gherkin-layout.spec.ts`.

import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  chooseProject,
  parts,
  shortRevision,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectAddress,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
  purposeRegion,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import { intentModeTab } from "../../dashboard/tests/intentModePage.ts";
import { colourOf, sourceToken } from "../../dashboard/tests/pageColours.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import {
  doughnut,
  doughnutSettings,
  packagedFeature,
  publishIntentProject,
  pygardon,
  pygardonSettings,
  recallFeature,
} from "../../dashboard/tests/intentGherkinBrowseFixtures.ts";

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
  await expect(
    intent.getByRole("heading", { name: "No story selected", exact: true }),
  ).toBeVisible();
  await expect(intentGroupToggle(intent, "e2e_test/features")).toBeVisible();
  await expect(
    intent.locator(
      'button.intent-location-name[data-location-path="e2e_test/features"]',
    ),
  ).toContainText("gherkin");
  await expectIntentGroupsCollapsed(intent);

  await test.step("selecting a nested feature shows exact text, line numbers and the observed revision", async () => {
    await expandIntentGroup(intent, "e2e_test/features");
    await expandIntentFolders(intent, "e2e_test/features");
    await expect(
      intent.getByRole("button", { name: "recall", exact: true }),
    ).toBeVisible();
    const feature = sourceFile(
      intent,
      "e2e_test/features/recall/recall_note.feature",
    );
    await expect(feature).toBeVisible();
    await expect(
      intent.getByRole("button", { name: /recall\.png/ }),
    ).toHaveCount(0);
    await feature.click();
    const source = fileSource(
      intent,
      "e2e_test/features/recall/recall_note.feature",
    );
    await expect(source).toContainText("Feature: Recall a note");
    await expect(source).toContainText("Given a notebook with a note titled");
    await expect(sourceLineNumbers(source).first()).toHaveText("1");
    await expect(intent).toContainText(
      `at revision ${shortRevision(doughnut.revision)}`,
    );
  });

  await test.step("Gherkin keywords and steps are styled; line text equals the source; copy excludes line numbers", async () => {
    const source = fileSource(
      intent,
      "e2e_test/features/recall/recall_note.feature",
    );
    const keyword = sourceToken(source, /^Feature$/);
    const step = sourceToken(source, /^Given $/);
    const plain = sourceToken(source, /^a notebook with a note titled $/);
    await expect(keyword).toBeVisible();
    await expect(step).toBeVisible();
    await expect(plain).toBeVisible();
    const keywordColour = await colourOf(keyword);
    const stepColour = await colourOf(step);
    const plainColour = await colourOf(plain);
    expect(keywordColour).not.toBe(plainColour);
    expect(stepColour).not.toBe(plainColour);
    expect(keywordColour).toBe(stepColour);

    const lineText = await sourceText(source);
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
      sourceFile(intent, "e2e_test/features/recall/recall_note.feature"),
    ).toHaveCount(0);
    await expect(intentGroupToggle(intent, "e2e_test/features")).toBeVisible();
    await expect(
      intentGroupToggle(intent, "e2e_test/packaged/features"),
    ).toBeVisible();
    await expectIntentGroupsCollapsed(intent);
    await expect(intentModeTab(intent, "CI status")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      intent.getByRole("region", { name: "CI status", exact: true }),
    ).toBeVisible();
    await expect(purposeRegion(intent)).toHaveCount(0);
    await expandIntentGroup(intent, "e2e_test/packaged/features");
    await sourceFile(
      intent,
      "e2e_test/packaged/features/packaged.feature",
    ).click();
    await expect(
      fileSource(intent, "e2e_test/packaged/features/packaged.feature"),
    ).toContainText("Feature: Packaged feature");
    await expect(intent).toContainText(
      `at revision ${shortRevision(pygardon.revision)}`,
    );
    expectAddress(page, { project: "pygardon", perspective: "intent" });
  });
});
