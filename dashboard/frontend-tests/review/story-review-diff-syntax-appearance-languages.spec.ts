// New-language diffs keep distinct token colours for Markdown, JSON and CSS
// while markers, backgrounds and 4.5:1 contrast stay as story-review already
// promises for TypeScript.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { expectReadableContrast } from "../../test-support/accessibleReading.ts";
import { setColorScheme } from "../../test-support/systemAppearanceReading.ts";
import {
  frontendFileDiff,
  frontendReviewSnapshot,
} from "../../test-support/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../test-support/support/frontendStoryReviewOpen.ts";
import {
  fileDiff,
  fileRow,
} from "../../test-support/support/reviewTreeRows.ts";
import {
  readmeDiff,
  readmeText,
  stylesheetDiff,
  stylesheetText,
} from "../../test-support/support/diffSyntaxFixtures.ts";
import {
  storyReviewDiff,
  tokenAppearance,
} from "../../test-support/support/reviewDiffSyntax.ts";

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
  const diff = storyReviewDiff(fileDiff(review, `Modified ${path}`));
  const added = diff.newLine(2);
  const removed = diff.removedLine(2);
  const plain = diff.newLine(1);
  await expect(added.line).toHaveText("+# Shown");
  await expect(removed.line).toHaveText("-```");
  await expect(added.line).toHaveClass(/story-review-added/);
  await expect(removed.line).toHaveClass(/story-review-removed/);
  const heading = await tokenAppearance(added.token(/^# Shown$/));
  // Fence markers are three backticks; avoid a `...` regex literal so
  // Playwright's locator serialization keeps the pattern intact.
  const fence = await tokenAppearance(
    removed.token(new RegExp("^\\u0060{3}$")),
  );
  const paragraph = await tokenAppearance(plain.token(/^plain paragraph$/));
  expect(heading.color).not.toBe(fence.color);
  expect(heading.color).not.toBe(paragraph.color);
  expect(
    await added.line.evaluate((line) => getComputedStyle(line).backgroundColor),
  ).not.toBe(
    await removed.line.evaluate(
      (line) => getComputedStyle(line).backgroundColor,
    ),
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
  const line = storyReviewDiff(fileDiff(review, `Added ${jsonPath}`)).newLine(
    1,
  );
  await expect(line.line).toHaveText(`+${code}`);
  await expect(line.line).toHaveClass(/story-review-added/);
  const name = line.token(/^"shown"$/);
  const value = line.token(/^"value"$/);
  const punctuation = line.token(/^: $/);
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
  const line = storyReviewDiff(
    fileDiff(review, `Modified ${path}`),
  ).removedLine(2);
  await expect(line.line).toHaveText("-  --accent: #ff0000;");
  await expect(line.line).toHaveClass(/story-review-removed/);
  const property = line.token(/^--accent$/);
  const value = line.token(/^#ff0000$/);
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
