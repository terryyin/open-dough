// The usage store the System settings → Usage journeys open: finished
// dashboard Codex tasks of Open Dough written into the server's HOME, and
// what each journey expects the page to read for them, its point's readout
// and the moving average's figure, from the task's counters under the
// product's tariff.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../dashboard/server/usageHistory.ts";
import type { UsageTokens } from "../../dashboard/server/usageRecords.ts";
import { codexTariff } from "../../dashboard/server/usageTariffs.ts";

export const sol = "gpt-6.1-sol";
export const astra = "gpt-6-astra";

// "Nov 3" on the reader's clock, and a whole figure such as "12,345".
const dayWords = (at: string) =>
  new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const figureWords = (value: number) =>
  Math.round(value).toLocaleString("en-US");

type Counters = Pick<UsageTokens, "uncachedInput" | "cacheRead" | "output">;
export type Response = {
  readonly model: string;
  readonly effort: string;
  readonly worker?: true;
  readonly tokens: Counters;
};

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

// A finished dashboard Codex task of Open Dough ending on day `day` of
// November, a recovered one recording the skill its workflow ran, and the
// readout its point shows.
export function finishedTask(
  name: string,
  workflow: "execution" | "refinement",
  day: number,
  responses: readonly Response[],
  { recovered = false }: { readonly recovered?: boolean } = {},
) {
  const endedAt = `2026-11-${String(day).padStart(2, "0")}T12:00:00.000Z`;
  const index = indexOf(responses);
  return {
    history: {
      task: {
        id: name.toLowerCase().replaceAll(" ", "-"),
        kind: recovered ? ("recovered" as const) : ("launch" as const),
        origin: "dashboard" as const,
        project: "open-dough",
        workflow: recovered ? "dough-execute-plan" : workflow,
        title: name,
        ...(recovered
          ? { outcome: null, lastActivityAt: endedAt }
          : { outcome: { kind: "reported-complete" as const, at: endedAt } }),
      },
      responses,
    },
    index,
    readout: `${dayWords(endedAt)} · ${figureWords(index)}`,
  };
}

export type FinishedTask = ReturnType<typeof finishedTask>;

// Writes the tasks as the usage store in `home`, and returns its file.
export async function writeUsageStore(
  home: string,
  tasks: readonly FinishedTask[],
) {
  const store = usageHistoryFile(home);
  await writeUsageHistory(
    makeMe.aUsageHistory
      .with({ tasks: tasks.map(({ history }) => history) })
      .please(),
    store,
  );
  return store;
}

export const readouts = (tasks: readonly FinishedTask[]) =>
  tasks.map(({ readout }) => readout);

// The latest ten tasks' mean index, as its figure.
export const averageOf = (tasks: readonly FinishedTask[]) =>
  figureWords(tasks.slice(-10).reduce((sum, { index }) => sum + index, 0) / 10);
