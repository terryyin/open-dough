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
  const expected = full instanceof RegExp ? expect.stringMatching(full) : full;
  await expect
    .poll(() =>
      label.evaluate(
        (element, normalize) => {
          const text = (value: string) =>
            normalize
              ? value
                  .replace(/[\u200b\u00ad]/g, "")
                  .trim()
                  .replace(/\s+/g, " ")
              : value;
          return {
            full: Array.from(
              element.querySelectorAll(".intent-evidence-label-full"),
              (node) => text(node.textContent),
            ),
            titles: Array.from(
              element.querySelectorAll(".intent-evidence-label-content"),
              (node) => node.getAttribute("title"),
            ),
          };
        },
        typeof full === "string",
      ),
    )
    .toEqual({ full: [expected], titles: [expected] });
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

async function expectLabelNames(
  strip: Locator,
  names: readonly string[],
  exact: boolean,
) {
  const labels = strip.getByRole("listitem");
  if (names.length > 0) await labels.first().waitFor({ state: "attached" });
  await expect
    .poll(() =>
      labels.evaluateAll(
        (items, { count, exact }) => ({
          count: exact ? items.length : null,
          labels: items.slice(0, count).map((item) => ({
            heard: Array.from(
              item.querySelectorAll(".intent-evidence-label-heard"),
              (node) =>
                node.textContent
                  .replace(/[\u200b\u00ad]/g, "")
                  .trim()
                  .replace(/\s+/g, " "),
            ),
            ariaLabel: item.getAttribute("aria-label"),
          })),
        }),
        { count: names.length, exact },
      ),
    )
    .toEqual({
      count: exact ? names.length : null,
      labels: names.map((name) => ({ heard: [name], ariaLabel: null })),
    });
}

// The strip begins with labels heard as NAMES, in order, whatever follows
// them; each is heard from its content, with no `aria-label` over it.
export async function expectLeadingEvidenceLabels(
  strip: Locator,
  names: readonly string[],
) {
  await expectLabelNames(strip, names, false);
}

// The strip holds exactly labels heard as NAMES, in order.
export async function expectEvidenceLabels(
  strip: Locator,
  names: readonly string[],
) {
  await expectLabelNames(strip, names, true);
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

// REGION uses the shared comparison's observed-build framing paragraph.
export async function expectObservedNotAttributed(region: Locator) {
  await expect(region.locator(".intent-ci-comparison-framing")).toHaveText(
    observedNotAttributedInFull,
  );
}

// REGION shows no comparison framing.
export async function expectNoComparisonFraming(region: Locator) {
  await expect(
    region.locator(
      ".intent-ci-comparison-frame, .intent-ci-comparison-framing",
    ),
  ).toHaveCount(0);
  await expect(evidenceLabel(region, observedLabel)).toHaveCount(0);
}
