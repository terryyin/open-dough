// How journeys read Intent's CI evidence and comparison identity as short
// labels (../src/CiEvidenceLabels.tsx): a named strip of labels, each read
// from its own content, as a screen reader in browse mode reads it -- what
// its icon stands for and its short words, then its full words -- and never
// from an `aria-label`. The full words are also the label's hover.

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

// What a reader hears a label say before its full words: what its icon
// stands for, where its shown words leave that out, and those words.
const heard = (label: Locator) => label.locator(".intent-evidence-label-heard");

// The words a label shows beside its icon.
export const labelWords = (label: Locator) =>
  label.locator(".intent-evidence-label-words");

const exactly = (words: string) =>
  new RegExp(`^${words.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);

// The one label within REGION heard as NAME, such as "Revision abc1234".
export function evidenceLabel(region: Locator, name: string): Locator {
  return region.getByRole("listitem").filter({
    has: region
      .page()
      .locator(".intent-evidence-label-heard", { hasText: exactly(name) }),
  });
}

// LABEL says FULL in full: heard after its words, and on hover.
export async function expectInFull(label: Locator, full: string | RegExp) {
  await expect(label.locator(".intent-evidence-label-full")).toHaveText(full);
  await expect(label.locator(".intent-evidence-label-content")).toHaveAttribute(
    "title",
    full,
  );
}

// The label heard as NAME within REGION says FULL in full.
export async function expectLabelInFull(
  region: Locator,
  name: string,
  full: string | RegExp,
) {
  await expectInFull(evidenceLabel(region, name), full);
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

// The strip begins with labels heard as NAMES, in order, whatever follows
// them; each is heard from its content, with no `aria-label` over it.
export async function expectLeadingEvidenceLabels(
  strip: Locator,
  names: readonly string[],
) {
  const labels = strip.getByRole("listitem");
  for (const [at, name] of names.entries()) {
    await expect(heard(labels.nth(at))).toHaveText(name);
    await expect(labels.nth(at)).not.toHaveAttribute("aria-label");
  }
}

// The strip holds exactly labels heard as NAMES, in order.
export async function expectEvidenceLabels(
  strip: Locator,
  names: readonly string[],
) {
  await expect(strip.getByRole("listitem")).toHaveCount(names.length);
  await expectLeadingEvidenceLabels(strip, names);
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
// story: a short label whose full words are the homepage's statement.
export async function expectObservedNotAttributed(region: Locator) {
  await expectLabelInFull(region, observedLabel, observedNotAttributedInFull);
}

// REGION shows no comparison framing.
export async function expectNoComparisonFraming(region: Locator) {
  await expect(evidenceLabel(region, observedLabel)).toHaveCount(0);
}
