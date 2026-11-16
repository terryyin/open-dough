// Equal spacing gives every shown task of the selected tools one slot in
// completion order, a tie by tool then task ID, with each tool's median at
// its own task; readouts and detail keep actual times, and switching it off
// restores each time position.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  requestedCohort,
  usageRefreshEndpoint,
  usageTokenIndexEndpoint,
  type TokenIndexAnswer,
  type UsageTool,
} from "../src/usageTokenIndex.ts";
import { narrowWindow } from "../tests/accessibleReading.ts";
import { expect } from "../tests/dashboardTest.ts";
import { test } from "../tests/support/frontendApp.ts";
import { usageChart } from "../tests/support/usageChartPage.ts";
import { usageSpacing } from "../tests/support/usageSpacingPage.ts";
import { visitUsage } from "../tests/support/systemSettingsUsagePage.ts";
import type { Page } from "@playwright/test";

const at = (date: number, hour = 12) =>
  new Date(Date.UTC(2026, 10, date, hour)).toISOString();
const large = "Nov 4 · Claude Code · 60,000,000 · Large task above 50 million";
// Completion order: Codex task-1 (Nov 1); a tie on Nov 3 between Codex
// task-2 and Claude Code task-1; Claude Code's partial task-2 and large
// task-3 (Nov 4); Codex task-3 (Nov 9).
const inOrder = [
  "Nov 1 · Codex · 1,000",
  "Nov 3 · Codex · 2,000",
  "Nov 3 · Claude Code · 3,000",
  "Nov 4 · Claude Code · 4,000 · Partial",
  large,
  "Nov 9 · Codex · 4,000",
];

const codex = () =>
  makeMe.aTokenIndexAnswer
    .with({ indexes: [1_000, 2_000, 4_000] })
    .withTask(1, { endedAt: at(3) })
    .withTask(2, { endedAt: at(9) })
    .withTrend([{ at: at(9), value: 2_000 }]);
const claude = (median = 3_500) =>
  makeMe.aTokenIndexAnswer
    .with({ indexes: [3_000, 4_000, 60_000_000] })
    .withTask(0, { endedAt: at(3) })
    .withTask(1, {
      endedAt: at(4),
      coverage: { kind: "partial", gaps: ["missing-root-transcript-usage"] },
    })
    .withTask(2, { endedAt: at(4, 13) })
    .withUnpricedTasks(1)
    .withTrend(
      median === 3_500
        ? [{ at: at(3), value: median }]
        : [{ at: at(4, 13), value: median }],
    );

async function answering(
  page: Page,
  answer: (tool: UsageTool) => TokenIndexAnswer,
) {
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => {
      const tool =
        requestedCohort(new URL(route.request().url()).searchParams)?.tool ??
        "codex";
      return route.fulfill({ json: answer(tool) });
    },
  );
}

const gaps = (xs: readonly { readonly x: number }[]) =>
  xs.slice(1).map((point, at) => point.x - (xs[at]?.x ?? 0));

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
});

