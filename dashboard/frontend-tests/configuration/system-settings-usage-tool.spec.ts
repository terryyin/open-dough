// The tool selection chooses whose cohorts the view reads, keeping the other
// filters while any selected tool still offers them.
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { UsagePeriod } from "../../src/usagePeriod.ts";
import type { UsageSource } from "../../src/usageSource.ts";
import type { TokenIndexCohort, UsageTool } from "../../src/usageTokenIndex.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

const sol = { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" };
const astra = { id: "gpt-6-astra", name: "GPT-6 Astra" };
const opus = { id: "claude-opus-5-5", name: "Claude Opus 5.5" };
const claudeTariff = "Claude test rate card";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-15T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

test("adding Claude Code keeps a Codex-only model, offering both tools' models once; hiding Codex then resets that model and keeps the workflow and a shared effort", async () => {
  const reads: {
    readonly cohort: TokenIndexCohort;
    readonly period: UsagePeriod | undefined;
  }[] = [];
  const source: UsageSource = {
    read: (cohort, period) => {
      reads.push({ cohort, period });
      const answer =
        cohort.tool === "claude"
          ? makeMe.aTokenIndexAnswer
              // Like the service, no Claude task matches a model it never ran.
              .with({
                indexes: [null, opus.id].includes(cohort.model) ? [2_000] : [],
              })
              .withTask(0, { observed: { model: opus, effort: "high" } })
              .offering({ models: [opus], efforts: ["high", "medium"] })
              .underTariff(claudeTariff)
          : makeMe.aTokenIndexAnswer.offering({
              models: [sol, astra],
              efforts: ["xhigh", "high"],
            });
      return Promise.resolve(answer.forCohort(cohort).please());
    },
    refresh: () => Promise.resolve(),
  };

  const usage = await mountUsage(source);
  await usage.showsTools({ Codex: true, "Claude Code": false });
  await usage.choose("Launch workflow", "Refinement");
  await usage.choose("Model", astra.name);
  await usage.choose("Effort", "high");

  await usage.showTool("Claude Code", true, "keyboard");
  await usage.showsToolSummaries(["Codex", "Claude Code"]);
  await usage.offers("Model", ["All models", sol.name, astra.name, opus.name]);
  await usage.offers("Effort", ["Any effort", "xhigh", "high", "medium"]);
  await usage.showsCohort({ Model: astra.name, Effort: "high" });

  // Each tool reads its own cohort with the same filters and period.
  const latest = (tool: UsageTool) =>
    [...reads].reverse().find((read) => read.cohort.tool === tool);
  expect(latest("claude")).toEqual({
    ...latest("codex"),
    cohort: {
      tool: "claude",
      workflow: "refinement",
      model: astra.id,
      effort: "high",
    },
  });

  await usage.showTool("Codex", false);
  await usage.showsToolSummaries(["Claude Code"]);
  await usage.showsTariff(claudeTariff);
  await usage.showsCohort({
    "Launch workflow": "Refinement",
    Model: "All models",
    Effort: "high",
  });
  await usage.offers("Model", ["All models", opus.name]);
  await usage.selectPoint("Nov 1 · Claude Code · 2,000", "pointer");
  await usage.showsDetail({
    title: "Task 1",
    about: "Open Dough · Claude Code · Refinement",
    facts: [
      ["Token index", "2,000"],
      ["Observed model", "Claude Opus 5.5 · high effort"],
      ["Ended", { at: "2026-11-01T12:00:00.000Z", outcome: "Completed" }],
      ["Coverage", "No known gaps"],
    ],
  });
});

test("the Claude Code cohort names, once and in words, the background work it leaves out and each task's own missing usage; Codex names no left-out work", async () => {
  const codexTariff = "Codex test rate card";
  const source: UsageSource = {
    read: (cohort) => {
      const answer =
        cohort.tool === "claude"
          ? makeMe.aTokenIndexAnswer
              .with({ indexes: [2_000, 3_000] })
              .withTask(1, {
                coverage: {
                  kind: "partial",
                  gaps: [
                    "missing-root-transcript-usage",
                    "no-attributable-response-usage",
                  ],
                },
              })
              .underTariff(claudeTariff)
          : makeMe.aTokenIndexAnswer.underTariff(codexTariff);
      return Promise.resolve(answer.forCohort(cohort).please());
    },
    refresh: () => Promise.resolve(),
  };

  const usage = await mountUsage(source);
  await usage.showsToolNotes([codexTariff]);

  await usage.showTool("Codex", false);
  await usage.showTool("Claude Code", true);
  await usage.showsToolNotes([
    claudeTariff,
    "Not included: background agent-view row summaries, recaps and idle compaction",
  ]);
  await usage.showsCohortNote("2 tasks · 1 partial · Last 30 days");
  await usage.selectPoint("Nov 2 · Claude Code · 3,000 · Partial", "pointer");
  await usage.showsFact(
    "Coverage",
    "Partial · Root transcript usage missing, No attributed response",
  );
  await usage.closeDetail("Nov 2 · Claude Code · 3,000 · Partial");
  await usage.selectPoint("Nov 1 · Claude Code · 2,000", "pointer");
  await usage.showsFact("Coverage", "No known gaps");
});
