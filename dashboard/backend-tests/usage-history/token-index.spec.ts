// How the usage endpoint (../../server/usageBoundary.ts) weighs finished
// dashboard Codex tasks into the Token index, at the boundary server over raw
// HTTP on a usage store in the server's HOME: the seed's single-response
// example, a GPT-6 Astra worker inside a GPT-6.1 Sol task, configured
// projects (hidden ones included), and a derivation that leaves the store
// byte-identical and its summary rebuildable; and a later tariff version
// weighing the same derived summary again. The page's journey is
// ../../../e2e/configuration/system-settings-usage.spec.ts.
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { projectConfigurationFile } from "../../tests/support/projectConfiguration.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { systemSettingsMachine } from "../../tests/support/systemSettingsMachine.ts";
import type { UsageTokens } from "../../server/usageRecords.ts";
import { tokenIndexCohort } from "../../server/tokenIndexCohort.ts";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  deriveUsageTaskSummary,
  usageTaskSummaryFile,
} from "../../server/usageTaskSummary.ts";
import { codexTariff, type UsageTariff } from "../../server/usageTariffs.ts";
import type { TokenIndexAnswer } from "../../src/usageTokenIndex.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

const sol = "gpt-6.1-sol";
const astra = "gpt-6-astra";

// A finished Codex Execution launch, from the dashboard unless stated, and
// its responses: the root's, in its first turn unless stated, or a worker's.
function execution(
  name: string,
  {
    project,
    endedAt,
    origin = "dashboard",
  }: {
    readonly project: string;
    readonly endedAt: string;
    readonly origin?: "dashboard" | "native" | "unknown";
  },
  responses: readonly {
    readonly model: string;
    readonly worker?: true;
    readonly turnId?: string;
    readonly tokens: Partial<UsageTokens>;
  }[],
) {
  const task = makeMe.aUsageTask
    .with({
      id: name,
      sessionId: name,
      kind: "launch",
      origin,
      project,
      workflow: "execution",
      title: name,
      outcome: { kind: "reported-complete", at: endedAt },
    })
    .please();
  const observations = responses.map((response, index) =>
    makeMe.aUsageObservation
      .with({
        sessionId: response.worker ? `${name}-worker` : name,
        ...(response.worker ? { parentSessionId: name } : {}),
        responseId: `response-${String(index)}`,
        ...(response.turnId ? { turnId: response.turnId } : {}),
        settings: { model: response.model },
        tokens: response.tokens,
      })
      .please(),
  );
  return {
    tasks: [task],
    observations,
    associations: observations.map((observation) =>
      makeMe.aUsageAssociation.with({ observation, task }).please(),
    ),
  };
}

// Credits of stated counters at one model's rates, in the product tariff.
const credits = (
  model: string,
  tokens: { uncachedInput: number; cacheRead: number; output: number },
  tariff: UsageTariff = codexTariff,
) => {
  const rates = tariff.models[model];
  if (rates === undefined) throw new Error(`No rate for ${model}`);
  return (
    tokens.uncachedInput * rates.input +
    tokens.cacheRead * rates.cachedInput +
    tokens.output * rates.output
  );
};

// Every file of the store: its manifest and pages, by relative path.
function storeFiles(store: string): Record<string, string> {
  const files: Record<string, string> = {};
  const pages = `${store}.pages`;
  const hash = (file: string) =>
    createHash("sha256").update(readFileSync(file)).digest("hex");
  files["usage.json"] = hash(store);
  for (const name of readdirSync(pages))
    files[`pages/${name}`] = hash(path.join(pages, name));
  return files;
}

async function tokenIndex(baseURL: string, origin: string) {
  const response = await rawRequest({
    url: `${baseURL}/__usage/token-index`,
    headers: { Origin: origin },
  });
  expect(response.status, response.body).toBe(200);
  return JSON.parse(response.body) as TokenIndexAnswer;
}

