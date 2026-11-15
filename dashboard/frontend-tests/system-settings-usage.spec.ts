// Display variants stay in the frontend; real store/filter/refresh wiring is E2E.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { usageTokenIndexEndpoint } from "../src/usageTokenIndex.ts";
import { test } from "../tests/support/frontendApp.ts";
import { visitUsage } from "../tests/support/systemSettingsUsagePage.ts";

const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;

test("ten eligible tasks draw their one moving average value", async ({
  page,
}) => {
  const answer = makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        1_000, 1_100, 1_200, 1_300, 1_400, 1_500, 1_600, 1_700, 1_800, 1_900,
      ],
    })
    .please();
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page);
  await usage.showsAverage("1,450");
});

test("partial and unpriced tasks explain a sparse trend, and an empty cohort explains its absence", async ({
  page,
}) => {
  let answer = makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        1_000, 1_100, 1_200, 1_300, 1_400, 1_500, 1_600, 1_700, 1_800, 1_900,
      ],
    })
    .withTask(4, {
      coverage: { kind: "partial", gaps: ["missing-worker-evidence"] },
    })
    .withUnpricedTasks(1)
    .please();
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page);
  await usage.showsCohortNote("11 tasks · 1 partial · 1 unpriced");
  await usage.showsPointCount(10);
  await usage.showsPartialPoints(1);
  await usage.showsNoAverage("Fewer than 10 eligible tasks");
  await usage.selectPoint("Nov 5 · 1,400 · Partial", "pointer");
  await usage.showsFact("Coverage", "Partial · Worker usage missing");

  answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [] })
    .inWorkflow("refinement")
    .please();
  await usage.choose("Launch workflow", "Refinement");
  await usage.showsCohortNote("0 tasks");
  await usage.showsNoPoints("No finished task matches.");
});

test("task detail distinguishes repeated launches and unknown outcomes, with keyboard selection and focus restoration", async ({
  page,
}) => {
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
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page);
  await usage.selectPoint("Nov 1 · 1,950", "keyboard");
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
  await usage.closeDetail("Nov 1 · 1,950");
  await usage.selectPoint("Nov 2 · 3,900", "keyboard");
  await usage.showsFact("Ended", { at: day(2), outcome: "Completed" });
  await usage.closeDetail("Nov 2 · 3,900");
  await usage.selectPoint("Nov 3 · 5,850", "pointer");
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
