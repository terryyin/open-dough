// Codex and Claude Code compared on one chart: each tool's own points, median,
// unit and notes over one completion-time axis and one numeric scale, with
// tool identity kept in readouts and detail, and each read's failure or
// emptiness shown as that tool's.
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
import { visitUsage } from "../tests/support/systemSettingsUsagePage.ts";
import type { Page } from "@playwright/test";

const at = (date: number, hour = 12) =>
  new Date(Date.UTC(2026, 10, date, hour)).toISOString();
const codexUnit = "Codex test rate card · GPT-6.1 Sol input-token equivalents";
const claudeUnit =
  "Claude test rate card · Claude Opus 5.5 input-token equivalents";
const leftOut =
  "Not included: background agent-view row summaries, recaps and idle compaction";

// Codex finished on Nov 1, 3 and 9; Claude Code on Nov 3, at the same time
// as Codex, and Nov 4. Both tools number their first task `task-1`.
const codex = () =>
  makeMe.aTokenIndexAnswer
    .with({ indexes: [1_000, 2_000, 4_000] })
    .withTask(1, { endedAt: at(3) })
    .withTask(2, { endedAt: at(9) })
    .withTrend([{ at: at(9), value: 2_000 }])
    .underTariff(codexUnit);
const claude = () =>
  makeMe.aTokenIndexAnswer
    .with({ indexes: [3_000, 4_000] })
    .withTask(0, { endedAt: at(3) })
    .withTask(1, {
      endedAt: at(4),
      coverage: { kind: "partial", gaps: ["missing-root-transcript-usage"] },
    })
    .withUnpricedTasks(1)
    .withTrend([{ at: at(4), value: 3_500 }])
    .underTariff(claudeUnit);

async function answering(
  page: Page,
  answer: (tool: UsageTool) => TokenIndexAnswer | "fail",
) {
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => {
      const cohort = requestedCohort(
        new URL(route.request().url()).searchParams,
      );
      const body = answer(cohort?.tool ?? "codex");
      return body === "fail"
        ? route.fulfill({ status: 500, json: {} })
        : route.fulfill({ json: body });
    },
  );
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
});

test("both tools share one time axis and scale with their own medians, units and notes, keeping each task's tool through inspection", async ({
  page,
}) => {
  await answering(page, (tool) =>
    (tool === "claude" ? claude() : codex()).forCohort({ tool }).please(),
  );
  const usage = await visitUsage(page);
  const chart = usageChart(page);
  await usage.showTool("Claude Code", true);
  await usage.showsPoints([
    "Nov 1 · Codex · 1,000",
    "Nov 3 · Codex · 2,000",
    "Nov 3 · Claude Code · 3,000",
    "Nov 4 · Claude Code · 4,000 · Partial",
    "Nov 9 · Codex · 4,000",
  ]);
  const x = await chart.markCentres([
    "Nov 1 · Codex · 1,000",
    "Nov 3 · Codex · 2,000",
    "Nov 3 · Claude Code · 3,000",
    "Nov 4 · Claude Code · 4,000 · Partial",
    "Nov 9 · Codex · 4,000",
  ]);
  const day = ((x[1]?.x ?? 0) - (x[0]?.x ?? 0)) / 2;
  expect(day).toBeGreaterThan(0);
  expect(x[2]?.x).toBeCloseTo(x[1]?.x ?? 0, 1);
  expect(((x[3]?.x ?? 0) - (x[2]?.x ?? 0)) / day).toBeCloseTo(1, 1);
  expect(((x[4]?.x ?? 0) - (x[3]?.x ?? 0)) / day).toBeCloseTo(5, 1);
  // One numeric scale: equal indices of different tools stand level.
  expect(x[3]?.y).toBeCloseTo(x[4]?.y ?? 0, 1);
  await usage.showsMedian("2,000", "Codex");
  await usage.showsMedian("3,500", "Claude Code");
  await chart.showsDistinctTraces();
  await usage.showsCohortNote("3 tasks · Last 30 days", "Codex");
  await usage.showsCohortNote(
    "3 tasks · 1 partial · 1 unpriced · Last 30 days",
    "Claude Code",
  );
  await usage.showsToolNotes([codexUnit, claudeUnit, leftOut]);
  await chart.showsNote(
    "One numeric scale; each tool's values stay in its own reference unit, not a common cost or a measure of tool efficiency.",
  );

  await usage.selectPoint("Nov 3 · Claude Code · 3,000", "keyboard");
  await usage.showsFact("Token index", "3,000");
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
  await usage.selectPoint("Nov 1 · Codex · 1,000", "pointer");
  await usage.showsFact("Token index", "1,000");
  await usage.selectPoint("Nov 4 · Claude Code · 4,000 · Partial", "pointer");

  await usage.showTool("Claude Code", false);
  await usage.showsNoDetail();
  await usage.showsPoints([
    "Nov 1 · Codex · 1,000",
    "Nov 3 · Codex · 2,000",
    "Nov 9 · Codex · 4,000",
  ]);
  await usage.showsToolSummaries(["Codex"]);
});

