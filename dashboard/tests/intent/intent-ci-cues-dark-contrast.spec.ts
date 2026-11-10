// Mounted CI comparison cue variants under a dark system preference: count
// borders, duration tints, and row text stay distinguishable on composed
// backgrounds without expanding the integrated cue journey.

import { test, expect } from "../support/pageTest.ts";
import { renderComparison } from "../support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../support/comparisonScopeFacts.ts";
import { expectReadableContrast } from "../accessibleReading.ts";
import {
  expectDarkSurface,
  setColorScheme,
} from "../systemAppearanceReading.ts";
import {
  expectScopeRowCues,
  summaryEntryComparisonCues,
} from "../support/expectCiComparisonCues.ts";

test("composed CI cue variants stay readable on dark surfaces", async ({
  page,
  comparisonRenderer,
}) => {
  await setColorScheme(page, "dark");
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
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
