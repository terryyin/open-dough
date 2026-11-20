// System settings → Usage mounted tool-selection and per-tool summary
// operations and readings (../../src/UsageToolChoice.tsx,
// ../../src/UsageToolSummary.tsx).
import { expect } from "vitest";
import { type page, userEvent } from "vitest/browser";

export type UsageToolName = "Codex" | "Claude Code";

type RegionLocator = ReturnType<typeof page.getByRole>;

export function usageToolsView(
  view: RegionLocator,
  trend: RegionLocator,
  chartDrawing: () => Element | null,
) {
  const tool = (name: UsageToolName) =>
    view
      .getByRole("group", { name: "Tools", exact: true })
      .getByRole("checkbox", { name, exact: true });
  const list = trend.getByRole("list", {
    name: "Selected tools",
    exact: true,
  });
  const summary = () => list.getByRole("listitem").query();
  const medianLines = () =>
    chartDrawing()?.querySelectorAll(".history-chart-line");

  return {
    async showTool(
      name: UsageToolName,
      shown: boolean,
      by: "pointer" | "keyboard" = "pointer",
    ) {
      const box = tool(name);
      await expect.element(box).toBeInTheDocument();
      const input = box.element() as HTMLInputElement;
      if (by === "keyboard") {
        input.focus();
        if (input.checked !== shown) {
          await userEvent.keyboard("{Space}");
        }
      } else if (input.checked !== shown) {
        await userEvent.click(box);
      }
      if (shown) {
        await expect.element(box).toBeChecked();
      } else {
        await expect.element(box).not.toBeChecked();
      }
    },
    async showsTools(selected: Readonly<Record<UsageToolName, boolean>>) {
      for (const [name, shown] of Object.entries(selected)) {
        const box = tool(name as UsageToolName);
        if (shown) {
          await expect.element(box).toBeChecked();
        } else {
          await expect.element(box).not.toBeChecked();
        }
      }
    },
    async showsToolSummaries(names: readonly UsageToolName[]) {
      await expect
        .poll(() =>
          [...(list.query()?.querySelectorAll("h4") ?? [])].map((heading) =>
            heading.textContent.trim(),
          ),
        )
        .toEqual([...names]);
    },
    async showsCohortNote(words: string) {
      await expect
        .poll(() => summary()?.querySelector(".usage-tool-count")?.textContent)
        .toBe(words);
    },
    async showsMedian(figure: string) {
      await expect
        .poll(
          () => summary()?.querySelector(".usage-median strong")?.textContent,
        )
        .toBe(figure);
      await expect
        .poll(() => summary()?.querySelector(".usage-median span")?.textContent)
        .toBe("10-task rolling median");
      await expect
        .poll(() => {
          const lines = medianLines();
          return lines?.length === 1
            ? (lines[0]?.getBoundingClientRect().width ?? 0)
            : 0;
        })
        .toBeGreaterThan(0);
    },
    async showsNoMedian(words: string) {
      await expect
        .poll(
          () => summary()?.querySelector(".usage-median strong")?.textContent,
        )
        .toBe("—");
      await expect
        .poll(() => summary()?.querySelector(".usage-median span")?.textContent)
        .toBe(words);
      await expect.poll(() => medianLines()?.length ?? 0).toBe(0);
    },
    async showsToolNotes(notes: readonly string[]) {
      await expect
        .poll(() =>
          [...(trend.query()?.querySelectorAll(".usage-tool-note") ?? [])].map(
            (note) => note.textContent,
          ),
        )
        .toEqual([...notes]);
    },
    async showsTariff(label: string) {
      await expect
        .element(trend.getByText(label, { exact: true }))
        .toBeVisible();
    },
  };
}
