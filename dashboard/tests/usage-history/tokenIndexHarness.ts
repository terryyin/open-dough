// Real usage persistence and HTTP mechanics shared by Token index service tests.
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { TaskHistoryFacts } from "../../../Distribution/tests/support/usageStoreTestData.mjs";
import { tokenIndexCohort } from "../../server/tokenIndexCohort.ts";
import { usageCheckFile } from "../../server/usageCheck.ts";
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

// A finished execution launch of story `SEED-7#<session>` in that Codex
// session, whose first turn is `<session>-turn`.
export const finished = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-7#${sessionId}`, title: `Story ${sessionId}` })
    .inCodexSession({ sessionId })
    .launchedAt("2026-11-14T09:00:00.000Z")
    .withFirstInput({ state: "confirmed", turnId: `${sessionId}-turn` })
    .completedWith({ message: "" })
    .please();
export const counters = (output: number) => ({
  input_tokens: 10_000,
  cached_input_tokens: 8_000,
  cache_write_input_tokens: 0,
  output_tokens: output,
});
export const sol = "gpt-6.1-sol";
// The session's rollout so far: its first turn with one response of `output`.
export const rootRollout = (session: string, output: number) =>
  makeMe.aCodexRollout
    .forSession(session)
    .withTurnContext(`${session}-turn`, sol, "xhigh")
    .withResponse(`${session}-turn`, `${session}-${output}`, counters(output));
// The rollout of `<parent>-worker`, the agent that session's first turn
// spawned, with its one response of 70 output tokens.
export const workerRollout = (parent: string) =>
  makeMe.aCodexRollout
    .forSession(`${parent}-worker`)
    .withParent(parent)
    .withTurnContext("worker-turn", sol, "xhigh")
    .withResponse("worker-turn", "worker-own", counters(70), {
      rootTurnId: `${parent}-turn`,
    });
// Each task's usage as the history in `home` sums it, by story.
export const storedUsage = async (home: string) =>
  new Map(
    (await deriveUsageTaskSummary(usageHistoryFile(home))).tasks.map(
      ({ identity, usage }) => [identity, usage] as const,
    ),
  );

// Every file kept beside the usage history in `home`, by name, as it is
// stored now (content, inode and modification time), without the check
// record: equal when nothing but a check time was written between two reads.
export function storedBesideCheck(home: string) {
  const store = usageHistoryFile(home);
  const directory = path.dirname(store);
  return Object.fromEntries(
    readdirSync(directory, { recursive: true, encoding: "utf8" })
      .map((name) => path.join(directory, name))
      .filter((file) => file !== usageCheckFile(store))
      .toSorted()
      .map((file) => {
        const { ino, mtimeNs } = statSync(file, { bigint: true });
        const content = statSync(file).isFile()
          ? createHash("sha256").update(readFileSync(file)).digest("hex")
          : "directory";
        return [file, [content, ino, mtimeNs]];
      }),
  );
}

// The store's one file, its history document.
export function storeHashes(store: string) {
  return {
    [store]: createHash("sha256").update(readFileSync(store)).digest("hex"),
  };
}