test("finished Codex executions of configured projects weigh each response at its own model's rates without changing the store, which a deleted summary is rebuilt from", async () => {
  const projects = projectConfigurationFile(fixture.home, "production");
  mkdirSync(path.dirname(projects), { recursive: true });
  writeFileSync(
    projects,
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({
          id: "open-dough",
          label: "Open Dough",
          repository: "terryyin/open-dough",
          localPath: "~/git/open-dough",
        })
        .please(),
      makeMe.aConfiguredProject
        .with({
          id: "doughnut",
          label: "Doughnut",
          repository: "nerds-odd-e/doughnut",
          localPath: "~/git/doughnut",
          hidden: true,
        })
        .please(),
    ]),
  );
  const seedExample = { uncachedInput: 1_000, cacheRead: 9_000, output: 100 };
  const root = { uncachedInput: 2_000, cacheRead: 3_000, output: 40 };
  // A resumed turn whose input includes cache writes and whose output
  // includes reasoning.
  const resumed = {
    uncachedInput: 500,
    cacheWrite: 200,
    cacheRead: 1_000,
    output: 60,
    reasoningOutput: 45,
  };
  const worker = { uncachedInput: 300, cacheRead: 700, output: 20 };
  const store = usageHistoryFile(fixture.home);
  const at = (day: number) => `2026-11-0${String(day)}T00:00:00.000Z`;
  const parts = [
    execution("single", { project: "open-dough", endedAt: at(2) }, [
      { model: sol, tokens: seedExample },
    ]),
    execution("with-worker", { project: "doughnut", endedAt: at(3) }, [
      { model: sol, tokens: root },
      { model: sol, turnId: "resumed", tokens: resumed },
      { model: astra, worker: true, tokens: worker },
    ]),
    execution("retired", { project: "retired-project", endedAt: at(4) }, [
      { model: sol, tokens: seedExample },
    ]),
    ...(["native", "unknown"] as const).map((origin) =>
      execution(origin, { project: "open-dough", endedAt: at(5), origin }, [
        { model: sol, tokens: seedExample },
      ]),
    ),
  ];
  await writeUsageHistory(
    {
      tasks: parts.flatMap((part) => part.tasks),
      observations: parts.flatMap((part) => part.observations),
      associations: parts.flatMap((part) => part.associations),
    },
    store,
  );
  const before = storeFiles(store);
  const server = await fixture.start("boundary");

  const answer = await tokenIndex(server.baseURL, server.origin);
  const reference = codexTariff.models[codexTariff.reference.model]?.input;
  expect(answer.tasks.map((task) => [task.id, task.index])).toEqual([
    ["single", 1_950],
    [
      "with-worker",
      (credits(sol, root) +
        credits(sol, {
          uncachedInput: resumed.uncachedInput + resumed.cacheWrite,
          cacheRead: resumed.cacheRead,
          output: resumed.output,
        }) +
        credits(astra, worker)) /
        (reference ?? NaN),
    ],
  ]);
  expect(answer.tariff.version).toBe(codexTariff.version);
  expect(storeFiles(store)).toEqual(before);

  // The summary is a rebuildable file beside the store.
  rmSync(usageTaskSummaryFile(store));
  expect((await tokenIndex(server.baseURL, server.origin)).tasks).toEqual(
    answer.tasks,
  );
  expect(storeFiles(store)).toEqual(before);
});

test("a later tariff version weighs the same derived counters again", async () => {
  const counters = { uncachedInput: 1_000, cacheRead: 9_000, output: 100 };
  const store = usageHistoryFile(fixture.home);
  await writeUsageHistory(
    execution(
      "single",
      { project: "open-dough", endedAt: "2026-11-02T00:00:00.000Z" },
      [{ model: sol, tokens: counters }],
    ),
    store,
  );
  const later: UsageTariff = {
    ...codexTariff,
    version: "later",
    models: { [sol]: { input: 100, cachedInput: 10, output: 400 } },
  };

  const reweighed = tokenIndexCohort(
    await deriveUsageTaskSummary(store),
    ["open-dough"],
    later,
  );

  expect(reweighed.tasks.map((task) => task.index)).toEqual([
    credits(sol, counters, later) / (later.models[sol]?.input ?? NaN),
  ]);
});
