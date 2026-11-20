import { expect, test } from "vitest";
import type { ReviewedFileText } from "../../src/storyReviewContract.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { diffColorScheme } from "./diffColorScheme.ts";
import { styledDiffReading } from "./mountedFileDiff.ts";
import {
  mountedReviewDiff,
  tokenAppearance,
  tokenContrast,
} from "./mountedReviewDiffPage.ts";
import { addedLineDiff, printedDiff } from "./styledDiffCases.ts";

test("a modified README heading and fence take distinct token colours while markers and backgrounds stay", async () => {
  const setColorScheme = diffColorScheme();
  await setColorScheme("dark");
  const path = "README.md";
  const text = {
    kind: "text",
    baseline: "plain paragraph\n```\n",
    tree: "plain paragraph\n# Shown\n",
  } as const satisfies ReviewedFileText;
  await mountComponent(
    styledDiffReading({
      path,
      printed: printedDiff(path, [
        "@@ -1,2 +1,2 @@",
        " plain paragraph",
        "-```",
        "+# Shown",
      ]),
      text,
    }),
  );
  const diff = mountedReviewDiff();
  const added = diff.newLine(2);
  const removed = diff.removedLine(2);
  const heading = added.token(/^# Shown$/);
  const fence = removed.token(/^\u0060{3}$/);
  const paragraph = diff.newLine(1).token(/^plain paragraph$/);
  await expect.element(heading).toBeVisible();
  await expect.element(fence).toBeVisible();
  await expect.element(paragraph).toBeVisible();
  expect(tokenAppearance(heading).color).not.toBe(tokenAppearance(fence).color);
  expect(tokenAppearance(heading).color).not.toBe(
    tokenAppearance(paragraph).color,
  );
  await expect.element(added.line).toHaveTextContent("+# Shown");
  await expect.element(removed.line).toHaveTextContent("-```");
  await expect.element(added.line).toHaveClass("story-review-added");
  await expect.element(removed.line).toHaveClass("story-review-removed");
  expect(added.background()).not.toBe(removed.background());
});

test("a JSON property name and string value take distinct colours from each other and punctuation", async () => {
  const setColorScheme = diffColorScheme();
  await setColorScheme("dark");
  const code = '{ "shown": "value" }';
  await mountComponent(styledDiffReading(addedLineDiff("config.json", code)));
  const line = mountedReviewDiff().newLine(1);
  const name = line.token(/^"shown"$/);
  const value = line.token(/^"value"$/);
  const punctuation = line.token(/^:\s*$/);
  await expect.element(name).toBeVisible();
  await expect.element(value).toBeVisible();
  await expect.element(punctuation).toBeVisible();
  expect(
    new Set([
      tokenAppearance(name).color,
      tokenAppearance(value).color,
      tokenAppearance(punctuation).color,
    ]).size,
  ).toBe(3);
  await expect.element(line.line).toHaveTextContent(`+${code}`);
  await expect.element(line.line).toHaveClass("story-review-added");
  expect(tokenContrast(name)).toBeGreaterThanOrEqual(4.5);
  await setColorScheme("light");
  expect(tokenContrast(name)).toBeGreaterThanOrEqual(4.5);
});

test("a removed CSS property and colour value differ and stay readable when appearance switches", async () => {
  const setColorScheme = diffColorScheme();
  await setColorScheme("dark");
  const path = "theme.css";
  const text = {
    kind: "text",
    baseline: "body {\n  --accent: #ff0000;\n}\n",
    tree: "body {\n}\n",
  } as const satisfies ReviewedFileText;
  await mountComponent(
    styledDiffReading({
      path,
      printed: printedDiff(path, [
        "@@ -1,3 +1,2 @@",
        " body {",
        "-  --accent: #ff0000;",
        " }",
      ]),
      text,
    }),
  );
  const line = mountedReviewDiff().removedLine(2);
  const property = line.token(/^--accent$/);
  const value = line.token(/^#ff0000$/);
  await expect.element(property).toBeVisible();
  await expect.element(value).toBeVisible();
  await expect
    .element(line.line)
    .toHaveTextContent("-  --accent: #ff0000;", { normalizeWhitespace: false });
  await expect.element(line.line).toHaveClass("story-review-removed");
  const darkProperty = tokenAppearance(property).color;
  expect(darkProperty).not.toBe(tokenAppearance(value).color);
  expect(tokenContrast(property)).toBeGreaterThanOrEqual(4.5);
  await setColorScheme("light");
  expect(tokenAppearance(property).color).not.toBe(darkProperty);
  expect(tokenContrast(property)).toBeGreaterThanOrEqual(4.5);
});
