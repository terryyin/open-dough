// The key and tool summaries draw the marks of the traces they describe.
import { afterEach, beforeEach, describe, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { usageColourScheme } from "./system-settings-usage-browser.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

const at = (date: number) =>
  new Date(Date.UTC(2026, 10, date, 12)).toISOString();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(at(15)));
});
afterEach(() => {
  vi.useRealTimers();
});

function comparing(viewport?: {
  readonly width: number;
  readonly height: number;
}) {
  return mountUsage(
    {
      read: (cohort) => {
        const day = cohort.tool === "claude" ? 4 : 2;
        const answer = makeMe.aTokenIndexAnswer
          .with({ indexes: [1_000, 2_000] })
          .withTask(0, { endedAt: at(day) })
          .withTask(1, {
            endedAt: at(day + 1),
            coverage: {
              kind: "partial",
              gaps: ["missing-root-transcript-usage"],
            },
          })
          .withTrend([{ at: at(day + 1), value: 1_500 }])
          .forCohort(cohort)
          .please();
        return Promise.resolve(answer);
      },
      refresh: async () => {},
    },
    viewport,
  );
}

test("the key and summary swatches show each shown tool's marks, and a hidden tool leaves the key", async () => {
  const usage = await comparing();
  await usage.chart.showsKeyFor(["Codex"]);
  await usage.showTool("Claude Code", true);
  await usage.chart.showsKeyFor(["Codex", "Claude Code"]);
  await usage.chart.showsSummarySwatches(["Codex", "Claude Code"]);
  await usage.showTool("Codex", false);
  await usage.chart.showsKeyFor(["Claude Code"]);
  await usage.chart.showsSummarySwatches(["Claude Code"]);
});

for (const [name, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["narrowest reading window", { width: 420, height: 900 }],
] as const) {
  describe(name, () => {
    test("the compared key fits without sideways scroll in light and dark", async () => {
      const usage = await comparing(viewport);
      await usage.showTool("Claude Code", true);
      const appearance = usageColourScheme();
      for (const colour of ["light", "dark"] as const) {
        await appearance(colour);
        await usage.chart.showsKeyFor(["Codex", "Claude Code"]);
        await usage.chart.fitsReadingWindow();
      }
    });
  });
}
