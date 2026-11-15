// Tool chooses whose cohort the view reads, keeping the other filters that
// the chosen tool still offers.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  requestedCohort,
  usageTokenIndexEndpoint,
} from "../src/usageTokenIndex.ts";
import { test } from "../tests/support/frontendApp.ts";
import { visitUsage } from "../tests/support/systemSettingsUsagePage.ts";

const sol = { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
  astra = { id: "gpt-6-astra", name: "GPT-6 Astra" },
  opus = { id: "claude-opus-5-5", name: "Claude Opus 5.5" };
const claudeTariff = "Claude test rate card";

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
});

test("choosing Claude Code reads its cohort under its tariff, keeping the workflow and an effort it ran and resetting a model it did not", async ({
  page,
}) => {
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => {
      const cohort = requestedCohort(
        new URL(route.request().url()).searchParams,
      );
      const answer =
        cohort?.tool === "claude"
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
      return route.fulfill({
        json: answer.forCohort(cohort ?? {}).please(),
      });
    },
  );
  const usage = await visitUsage(page);
  await usage.offers("Tool", ["Codex", "Claude Code"]);
  await usage.choose("Launch workflow", "Refinement");
  await usage.choose("Model", astra.name);
  await usage.choose("Effort", "high");

  await usage.choose("Tool", "Claude Code");
  await usage.showsTariff(claudeTariff);
  await usage.showsCohort({
    Tool: "Claude Code",
    "Launch workflow": "Refinement",
    Model: "All models",
    Effort: "high",
  });
  await usage.offers("Model", ["All models", opus.name]);
  await usage.selectPoint("Nov 1 · 2,000", "pointer");
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

test("the Claude Code cohort names, once and in words, the background work it leaves out and each task's own missing usage; Codex names no left-out work", async ({
  page,
}) => {
  const codexTariff = "Codex test rate card";
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => {
      const cohort = requestedCohort(
        new URL(route.request().url()).searchParams,
      );
      const answer =
        cohort?.tool === "claude"
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
      return route.fulfill({
        json: answer.forCohort(cohort ?? {}).please(),
      });
    },
  );
  const usage = await visitUsage(page);
  await usage.showsFootNotes([codexTariff]);

  await usage.choose("Tool", "Claude Code");
  await usage.showsFootNotes([
    claudeTariff,
    "Not included: background agent-view row summaries, recaps and idle compaction",
  ]);
  await usage.showsCohortNote("2 tasks · 1 partial · Last 30 days");
  await usage.selectPoint("Nov 2 · 3,000 · Partial", "pointer");
  await usage.showsFact(
    "Coverage",
    "Partial · Root transcript usage missing, No attributed response",
  );
  await usage.closeDetail("Nov 2 · 3,000 · Partial");
  await usage.selectPoint("Nov 1 · 2,000", "pointer");
  await usage.showsFact("Coverage", "No known gaps");
});
