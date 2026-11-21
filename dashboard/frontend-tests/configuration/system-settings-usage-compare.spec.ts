// Codex and Claude Code compared on one chart: each tool's own points, median,
// unit and notes over one completion-time axis and one numeric scale, with
// tool identity kept in mark shapes, readouts and detail, and each read's
// failure or emptiness shown as that tool's.
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { UsageSource } from "../../src/usageSource.ts";
import { settingsColourScheme } from "./system-settings-browser.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

const at = (date: number) =>
  new Date(Date.UTC(2026, 10, date, 12)).toISOString();
const codexUnit = "Codex test rate card · GPT-6.1 Sol input-token equivalents";
const claudeUnit =
  "Claude test rate card · Claude Opus 5.5 input-token equivalents";
const leftOut =
  "Not included: background agent-view row summaries, recaps and idle compaction";

// Codex finished on Nov 1, 3 and 9, partly measured; Claude Code on Nov 3,
// at the same time as Codex, and Nov 4, partly measured. Both tools number
// their first task `task-1`.
const codex = () =>
  makeMe.aTokenIndexAnswer
    .with({ indexes: [1_000, 2_000, 4_000] })
    .withTask(1, { endedAt: at(3) })
    .withTask(2, {
      endedAt: at(9),
      coverage: { kind: "partial", gaps: ["missing-root-transcript-usage"] },
    })
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

function comparing(viewport?: {
  readonly width: number;
  readonly height: number;
}) {
  return mountUsage(
    {
      read: (cohort) =>
        Promise.resolve(
          (cohort.tool === "claude" ? claude() : codex())
            .forCohort(cohort)
            .please(),
        ),
      refresh: () => Promise.resolve(),
    },
    viewport,
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(at(15)));
});
afterEach(() => {
  vi.useRealTimers();
});

test("both tools share one time axis and scale with their own medians, units and notes, keeping each task's tool through inspection", async () => {
  const usage = await comparing();
  const { chart } = usage;
  const comparedReadouts = [
    "Nov 1 · Codex · 1,000",
    "Nov 3 · Codex · 2,000",
    "Nov 3 · Claude Code · 3,000",
    "Nov 4 · Claude Code · 4,000 · Partial",
    "Nov 9 · Codex · 4,000 · Partial",
  ];

  await usage.showTool("Claude Code", true);
  await usage.showsPoints(comparedReadouts);
  const [nov1, nov3Codex, nov3Claude, nov4, nov9] =
    await chart.markCentres(comparedReadouts);
  if (!nov1 || !nov3Codex || !nov3Claude || !nov4 || !nov9)
    throw new Error("Comparison must draw all five tasks.");
  const day = (nov3Codex.x - nov1.x) / 2;
  expect(day).toBeGreaterThan(0);
  expect(nov3Claude.x).toBeCloseTo(nov3Codex.x, 1);
  expect((nov4.x - nov3Claude.x) / day).toBeCloseTo(1, 1);
  expect((nov9.x - nov4.x) / day).toBeCloseTo(5, 1);
  // One numeric scale: equal indices of different tools stand level.
  expect(nov4.y).toBeCloseTo(nov9.y, 1);
  await usage.showsMedian("2,000", "Codex");
  await usage.showsMedian("3,500", "Claude Code");
  await usage.showsCohortNote("3 tasks · 1 partial · Last 30 days", "Codex");
  await usage.showsCohortNote(
    "3 tasks · 1 partial · 1 unpriced · Last 30 days",
    "Claude Code",
  );
  await usage.showsToolNotes([codexUnit, claudeUnit, leftOut]);
  await usage.showsToolNotes([codexUnit], "Codex");
  await usage.showsToolNotes([claudeUnit, leftOut], "Claude Code");
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
    "Nov 9 · Codex · 4,000 · Partial",
  ]);
  await usage.showsToolSummaries(["Codex"]);
});

test("each tool's marks differ by shape, partial ones keep the caution stroke, and either tool's selected task is the one larger diamond", async () => {
  const usage = await comparing();
  const { chart } = usage;
  await usage.showTool("Claude Code", true);
  await chart.showsDistinctTraces();
  await usage.selectPoint("Nov 3 · Claude Code · 3,000", "pointer");
  await chart.showsSelectedDiamond("Claude Code");
  await usage.selectPoint("Nov 1 · Codex · 1,000", "pointer");
  await chart.showsSelectedDiamond("Codex");
});

test("an empty tool says so, a failed read names its tool, and neither tool asks for one", async () => {
  let refuseClaude = false;
  const source: UsageSource = {
    read: (cohort) => {
      if (cohort.tool === "codex")
        return Promise.resolve(codex().forCohort(cohort).please());
      if (refuseClaude)
        return Promise.reject(new Error("Usage could not be read."));
      return Promise.resolve(
        claude()
          .with({ indexes: [] })
          .withUnpricedTasks(0)
          .withTrend([])
          .forCohort(cohort)
          .please(),
      );
    },
    refresh: () => Promise.resolve(),
  };
  const usage = await mountUsage(source);
  await usage.showTool("Claude Code", true);
  await usage.showsEmptyTool(
    "Claude Code",
    "No finished task matches in the last 30 days.",
  );
  await usage.showsCohortNote("0 tasks · Last 30 days", "Claude Code");
  await usage.showsPointCount(3);

  refuseClaude = true;
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
  await usage.showsPointCount(0);
});

for (const [name, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["narrowest reading window", { width: 420, height: 900 }],
] as const) {
  describe(name, () => {
    test("tool choices work by keyboard and a compared point opens by touch, in light and dark, without sideways scroll", async () => {
      const appearance = settingsColourScheme();
      const usage = await comparing(viewport);
      const { chart } = usage;
      for (const colorScheme of ["light", "dark"] as const) {
        await appearance(colorScheme);
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
