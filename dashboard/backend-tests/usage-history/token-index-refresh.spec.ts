// Refresh at the boundary server over raw HTTP (../../server/usageBoundary.ts),
// with launch records, an imported usage store and Codex rollouts in the
// server's HOME. Refresh reads the rollouts modified since the last check,
// and the rollouts of the workers they spawned, adds a newly finished launch
// from the current launch records, and assigns its responses as a full import
// of the same rollouts does. Refreshing again without new rollout activity
// changes no summary value or stored response, concurrent Refreshes share
// one run, and an overlapping import counts each response once. A Refresh
// that cannot read the store fails readably and leaves the summary and the
// check time as they were. The page's journey is
// ../../../e2e/configuration/system-settings-usage-refresh.spec.ts.
import {
  appendFileSync,
  cpSync,
  mkdirSync,
  readFileSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import { responseKey, type UsageHistory } from "../../server/usageRecords.ts";
import { usageTaskSummaryFile } from "../../server/usageTaskSummary.ts";
import type { TokenIndexAnswer } from "../../src/usageTokenIndex.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { projectConfigurationFile } from "../../tests/support/projectConfiguration.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { systemSettingsMachine } from "../../tests/support/systemSettingsMachine.ts";
import {
  readStoredRows,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

const sol = "gpt-6.1-sol";
const longAgo = new Date("2026-11-01T00:00:00.000Z");
const counters = (output: number) => ({
  input_tokens: 10_000,
  cached_input_tokens: 8_000,
  cache_write_input_tokens: 0,
  output_tokens: output,
});

function configureOpenDough(home: string) {
  const file = projectConfigurationFile(home, "production");
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(
    file,
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({
          id: "open-dough",
          label: "Open Dough",
          repository: "terryyin/open-dough",
          localPath: "~/git/open-dough",
        })
        .please(),
    ]),
  );
}

// A finished execution launch in its own Codex session, whose first turn is
// `<session>-turn`.
const finished = (session: string) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-7#${session}`, title: `Story ${session}` })
    .inCodexSession({ sessionId: session })
    .launchedAt("2026-11-14T09:00:00.000Z")
    .withFirstInput({ state: "confirmed", turnId: `${session}-turn` })
    .completedWith({ message: "" })
    .please();

// The root's rollout of the launch's session, with one response per output.
function rootRollout(session: string, ...outputs: number[]) {
  const rollout = makeMe.aCodexRollout
    .forSession(session)
    .withTurnContext(`${session}-turn`, sol, "xhigh");
  for (const output of outputs)
    rollout.withResponse(
      `${session}-turn`,
      `${session}-${String(output)}`,
      counters(output),
    );
  return rollout;
}

// A worker the parent spawned, whose own response belongs to the parent's
// first turn.
const workerRows = (parent: string, worker: string) =>
  makeMe.aCodexRollout
    .forSession(worker)
    .withParent(parent)
    .withTurnContext(`${worker}-turn`, sol, "xhigh")
    .withResponse(`${worker}-turn`, `${worker}-own`, counters(70), {
      rootTurnId: `${parent}-turn`,
    })
    .please();

// Each stored response's task, by response.
const assignments = (history: UsageHistory) =>
  Object.fromEntries(
    Object.values(history.associations).map((association) => [
      association.observationId,
      association.taskId,
    ]),
  );

function usageServer(baseURL: string, origin: string) {
  const request = async (method: "GET" | "POST", endpoint: string) => {
    const answer = await rawRequest({
      url: `${baseURL}${endpoint}`,
      method,
      headers: { Origin: origin },
    });
    return { status: answer.status, body: JSON.parse(answer.body) as unknown };
  };
  return {
    request,
    async refresh() {
      const { status, body } = await request("POST", "/__usage/refresh");
      expect(status, JSON.stringify(body)).toBe(200);
      return (body as { checkedAt: string }).checkedAt;
    },
    async chart() {
      const { status, body } = await request("GET", "/__usage/token-index");
      expect(status, JSON.stringify(body)).toBe(200);
      return body as TokenIndexAnswer;
    },
  };
}

