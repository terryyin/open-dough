// A fresh run of plain preparation-page consumers, Claude, Codex and a later
// revision override sharing one worker, under each group runner's own setup:
// both hosts' queued origins are prepared before any case's own time, every
// case gets its host's layout as an independent copy, and the override keeps
// its later revision.
import { existsSync, readFileSync } from "node:fs";
import { createServer, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appendedRecords } from "../../tests/support/appendedRecords.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  proofDirectory,
  quietReporter,
  readProof,
  removeProofDirectories,
  startProofRun,
} from "../../tests/support/proofRecordRun.ts";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";

const fixtures = path.join(
  repoRoot,
  "dashboard/tests/fixtures/test-preparation-budget",
);
const preload = pathToFileURL(path.join(fixtures, "cloneGate.mjs")).href;

type Held = { layout: string; release: () => void };
type Trace = { event: string; key: string; at: number };
type Step =
  | { event: "case"; title: string; at: number }
  | {
      event: "fixture";
      case: string;
      title: string;
      start: number;
      end: number;
    }
  | { event: "end"; title: string; duration: number; status: string };
type Case = {
  title: string;
  host: string;
  origin: string;
  branches: string[];
  tree: string[];
  revisions: string[];
  mainIsLast: boolean;
};

function records<T>(file: string): T[] {
  return existsSync(file) ? appendedRecords<T>(readFileSync(file, "utf8")) : [];
}

test.afterEach(removeProofDirectories);

for (const [runner, setup] of [
  ["Dashboard Integrated UI Test", "integratedGlobalSetup.ts"],
  ["Dashboard Backend Test", "backendGlobalSetup.ts"],
  ["E2E Test", "e2eGlobalSetup.ts"],
] as const)
  test(`${runner} prepares both hosts' origins before the first case`, async () => {
    const directory = proofDirectory();
    const file = (name: string) => path.join(directory, name);
    const held: Held[] = [];
    let bothHeld: () => void = () => {};
    const reached = new Promise<void>((resolve) => {
      bothHeld = resolve;
    });
    const gate = createServer((request, response: ServerResponse) => {
      const input: Buffer[] = [];
      request.on("data", (chunk: Buffer) => input.push(chunk));
      request.once("end", () => {
        const { layout } = JSON.parse(
          Buffer.concat(input).toString("utf8"),
        ) as {
          layout: string;
        };
        held.push({
          layout,
          release: () => {
            if (!response.writableEnded) response.end("continue");
          },
        });
        if (held.length === 2) bothHeld();
      });
    });
    await new Promise<void>((resolve, reject) => {
      gate.once("error", reject);
      gate.listen(0, "127.0.0.1", resolve);
    });
    const { port } = gate.address() as AddressInfo;
    const recordPath = file("proof.json");
    const run = startProofRun({
      directory,
      recordPath,
      spec: "preparation.proof.ts",
      config: {
        testDir: fixtures,
        workers: 1,
        globalSetup: path.join(repoRoot, "dashboard/tests/support", setup),
        reporter: [
          [quietReporter, { proofRecord: recordPath }],
          [path.join(fixtures, "fixtureSteps.mjs")],
        ],
      },
      env: {
        NODE_OPTIONS: [
          process.env["NODE_OPTIONS"],
          `--import ${JSON.stringify(preload)}`,
        ]
          .filter(Boolean)
          .join(" "),
        OPEN_DOUGH_ARTIFACT_PROOF_GATE: `http://127.0.0.1:${String(port)}`,
        OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE: file("artifacts.jsonl"),
        OPEN_DOUGH_PREPARATION_PROOF_CASES: file("cases.jsonl"),
        OPEN_DOUGH_PREPARATION_PROOF_STEPS: file("steps.jsonl"),
      },
    });
    try {
      // Both layouts are requested together, before any case reports.
      await Promise.race([
        reached,
        run.result.then((result) => {
          throw new Error(
            `Playwright exited before both origins were held: ${result.stdout}${result.stderr}`,
          );
        }),
      ]);
      expect(held.map(({ layout }) => layout).sort()).toEqual([
        "claude",
        "codex",
      ]);
      expect(records<Case>(file("cases.jsonl"))).toEqual([]);
      const releasedAt = Date.now();
      for (const { release } of held) release();

      const result = await run.result;
      expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
      expect(readProof(recordPath).terminal?.strictStatus).toBe("passed");

      // Worker preparation and case intervals, recorded separately.
      const trace = records<Trace>(file("artifacts.jsonl"));
      const completed = (key: string) =>
        trace.find((entry) => entry.event === "complete" && entry.key === key)
          ?.at;
      const claude = completed("start-origin-claude-queued");
      const codex = completed("start-origin-codex-queued");
      expect(claude).toBeGreaterThanOrEqual(releasedAt);
      expect(codex).toBeGreaterThanOrEqual(releasedAt);
      const steps = records<Step>(file("steps.jsonl"));
      // Each case's own origin setup (its first origin step; the second is
      // its teardown) starts after both bases completed.
      const originSetups = [
        ...new Map(
          steps
            .flatMap((step) =>
              step.event === "fixture" && step.title === 'Fixture "origin"'
                ? [step]
                : [],
            )
            .reverse()
            .map((step) => [step.case, step]),
        ).values(),
      ];
      expect(originSetups).toHaveLength(3);
      for (const step of originSetups)
        expect(step.start).toBeGreaterThanOrEqual(
          Math.max(claude ?? Infinity, codex ?? Infinity),
        );
      const ends = steps.filter((step) => step.event === "end");
      // Kept visible: run-owned preparation versus each case's own time.
      console.log(
        JSON.stringify({ held: { releasedAt, claude, codex }, cases: ends }),
      );

      const cases = records<Case>(file("cases.jsonl"));
      expect(cases.map(({ host }) => host)).toEqual([
        "claude",
        "codex",
        "claude",
      ]);
      expect(new Set(cases.map(({ origin }) => origin)).size).toBe(3);
      // A copy holds no other case's private write.
      for (const { branches } of cases)
        expect(branches).not.toContain("private-proof");
      const [onClaude, onCodex, overriding] = cases;
      expect(onClaude?.tree).not.toEqual(onCodex?.tree);
      expect(overriding?.tree).toEqual(onClaude?.tree);
      expect(overriding?.revisions.at(-1)).toBe("changed review");
      expect(overriding?.revisions).toEqual([
        ...(onClaude?.revisions ?? []),
        "changed review",
      ]);
      expect(overriding?.mainIsLast).toBe(true);
    } finally {
      for (const { release } of held) release();
      const closed = new Promise<void>((resolve) =>
        gate.close(() => {
          resolve();
        }),
      );
      gate.closeAllConnections();
      await closed;
      await run.stop();
    }
  });
