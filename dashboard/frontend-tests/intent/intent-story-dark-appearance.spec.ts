import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  paintContrast,
  tokenColour,
} from "../configuration/system-settings-reading.ts";
import { textContrast } from "../navigation/board-accessibility.ts";
import { emulateMedia } from "../review/browser-session.ts";
import { scopeToggle } from "./intent-browser-page.ts";
import { fileLayout, focus, intentPage } from "./intent-file-layout-page.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";
import {
  openScopeSummary,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  doneIdentity,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";

const location = "dashboard/tests";
const changed = "dashboard/tests/folder/a.spec.ts";
const unchanged = "dashboard/tests/root.spec.ts";
const source = intentPage.getByLabelText(`${unchanged} source`, {
  exact: true,
});

async function darkSurface() {
  const root = document.documentElement;
  await expect
    .poll(() => matchMedia("(prefers-color-scheme: dark)").matches)
    .toBe(true);
  await expect
    .poll(() => getComputedStyle(root).backgroundColor)
    .toBe(tokenColour(root, "--surface"));
  expect(getComputedStyle(root).backgroundColor).not.toBe("rgb(246, 246, 243)");
  expect(getComputedStyle(root).color).toBe(tokenColour(root, "--text"));
  textContrast(root);
}

test("a Done story's Intent evidence stays readable under the system dark appearance", async () => {
  await emulateMedia([{ name: "prefers-color-scheme", value: "dark" }]);
  const comparison = makeMe.aStoryReview
    .published(doneCompletion)
    .modifying(changed)
    .please();
  const collected = makeMe.aScopeHistoryGlance
    .at(location)
    .timing("case", [1200], 900)
    .through(doneCompletion)
    .please();
  await openDoneStoryComparison({
    review: () => Promise.resolve(comparison),
    readFile: () => Promise.resolve("const historical = true;\n"),
    fileDiff: () =>
      Promise.resolve({
        kind: "diff",
        printed: [
          `diff --git a/${changed} b/${changed}`,
          `--- a/${changed}`,
          `+++ b/${changed}`,
          "@@ -1,1 +1,1 @@",
          "-const removed = false;",
          "+const added = true;",
          "",
        ].join("\n"),
      }),
    fileText: () =>
      Promise.resolve({
        kind: "text",
        baseline: "const removed = false;\n",
        tree: "const added = true;\n",
      }),
    ci: { readScopeHistory: () => Promise.resolve(collected) },
  });
  const story = intentStoryCompare();
  await darkSurface();
  const timing = intentPage.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
  await expect.element(timing).toBeVisible();
  textContrast(timing.getByRole("heading").first().element());
  textContrast(timing.element().querySelector("thead th") as Element);
  const switchName =
    /^(dark mode|light mode|appearance|color scheme|dashboard theme)$/i;
  for (const role of ["button", "combobox", "switch"] as const)
    await expect
      .element(page.getByRole(role, { name: switchName }))
      .not.toBeInTheDocument();

  await story.chooseTab("Changes");
  const folder = scopeToggle("folder");
  await expect.element(folder).toBeVisible();
  if (folder.element().getAttribute("aria-expanded") === "false")
    await folder.click();
  const file = story.file(`Modified ${changed}`);
  await expect.element(file).toBeVisible();
  textContrast(file.element().querySelector("code") as Element);
  const files = fileLayout();
  for (const width of [1280, 390] as const) {
    await page.viewport(width, 844);
    await darkSurface();
    await files.toggle.click();
    await files.showsFiles(false);
    await files.toggle.click();
    await files.showsFiles(true);
    await intentPage.screenshot({
      path: `../test-results/story-dark-${width}.png`,
    });
  }
  await page.viewport(1280, 900);

  await story.chooseTab("Intent coverage");
  const coverage = intentPage.getByRole("region", {
    name: "Intent coverage",
    exact: true,
  });
  await expect.element(coverage).toBeVisible();
  textContrast(
    coverage.getByRole("heading", { name: "Intent coverage" }).element(),
  );
  textContrast(
    coverage
      .element()
      .querySelector("p, .intent-story-coverage-text") as Element,
  );

  await story.chooseTab("Changes");
  await expect.element(file).toHaveAttribute("data-ci-count-cue", "none");
  await expect
    .element(file)
    .toHaveAttribute("data-ci-duration-cue", "slower-light");
  await expect
    .element(file)
    .toHaveAttribute("data-ci-count-cue-reason", "unchanged");
  await file.click();
  await expect.element(file).toHaveAttribute("aria-pressed", "true");
  focus(file);
  await expect.element(file).toHaveFocus();
  await expect.poll(story.diffCode).toContain("const added");
  const purpose = intentPage.getByRole("region", {
    name: "Purpose",
    exact: true,
  });
  for (const kind of ["added", "removed"]) {
    const line = purpose.element().querySelector(`.story-review-${kind}`);
    expect(line, `${kind} diff line`).not.toBeNull();
    textContrast(line as Element);
  }

  await story.file(unchanged).click();
  await intentFileReading(unchanged).shows("const historical");
  const lineNumber = source
    .element()
    .querySelector(".source-line-number") as Element;
  const token = () =>
    source.element().querySelector(".source-token") as Element;
  textContrast(lineNumber);
  textContrast(token());

  const summary = await openScopeSummary(location);
  const history = scopeHistoryIn(summary);
  const chart = await history.chart("test cases", "selected landing");
  textContrast(
    history.region.getByText(/Cumulative test execution time/).element(),
  );
  textContrast(chart.readoutElement() as Element);
  const mark = history.region
    .element()
    .querySelector(":is(circle, polygon).history-chart-point");
  if (mark === null) throw new Error("History shows no measured chart point");
  const markPaint = getComputedStyle(mark);
  expect(
    paintContrast(mark, [markPaint.fill, markPaint.stroke]),
  ).toBeGreaterThanOrEqual(3);

  const current = story.file(unchanged);
  await current.click();
  await intentFileReading(unchanged).shows("const historical");
  const darkColour = getComputedStyle(token()).color;
  await emulateMedia([{ name: "prefers-color-scheme", value: "light" }]);
  await expect
    .poll(() => getComputedStyle(document.documentElement).backgroundColor)
    .toBe("rgb(246, 246, 243)");
  expect(getComputedStyle(document.documentElement).color).toBe(
    "rgb(29, 29, 27)",
  );
  await expect
    .element(intentPage)
    .toHaveAttribute("data-selected-story", doneIdentity);
  await expect.element(current).toHaveAttribute("aria-pressed", "true");
  await expect.element(source).toBeVisible();
  expect(getComputedStyle(token()).color).not.toBe(darkColour);

  await emulateMedia([{ name: "prefers-color-scheme", value: "dark" }]);
  await darkSurface();
  await expect
    .element(intentPage)
    .toHaveAttribute("data-selected-story", doneIdentity);
  await expect.element(current).toHaveAttribute("aria-pressed", "true");
  await expect.element(source).toBeVisible();
  expect(getComputedStyle(token()).color).toBe(darkColour);
});