test("Refresh reads rollouts changed since its last check and the workers they spawned, adding a newly finished launch as a full import assigns it, and changes nothing when nothing new was written", async () => {
  const { home } = fixture;
  configureOpenDough(home);
  const sessions = path.join(home, ".codex/sessions");
  const rollouts = path.join(sessions, "2026/11/14");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  const first = writeCodexSession(rollouts, rootRollout("first", 100).please());
  runImport(home, sessions);
  const store = usageHistoryFile(home);
  const server = await fixture.start("boundary");
  const usage = usageServer(server.baseURL, server.origin);
  const lastCheck = await usage.refresh();

  // A rollout last written before that check, though its content changed,
  // is not read again.
  const [late] = makeMe.aCodexRollout
    .forSession("first")
    .withResponse("first-turn", "first-late", counters(5))
    .rows();
  appendFileSync(first, `${JSON.stringify(late)}\n`);
  utimesSync(first, longAgo, longAgo);
  keepLaunchStore(home, {
    "open-dough": [finished("first"), finished("second")],
  });
  writeCodexSession(
    rollouts,
    rootRollout("second", 200).withSpawnedAgent("second-worker").please(),
  );
  // Its worker finished before that check.
  const worker = writeCodexSession(
    rollouts,
    workerRows("second", "second-worker"),
  );
  utimesSync(worker, longAgo, longAgo);
  const checkedAt = await usage.refresh();

  expect(Date.parse(checkedAt)).toBeGreaterThan(Date.parse(lastCheck));
  const chart = await usage.chart();
  expect(chart.checkedAt).toBe(checkedAt);
  expect(
    chart.tasks.map(({ identity, coverage }) => [identity, coverage.kind]),
  ).toEqual([
    ["SEED-7#first", "measured"],
    ["SEED-7#second", "measured"],
  ]);
  const refreshed = assignments(readStoredRows(home));
  expect(Object.keys(refreshed)).not.toContain(
    responseKey("codex", "first", "first-late"),
  );
  expect(
    refreshed[responseKey("codex", "second-worker", "second-worker-own")],
  ).toBe(chart.tasks[1]?.id);

  const imported = path.join(fixture.machine, "imported-home");
  cpSync(home, imported, {
    recursive: true,
    filter: (source) => !path.basename(source).startsWith("usage"),
  });
  runImport(imported, path.join(imported, ".codex/sessions"));
  const full = assignments(readStoredRows(imported));
  for (const [id, task] of Object.entries(refreshed))
    expect([id, full[id]]).toEqual([id, task]);

  const manifest = readFileSync(store);
  const summary = readFileSync(usageTaskSummaryFile(store));
  const [again, alongside] = await Promise.all([
    usage.refresh(),
    usage.refresh(),
  ]);
  expect(alongside).toBe(again);
  expect(Date.parse(again)).toBeGreaterThan(Date.parse(checkedAt));
  expect(await usage.chart()).toEqual({ ...chart, checkedAt: again });
  expect(readFileSync(store)).toEqual(manifest);
  expect(readFileSync(usageTaskSummaryFile(store))).toEqual(summary);

  runImport(home, sessions);
  const overlapped = await usage.chart();
  expect(overlapped.tasks[1]?.index).toBe(chart.tasks[1]?.index);
});

test("a Refresh that cannot read the usage store fails readably and keeps the summary and the check time", async () => {
  const { home } = fixture;
  configureOpenDough(home);
  const sessions = path.join(home, ".codex/sessions");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  writeCodexSession(
    path.join(sessions, "2026/11/14"),
    rootRollout("first", 9).please(),
  );
  runImport(home, sessions);
  const store = usageHistoryFile(home);
  const server = await fixture.start("boundary");
  const usage = usageServer(server.baseURL, server.origin);
  const checkedAt = await usage.refresh();
  const chart = await usage.chart();
  const manifest = readFileSync(store);
  const summary = readFileSync(usageTaskSummaryFile(store));

  writeFileSync(store, "{ not a usage store");
  const failed = await usage.request("POST", "/__usage/refresh");

  expect(failed.status).toBe(503);
  expect(failed.body).toEqual({
    error: `Usage could not be refreshed: Usage history is unreadable: ${store}`,
  });
  expect(readFileSync(usageTaskSummaryFile(store))).toEqual(summary);
  writeFileSync(store, manifest);
  expect(await usage.chart()).toEqual({ ...chart, checkedAt });
});
