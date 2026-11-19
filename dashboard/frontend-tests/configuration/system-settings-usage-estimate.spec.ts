// A refresh that brings an explicit rate replaces the estimate in the point,
// the selected detail and the rate-card warning; another model's warning stays.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  type TokenIndexTask,
  usageRefreshEndpoint,
  usageTokenIndexEndpoint,
} from "../../src/usageTokenIndex.ts";
import { test } from "../../test-support/support/frontendApp.ts";
import { visitUsage } from "../../test-support/support/systemSettingsUsagePage.ts";

const astra = { id: "gpt-6.2-astra", name: "gpt-6.2-astra" };
const nova = {
  model: { id: "gpt-9-nova", name: "gpt-9-nova" },
  substitute: { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
};
const novaWarning =
  "Codex used gpt-9-nova, which is not on its Token Index rate card; estimated at GPT-6.1 Sol rates. The Token Index rate card needs an update.";
// The Astra task first, then a task with a gpt-9-nova worker.
const answer = (astraIndex: number, astraFacts: Partial<TokenIndexTask>) =>
  makeMe.aTokenIndexAnswer
    .with({ indexes: [astraIndex, 1_950] })
    .withTask(0, astraFacts)
    .withTask(1, { substitutions: [nova] })
    .please();
const estimated = answer(12_000, {
  observed: { model: astra, effort: "xhigh" },
  substitutions: [
    { model: astra, substitute: { id: "gpt-6-astra", name: "GPT-6 Astra" } },
  ],
});
const rated = answer(7_800, {
  observed: { model: { ...astra, name: "GPT-6.2 Astra" }, effort: "xhigh" },
});

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
});

test("refreshing to an explicit rate replaces the estimate and keeps another model's warning", async ({
  page,
}) => {
  let current = estimated;
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: current }),
  );
  await page.route(
    (url) => url.pathname === usageRefreshEndpoint,
    (route) =>
      route.fulfill({ json: { checkedAt: "2026-11-15T12:00:00.000Z" } }),
  );
  const usage = await visitUsage(page);
  await usage.showsRateCardWarnings([
    "Codex used gpt-6.2-astra, which is not on its Token Index rate card; estimated at GPT-6 Astra rates. The Token Index rate card needs an update.",
    novaWarning,
  ]);
  await usage.selectPoint("Nov 1 · Codex · 12,000 · Estimated rate", "pointer");
  await usage.showsFact("Estimated rate", "gpt-6.2-astra at GPT-6 Astra rates");

  current = rated;
  await usage.refresh();
  await usage.showsPoints([
    "Nov 1 · Codex · Selected task · 7,800",
    "Nov 2 · Codex · 1,950 · Estimated rate",
  ]);
  await usage.showsFact("Token index", "7,800");
  await usage.showsFact("Observed model", "GPT-6.2 Astra · xhigh effort");
  await usage.showsRateCardWarnings([novaWarning]);
});
