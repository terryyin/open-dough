// How journeys read a CI timing comparison Build cell's compact source cue
// (../../src/IntentCiComparisonEndpoints.tsx): exact / ancestor icon with
// accessible words, or concise equivalent / later wording, without run or
// attempt IDs in the default cell.

import type { Locator } from "@playwright/test";
import { expect } from "../dashboardTest.ts";

export async function expectExactSourceCue(identity: Locator) {
  await expect(
    identity.locator('.intent-ci-comparison-source[data-selection="exact"]'),
  ).toBeVisible();
  await expect(identity).toContainText("exact revision");
}

export async function expectAncestorSourceCue(
  identity: Locator,
  detail?: string | RegExp,
) {
  await expect(
    identity.locator('.intent-ci-comparison-source[data-selection="ancestor"]'),
  ).toBeVisible();
  await expect(identity).toContainText(detail ?? "ancestor:");
}

// Any compact exact/ancestor icon cue (selection kind may be ancestor after a
// walk). Recovery journeys use this when presence, not kind, is the signal.
export async function expectSourceCue(identity: Locator) {
  await expect(identity.locator(".intent-ci-comparison-source")).toBeVisible();
}

export async function expectNoRunOrAttemptIds(identity: Locator) {
  await expect(identity).not.toContainText(/run \d+/);
  await expect(identity).not.toContainText(/attempt /i);
}

// Raw identity wording and source attributes; native visibility stays separate.
export async function sourceIdentityFacts(identities: Locator) {
  return identities.evaluateAll((nodes) =>
    nodes.map((identity) => {
      const rawText = identity.textContent;
      return {
        rawText,
        text: rawText
          .replace(/[\u200b\u00ad]/g, "")
          .trim()
          .replace(/\s+/g, " "),
        sources: [
          ...identity.querySelectorAll(".intent-ci-comparison-source"),
        ].map((source) => ({
          selection: source.getAttribute("data-selection"),
          title: source.getAttribute("title"),
        })),
      };
    }),
  );
}
