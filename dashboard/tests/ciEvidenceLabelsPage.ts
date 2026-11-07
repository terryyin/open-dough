// How journeys read Intent's CI evidence and comparison identity as short
// labels (../src/CiEvidenceLabels.tsx): a named strip of labels, each read by
// its accessible name (what its icon stands for and its short words) and its
// full words as its description.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { observedNotAttributedInFull } from "../src/storyCiComparisonWording.ts";

// The strip named NAME: "CI evidence" for an attempt's evidence, or
// "CI timing comparison of <story>" for a story comparison.
export function evidenceLabels(region: Locator, name = "CI evidence"): Locator {
  return region.getByRole("list", { name, exact: true });
}

// The comparison identity strip of STORY's CI timing comparison.
export function comparisonLabels(region: Locator, story: string): Locator {
  return evidenceLabels(region, `CI timing comparison of ${story}`);
}

// The one label named NAME within REGION.
export function evidenceLabel(region: Locator, name: string): Locator {
  return region.getByRole("listitem", { name, exact: true });
}

// The label named NAME within REGION says FULL as its description.
export async function expectLabelInFull(
  region: Locator,
  name: string,
  full: string | RegExp,
) {
  await expect(evidenceLabel(region, name)).toHaveAccessibleDescription(full);
}

// The attempt label ATTEMPT within REGION links to URL.
export async function expectAttemptLinked(
  region: Locator,
  attempt: string,
  url: string,
) {
  await expect(region.getByRole("link", { name: attempt })).toHaveAttribute(
    "href",
    url,
  );
}

// The strip holds exactly NAMES, in order, each read by its accessible name.
export async function expectEvidenceLabels(
  strip: Locator,
  names: readonly string[],
) {
  const labels = strip.getByRole("listitem");
  await expect(labels).toHaveCount(names.length);
  for (const [at, name] of names.entries())
    await expect(labels.nth(at)).toHaveAccessibleName(name);
}

// The strip begins with NAMES, in order, whatever follows them.
export async function expectLeadingEvidenceLabels(
  strip: Locator,
  names: readonly string[],
) {
  const labels = strip.getByRole("listitem");
  for (const [at, name] of names.entries())
    await expect(labels.nth(at)).toHaveAccessibleName(name);
}

// REGION's evidence first names ATTEMPT ("Run 41 · attempt 2" or an
// adapter's "Attempt 9f1c") and then the revision REVISION.
export const expectAttemptAt = (
  region: Locator,
  attempt: string,
  revision: string,
) =>
  expectLeadingEvidenceLabels(evidenceLabels(region), [
    attempt,
    `Revision ${revision}`,
  ]);

// Any story comparison's identity strip within REGION.
export function anyComparisonLabels(region: Locator): Locator {
  return region.getByRole("list", { name: /^CI timing comparison of / });
}

const observedLabel = "Observed, not attributed";

// REGION frames its comparison as observed builds, not attributed to the
// story: a short label whose description is the homepage's statement.
export async function expectObservedNotAttributed(region: Locator) {
  await expectLabelInFull(region, observedLabel, observedNotAttributedInFull);
}

// REGION shows no comparison framing.
export async function expectNoComparisonFraming(region: Locator) {
  await expect(evidenceLabel(region, observedLabel)).toHaveCount(0);
}
