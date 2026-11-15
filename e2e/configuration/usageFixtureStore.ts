// The usage store the System settings → Usage journeys open: dashboard Codex
// tasks of Open Dough written into the server's HOME, stated directly or as
// an import of their launch records stores them, and what each journey
// expects the page to read for them, its point's readout and the moving
// average's figure, from the task's counters under the product's tariff; and
// the Codex rollout a launch's session writes with those responses.
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../dashboard/server/usageHistory.ts";
import type {
  UsageTask,
  UsageTokens,
} from "../../dashboard/server/usageRecords.ts";
import { codexTariff } from "../../dashboard/server/usageTariffs.ts";
import { writeCodexSession } from "../../dashboard/tests/usage-history/importHarness.ts";

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
  readonly serviceTier?: string;
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

// A stored task with its responses, the last of them at `endedAt`, and any
// worker gaps its import records, and the readout its point shows when it
// ends then, partial with such a gap.
function storedTask(
  task: Pick<UsageTask, "id"> & Partial<UsageTask>,
  responses: readonly Response[],
  endedAt: string,
  workerGaps: readonly string[] = [],
) {
  const index = indexOf(responses);
  return {
    history: {
      task,
      responses: responses.map((response) => ({ at: endedAt, ...response })),
      workerGaps,
    },
    index,
    readout: `${dayWords(endedAt)} · ${figureWords(index)}${workerGaps.length === 0 ? "" : " · Partial"}`,
  };
}

export type StoredTask = ReturnType<typeof storedTask>;

// A finished dashboard Codex task of Open Dough ending on day `day` of
// November unless another month is stated, a recovered one recording the
// skill its workflow ran, with any worker gaps its import records.
export function finishedTask(
  name: string,
  workflow: "execution" | "refinement",
  day: number,
  responses: readonly Response[],
  {
    recovered = false,
    month = "2026-11",
    workerGaps = [],
  }: {
    readonly recovered?: boolean;
    readonly month?: string;
    readonly workerGaps?: readonly string[];
  } = {},
) {
  const endedAt = `${month}-${String(day).padStart(2, "0")}T12:00:00.000Z`;
  return storedTask(
    {
      id: name.toLowerCase().replaceAll(" ", "-"),
      kind: recovered ? "recovered" : "launch",
      origin: "dashboard",
      project: "open-dough",
      workflow: recovered ? "dough-execute-plan" : workflow,
      title: name,
      ...(recovered
        ? { outcome: null, lastActivityAt: endedAt }
        : { outcome: { kind: "reported-complete", at: endedAt } }),
    },
    responses,
    endedAt,
    workerGaps,
  );
}

// A launch as an import of its launch record stores it (`task`, from
// ../../dashboard/server/retainedUsageTasks.ts), last active at
// `lastActivityAt`, which places it unless it reported an outcome.
export function launchedTask(
  task: UsageTask,
  responses: readonly Response[],
  lastActivityAt: string,
) {
  return storedTask(
    { ...task, lastActivityAt },
    responses,
    task.outcome?.at ?? lastActivityAt,
  );
}

// Writes the tasks as the usage store in `home`, and returns its file.
export async function writeUsageStore(
  home: string,
  tasks: readonly StoredTask[],
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

// The task's Token index as its detail reads it.
export const indexWords = (task: StoredTask) => figureWords(task.index);

export const readouts = (tasks: readonly StoredTask[]) =>
  tasks.map(({ readout }) => readout);

// The latest ten tasks' mean index, as its figure.
export const averageOf = (tasks: readonly StoredTask[]) =>
  figureWords(tasks.slice(-10).reduce((sum, { index }) => sum + index, 0) / 10);

// Writes the rollout Codex keeps in `home` for the session's root turn
// `turnId`, holding the responses in its own model and effort contexts.
export function codexRollout(
  home: string,
  sessionId: string,
  turnId: string,
  responses: readonly Response[],
) {
  const rollout = makeMe.aCodexRollout.forSession(sessionId);
  responses.forEach(({ model, effort, tokens }, at) =>
    rollout
      .withTurnContext(turnId, model, effort)
      .withResponse(turnId, `${sessionId}-${String(at)}`, {
        input_tokens: (tokens.uncachedInput ?? 0) + (tokens.cacheRead ?? 0),
        cached_input_tokens: tokens.cacheRead ?? 0,
        cache_write_input_tokens: 0,
        output_tokens: tokens.output ?? 0,
      }),
  );
  writeCodexSession(
    path.join(home, ".codex/sessions/2026/11"),
    rollout.please(),
  );
}
