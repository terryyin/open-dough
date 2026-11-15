// Real usage persistence and HTTP mechanics shared by Token index service tests.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { TaskHistoryFacts } from "../../../Distribution/tests/support/usageStoreTestData.mjs";
import { tokenIndexCohort } from "../../server/tokenIndexCohort.ts";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import type { UsageBatch } from "../../server/usageRecords.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { codexTariff, type UsageTariff } from "../../server/usageTariffs.ts";
import {
  defaultCohort,
  type TokenIndexAnswer,
  type TokenIndexCohort,
} from "../../src/usageTokenIndex.ts";
import { expect, test as base } from "../support/pageTest.ts";
import { projectConfigurationFile } from "../support/projectConfiguration.ts";
import { rawRequest } from "../support/rawHttp.ts";
import { systemSettingsMachine } from "../support/systemSettingsMachine.ts";

type Machine = ReturnType<typeof systemSettingsMachine>;
export const test = base.extend<{ machine: Machine }>({
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = systemSettingsMachine();
    configureProjects(machine.home);
    try {
      await use(machine);
    } finally {
      await machine.close();
    }
  },
});
export { expect };

export function configureProjects(
  home: string,
  projects = [
    makeMe.aConfiguredProject
      .with({
        id: "open-dough",
        label: "Open Dough",
        repository: "terryyin/open-dough",
        localPath: "~/git/open-dough",
      })
      .please(),
  ],
) {
  const file = projectConfigurationFile(home, "production");
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(projects));
}

export async function writeTaskUsage(
  home: string,
  tasks: readonly TaskHistoryFacts[],
) {
  const store = usageHistoryFile(home);
  await writeUsageHistory(makeMe.aUsageHistory.with({ tasks }).please(), store);
  return store;
}

export async function readCohort(
  home: string,
  history: UsageBatch,
  tariff: UsageTariff = codexTariff,
) {
  const store = usageHistoryFile(home);
  await writeUsageHistory(history, store);
  const summary = await deriveUsageTaskSummary(store);
  return (selection: Partial<TokenIndexCohort> = {}) =>
    tokenIndexCohort(
      summary,
      {
        projects: new Map([["open-dough", "Open Dough"]]),
        launches: new Map(),
        tariff,
      },
      { ...defaultCohort, ...selection },
    );
}

export async function usageServer(machine: Machine) {
  const { baseURL, origin } = await machine.start("boundary");
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
    async chart() {
      const { status, body } = await request("GET", "/__usage/token-index");
      expect(status, JSON.stringify(body)).toBe(200);
      return body as TokenIndexAnswer;
    },
    async refresh() {
      const { status, body } = await request("POST", "/__usage/refresh");
      expect(status, JSON.stringify(body)).toBe(200);
      return (body as { checkedAt: string }).checkedAt;
    },
  };
}

// The store's one file, its history document.
export function storeHashes(store: string) {
  return {
    [store]: createHash("sha256").update(readFileSync(store)).digest("hex"),
  };
}
