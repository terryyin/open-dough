// Project Intent's CI wall time history in CI status
// (../../src/IntentCiHistory.tsx) once the history holds more builds than
// it shows: of 35 collected measured builds it shows the newest 20 in trunk
// order, with the gaps among and after them, each with its own reason, and
// none from before, under a heading that says "20 measured builds" with their
// date span and with no window to choose; its line rises where CI got slower,
// falls where it got faster and wavers where it varied, breaking at each gap
// (SEED-285#see-landed-ci-wall-time-history example 8). A history whose
// landings are all gaps says none is measured yet and draws no chart. The
// history is the one this machine's dashboards keep, as collection leaves
// it; collection itself is in
// ../../backend-tests/intent/landed-ci-history-collection.spec.ts and the
// store's bound in ../../backend-tests/intent/landed-ci-history-window.spec.ts.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { expect, test } from "../dashboardTest.ts";
import {
  chartOf,
  dayWords,
  historyOf,
  openProjectCiStatus,
} from "../intentCiHistoryPage.ts";
import {
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "../intentCiStatusPage.ts";
import { openDough } from "../intentCodeBrowseFixtures.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import type { Page } from "@playwright/test";

const dayMs = 24 * 60 * 60_000;
// The first landing's build started at noon on Oct 1, one each day after.
const firstStart = Date.parse("2026-10-01T12:00:00Z");
const at = (ms: number) => new Date(ms).toISOString();

// Wall time in seconds of each day's build: the 15 oldest at 8 min 20 s;
// then, newest 20, rising, falling, then varying.
const wallSeconds = [
  ...Array<number>(15).fill(500),
  ...[300, 320, 340, 360, 380, 400, 420, 440],
  ...[430, 410, 390, 370, 350, 330],
  ...[400, 310, 450, 320, 420, 300],
];
const wallWords = (seconds: number) =>
  `${String(Math.floor(seconds / 60))} min${seconds % 60 === 0 ? "" : ` ${String(seconds % 60)} s`}`;

const revisionOf = (day: number) =>
  (day + 1).toString(16).padStart(2, "0").repeat(20);
const receiptOf = (n: number) =>
  `cccccccc-0000-4000-8000-${String(n).padStart(12, "0")}`;

// Trunk's judged CI, published, and Project Intent's CI status opened on it.
async function openCiStatus(page: Page) {
  publishProject(page, openDough).serveCi(
    trunkCi(openDough.revision, () => [
      {
        headSha: judged,
        conclusion: "success",
        url: runUrl,
        id: 41,
        startedAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:03:00Z",
      },
    ]),
  );
  return historyOf(await openProjectCiStatus(page));
}

test("of 35 measured builds, CI status shows the newest 20 in trunk order with the gaps among and after them, under 20 measured builds and their dates, as a line that rises, falls and varies", async ({
  page,
  dashboard,
}) => {
  let history = makeMe.aLandedCiHistory;
  for (const [day, seconds] of wallSeconds.entries()) {
    const start = firstStart + day * dayMs;
    history = history.measuredLanding({
      receipt: receiptOf(day),
      revision: revisionOf(day),
      receivedAt: at(start),
      runId: 100 + day,
      startedAt: at(start),
      completedAt: at(start + seconds * 1000),
    });
  }
  // A landing CI never built among the oldest; among the newest 20, another,
  // one whose stand-in build's CI proof expired, a failed build, one whose
  // stand-in build's CI proof could not be read, and a cancelled landing;
  // one still pending after them.
  const quarter = dayMs / 4;
  const olderAt = firstStart + 5 * dayMs + quarter;
  const noBuildAt = firstStart + 20 * dayMs + quarter;
  const expiredAt = firstStart + 22 * dayMs + quarter;
  const failedAt = firstStart + 25 * dayMs + quarter;
  const unreadableAt = firstStart + 28 * dayMs + quarter;
  const cancelledAt = firstStart + 30 * dayMs + quarter;
  const pendingAt = firstStart + 34 * dayMs + quarter;
  history = history
    .unmeasuredLanding({
      receipt: receiptOf(90),
      revision: "e0".repeat(20),
      receivedAt: at(olderAt),
      reason: "no-build",
    })
    .unmeasuredLanding({
      receipt: receiptOf(94),
      revision: "e4".repeat(20),
      receivedAt: at(noBuildAt),
      reason: "no-build",
    })
    .unmeasuredLanding({
      receipt: receiptOf(95),
      revision: "e5".repeat(20),
      receivedAt: at(expiredAt),
      reason: "expired",
    })
    .unmeasuredLanding({
      receipt: receiptOf(96),
      revision: "e6".repeat(20),
      receivedAt: at(unreadableAt),
      reason: "unreadable",
    })
    .failedLanding({
      receipt: receiptOf(91),
      revision: "e1".repeat(20),
      receivedAt: at(failedAt),
      runId: 291,
      startedAt: at(failedAt),
      completedAt: at(failedAt + 120_000),
    })
    .unmeasuredLanding({
      receipt: receiptOf(92),
      revision: "e2".repeat(20),
      receivedAt: at(cancelledAt),
      reason: "cancelled",
    })
    .pendingLanding({
      receipt: receiptOf(93),
      revision: "e3".repeat(20),
      receivedAt: at(pendingAt),
      waitsFor: "build",
    });
  keepLandedCiHistory(dashboard.home, history.please());
  const shown = await openCiStatus(page);

  const newest = [...wallSeconds.keys()].slice(15);
  const lastStart = firstStart + 34 * dayMs;
  await expect(shown.getByRole("heading")).toHaveText(
    `CI wall time history 20 measured builds · ${dayWords(firstStart + 15 * dayMs)}–${dayWords(lastStart)}`,
  );
  await expect(shown.getByRole("definition")).toHaveText("5 min");
  // The window is the newest 20; there is no other to choose.
  for (const choice of [
    "combobox",
    "radio",
    "slider",
    "spinbutton",
    "textbox",
  ] as const)
    await expect(shown.getByRole(choice)).toHaveCount(0);

  await shown.locator("summary").click();
  const point = (day: number) =>
    `${dayWords(firstStart + day * dayMs)} · ${wallWords(wallSeconds[day] ?? 0)} · exact revision ${shortSha(revisionOf(day))} · Run ${String(100 + day)} · attempt 1`;
  await expect(
    shown
      .getByRole("list", { name: "Builds and evidence" })
      .getByRole("listitem"),
  ).toHaveText([
    ...newest.filter((day) => day <= 20).map(point),
    `${dayWords(noBuildAt)} · No build · landed revision ${shortSha("e4".repeat(20))}`,
    ...newest.filter((day) => day > 20 && day <= 22).map(point),
    `${dayWords(expiredAt)} · CI proof expired · landed revision ${shortSha("e5".repeat(20))}`,
    ...newest.filter((day) => day > 22 && day <= 25).map(point),
    `${dayWords(failedAt)} · Failed · exact revision ${shortSha("e1".repeat(20))} · Run 291 · attempt 1`,
    ...newest.filter((day) => day > 25 && day <= 28).map(point),
    `${dayWords(unreadableAt)} · CI proof unreadable · landed revision ${shortSha("e6".repeat(20))}`,
    ...newest.filter((day) => day > 28 && day <= 30).map(point),
    `${dayWords(cancelledAt)} · Cancelled · landed revision ${shortSha("e2".repeat(20))}`,
    ...newest.filter((day) => day > 30).map(point),
    `${dayWords(pendingAt)} · Pending · CI queued or running · landed revision ${shortSha("e3".repeat(20))}`,
  ]);

  // Each build's point stands right of the one before it, higher where it
  // took longer and lower where it took less; each gap breaks the line.
  const chart = await chartOf(shown);
  expect(chart.points).toHaveLength(20);
  for (const [index, drawn] of chart.points.entries()) {
    const before = chart.points[index - 1];
    if (before === undefined) continue;
    const day = newest[index] ?? 0;
    const longer = (wallSeconds[day] ?? 0) - (wallSeconds[day - 1] ?? 0);
    expect(
      drawn.x,
      `day ${String(day)} is right of the day before`,
    ).toBeGreaterThan(before.x);
    expect(Math.sign(before.y - drawn.y), `day ${String(day)}`).toBe(
      Math.sign(longer),
    );
  }
  expect(chart.strokes).toEqual([6, 2, 3, 3, 2, 4]);
});

test("a history whose recorded landings are all gaps says none is measured yet, draws no chart, and lists each gap with its reason", async ({
  page,
  dashboard,
}) => {
  const noBuildAt = firstStart;
  const pendingAt = firstStart + dayMs;
  keepLandedCiHistory(
    dashboard.home,
    makeMe.aLandedCiHistory
      .unmeasuredLanding({
        receipt: receiptOf(0),
        revision: "e0".repeat(20),
        receivedAt: at(noBuildAt),
        reason: "no-build",
      })
      .pendingLanding({
        receipt: receiptOf(1),
        revision: "e1".repeat(20),
        receivedAt: at(pendingAt),
        waitsFor: "run",
      })
      .please(),
  );
  const shown = await openCiStatus(page);

  await expect(shown.getByRole("heading")).toHaveText("CI wall time history");
  await expect(shown).toContainText(
    "No dashboard-recorded landings have been measured yet.",
  );
  await expect(shown.getByRole("img")).toHaveCount(0);
  await shown.locator("summary").click();
  await expect(
    shown
      .getByRole("list", { name: "Builds and evidence" })
      .getByRole("listitem"),
  ).toHaveText([
    `${dayWords(noBuildAt)} · No build · landed revision ${shortSha("e0".repeat(20))}`,
    `${dayWords(pendingAt)} · Pending · no CI run yet · landed revision ${shortSha("e1".repeat(20))}`,
  ]);
});
