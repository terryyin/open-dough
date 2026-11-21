// Equal spacing gives every shown task of the selected tools one slot in
// completion order, a tie by tool then task ID, with each tool's median at
// its own task; readouts and detail keep actual times, and switching it off
// restores each time position.
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { usageColourScheme } from "./system-settings-usage-browser.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

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

function comparing({
  viewport = { width: 1280, height: 720 },
  claudeMedian = 3_500,
}: {
  readonly viewport?: { readonly width: number; readonly height: number };
  readonly claudeMedian?: number;
} = {}) {
  return mountUsage(
    {
      read: (cohort) =>
        Promise.resolve(
          (cohort.tool === "claude" ? claude(claudeMedian) : codex())
            .forCohort(cohort)
            .please(),
        ),
      refresh: () => Promise.resolve(),
    },
    viewport,
  );
}

const gaps = (xs: readonly { readonly x: number }[]) =>
  xs.slice(1).map((point, at) => point.x - (xs[at]?.x ?? 0));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(at(15)));
});
afterEach(() => {
  vi.useRealTimers();
});

test("equal spacing gives each shown task one slot in completion order across tools, keeps medians on their tasks and actual times, and restores time positions", async () => {
  const usage = await comparing();
  const { chart } = usage;
  const { spacing } = chart;
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
  const [, , claudeMedianTask, , , codexMedianTask] = spaced;
  if (!claudeMedianTask || !codexMedianTask)
    throw new Error("Both median tasks must have positions.");
  await spacing.showsMedianAt("Codex", codexMedianTask.x);
  await spacing.showsMedianAt("Claude Code", claudeMedianTask.x);
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

test("an above-scale median stands at its own large task's slot under equal spacing", async () => {
  const usage = await comparing({ claudeMedian: 70_000_000 });
  const { chart } = usage;
  const { spacing } = chart;
  await usage.showTool("Claude Code", true);
  await spacing.space(true);
  await chart.showsMedianOverflow(
    ["Claude Code Median ↑ 70,000,000"],
    ["Nov 4 · Claude Code · 10-task rolling median above scale · 70,000,000"],
  );
  const [largeMark] = await chart.markCentres([large]);
  if (!largeMark) throw new Error("The large task must have a position.");
  await spacing.showsOverflowMedianAt(largeMark.x);
  await chart.fitsReadingWindow();
});

for (const [name, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["narrowest reading window", { width: 420, height: 900 }],
] as const) {
  describe(name, () => {
    test("equal spacing works by keyboard and its points open by touch, in light and dark, without sideways scroll", async () => {
      const appearance = usageColourScheme();
      const usage = await comparing({ viewport });
      const { chart } = usage;
      const { spacing } = chart;
      await usage.showTool("Claude Code", true);
      for (const colorScheme of ["light", "dark"] as const) {
        await appearance(colorScheme);
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
