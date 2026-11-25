import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { emulateMedia } from "../review/browser-session.ts";
import { scopeName, scopeToggle } from "./intent-browser-page.ts";
import { locationHeader } from "./intent-scope-tree-page.ts";
import { openStoryChanges } from "./intent-story-changes-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  showsSummaryPath,
  summaryRegion,
} from "./intent-summary-proof-page.ts";

const root = "e2e";
const ancestor = "e2e_test";
const nestedRoot = "e2e_test/features";
const packageFolder = "packaged";
const packageRoot = "e2e_test/packaged/features";

async function browseStoryWithEmptyIntentRoots() {
  const entries = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at(root)
        .labelled("Browser checks")
        .ofKind("typescript", ["**/*.spec.ts"])
        .selecting("e2e/a.spec.ts")
        .please(),
      makeMe.anIntentLocation
        .at(nestedRoot)
        .ofKind("gherkin")
        .selecting()
        .please(),
      {
        ...makeMe.anIntentLocation
          .at(packageRoot)
          .ofKind("unsupported")
          .selecting()
          .please(),
        problem: "unsupported-kind",
      },
    )
    .please();
  await openStoryChanges({
    locationAnswer: entries,
    review: () =>
      Promise.resolve(makeMe.aStoryReview.adding("src/app.ts").please()),
  });
  const story = intentStoryCompare();
  await story.browseFiles();
}

test("opening an Intent ancestor passes its cue to the next collapsed folder and leaves roots distinct", async () => {
  await browseStoryWithEmptyIntentRoots();
  const regular = "src";
  // Story expansion first exposes configured paths. Closing the intervening
  // folders lets us observe how their cues travel as the reader opens them.
  await scopeToggle(packageFolder).click();
  await scopeToggle(ancestor).click();
  const cueOf = (path: string) =>
    locationHeader(path).getAttribute("data-intent-folder-cue");
  expect(cueOf(ancestor)).toBe("ancestor");
  expect(cueOf(root)).toBe("root");
  const backgroundOf = (path: string) =>
    getComputedStyle(locationHeader(path)).backgroundColor;
  for (const appearance of ["light", "dark"]) {
    await emulateMedia([{ name: "prefers-color-scheme", value: appearance }]);
    await expect
      .poll(() => matchMedia(`(prefers-color-scheme: ${appearance})`).matches)
      .toBe(true);
    expect(backgroundOf(ancestor)).not.toBe(backgroundOf(regular));
    expect(backgroundOf(root)).not.toBe(backgroundOf(ancestor));
    expect(backgroundOf(root)).not.toBe(backgroundOf(regular));
  }
  const closedSurface = backgroundOf(root);
  await expect
    .poll(() => scopeName(root).query()?.textContent)
    .toBe("e2e 1 file");
  await expect.element(scopeName(root)).toHaveAccessibleDescription("1 file");
  await scopeToggle(root).click();
  await expect.poll(() => scopeName(root).query()?.textContent).toBe("e2e");
  expect(backgroundOf(root)).toBe(closedSurface);
  await scopeToggle(root).click();
  expect(backgroundOf(root)).toBe(closedSurface);

  await scopeToggle(ancestor).click();
  expect(cueOf(ancestor)).toBeNull();
  expect(cueOf(nestedRoot)).toBe("root");
  expect(cueOf(packageFolder)).toBe("ancestor");
  await scopeToggle(packageFolder).click();
  expect(cueOf(packageFolder)).toBeNull();
  expect(cueOf(packageRoot)).toBe("root");
});

test("a collapsed ancestor of empty Intent roots opens its own folder reading", async () => {
  await browseStoryWithEmptyIntentRoots();
  await scopeToggle(ancestor).click();
  await scopeName(ancestor).click();
  await expect
    .element(page.getByRole("heading", { name: ancestor, exact: true }))
    .toBeVisible();
  await expect
    .element(scopeToggle(ancestor))
    .toHaveAttribute("aria-expanded", "false");
});

test("a nested unsupported Intent root opens its empty Summary", async () => {
  await browseStoryWithEmptyIntentRoots();
  await scopeName(packageRoot).click();
  await showsSummaryPath(summaryRegion(), packageRoot);
  await expect
    .element(summaryRegion().getByText("0 files", { exact: true }))
    .toBeVisible();
});

test("a changes-only tree gives no cue to a collapsed ancestor of an unchanged root", async () => {
  const ancestor = "dashboard";
  const root = "dashboard/frontend-tests";
  const location = makeMe.anIntentLocation
    .at(root)
    .ofKind("typescript")
    .selecting(`${root}/app.spec.ts`)
    .please();
  await openStoryChanges({
    locationAnswer: makeMe.anIntentLocationsAnswer.locating(location).please(),
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview.modifying("dashboard/src/app.ts").please(),
      ),
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  await scopeToggle(ancestor).click();
  const cue = () =>
    locationHeader(ancestor).getAttribute("data-intent-folder-cue");
  expect(cue()).toBe("ancestor");

  await story.onlyChangedFiles.click();
  await expect.element(story.folder(root)).not.toBeInTheDocument();
  await scopeToggle(ancestor).click();
  await expect
    .element(scopeToggle(ancestor))
    .toHaveAttribute("aria-expanded", "false");
  expect(cue()).toBeNull();

  await story.onlyChangedFiles.click();
  await scopeToggle(ancestor).click();
  expect(cue()).toBe("ancestor");
});
