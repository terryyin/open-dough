// Mounted CI comparison cue variants under a dark system preference: count
// borders, duration tints, and row text stay distinguishable on composed
// backgrounds without expanding the integrated cue journey.

import { createElement } from "react";
import { expect, onTestFinished, test } from "vitest";
import { cdp, page } from "vitest/browser";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ciTargetOf } from "../../src/intentCiTarget.ts";
import "../../src/intent-browser.css";
import "../../src/intent-perspective.css";
import { scopeEvidenceOf } from "../../src/IntentScopeEvidence.tsx";
import { IntentScopeProofView } from "../../src/IntentScopeProofView.tsx";
import {
  filesOfSelection,
  owningLocation,
} from "../../src/intentSelectionCoverage.ts";
import {
  intentStoryOverlay,
  overlayFilesByPath,
} from "../../src/intentStoryOverlay.ts";
import { IntentSummaryView } from "../../src/IntentSummaryView.tsx";
import { comparisonProofOf } from "../../src/storyCiComparisonEntries.ts";
import {
  composeBackgrounds,
  contrastRatio,
} from "../../test-support/composedColours.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

const summaryEntryComparisonCues = [
  { count: "more-light", duration: "slower-strong" },
  {
    count: "none",
    duration: "slower-light",
    countReason: "unchanged",
  },
  {
    count: "none",
    duration: "none",
    countReason: "added",
    durationReason: "added",
  },
  {
    count: "none",
    duration: "none",
    countReason: "removed",
    durationReason: "removed",
  },
  // Renamed from a shell check's test file into a Playwright test case.
  {
    count: "none",
    duration: "none",
    countReason: "units not comparable",
    durationReason: "units not comparable",
  },
  {
    count: "none",
    duration: "none",
    countReason: "unchanged",
    durationReason: "unchanged",
  },
] as const;

function cueAttrsOf(node: Element) {
  return {
    count: node.getAttribute("data-ci-count-cue"),
    duration: node.getAttribute("data-ci-duration-cue"),
    countReason: node.getAttribute("data-ci-count-cue-reason"),
    durationReason: node.getAttribute("data-ci-duration-cue-reason"),
  };
}

function tokenColour(token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}

function expectReadableContrast(element: Element, minimum = 4.5) {
  const color = getComputedStyle(element).color;
  const backgrounds: string[] = [];
  for (let at: Element | null = element; at !== null; at = at.parentElement) {
    backgrounds.push(getComputedStyle(at).backgroundColor);
  }
  const background = composeBackgrounds(backgrounds);
  expect(
    contrastRatio(color, background),
    `contrast of ${element.textContent}`,
  ).toBeGreaterThanOrEqual(minimum);
}

async function mountSummaryComparison(facts: ComparedStory) {
  const { scope, answer, proofs, source, work, identity } = facts;
  if (scope === undefined || proofs === undefined) {
    throw new Error("Expected Summary scope and published comparison proofs");
  }
  const target = ciTargetOf(source, work, identity);
  const evidence = scopeEvidenceOf({
    kind: "comparison",
    phase: answer.phase,
    source,
    story: target.kind === "gap" ? identity : (target.story ?? identity),
    identity,
    comparison: {
      shown: answer,
      failed: undefined,
      reading: false,
      checkedAgain: 0,
      checkAgain() {},
    },
    endpointProofs: {
      baseline: comparisonProofOf(answer.baseline, proofs[0], false),
      branch: comparisonProofOf(
        answer.provisional ?? answer.branch,
        proofs[1],
        false,
      ),
      landed: comparisonProofOf(answer.landed, proofs[2], false),
    },
  });
  const overlay = intentStoryOverlay(scope.locations, scope.changed);
  const treeFiles = overlayFilesByPath(scope.locations, overlay);
  const selection = scope.selection;
  const location = owningLocation(scope.locations, selection);
  if (location === undefined) {
    throw new Error(`Expected owning location for ${selection.path}`);
  }
  const inventory = filesOfSelection(treeFiles, selection);
  await mountComponent(
    createElement(
      "div",
      { className: "intent-perspective" },
      createElement(
        "div",
        { className: "intent-browser intent-files-hidden" },
        createElement(
          "div",
          { className: "intent-reading" },
          createElement(IntentSummaryView, {
            path: selection.path,
            files: inventory,
            location,
            children: createElement(IntentScopeProofView, {
              path: selection.path,
              inventory,
              revision: scope.revision,
              treeFiles,
              evidence,
              preference: { showPercent: false, onShowPercent() {} },
              sorting: { sort: undefined, onSort() {} },
              onOpen() {},
            }),
          }),
        ),
      ),
    ),
  );
}

test("composed CI cue variants stay readable on dark surfaces", async () => {
  const session = cdp() as {
    send(method: string, params?: Record<string, unknown>): Promise<unknown>;
  };
  onTestFinished(async () => {
    await session.send("Emulation.setEmulatedMedia", { features: [] });
  });
  await session.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "dark" }],
  });
  await expect
    .poll(() => matchMedia("(prefers-color-scheme: dark)").matches)
    .toBe(true);

  await mountSummaryComparison(makeMe.aComparedStory.inSummaryScope().please());

  const surface = tokenColour("--surface");
  const text = tokenColour("--text");
  expect(contrastRatio(text, surface)).toBeGreaterThanOrEqual(4.5);
  const rootStyle = getComputedStyle(document.documentElement);
  expect(rootStyle.backgroundColor).toBe(surface);
  expect(rootStyle.color).toBe(text);
  expect(surface).not.toBe("rgb(246, 246, 243)");

  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expect.element(summary).toBeVisible();

  const [ownExpected, ...rowsExpected] = summaryEntryComparisonCues;
  const ownFigures = summary.getByRole("group", {
    name: "CI proof of dashboard/tests",
    exact: true,
  });
  await expect.element(ownFigures).toBeVisible();
  expect(cueAttrsOf(ownFigures.element())).toMatchObject(ownExpected);

  const table = summary.getByRole("table", {
    name: "CI proof of the immediate folders and files of dashboard/tests",
    exact: true,
  });
  const rows = [...table.element().querySelectorAll("tbody tr")];
  expect(rows.map(cueAttrsOf)).toMatchObject([...rowsExpected]);

  const cued = summary.element().querySelector("[class*='intent-ci-cue-']");
  if (cued === null) throw new Error("Expected at least one CI cue element");
  await expect.element(page.elementLocator(cued)).toBeVisible();
  expectReadableContrast(cued);
  expectReadableContrast(ownFigures.element());
});
