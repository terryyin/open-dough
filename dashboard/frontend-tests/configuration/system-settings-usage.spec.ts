// Display variants stay in the frontend; real store/filter/refresh wiring is E2E.
import { afterEach, beforeEach, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { UsageSource } from "../../src/usageSource.ts";
import type {
  TokenIndexAnswer,
  TokenIndexCohort,
} from "../../src/usageTokenIndex.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-15T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;

const tenIndexes = [
  1_000, 1_100, 1_200, 1_300, 1_400, 1_500, 1_600, 1_700, 1_800, 1_900,
];

const sourceAnswering = (
  reply: (cohort: TokenIndexCohort) => TokenIndexAnswer,
): UsageSource => ({
  read: (cohort) => Promise.resolve(reply(cohort)),
  refresh: () => Promise.resolve(),
});

test("ten eligible tasks draw their one rolling median value", async () => {
  const answer = makeMe.aTokenIndexAnswer
    .with({ indexes: tenIndexes })
    .withTrend([{ at: day(10), value: 1_450 }])
    .please();
  const usage = await mountUsage(sourceAnswering(() => answer));
  await usage.showsCohortNote("10 tasks · Last 30 days");
  await usage.showsPointCount(10);
  await usage.showsMedian("1,450");
});

test("partial and unpriced tasks explain a sparse trend, and an empty cohort explains its absence", async () => {
  const sparseExecution = makeMe.aTokenIndexAnswer
    .with({ indexes: tenIndexes })
    .withTask(4, {
      coverage: { kind: "partial", gaps: ["missing-worker-evidence"] },
    })
    .withUnpricedTasks(1)
    .please();
  const adHocWithMedian = makeMe.aTokenIndexAnswer
    .inWorkflow("ad-hoc")
    .with({ indexes: tenIndexes })
    .withTrend([{ at: day(10), value: 1_450 }])
    .please();
  const emptyRefinement = makeMe.aTokenIndexAnswer
    .with({ indexes: [] })
    .inWorkflow("refinement")
    .please();

  const usage = await mountUsage(
    sourceAnswering((cohort) => {
      if (cohort.workflow === "ad-hoc") {
        return adHocWithMedian;
      }
      if (cohort.workflow === "refinement") {
        return emptyRefinement;
      }
      return sparseExecution;
    }),
  );

  await usage.showsCohortNote(
    "11 tasks · 1 partial · 1 unpriced · Last 30 days",
  );
  await usage.showsPointCount(10);
  await usage.showsPartialPoints(1);
  await usage.showsNoMedian(
    "A rolling median needs 10 eligible tasks; none is available in this period",
  );
  await usage.selectPoint("Nov 5 · Codex · 1,400 · Partial", "pointer");
  await usage.showsFact("Coverage", "Partial · Worker usage missing");

  await usage.choose("Launch workflow", "Ad hoc");
  await usage.showsMedian("1,450");

  await usage.choose("Launch workflow", "Refinement");
  await usage.showsCohortNote("0 tasks · Last 30 days");
  await usage.showsNoPoints("No finished task matches in the last 30 days.");
  await usage.showsNoMedian(
    "A rolling median needs 10 eligible tasks; none is available in this period",
  );
});

test("task detail distinguishes repeated launches and unknown outcomes, with keyboard selection and focus restoration", async () => {
  const story = {
    identity: "SEED-42#keep-launch-history",
    title: "Keep launch history",
  };
  const answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [1_950, 3_900, 5_850] })
    .withTask(0, {
      ...story,
      requested: {
        model: { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
        effort: "high",
      },
      outcome: {
        kind: "reported-complete",
        disposition: "returned-to-backlog",
      },
    })
    .withTask(1, story)
    .withTask(2, { title: "Recovered execution", outcome: null })
    .please();

  const usage = await mountUsage(sourceAnswering(() => answer));
  await usage.selectPoint("Nov 1 · Codex · 1,950", "keyboard");
  await usage.showsDetail({
    ...story,
    about: "Open Dough · SEED-42#keep-launch-history · Codex · Execution",
    facts: [
      ["Token index", "1,950"],
      ["Observed model", "GPT-6.1 Sol · xhigh effort"],
      ["Requested model", "GPT-6.1 Sol · high effort"],
      ["Ended", { at: day(1), outcome: "Returned to backlog" }],
      ["Coverage", "No known gaps"],
    ],
  });
  await usage.closeDetail("Nov 1 · Codex · 1,950");
  await usage.selectPoint("Nov 2 · Codex · 3,900", "keyboard");
  await usage.showsFact("Ended", { at: day(2), outcome: "Completed" });
  await usage.closeDetail("Nov 2 · Codex · 3,900");
  await usage.selectPoint("Nov 3 · Codex · 5,850", "pointer");
  await usage.showsDetail({
    title: "Recovered execution",
    about: "Open Dough · Codex · Execution",
    facts: [
      ["Token index", "5,850"],
      ["Observed model", "GPT-6.1 Sol · xhigh effort"],
      ["Ended", { at: day(3), outcome: "Outcome unknown" }],
      ["Coverage", "No known gaps"],
    ],
  });
});
