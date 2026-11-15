// Representative real-store journeys; pricing/eligibility variants belong to
// backend token-index tests, display variants to frontend system-settings-usage.
import {
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { usageCheckFile } from "../../dashboard/server/usageCheck.ts";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../dashboard/server/usageHistory.ts";
import { keepLaunchStore } from "../../dashboard/tests/support/launchStore.ts";
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import { visitUsage } from "../../dashboard/tests/support/systemSettingsUsagePage.ts";
import { writeCodexSession } from "../../dashboard/tests/usage-history/importHarness.ts";

const sol = "gpt-6.1-sol";
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("Usage shows the finished-task trend and opens a task from the chosen cohort", async ({
  page,
}) => {
  const executions = [...Array<number>(10).keys()].map((at) =>
    makeMe.aUsageTaskHistory
      .identifiedAs(`execution-${String(at + 1)}`)
      .endedAt(day(at + 1))
      .please(),
  );
  const refinements = [
    makeMe.aUsageTaskHistory
      .identifiedAs("sol-refinement")
      .inWorkflow("refinement")
      .endedAt(day(11))
      .withResponse({ effort: "high" })
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("astra-refinement")
      .inWorkflow("refinement")
      .endedAt(day(12))
      .withResponse({ model: "gpt-6-astra", effort: "medium" })
      .please(),
  ];
  const store = usageHistoryFile(fixture.home);
  await writeUsageHistory(
    makeMe.aUsageHistory
      .with({ tasks: [...executions, ...refinements] })
      .please(),
    store,
  );
  const server = await fixture.start("preview");
  const usage = await visitUsage(page, server.baseURL);

  await usage.showsCohort({
    Tool: "Codex",
    "Launch workflow": "Execution",
    Model: "All models",
    Effort: "Any effort",
  });
  await usage.showsPoints(
    [...Array<number>(10).keys()].map((at) => `Nov ${String(at + 1)} · 1,950`),
  );
  await usage.showsMedian("1,950");
  await usage.showsTariff(
    "Codex rate card read 2026-11-15 · standard speed · GPT-6.1 Sol input-token equivalents",
  );
  await usage.showsCheckedAt(statSync(store).mtime.toISOString());
  await usage.offers("Launch workflow", ["Execution", "Refinement", "Ad hoc"]);
  await usage.offers("Model", ["All models", "GPT-6.1 Sol", "GPT-6 Astra"]);
  await usage.offers("Effort", ["Any effort", "xhigh", "high", "medium"]);
  await usage.choose("Launch workflow", "Refinement");
  await usage.showsPoints(["Nov 11 · 1,950", "Nov 12 · 12,000"]);
  await usage.choose("Model", "GPT-6 Astra");
  await usage.showsPoints(["Nov 12 · 12,000"]);
  await usage.choose("Model", "All models");
  await usage.choose("Effort", "high");
  await usage.showsPoints(["Nov 11 · 1,950"]);
  await usage.selectPoint("Nov 11 · 1,950", "pointer");
  await usage.showsFact("Observed model", "GPT-6.1 Sol · high effort");
  await usage.closeDetail("Nov 11 · 1,950");
});

test("Refresh keeps the chart while checking, adds new launch usage, and preserves the result on failure", async ({
  page,
}) => {
  const store = usageHistoryFile(fixture.home);
  await writeUsageHistory(
    makeMe.aUsageHistory
      .with({ tasks: [makeMe.aUsageTaskHistory.endedAt(day(3)).please()] })
      .please(),
    store,
  );
  const importedAt = statSync(store).mtime.toISOString();
  keepLaunchStore(fixture.home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-9#refresh", title: "Refresh usage" })
        .inCodexSession({ sessionId: "new-launch" })
        .launchedAt(day(6))
        .withFirstInput({ state: "confirmed", turnId: "first-turn" })
        .completedWith({ message: "", receivedAt: day(6) })
        .please(),
    ],
  });
  writeCodexSession(
    path.join(fixture.home, ".codex/sessions/2026/11"),
    makeMe.aCodexRollout
      .forSession("new-launch")
      .withTurnContext("first-turn", sol, "xhigh")
      .withResponse("first-turn", "new-response", {
        input_tokens: 10_000,
        cached_input_tokens: 9_000,
        cache_write_input_tokens: 0,
        output_tokens: 100,
      })
      .please(),
  );
  const server = await fixture.start("preview");
  const usage = await visitUsage(page, server.baseURL);
  await usage.showsPoints(["Nov 3 · 1,950"]);
  await usage.showsCheckedAt(importedAt);
  await usage.chooseDays("20");
  await usage.showsPoints(["Nov 3 · 1,950"]);

  const lock = `${store}.lock`;
  mkdirSync(lock);
  try {
    await usage.refresh();
    await usage.showsChecking();
    await usage.showsPoints(["Nov 3 · 1,950"]);
    await usage.showsCheckedAt(importedAt);
  } finally {
    rmSync(lock, { recursive: true });
  }
  await usage.showsPoints(["Nov 3 · 1,950", "Nov 6 · 1,950"]);
  await usage.showsChecked();
  await usage.showsDays("20");
  const { checkedAt } = JSON.parse(
    readFileSync(usageCheckFile(store), "utf8"),
  ) as { checkedAt: string };
  await usage.showsCheckedAt(checkedAt);

  writeFileSync(store, "{ not a usage store");
  await usage.refresh();
  await usage.showsProblem(
    `Usage could not be refreshed: Usage history is unreadable: ${store}`,
  );
  await usage.showsChecked();
  await usage.showsPoints(["Nov 3 · 1,950", "Nov 6 · 1,950"]);
  await usage.showsCheckedAt(checkedAt);
  await usage.showsDays("20");
});
