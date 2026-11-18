// A store an earlier dashboard wrote, whole-document v1 or paged, is the
// starting history; `read` prints the history document; and the responses an
// import read are written without one whole-scan string.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import {
  test,
  expect,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  nodeProcess,
  readImported,
  responsesFile,
  runImport,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

const budget = 128 * 1024;
const boundedCodec = `data:text/javascript,${encodeURIComponent(`
  const stringify = JSON.stringify;
  JSON.stringify = (...args) => {
    const text = stringify(...args);
    if (text && Buffer.byteLength(text) > ${budget}) throw new Error('bounded codec budget exceeded');
    return text;
  };
`)}`;

test("a legacy v1 store is read as the starting history, keeps its tasks, gaps and totals in the document a write stores, and survives removal of native inputs", ({
  home,
  root,
}) => {
  const task = makeMe.aUsageTask
    .with({
      id: "legacy",
      sessionId: "legacy-session",
      title: "Retained title",
    })
    .please();
  const file = path.join(
    home,
    ".open-dough/dashboard/launch-history/usage.json",
  );
  keepOperationalLaunch(home, launch("legacy-native", "legacy-turn"));
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("legacy-native")
      .withResponse("legacy-turn", "prior", { output_tokens: 4 })
      .please(),
  );
  runImport(home, root);
  const prior = readImported(home);
  const [launched] = Object.values(prior.tasks);
  assert(launched);
  mkdirSync(path.dirname(file), { recursive: true });
  // Literal v1 wire representation is the compatibility promise under proof.
  writeFileSync(
    file,
    JSON.stringify({
      version: 1,
      tasks: { ...prior.tasks, legacy: task },
      observations: prior.observations,
      associations: prior.associations,
      gaps: [
        ...prior.gaps,
        { code: "legacy-gap", sessionId: "legacy-session" },
      ],
    }),
  );
  const started = readImported(home);
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
  runImport(home, root);
  const after = readImported(home);
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
  // `read` prints the document the write stored, which holds no response.
  const { observations, associations, ...document } = after;
  expect(Object.keys(observations)).toHaveLength(2);
  expect(Object.keys(associations)).toHaveLength(2);
  expect(JSON.parse(readFileSync(file, "utf8"))).toEqual(document);
  expect(Object.keys(document).sort()).toEqual([
    "format",
    "gaps",
    "sessions",
    "tasks",
  ]);
  nodeProcess(
    home,
    `const { rmSync } = await import('node:fs'); rmSync(${JSON.stringify(root)}, { recursive: true });`,
  );
  expect(readImported(home)).toEqual(after);
});

test("an import writes the responses it read beyond the codec budget one at a time, beside a history that keeps their totals", ({
  home,
  root,
}) => {
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
  writeCodexSession(root, rollout.please());
  runImport(home, root, [], ["--import", boundedCodec]);
  expect(statSync(responsesFile(home)).size).toBeGreaterThan(budget);
  const responses = JSON.parse(
    readFileSync(responsesFile(home), "utf8"),
  ) as UsageResponses;
  expect(Object.values(responses.observations)).toHaveLength(300);
  expect(
    Object.values(responses.observations).every((item) =>
      item.measurements.some(
        (measurement) =>
          measurement.source.file === path.join(root, "bounded.jsonl") &&
          measurement.source.line,
      ),
    ),
  ).toBe(true);
  const history = readImported(home);
  const [task] = Object.values(history.tasks);
  assert(task);
  expect(
    Object.values(responses.associations).every(
      (item) => item.taskId === task.id,
    ),
  ).toBe(true);
  expect(taskUsage(history, task.id)).toMatchObject({
    requests: 300,
    tokens: { output: 900 },
  });
  runImport(home, root, [], ["--import", boundedCodec]);
  expect(readImported(home)).toEqual(history);
});

test("an earlier paged store and reordered gap replay retain one equivalent coverage fact", ({
  home,
  root,
}) => {
  const file = path.join(
    home,
    ".open-dough/dashboard/launch-history/usage.json",
  );
  const source = { kind: "native", file: "native://missing", line: 7 };
  // Literal old paged wire keys used the caller's property order, before schema
  // parsing. This must migrate as well as the older monolithic v1 document.
  const gap = {
    code: "old-gap",
    host: "codex",
    sessionId: "gap-session",
    source,
  };
  const key = JSON.stringify(gap);
  const name = `${"b".repeat(64)}.json`;
  mkdirSync(`${file}.pages`, { recursive: true });
  writeFileSync(
    path.join(`${file}.pages`, name),
    JSON.stringify([[key, gap, 0]]),
  );
  const partition = createHash("sha256").update(key).digest("hex").slice(0, 2);
  writeFileSync(
    file,
    JSON.stringify({
      format: "usage-pages-v1",
      version: 1,
      next: { tasks: 0, observations: 0, associations: 0, gaps: 1 },
      pages: { [`gaps:${partition}`]: [name] },
    }),
  );
  expect(
    readImported(home).gaps.filter((item) => item.code === "old-gap"),
  ).toHaveLength(1);
  nodeProcess(
    home,
    `
    const { writeUsageHistory } = await import('./dashboard/server/usageHistory.ts');
    await writeUsageHistory({ gaps: [{ source: ${JSON.stringify(source)}, sessionId: 'gap-session', host: 'codex', code: 'old-gap' }] });
  `,
  );
  runImport(home, root);
  const retained = readImported(home).gaps.filter(
    (item) => item.code === "old-gap",
  );
  expect(retained).toEqual([
    { code: "old-gap", source, sessionId: "gap-session", host: "codex" },
  ]);
});