test("an empty tool says so, a failed read names its tool, and neither tool asks for one", async ({
  page,
}) => {
  let claudeAnswer: "empty" | "fail" = "empty";
  await answering(page, (tool) =>
    tool !== "claude"
      ? codex().please()
      : claudeAnswer === "fail"
        ? "fail"
        : claude()
            .with({ indexes: [] })
            .withUnpricedTasks(0)
            .withTrend([])
            .forCohort({ tool })
            .please(),
  );
  const usage = await visitUsage(page);
  await usage.showTool("Claude Code", true);
  await usage.showsEmptyTool(
    "Claude Code",
    "No finished task matches in the last 30 days.",
  );
  await usage.showsCohortNote("0 tasks · Last 30 days", "Claude Code");
  await usage.showsPointCount(3);

  claudeAnswer = "fail";
  await page.route(
    (url) => url.pathname === usageRefreshEndpoint,
    (route) =>
      route.fulfill({ json: { checkedAt: "2026-11-15T11:00:00.000Z" } }),
  );
  await usage.refresh();
  await usage.showsProblem("Claude Code: Usage could not be read.");
  // The last answer for this selection stays with its check time.
  await usage.showsPointCount(3);
  await usage.showsCheckedAt("2026-11-15T00:00:00.000Z");
  await usage.showsChecked();

  await usage.choose("Launch workflow", "Refinement");
  await usage.showsProblem("Claude Code: Usage could not be read.");
  await usage.showsPointCount(0);

  await usage.showTool("Codex", false);
  await usage.showTool("Claude Code", false);
  await usage.showsSelectToolPrompt();
});

for (const [name, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["narrowest reading window", narrowWindow],
] as const) {
  test.describe(name, () => {
    test.use({ viewport, hasTouch: true });
    test("tool choices work by keyboard and a compared point opens by touch, in light and dark, without sideways scroll", async ({
      page,
    }) => {
      await answering(page, (tool) =>
        (tool === "claude" ? claude() : codex()).forCohort({ tool }).please(),
      );
      const usage = await visitUsage(page);
      const chart = usageChart(page);
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        await usage.showTool("Claude Code", true, "keyboard");
        await usage.showsToolSummaries(["Codex", "Claude Code"]);
        await usage.showsFocusedToolChoice("Claude Code");
        await chart.showsDistinctTraces();
        await chart.fitsReadingWindow();
        await usage.selectPoint("Nov 3 · Claude Code · 3,000", "touch");
        await usage.showsFact("Token index", "3,000");
        await usage.closeDetail("Nov 3 · Claude Code · 3,000");
        await usage.showTool("Claude Code", false, "keyboard");
        await usage.showsNoDetail();
      }
    });
  });
}
