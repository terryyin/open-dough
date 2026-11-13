// Project Intent's CI wall time history journeys
// (./intent/intent-ci-wall-time-history*.spec.ts): Open Dough's trunk
// published from its real bare origin (./support/startOrigin.ts) with the CI
// runs, and their CI proof, a journey serves, or its published project with
// a judged trunk beside a history the journey keeps; Project Intent's CI
// status with nothing selected, the history region in it
// (../src/IntentCiHistory.tsx), Builds and evidence reached by keyboard and
// its links in turn, the day a date falls on as the history says it, and its
// chart's drawn points and line.

import { makeMe } from "../../tests/support/makeMe.mjs";
import { historyChart } from "./ciHistoryChartPage.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import {
  chooseCiStatus,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "./intentCiStatusPage.ts";
import { openDough } from "./intentCodeBrowseFixtures.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import type { CiRunAnswer } from "./support/baseCiActions.ts";
import {
  answeredRun,
  trunkActions,
  type TrunkProofs,
} from "./support/landedCiTrunk.ts";
import { originMain } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import type { Locator, Page } from "@playwright/test";

// The CI wall time history in a CI status panel.
export const historyOf = (panel: Locator) =>
  panel.getByRole("region", { name: "CI wall time history", exact: true });

export const buildEvidenceRows = (builds: Locator) =>
  builds.getByRole("listitem");

// The history's chart of CI wall time by build date (./ciHistoryChartPage.ts).
export const wallTimeChart = (history: Locator) =>
  historyChart(history, "CI wall time by build date");

// The displayed build history, without choosing its dates, values or evidence.
export function buildHistoryReading(history: Locator) {
  const chart = wallTimeChart(history);
  const reference = history.locator(".intent-ci-history-reference");
  const evidence = history.getByRole("list", { name: "Builds and evidence" });
  return {
    heading: history.getByRole("heading"),
    latest: history.getByRole("definition"),
    latestLabel: history.getByRole("term"),
    chart: chart.drawing,
    charts: history.getByRole("img"),
    points: chart.measured,
    disclosure: history.locator("summary"),
    evidence,
    samples: buildEvidenceRows(evidence),
    reference,
    referenceLine: reference.locator("line"),
    referenceTitle: reference.locator("title"),
  };
}

// Reveal the retained samples by pointer; keyboard journeys keep their input explicit.
export async function showBuildHistoryEvidence(history: Locator) {
  const reading = buildHistoryReading(history);
  await reading.disclosure.click();
  return reading.evidence;
}

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
export async function openProjectCiStatus(page: Page, address = "/") {
  await openUntilRead(page, address);
  return chooseProjectCiStatus(page);
}

// Show Project Intent's CI status on the page already opened and read.
export async function chooseProjectCiStatus(page: Page) {
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  return chooseCiStatus(intent);
}

// Open Dough's published project with its trunk's CI judged, and Project
// Intent's CI status opened on it beside the history the journey keeps: its
// panel.
export async function openJudgedCiStatus(page: Page) {
  publishProject(page, openDough).serveCi(
    trunkCi(openDough.revision, () => [
      makeMe.aCiRun
        .with({
          headSha: judged,
          conclusion: "success",
          url: runUrl,
          id: 41,
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:03:00Z",
        })
        .please(),
    ]),
  );
  return openProjectCiStatus(page);
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
  await expect(buildHistoryReading(history).disclosure).toBeFocused();
  await page.keyboard.press("Enter");
  return buildHistoryReading(history).evidence;
}

// Project Intent's CI status opened on a phone: its history, and Builds and
// evidence reached by keyboard (`evidenceByKeyboard`).
export async function evidenceOnPhone(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  const panel = await openProjectCiStatus(page);
  const builds = await evidenceByKeyboard(page, panel);
  return { history: historyOf(panel), builds };
}

// Each link of Builds and evidence (`builds`) in turn by keyboard, from just
// before the first: its name, and where it leads.
export async function expectLinksByKeyboard(
  page: Page,
  builds: Locator,
  links: readonly { readonly name: string; readonly href: string }[],
) {
  for (const { name, href } of links) {
    await page.keyboard.press("Tab");
    const link = builds.locator("a:focus");
    await expect(link).toHaveAccessibleName(name);
    await expect(link).toHaveAttribute("href", href);
  }
}

// Run `id`'s first attempt as Builds and evidence links it (`answeredRun`).
export const runLink = (id: number) => ({
  name: `Run ${String(id)} · attempt 1`,
  href: answeredRun(id).runUrl,
});

// The chart's drawn points, in drawing order, each at its place, and the
// line through them as its strokes, each a run of points no gap breaks.
export async function chartOf(history: Locator) {
  const chart = wallTimeChart(history);
  const points = await chart.measured.evaluateAll((circles) =>
    circles.map((circle) => ({
      x: Number(circle.getAttribute("cx")),
      y: Number(circle.getAttribute("cy")),
    })),
  );
  // How many points each stroke of the line joins.
  const strokes = await chart.line.evaluateAll((paths) =>
    paths.flatMap((line) =>
      (line.getAttribute("d") ?? "")
        .split("M")
        .filter((stroke) => stroke.trim() !== "")
        .map((stroke) => stroke.split("L").length),
    ),
  );
  return { points, strokes };
}