test("equal spacing gives each shown task one slot in completion order across tools, keeps medians on their tasks and actual times, and restores time positions", async ({
  page,
}) => {
  await answering(page, (tool) =>
    (tool === "claude" ? claude() : codex()).forCohort({ tool }).please(),
  );
  await page.route(
    (url) => url.pathname === usageRefreshEndpoint,
    (route) =>
      route.fulfill({ json: { checkedAt: "2026-11-15T11:00:00.000Z" } }),
  );
  const usage = await visitUsage(page);
  const chart = usageChart(page);
  const spacing = usageSpacing(page);
  await usage.showTool("Claude Code", true);
  await usage.showsPoints(inOrder);
  await spacing.showsDateAxis(["Nov 1", "Nov 4", "Nov 9"]);
  const timed = await chart.markCentres(inOrder);
  await usage.selectPoint("Nov 3 · Claude Code · 3,000", "keyboard");

  await spacing.space(true, "keyboard");
  await spacing.showsTaskOrderAxis();
  // The selection, its actual time and its close-to-mark focus survive.
  await usage.showsDetail({
    title: "Task 1",
    about: "Open Dough · Claude Code · Execution",
    facts: [
      ["Token index", "3,000"],
      ["Observed model", "GPT-6.1 Sol · xhigh effort"],
      ["Ended", { at: at(3), outcome: "Completed" }],
      ["Coverage", "No known gaps"],
    ],
  });
  await usage.closeDetail("Nov 3 · Claude Code · 3,000");
  // The unpriced Claude Code task has no point and so no slot.
  await usage.showsPoints(inOrder);
  const spaced = await chart.markCentres(inOrder);
  const slot = gaps(spaced)[0] ?? 0;
  expect(slot).toBeGreaterThan(0);
  for (const gap of gaps(spaced)) expect(gap).toBeCloseTo(slot, 1);
  // Values keep their heights (relative to the first, as the page may scroll).
  for (const [index, point] of spaced.entries())
    expect(point.y - (spaced[0]?.y ?? 0)).toBeCloseTo(
      (timed[index]?.y ?? 0) - (timed[0]?.y ?? 0),
      1,
    );
  expect(await spacing.medianX("Codex")).toBeCloseTo(spaced[5]?.x ?? 0, 1);
  expect(await spacing.medianX("Claude Code")).toBeCloseTo(
    spaced[2]?.x ?? 0,
    1,
  );
  await usage.showsMedian("2,000", "Codex");
  await usage.showsMedian("3,500", "Claude Code");

  // Filters rebuild the sequence; spacing stays through them and Refresh.
  await usage.showTool("Codex", false);
  const claudeOnly = await chart.markCentres(inOrder.slice(2, 5));
  const [first] = gaps(claudeOnly);
  for (const gap of gaps(claudeOnly)) expect(gap).toBeCloseTo(first ?? 0, 1);
  expect(first ?? 0).toBeGreaterThan(slot);
  await usage.showTool("Codex", true);
  await usage.refresh();
  await usage.showsChecked();
  await usage.chooseDays("7");
  await usage.chooseDays("30");
  await spacing.showsSpacing(true);
  await spacing.showsTaskOrderAxis();

  await usage.selectPoint("Nov 4 · Claude Code · 4,000 · Partial", "pointer");
  await spacing.space(false);
  await spacing.showsDateAxis(["Nov 1", "Nov 4", "Nov 9"]);
  await usage.showsFact("Token index", "4,000");
  await usage.showsFact("Ended", { at: at(4), outcome: "Completed" });
  await usage.closeDetail("Nov 4 · Claude Code · 4,000 · Partial");
  const restored = await chart.markCentres(inOrder);
  for (const [index, point] of restored.entries())
    expect(point.x).toBeCloseTo(timed[index]?.x ?? 0, 1);
});

test("an above-scale median stands at its own large task's slot under equal spacing", async ({
  page,
}) => {
  await answering(page, (tool) =>
    (tool === "claude" ? claude(70_000_000) : codex())
      .forCohort({ tool })
      .please(),
  );
  const usage = await visitUsage(page);
  const chart = usageChart(page);
  const spacing = usageSpacing(page);
  await usage.showTool("Claude Code", true);
  await spacing.space(true);
  await chart.showsMedianOverflow(
    ["Claude Code Median ↑ 70,000,000"],
    ["Nov 4 · Claude Code · 10-task rolling median above scale · 70,000,000"],
  );
  const [largeMark] = await chart.markCentres([large]);
  expect(await spacing.overflowMedianX()).toBeCloseTo(largeMark?.x ?? 0, 1);
  await chart.fitsReadingWindow();
});

for (const [name, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["narrowest reading window", narrowWindow],
] as const) {
  test.describe(name, () => {
    test.use({ viewport, hasTouch: true });
    test("equal spacing works by keyboard and its points open by touch, in light and dark, without sideways scroll", async ({
      page,
    }) => {
      await answering(page, (tool) =>
        (tool === "claude" ? claude() : codex()).forCohort({ tool }).please(),
      );
      const usage = await visitUsage(page);
      const chart = usageChart(page);
      const spacing = usageSpacing(page);
      await usage.showTool("Claude Code", true);
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        await spacing.space(true, "keyboard");
        await spacing.showsFocusedSpacing();
        await spacing.showsTaskOrderAxis();
        await chart.fitsReadingWindow();
        await usage.selectPoint("Nov 3 · Claude Code · 3,000", "touch");
        await usage.showsFact("Token index", "3,000");
        await usage.closeDetail("Nov 3 · Claude Code · 3,000");
        await spacing.space(false, "keyboard");
        await chart.fitsReadingWindow();
      }
    });
  });
}
