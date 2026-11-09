// Project Intent's CI wall time history journeys
// (./intent/intent-ci-wall-time-history*.spec.ts): Open Dough's trunk
// published from its real bare origin (./support/startOrigin.ts) with the CI
// runs, and their CI proof, a journey serves, Project Intent's CI status with
// nothing selected, the history region in it (../src/IntentCiHistory.tsx),
// Builds and evidence reached by keyboard, the day a date falls on as the
// history says it, and its chart's drawn points and line.

import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { chooseCiStatus } from "./intentCiStatusPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import type { CiRunAnswer } from "./support/baseCiActions.ts";
import { trunkActions, type TrunkProofs } from "./support/landedCiTrunk.ts";
import { originMain } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import type { Locator, Page } from "@playwright/test";

// The CI wall time history in a CI status panel.
export const historyOf = (panel: Locator) =>
  panel.getByRole("region", { name: "CI wall time history", exact: true });

// Open Dough's trunk as published, its main followed as it moves, with
// `runs` as the selected workflow's push runs and their CI proof as `proofs`
// keeps it whenever they are asked for.
export async function publishTrunk(
  page: Page,
  origin: StartOrigin,
  runs: () => readonly CiRunAnswer[],
  proofs: () => TrunkProofs = () => ({}),
) {
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: await originMain(origin),
    repository: "terryyin/open-dough",
    follows: true,
  });
  committed.serveActions((argv, head) =>
    trunkActions(runs(), proofs())(argv, head),
  );
}

// Project Intent's CI status, with nothing selected.
export async function openProjectCiStatus(page: Page) {
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  return chooseCiStatus(intent);
}

// The day `at` falls on, on the reader's clock, as the history says a build's
// or a landing's date: "Nov 5".
export const dayWords = (at: string | number) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(at),
  );

// Builds and evidence in `panel`, reached by keyboard just before Check again
// once the trunk's reading is done, and opened: its list.
export async function evidenceByKeyboard(page: Page, panel: Locator) {
  const history = historyOf(panel);
  const checkAgain = panel.getByRole("button", {
    name: "Check again",
    exact: true,
  });
  await expect(checkAgain).toBeEnabled();
  await checkAgain.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(history.locator("summary")).toBeFocused();
  await page.keyboard.press("Enter");
  return history.getByRole("list", { name: "Builds and evidence" });
}

// Project Intent's CI status opened on a phone: its history, and Builds and
// evidence reached by keyboard (`evidenceByKeyboard`).
export async function evidenceOnPhone(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  const panel = await openProjectCiStatus(page);
  const builds = await evidenceByKeyboard(page, panel);
  return { history: historyOf(panel), builds };
}

// The chart's drawn points, in drawing order, each at its place, and the
// line through them as its strokes, each a run of points no gap breaks.
export async function chartOf(history: Locator) {
  const chart = history.getByRole("img", {
    name: "CI wall time by build date",
  });
  const points = await chart.locator("circle").evaluateAll((circles) =>
    circles.map((circle) => ({
      x: Number(circle.getAttribute("cx")),
      y: Number(circle.getAttribute("cy")),
    })),
  );
  // How many points each stroke of the line joins.
  const strokes = await chart.locator("path").evaluateAll((paths) =>
    paths.flatMap((line) =>
      (line.getAttribute("d") ?? "")
        .split("M")
        .filter((stroke) => stroke.trim() !== "")
        .map((stroke) => stroke.split("L").length),
    ),
  );
  return { points, strokes };
}
