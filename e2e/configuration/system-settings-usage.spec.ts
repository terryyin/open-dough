// Terry opens System settings → Usage on a machine whose usage store holds
// twelve finished dashboard Codex Execution tasks on GPT-6.1 Sol, one of them
// recovered and one with a GPT-6 Astra worker. Usage is its own view beside
// General and shows, for Codex, Execution, All models and Any effort, one
// Token index point per task over its end time, the trailing 10-task moving
// average, the tariff version and when the usage was checked. How the
// endpoint weighs responses and leaves the store unchanged is
// ../../dashboard/backend-tests/usage-history/token-index.spec.ts.
import { readFileSync } from "node:fs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../dashboard/server/usageHistory.ts";
import type { UsageTokens } from "../../dashboard/server/usageRecords.ts";
import { usageTaskSummaryFile } from "../../dashboard/server/usageTaskSummary.ts";
import { codexTariff } from "../../dashboard/server/usageTariffs.ts";
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import {
  expectGeneralSettingsShown,
  openUsage,
} from "../../dashboard/tests/support/systemSettingsUsagePage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

// "Nov 3" on the reader's clock, and a whole figure such as "12,345".
const dayWords = (at: string) =>
  new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const figureWords = (value: number) =>
  Math.round(value).toLocaleString("en-US");

type Counters = Pick<UsageTokens, "uncachedInput" | "cacheRead" | "output">;
type Response = { readonly model: string; readonly tokens: Counters };

// The task's Token index from its counters under the product's tariff.
function indexOf(responses: readonly Response[]): number {
  const reference = codexTariff.models[codexTariff.reference.model];
  let credits = 0;
  for (const { model, tokens } of responses) {
    const rates = codexTariff.models[model];
    if (rates === undefined || reference === undefined)
      throw new Error(`No rate for ${model}`);
    credits +=
      (tokens.uncachedInput ?? 0) * rates.input +
      (tokens.cacheRead ?? 0) * rates.cachedInput +
      (tokens.output ?? 0) * rates.output;
  }
  return credits / (reference?.input ?? NaN);
}

test("Usage shows each finished Codex execution's Token index with the 10-task moving average and the tariff version", async ({
  page,
}) => {
  const tasks = [...Array<number>(12).keys()].map((day) => {
    const name = `execution-${String(day)}`;
    const endedAt = `2026-11-${String(day + 1).padStart(2, "0")}T12:00:00.000Z`;
    const recovered = day === 0;
    const responses: { session: string; response: Response }[] = [
      {
        session: name,
        response: {
          model: "gpt-6.1-sol",
          tokens: {
            uncachedInput: 1_000 * (day + 1),
            cacheRead: 20_000 - 1_000 * day,
            output: 150 + 37 * day,
          },
        },
      },
    ];
    if (day === 7)
      responses.push({
        session: `${name}-worker`,
        response: {
          model: "gpt-6-astra",
          tokens: { uncachedInput: 4_000, cacheRead: 6_000, output: 500 },
        },
      });
    const task = makeMe.aUsageTask
      .with({
        id: name,
        sessionId: name,
        kind: recovered ? "recovered" : "launch",
        origin: "dashboard",
        project: "open-dough",
        workflow: recovered ? "dough-execute-plan" : "execution",
        title: `Execution ${String(day)}`,
        ...(recovered
          ? { outcome: null, lastActivityAt: endedAt }
          : { outcome: { kind: "reported-complete" as const, at: endedAt } }),
      })
      .please();
    const observations = responses.map(({ session, response }, index) =>
      makeMe.aUsageObservation
        .with({
          sessionId: session,
          ...(session === name ? {} : { parentSessionId: name }),
          responseId: `response-${String(index)}`,
          settings: { model: response.model, effort: "xhigh" },
          tokens: response.tokens,
        })
        .please(),
    );
    return {
      task,
      observations,
      endedAt,
      index: indexOf(responses.map(({ response }) => response)),
    };
  });
  const store = usageHistoryFile(fixture.home);
  await writeUsageHistory(
    {
      tasks: tasks.map(({ task }) => task),
      observations: tasks.flatMap(({ observations }) => observations),
      associations: tasks.flatMap(({ task, observations }) =>
        observations.map((observation) =>
          makeMe.aUsageAssociation.with({ observation, task }).please(),
        ),
      ),
    },
    store,
  );
  const server = await fixture.start("preview");

  await page.goto(`${server.baseURL}/?view=settings`);
  await expectGeneralSettingsShown(page);
  const usage = await openUsage(page);

  await usage.showsCohort({
    Tool: "Codex",
    "Launch workflow": "Execution",
    Model: "All models",
    Effort: "Any effort",
  });
  await usage.showsPoints(
    tasks.map(
      ({ endedAt, index }) => `${dayWords(endedAt)} · ${figureWords(index)}`,
    ),
  );
  const latestTen = tasks.slice(-10);
  await usage.showsAverage(
    figureWords(latestTen.reduce((sum, { index }) => sum + index, 0) / 10),
  );
  await usage.showsTariff(codexTariff.label);
  const summary = JSON.parse(
    readFileSync(usageTaskSummaryFile(store), "utf8"),
  ) as { checkedAt: string };
  await usage.showsCheckedAt(summary.checkedAt);
});
