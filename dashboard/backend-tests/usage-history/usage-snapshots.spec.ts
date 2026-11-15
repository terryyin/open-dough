// Physical storage cannot impose a whole-document serialization limit on facts.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  nodeProcess,
  readImported,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

const budget = 128 * 1024;
const boundedCodec = `data:text/javascript,${encodeURIComponent(`
  const stringify = JSON.stringify;
  JSON.stringify = (...args) => {
    const text = stringify(...args);
    if (text && Buffer.byteLength(text) > ${budget}) throw new Error('bounded codec budget exceeded');
    return text;
  };
`)}`;

test("legacy v1 facts migrate without losing evidence and survive removal of native inputs", ({
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
  expect(readImported(home).tasks.legacy?.title).toBe("Retained title");
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
    Object.values(after.observations).map((item) => item.tokens.output),
  ).toEqual([4, 7]);
  for (const [id, value] of Object.entries(prior.observations))
    expect(after.observations[id]).toEqual(value);
  for (const [id, value] of Object.entries(prior.associations))
    expect(after.associations[id]).toEqual(value);
  nodeProcess(
    home,
    `const { rmSync } = await import('node:fs'); rmSync(${JSON.stringify(root)}, { recursive: true });`,
  );
  expect(readImported(home)).toEqual(after);
});

test("actual import and fresh export retain all records when whole-history strings exceed the codec budget", ({
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
  const output = execFileSync(
    process.execPath,
    [
      "--import",
      boundedCodec,
      "dashboard/server/importUsageHistory.ts",
      "read",
      "--home",
      home,
    ],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
  expect(Buffer.byteLength(output)).toBeGreaterThan(budget);
  const history = JSON.parse(output) as ReturnType<typeof readImported>;
  expect(Object.values(history.observations)).toHaveLength(300);
  expect(
    Object.values(history.observations).reduce(
      (sum, item) => sum + (item.tokens.output ?? 0),
      0,
    ),
  ).toBe(900);
  expect(
    Object.values(history.associations).every(
      (item) => item.taskId && history.tasks[item.taskId],
    ),
  ).toBe(true);
  expect(
    Object.values(history.observations).every((item) =>
      item.measurements.some(
        (measurement) =>
          measurement.source.file === path.join(root, "bounded.jsonl") &&
          measurement.source.line,
      ),
    ),
  ).toBe(true);
  runImport(home, root, [], ["--import", boundedCodec]);
  expect(readImported(home)).toEqual(history);
});

test("an earlier paged snapshot and reordered gap replay retain one equivalent coverage fact", ({
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
