// A held native follow-up pass belongs to its origin until every process exits.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  expect,
  queuedClaudeBoundaryTest as test,
} from "../../tests/support/landedCiHistoryTest.ts";
import { prepareAdapterRepeatScenario } from "../../tests/support/ciFollowUpAdapterScenario.ts";
import { keepFollowUpEntries } from "../../tests/support/ciFollowUpScenario.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { processRunning, signal } from "../../tests/support/processGroup.ts";

test.use({ serverMode: "boundary" });

let processes: { collector: number; adapter: number } | undefined;
let collection: Promise<void> | undefined;
let homeAtExit: boolean | undefined;
let machine: string;
let collectAgain: (() => Promise<void>) | undefined;

test("a held collector and its adapter exit before the ended case removes its origin", async ({
  origin,
  github,
  startServer,
}, testInfo) => {
  machine = origin.machine;
  const scenario = await prepareAdapterRepeatScenario(origin, github);
  const server = await startServer();
  await server.close();
  const original = makeMe.aKeptBuild
    .with({
      revision: scenario.original.sha,
      state: "pass",
      adapterAttempt: {
        runId: scenario.original.runId,
        attemptId: scenario.original.attemptId,
      },
    })
    .please();
  await keepFollowUpEntries(server, [
    makeMe.aCiFollowUpEntry
      .with({
        project: "open-dough",
        revision: original.revision,
        target: "refs/heads/main",
        eligible: true,
        receipts: ["held-collector-receipt"],
        request: makeMe.aCiRepeatRequest
          .with({
            provider: "adapter",
            repository: "terryyin/open-dough",
            branch: "main",
            original,
            reference: {
              endpoint: original.revision,
              sampleCount: 5,
              averageMs: 100000,
              evidence: [],
            },
            rule: {
              percent: 5,
              provisional: true,
              timingBasis: "attempt-start",
            },
            requestedAt: "2026-11-10T06:02:00Z",
            submission: { kind: "accepted", attempt: scenario.accepted },
            outcome: { kind: "unverified", explanation: "Awaiting repeat" },
          })
          .please(),
      })
      .please(),
  ]);
  const recorded = testInfo.outputPath("collector-processes.json");
  // This real adapter holds a native descendant after receiving its request.
  // Ignoring TERM proves teardown ends the whole group after its leader exits.
  writeFileSync(
    path.join(origin.project, "scripts/ci-proof-fixture-adapter.mjs"),
    `import {writeFileSync} from 'node:fs';
import {createServer} from 'node:net';
import {execFileSync} from 'node:child_process';
for await (const chunk of process.stdin) {}
process.on('SIGTERM', () => {});
createServer().listen(0, '127.0.0.1', () => {
  writeFileSync(${JSON.stringify(recorded)}, JSON.stringify({collector: process.ppid, adapter: process.pid, group: execFileSync('ps', ['-o', 'pid=,ppid=,pgid=,stat=', '-p', String(process.ppid), '-p', String(process.pid)], {encoding:'utf8'})}));
});
`,
  );
  const history = makeMe.aLandedCiHistory.please();
  collectAgain = () => scenario.collectFollowUps(server, history);
  collection = collectAgain().then(
    () => {
      homeAtExit = existsSync(server.home);
    },
    () => {
      homeAtExit = existsSync(server.home);
    },
  );
  await expect.poll(() => existsSync(recorded)).toBe(true);
  processes = JSON.parse(readFileSync(recorded, "utf8")) as typeof processes;
  expect(processRunning(processes?.collector)).toBe(true);
  expect(processRunning(processes?.adapter)).toBe(true);
  // End the body while the actual collectCiFollowUps call is still held.
});

test.afterAll(async () => {
  try {
    expect(
      homeAtExit,
      "the native collector exited while HOME still existed",
    ).toBe(true);
    expect(
      processRunning(processes?.collector),
      "the collector cannot outlive its origin",
    ).toBe(false);
    expect(
      processRunning(processes?.adapter),
      "its held adapter cannot outlive its origin",
    ).toBe(false);
    expect(existsSync(machine), "the origin fixture completed removal").toBe(
      false,
    );
    await expect(collectAgain?.()).rejects.toThrow(
      "Follow-up collection origin retired",
    );
  } finally {
    // These PIDs came from only this test's held adapter, never a process sweep.
    if (processes !== undefined) {
      for (const pid of [processes.adapter, processes.collector])
        if (processRunning(pid)) signal(pid, "SIGKILL");
    }
    await collection;
  }
});
