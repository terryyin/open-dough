// CI comparison cue variants of a Done story's Summary on the production page
// (./intent-ci-page-mount.ts) under a dark system preference: count borders,
// duration tints, and row text stay distinguishable on the page's composed
// backgrounds without expanding the integrated cue journey.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  composeBackgrounds,
  contrastRatio,
} from "../../test-support/composedColours.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";
import { emulateMedia } from "../review/browser-session.ts";

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

// The Done story's Summary of its scope location on the production page,
// opened from its entry in the story's CI comparison, its comparison answered
// by the case's typed CI reads and its published completion modifying,
// adding, deleting and renaming the scope's specs.
async function openSummaryComparison() {
  const completion = makeMe.aStoryReview
    .published(doneCompletion)
    .modifying("dashboard/tests/folder/a.spec.ts")
    .adding("dashboard/tests/added.spec.ts")
    .deleting("dashboard/tests/gone.spec.ts")
    .renaming("tests/old.sh", "dashboard/tests/renamed.spec.ts")
    .please();
  await openDoneStoryComparison({
    review: () => Promise.resolve(completion),
  });
  await userEvent.click(
    page.getByRole("button", { name: "dashboard/tests", exact: true }),
  );
}

test("composed CI cue variants stay readable on dark surfaces", async () => {
  await emulateMedia([{ name: "prefers-color-scheme", value: "dark" }]);
  await expect
    .poll(() => matchMedia("(prefers-color-scheme: dark)").matches)
    .toBe(true);

  await openSummaryComparison();

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
