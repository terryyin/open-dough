// New-language diffs keep distinct token colours for Markdown, JSON and CSS
// while markers, backgrounds and 4.5:1 contrast stay as story-review already
// promises for TypeScript.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { expectReadableContrast } from "../../tests/accessibleReading.ts";
import { setColorScheme } from "../../tests/systemAppearanceReading.ts";
import {
  frontendFileDiff,
  frontendReviewSnapshot,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "../../tests/support/reviewTreeRows.ts";
import {
  readmeDiff,
  readmeText,
  stylesheetDiff,
  stylesheetText,
} from "../../tests/support/diffSyntaxFixtures.ts";
import {
  codeToken,
  newLine,
  removedLine,
  tokenAppearance,
} from "../../tests/support/reviewDiffSyntax.ts";

const schemes = ["dark", "light"] as const;

test("a modified README heading and fence take distinct token colours while markers and backgrounds stay", async ({
  page,
  frontendServices,
}) => {
  const path = "README.md";
  await setColorScheme(page, "dark");
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [{ kind: "modified", path, lines: { added: 1, removed: 1 } }],
    }),
    (answers) => {
      answers.answerFile(readmeDiff(path), path);
      answers.answerFileText(readmeText, path);
    },
  );
  await fileRow(review, `Modified ${path}`).click();
  const diff = fileDiff(review, `Modified ${path}`);
  const added = newLine(diff, 2);
  const removed = removedLine(diff, 2);
  const plain = newLine(diff, 1);
  await expect(added).toHaveText("+# Shown");
  await expect(removed).toHaveText("-```");
  await expect(added).toHaveClass(/story-review-added/);
  await expect(removed).toHaveClass(/story-review-removed/);
  const heading = await tokenAppearance(codeToken(added, /^# Shown$/));
  // Fence markers are three backticks; avoid a `...` regex literal so
  // Playwright's locator serialization keeps the pattern intact.
  const fence = await tokenAppearance(
    codeToken(removed, new RegExp("^\\u0060{3}$")),
  );
  const paragraph = await tokenAppearance(
    codeToken(plain, /^plain paragraph$/),
  );
  expect(heading.color).not.toBe(fence.color);
  expect(heading.color).not.toBe(paragraph.color);
  expect(
    await added.evaluate((line) => getComputedStyle(line).backgroundColor),
  ).not.toBe(
    await removed.evaluate((line) => getComputedStyle(line).backgroundColor),
  );
});

test("a JSON property name and string value take distinct colours from each other and punctuation", async ({
  page,
  frontendServices,
}) => {
  const jsonPath = "config.json";
  const code = '{ "shown": "value" }';
  await setColorScheme(page, "dark");
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [
        { kind: "added", path: jsonPath, lines: { added: 1, removed: 0 } },
      ],
    }),
    (answers) => {
      answers.answerFile(frontendFileDiff(jsonPath, [code]), jsonPath);
      answers.answerFileText(
        { kind: "text", baseline: null, tree: `${code}\n` },
        jsonPath,
      );
    },
  );
  await fileRow(review, `Added ${jsonPath}`).click();
  const line = newLine(fileDiff(review, `Added ${jsonPath}`), 1);
  await expect(line).toHaveText(`+${code}`);
  await expect(line).toHaveClass(/story-review-added/);
  const name = codeToken(line, /^"shown"$/);
  const value = codeToken(line, /^"value"$/);
  const punctuation = codeToken(line, /^: $/);
  await expect(name).toBeVisible();
  await expect(value).toBeVisible();
  const named = await tokenAppearance(name);
  const valued = await tokenAppearance(value);
  const punctuated = await tokenAppearance(punctuation);
  expect(named.color).not.toBe(valued.color);
  expect(named.color).not.toBe(punctuated.color);
  expect(valued.color).not.toBe(punctuated.color);
  for (const scheme of schemes) {
    await setColorScheme(page, scheme);
    await expectReadableContrast(name);
  }
});

test("a removed CSS property and colour value differ and stay readable when appearance switches", async ({
  page,
  frontendServices,
}) => {
  const path = "theme.css";
  await setColorScheme(page, "dark");
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [{ kind: "modified", path, lines: { added: 0, removed: 1 } }],
    }),
    (answers) => {
      answers.answerFile(stylesheetDiff(path), path);
      answers.answerFileText(stylesheetText, path);
    },
  );
  await fileRow(review, `Modified ${path}`).click();
  const line = removedLine(fileDiff(review, `Modified ${path}`), 2);
  await expect(line).toHaveText("-  --accent: #ff0000;");
  await expect(line).toHaveClass(/story-review-removed/);
  const property = codeToken(line, /^--accent$/);
  const value = codeToken(line, /^#ff0000$/);
  await expect(property).toBeVisible();
  const darkProperty = await tokenAppearance(property);
  const darkValue = await tokenAppearance(value);
  expect(darkProperty.color).not.toBe(darkValue.color);
  await expectReadableContrast(property);
  await setColorScheme(page, "light");
  const lightProperty = await tokenAppearance(property);
  expect(lightProperty.color).not.toBe(darkProperty.color);
  await expectReadableContrast(property);
});
