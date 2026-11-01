// Intent browses and reads configured Gherkin source at the observed revision
// (../src/IntentPerspective.tsx): Doughnut-like and Pygardon-like locations,
// nested folders, exact text with line numbers and Gherkin styling, Proof
// unavailable, project change, and PNG files outside the kind omitted.

import { expect, test } from "./dashboardTest.ts";
import { chooseProject, parts, shortRevision } from "./dashboardPage.ts";
import { expectAddress } from "./intentPerspectivePage.ts";
import { colourOf } from "./pageColours.ts";
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
  await expect(intent.getByText("e2e_test/features").first()).toBeVisible();
  await expect(intent.getByText("gherkin").first()).toBeVisible();

  await test.step("selecting a nested feature shows exact text, line numbers and the observed revision", async () => {
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
      "No Proof is available for this file yet",
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
    await expect(intent.getByText("e2e_test/features").first()).toBeVisible();
    await expect(
      intent.getByText("e2e_test/packaged/features").first(),
    ).toBeVisible();
    await expect(
      intent.getByRole("heading", {
        name: "Test Optimization Candidates",
        exact: true,
      }),
    ).toBeVisible();
    await expect(intent).toContainText(
      "No Test Optimization Candidates record has been published",
    );
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
