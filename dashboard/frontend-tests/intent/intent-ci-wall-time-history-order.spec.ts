// Project Intent's CI time without runner waits history in CI status
// (../../src/IntentCiHistory.tsx) keeps the order the history answer gives
// its landings while build dates run the other way: the measured span uses
// the actual earliest and latest build dates, each row keeps its own date,
// and no stroke joins the two builds across the gap between them. The
// Backend's accepted landing order, independent of receipt and build dates,
// is ../../../Distribution/tests/support/landed-ci-history-reading-order.test.mjs.

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

test("accepted landing order keeps a middle gap while reversed build dates retain their labels and true measured date span", async ({
  page,
}) => {
  const a = "a1".repeat(20);
  const b = "b2".repeat(20);
  const c = "c3".repeat(20);
  const aStart = "2026-11-09T10:00:00Z";
  const cStart = "2026-11-05T10:00:00Z";
  const gapAt = "2026-11-30T10:00:00Z";
  await serveFrontendCiHistory(
    page,
    makeMe.aCiHistoryAnswer
      .measuredBuild({
        revision: a,
        runId: 211,
        startedAt: aStart,
        completedAt: "2026-11-09T10:06:05Z",
        receivedAt: "2026-11-03T10:00:00Z",
      })
      .unmeasuredLanding({ revision: b, receivedAt: gapAt, reason: "no-build" })
      .measuredBuild({
        revision: c,
        runId: 213,
        startedAt: cStart,
        completedAt: "2026-11-05T10:03:00Z",
        receivedAt: "2026-11-01T10:00:00Z",
      })
      .please(),
  );
  const shown = historyOf(await openFrontendCiStatus(page));

  // The evidence and latest measurement follow the answer's order. The
  // measured span independently uses the actual minimum and maximum dates.
  const heading = buildHistoryReading(shown).heading;
  await expect(heading).toHaveText(
    `CI time without runner waits history 2 measured builds · ${dayWords(cStart)}–${dayWords(aStart)}`,
  );
  await expect(heading.locator("time").nth(0)).toHaveAttribute(
    "datetime",
    cStart,
  );
  await expect(heading.locator("time").nth(1)).toHaveAttribute(
    "datetime",
    aStart,
  );
  await expect(buildHistoryReading(shown).latest).toHaveText("3 min");
  await showBuildHistoryEvidence(shown);
  const rows = buildHistoryReading(shown).samples;
  await expect(rows).toHaveText([
    `${dayWords(aStart)} · 6 min 5 s · exact revision ${shortSha(a)} · Run 211 · attempt 1`,
    `${dayWords(gapAt)} · No build · landed revision ${shortSha(b)}`,
    `${dayWords(cStart)} · 3 min · exact revision ${shortSha(c)} · Run 213 · attempt 1`,
  ]);
  await expect(rows.nth(0).locator("time")).toHaveAttribute("datetime", aStart);
  await expect(rows.nth(1).locator("time")).toHaveAttribute("datetime", gapAt);
  await expect(rows.nth(2).locator("time")).toHaveAttribute("datetime", cStart);
  await expect(buildHistoryReading(shown).points).toHaveCount(2);
  const chart = await chartOf(shown);
  const [earlier, later] = chart.points;
  expect(earlier).toBeDefined();
  expect(later).toBeDefined();
  if (earlier === undefined || later === undefined)
    throw new Error("The chart must retain both measurements.");
  expect(earlier.x).toBeGreaterThan(later.x);
  // One-point SVG moves may remain, but no stroke joins the two builds
  // across B, regardless of where their actual dates place them on the axis.
  expect(chart.strokes.filter((points) => points > 1)).toEqual([]);
});
