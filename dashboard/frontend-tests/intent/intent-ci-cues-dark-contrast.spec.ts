// Mounted CI comparison cue variants under a dark system preference: count
// borders, duration tints, and row text stay distinguishable on composed
// backgrounds without expanding the integrated cue journey.

import { test, expect } from "../../test-support/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expectReadableContrast } from "../../test-support/accessibleReading.ts";
import {
  expectDarkSurface,
  setColorScheme,
} from "../../test-support/systemAppearanceReading.ts";
import {
  expectScopeRowCues,
  summaryEntryComparisonCues,
} from "../../test-support/support/expectCiComparisonCues.ts";

test("composed CI cue variants stay readable on dark surfaces", async ({
  page,
  renderComparison,
}) => {
  await setColorScheme(page, "dark");
  await renderComparison(makeMe.aComparedStory.inSummaryScope().please());
  await expectDarkSurface(page);

  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expect(summary).toBeVisible();
  await expectScopeRowCues(
    summary,
    "dashboard/tests",
    summaryEntryComparisonCues,
  );
  const cued = summary.locator("[class*='intent-ci-cue-']").first();
  await expect(cued).toBeVisible();
  await expectReadableContrast(cued);
  const figures = summary
    .locator(".intent-scope-figures, [class*='intent-ci-cue-']")
    .first();
  await expectReadableContrast(figures);
});
