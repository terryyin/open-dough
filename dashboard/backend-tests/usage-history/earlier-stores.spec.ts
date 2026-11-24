// A store an earlier dashboard wrote, whole-document v1 or paged, is the
// starting history. The importer writes its responses without a whole-scan string.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { once } from "node:events";
import fs from "node:fs";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
  type UsageImportOptions,
} from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import {
  test,
  expect,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

const budget = 128 * 1024;

const importOptions = (home: string, root: string) =>
  makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();

async function importUnderCodecBudget(options: UsageImportOptions) {
  const importer = new URL("../../server/usageImport.ts", import.meta.url);
  const source = `
    import { workerData } from "node:worker_threads";
    import { importUsageHistory } from ${JSON.stringify(importer.href)};
    const stringify = JSON.stringify;
    JSON.stringify = (...args) => {
      const text = stringify(...args);
      if (text && Buffer.byteLength(text) > ${budget}) throw new Error("bounded codec budget exceeded");
      return text;
    };
    await importUsageHistory(workerData);
  `;
  const worker = new Worker(
    new URL(`data:text/javascript,${encodeURIComponent(source)}`),
    {
      workerData: options,
    },
  );
  try {
    const [code] = (await once(worker, "exit")) as [number];
    expect(code).toBe(0);
  } finally {
    await worker.terminate();
  }
}

test("a legacy v1 store is read as the starting history, keeps its tasks, gaps and totals in the document a write stores, and survives removal of native inputs", async ({
  home,
  root,
}) => {
  const options = importOptions(home, root);
  const { store, responses } = options;
  const task = makeMe.aUsageTask
    .with({
      id: "legacy",
      sessionId: "legacy-session",
      title: "Retained title",
    })
    .please();
  keepOperationalLaunch(home, launch("legacy-native", "legacy-turn"));
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("legacy-native")
      .withResponse("legacy-turn", "prior", { output_tokens: 4 })
      .please(),
  );
  await importUsageHistory(options);
  const prior = await readUsageHistory(store);
  const native = JSON.parse(
    fs.readFileSync(responses, "utf8"),
  ) as UsageResponses;
  const [launched] = Object.values(prior.tasks);
  assert(launched);
  // Literal v1 wire representation is the compatibility promise under proof.
  fs.writeFileSync(
    store,
    JSON.stringify({
      version: 1,
      tasks: { ...prior.tasks, legacy: task },
      observations: native.observations,
      associations: native.associations,
      gaps: [
        ...prior.gaps,
        { code: "legacy-gap", sessionId: "legacy-session" },
      ],
    }),
  );
  const started = await readUsageHistory(store);
  expect(started.format).toBe("usage-history-v2");
  expect(started.tasks.legacy?.title).toBe("Retained title");
  expect(taskUsage(started, launched.id)).toMatchObject({
    requests: 1,
    tokens: { output: 4 },
  });
  keepOperationalLaunch(home, launch("new-session", "turn"));
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("new-session")
      .withResponse("turn", "one", { output_tokens: 7 })
      .please(),
  );
  await importUsageHistory(options);
  const after = await readUsageHistory(store);
  expect(after.tasks.legacy).toMatchObject({
    id: "legacy",
    sessionId: "legacy-session",
    title: "Retained title",
  });
  expect(after.gaps).toContainEqual({
    code: "legacy-gap",
    sessionId: "legacy-session",
  });
  expect(
    Object.values(after.tasks).map(
      (item) => taskUsage(after, item.id).tokens.output,
    ),
  ).toEqual([4, null, 7]);
  const output = JSON.parse(
    fs.readFileSync(responses, "utf8"),
  ) as UsageResponses;
  expect(Object.keys(output.observations)).toHaveLength(2);
  expect(Object.keys(output.associations)).toHaveLength(2);
  expect(JSON.parse(fs.readFileSync(store, "utf8"))).toEqual(after);
  const fields = Object.keys(after).sort();
  expect(fields).toEqual(["format", "gaps", "sessions", "tasks"]);
  fs.rmSync(root, { recursive: true });
  expect(await readUsageHistory(store)).toEqual(after);
  expect(JSON.parse(fs.readFileSync(responses, "utf8"))).toEqual(output);
});

test("an import writes the responses it read beyond the codec budget one at a time, beside a history that keeps their totals", async ({
  home,
  root,
}) => {
  const options = importOptions(home, root);
  const { store, responses } = options;
  keepOperationalLaunch(home, launch("bounded", "turn"));
  const rollout = makeMe.aCodexRollout.forSession("bounded");
  for (const index of [...Array<number>(300).keys()]) {
    rollout.withResponse("turn", `response-${index}`, {
      input_tokens: 10,
      cached_input_tokens: 0,
      cache_write_input_tokens: 0,
      output_tokens: 3,
    });
  }
  const transcript = writeCodexSession(root, rollout.please());
  await importUnderCodecBudget(options);
  expect(fs.statSync(responses).size).toBeGreaterThan(budget);
  const output = JSON.parse(
    fs.readFileSync(responses, "utf8"),
  ) as UsageResponses;
  const observations = Object.values(output.observations);
  expect(observations).toHaveLength(300);
  const observed = observations.every(({ measurements }) =>
    measurements.some(
      ({ source }) => source.file === transcript && source.line,
    ),
  );
  expect(observed).toBe(true);
  const history = await readUsageHistory(store);
  const [task] = Object.values(history.tasks);
  assert(task);
  const associated = Object.values(output.associations).every(
    ({ taskId }) => taskId === task.id,
  );
  expect(associated).toBe(true);
  expect(taskUsage(history, task.id)).toMatchObject({
    requests: 300,
    tokens: { output: 900 },
  });
  await importUnderCodecBudget(options);
  expect(await readUsageHistory(store)).toEqual(history);
  expect(JSON.parse(fs.readFileSync(responses, "utf8"))).toEqual(output);
});

test("an earlier paged store and reordered gap replay retain one equivalent coverage fact", async ({
  home,
  root,
}) => {
  const options = importOptions(home, root);
  const file = options.store;
  const source = { kind: "native" as const, file: "native://missing", line: 7 };
  // Literal old paged wire keys used the caller's property order, before schema
  // parsing. This must migrate as well as the older monolithic v1 document.
  const gap = {
    code: "old-gap",
    host: "codex" as const,
    sessionId: "gap-session",
    source,
  };
  const key = JSON.stringify(gap);
  const name = `${"b".repeat(64)}.json`;
  fs.mkdirSync(`${file}.pages`, { recursive: true });
  fs.writeFileSync(
    path.join(`${file}.pages`, name),
    JSON.stringify([[key, gap, 0]]),
  );
  const partition = createHash("sha256").update(key).digest("hex").slice(0, 2);
  fs.writeFileSync(
    file,
    JSON.stringify({
      format: "usage-pages-v1",
      version: 1,
      next: { tasks: 0, observations: 0, associations: 0, gaps: 1 },
      pages: { [`gaps:${partition}`]: [name] },
    }),
  );
  expect(
    (await readUsageHistory(file)).gaps.filter(
      (item) => item.code === "old-gap",
    ),
  ).toHaveLength(1);
  const { code, host, sessionId } = gap;
  await writeUsageHistory({ gaps: [{ source, sessionId, host, code }] }, file);
  await importUsageHistory(options);
  const updated = await readUsageHistory(file);
  const retained = updated.gaps.filter((item) => item.code === code);
  expect(retained).toEqual([gap]);
});
