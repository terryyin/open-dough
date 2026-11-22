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
  medianLines: (name?: UsageToolName) => readonly Element[],
) {
  const tool = (name: UsageToolName) =>
    view
      .getByRole("group", { name: "Tools", exact: true })
      .getByRole("checkbox", { name, exact: true });
  const list = trend.getByRole("list", {
    name: "Selected tools",
    exact: true,
  });
  const summary = (name?: UsageToolName) =>
    list.getByRole("listitem", name === undefined ? {} : { name, exact: true });

  async function showsLatestMedian(figure: string, name?: UsageToolName) {
    const row = summary(name);
    await expect
      .poll(
        () => row.query()?.querySelector(".usage-median strong")?.textContent,
      )
      .toBe(figure);
  }

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
    async showsFocusedToolChoice(name: UsageToolName) {
      const choice = tool(name);
      await expect.element(choice).toHaveFocus();
      expect(getComputedStyle(choice.element()).outlineStyle).not.toBe("none");
    },
    async showsSelectToolPrompt() {
      await expect
        .element(
          view.getByText(
            "Select Codex or Claude Code to show its token index.",
            { exact: true },
          ),
        )
        .toBeVisible();
      await expect.element(trend).not.toBeInTheDocument();
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
    async showsCohortNote(words: string, name?: UsageToolName) {
      await expect
        .poll(
          () =>
            summary(name).query()?.querySelector(".usage-tool-count")
              ?.textContent,
        )
        .toBe(words);
    },
    showsLatestMedian,
    async showsMedian(figure: string, name?: UsageToolName) {
      await showsLatestMedian(figure, name);
      const row = summary(name);
      await expect
        .poll(
          () => row.query()?.querySelector(".usage-median span")?.textContent,
        )
        .toBe("10-task rolling median");
      await expect
        .poll(() => {
          const lines = medianLines(name);
          return lines.length === 1
            ? (lines[0]?.getBoundingClientRect().width ?? 0)
            : 0;
        })
        .toBeGreaterThan(0);
    },
    async showsNoMedian(words: string) {
      await showsLatestMedian("—");
      await expect
        .poll(
          () =>
            summary().query()?.querySelector(".usage-median span")?.textContent,
        )
        .toBe(words);
      await expect.poll(() => medianLines().length).toBe(0);
    },
    async showsEmptyTool(name: UsageToolName, words: string) {
      await expect
        .element(summary(name).getByText(words, { exact: true }))
        .toBeVisible();
    },
    async showsToolNotes(notes: readonly string[], name?: UsageToolName) {
      const scope = name === undefined ? trend : summary(name);
      await expect
        .poll(() =>
          [...(scope.query()?.querySelectorAll(".usage-tool-note") ?? [])].map(
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
    async showsRateCardWarnings(words: readonly string[]) {
      await expect
        .poll(() =>
          [
            ...(summary().query()?.querySelectorAll(".usage-rate-warning") ??
              []),
          ].map((warning) => warning.textContent),
        )
        .toEqual([...words]);
    },
  };
}
