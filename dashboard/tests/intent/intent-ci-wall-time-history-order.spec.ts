// Accepted ancestry and actual build dates remain independent in history.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { expect, test } from "../dashboardTest.ts";
import { chartOf, dayWords } from "../intentCiHistoryPage.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import { openCiStatus } from "../support/ciHistoryWindowPage.ts";

const receiptOf = (n: number) =>
  `cccccccc-0000-4000-8000-${String(n).padStart(12, "0")}`;

test("accepted landing order keeps a middle gap while reversed build dates retain their labels and true measured date span", async ({
  page,
  dashboard,
}) => {
  const a = "a1".repeat(20);
  const b = "b2".repeat(20);
  const c = "c3".repeat(20);
  const aStart = "2026-11-09T10:00:00Z";
  const cStart = "2026-11-05T10:00:00Z";
  const gapAt = "2026-11-30T10:00:00Z";
  keepLandedCiHistory(
    dashboard.home,
    makeMe.aLandedCiHistory
      .inTrunkOrder([a, b, c])
      .measuredLanding({
        receipt: receiptOf(201),
        revision: a,
        receivedAt: "2026-11-03T10:00:00Z",
        runId: 211,
        startedAt: aStart,
        completedAt: "2026-11-09T10:06:05Z",
      })
      .unmeasuredLanding({
        receipt: receiptOf(202),
        revision: b,
        receivedAt: gapAt,
        reason: "no-build",
      })
      .measuredLanding({
        receipt: receiptOf(203),
        revision: c,
        receivedAt: "2026-11-01T10:00:00Z",
        runId: 213,
        startedAt: cStart,
        completedAt: "2026-11-05T10:03:00Z",
      })
      .please(),
  );
  const shown = await openCiStatus(page);

  // The evidence and latest measurement follow accepted landings. The
  // measured span independently uses the actual minimum and maximum dates.
  const heading = shown.getByRole("heading");
  await expect(heading).toHaveText(
    `CI wall time history 2 measured builds · ${dayWords(cStart)}–${dayWords(aStart)}`,
  );
  await expect(heading.locator("time").nth(0)).toHaveAttribute(
    "datetime",
    cStart,
  );
  await expect(heading.locator("time").nth(1)).toHaveAttribute(
    "datetime",
    aStart,
  );
  await expect(shown.getByRole("definition")).toHaveText("3 min");
  await shown.locator("summary").click();
  const rows = shown
    .getByRole("list", { name: "Builds and evidence" })
    .getByRole("listitem");
  await expect(rows).toHaveText([
    `${dayWords(aStart)} · 6 min 5 s · exact revision ${shortSha(a)} · Run 211 · attempt 1`,
    `${dayWords(gapAt)} · No build · landed revision ${shortSha(b)}`,
    `${dayWords(cStart)} · 3 min · exact revision ${shortSha(c)} · Run 213 · attempt 1`,
  ]);
  await expect(rows.nth(0).locator("time")).toHaveAttribute("datetime", aStart);
  await expect(rows.nth(1).locator("time")).toHaveAttribute("datetime", gapAt);
  await expect(rows.nth(2).locator("time")).toHaveAttribute("datetime", cStart);
  await expect(shown.locator("circle.intent-ci-history-point")).toHaveCount(2);
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
