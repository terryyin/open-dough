// Project Intent's CI time without runner waits history in CI status
// (../../src/IntentCiHistory.tsx) once the history answer holds the window
// the Backend keeps: its newest 20 measured builds in trunk order with the
// gaps among and after them, each with its own reason, under a heading that
// says "20 measured builds" with their date span and with no window to
// choose; its line rises where CI got slower, falls where it got faster and
// wavers where it varied, breaking at each gap
// (SEED-285#see-landed-ci-wall-time-history example 8). Which 20 builds and
// gaps the Backend keeps from a fuller stored history is
// ../../backend-tests/intent/landed-ci-history-read-window.spec.ts; the
// store's bound under collection is
// ../../backend-tests/intent/landed-ci-history-window.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import {
  buildHistoryReading,
  chartOf,
  dayWords,
  historyOf,
  showBuildHistoryEvidence,
} from "../../tests/intentCiHistoryPage.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { serveFrontendCiHistory } from "../../tests/support/frontendCiHistoryAnswers.ts";
import { openFrontendCiStatus } from "../../tests/support/frontendCiStatusAnswers.ts";

const dayMs = 24 * 60 * 60_000;
// Day 0's build started at noon on Oct 1, one each day after; the window
// holds days 15 to 34.
const firstStart = Date.parse("2026-10-01T12:00:00Z");
const startOf = (day: number) => firstStart + day * dayMs;
const at = (ms: number) => new Date(ms).toISOString();
// A gap's landing, recorded a quarter day after that day's build started.
const gapAt = (day: number) => at(startOf(day) + dayMs / 4);

// Wall time in seconds of each window day's build: rising, falling, then
// varying.
const wallSeconds = new Map(
  [
    ...[300, 320, 340, 360, 380, 400, 420, 440],
    ...[430, 410, 390, 370, 350, 330],
    ...[400, 310, 450, 320, 420, 300],
  ].map((seconds, index) => [15 + index, seconds]),
);
const days = [...wallSeconds.keys()];
const secondsOf = (day: number) => wallSeconds.get(day) ?? 0;
const wallWords = (seconds: number) =>
  `${String(Math.floor(seconds / 60))} min${seconds % 60 === 0 ? "" : ` ${String(seconds % 60)} s`}`;
const revisionOf = (day: number) =>
  (day + 1).toString(16).padStart(2, "0").repeat(20);

test("a window of the newest 20 measured builds shows them in trunk order with the gaps among and after them, under 20 measured builds and their dates, as a line that rises, falls and varies", async ({
  page,
}) => {
  const sha = (revision: string) => shortSha(revision.repeat(20));
  // After the named day's build: CI never built one landing, a skip whose
  // equivalent build's CI proof expired, a failed build, a cancelled landing
  // whose later trunk build's CI proof could not be read, a landing whose own
  // build was cancelled, and one still pending after them all.
  let answer = makeMe.aCiHistoryAnswer;
  for (const day of days) {
    answer = answer.measuredBuild({
      revision: revisionOf(day),
      runId: 100 + day,
      startedAt: at(startOf(day)),
      completedAt: at(startOf(day) + secondsOf(day) * 1000),
    });
    if (day === 20)
      answer = answer.unmeasuredLanding({
        revision: "e4".repeat(20),
        receivedAt: gapAt(20),
        reason: "no-build",
      });
    if (day === 22)
      answer = answer.unmeasuredLanding({
        revision: "e5".repeat(20),
        receivedAt: gapAt(22),
        reason: "expired",
        build: {
          revision: "b5".repeat(20),
          provenance: "equivalent",
          runId: 295,
        },
      });
    if (day === 25)
      answer = answer.unmeasuredLanding({
        revision: "e1".repeat(20),
        receivedAt: gapAt(25),
        reason: "failed",
        build: { revision: "e1".repeat(20), provenance: "exact", runId: 291 },
      });
    if (day === 28)
      answer = answer.unmeasuredLanding({
        revision: "e6".repeat(20),
        receivedAt: gapAt(28),
        reason: "unreadable",
        build: { revision: "b6".repeat(20), provenance: "later", runId: 296 },
      });
    if (day === 30)
      answer = answer.unmeasuredLanding({
        revision: "e2".repeat(20),
        receivedAt: gapAt(30),
        reason: "cancelled",
        build: { revision: "e2".repeat(20), provenance: "exact", runId: 292 },
      });
  }
  answer = answer.pendingLanding({
    revision: "e3".repeat(20),
    receivedAt: gapAt(34),
    waitsFor: "build",
  });
  await serveFrontendCiHistory(page, answer.please());
  const shown = historyOf(await openFrontendCiStatus(page));

  await expect(buildHistoryReading(shown).heading).toHaveText(
    `CI time without runner waits history 20 measured builds · ${dayWords(startOf(15))}–${dayWords(startOf(34))}`,
  );
  await expect(buildHistoryReading(shown).latest).toHaveText("5 min");
  // The window is the newest 20; there is no other to choose.
  for (const choice of [
    "combobox",
    "radio",
    "slider",
    "spinbutton",
    "textbox",
  ] as const)
    await expect(shown.getByRole(choice)).toHaveCount(0);

  await showBuildHistoryEvidence(shown);
  const point = (day: number) =>
    `${dayWords(startOf(day))} · ${wallWords(secondsOf(day))} · exact revision ${shortSha(revisionOf(day))} · Run ${String(100 + day)} · attempt 1`;
  const between = (after: number, through: number) =>
    days.filter((day) => day > after && day <= through).map(point);
  await expect(buildHistoryReading(shown).samples).toHaveText([
    ...between(14, 20),
    `${dayWords(gapAt(20))} · No build · landed revision ${sha("e4")}`,
    ...between(20, 22),
    `${dayWords(gapAt(22))} · CI proof expired · reused equivalent ${sha("b5")} for ${sha("e5")} · Run 295 · attempt 1`,
    ...between(22, 25),
    `${dayWords(gapAt(25))} · Failed · exact revision ${sha("e1")} · Run 291 · attempt 1`,
    ...between(25, 28),
    `${dayWords(gapAt(28))} · CI proof unreadable · later trunk build ${sha("b6")} for ${sha("e6")} · Run 296 · attempt 1`,
    ...between(28, 30),
    `${dayWords(gapAt(30))} · Cancelled · exact revision ${sha("e2")} · Run 292 · attempt 1`,
    ...between(30, 34),
    `${dayWords(gapAt(34))} · Pending · CI queued or running · landed revision ${sha("e3")}`,
  ]);

  // Each build's point stands right of the one before it, higher where it
  // took longer and lower where it took less; each gap breaks the line.
  const chart = await chartOf(shown);
  expect(chart.points).toHaveLength(20);
  for (const [index, drawn] of chart.points.entries()) {
    const before = chart.points[index - 1];
    if (before === undefined) continue;
    const day = days[index] ?? 0;
    expect(
      drawn.x,
      `day ${String(day)} is right of the day before`,
    ).toBeGreaterThan(before.x);
    expect(Math.sign(before.y - drawn.y), `day ${String(day)}`).toBe(
      Math.sign(secondsOf(day) - secondsOf(day - 1)),
    );
  }
  expect(chart.strokes).toEqual([6, 2, 3, 3, 2, 4]);
});
