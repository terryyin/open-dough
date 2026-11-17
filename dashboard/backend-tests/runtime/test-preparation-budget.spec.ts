// A fresh run of plain preparation-page consumers, Claude, Codex and a later
// revision override sharing one worker, under each group runner's own setup:
// both hosts' queued origins are prepared before any case's own time, every
// case gets its host's layout as an independent copy, and the override keeps
// its later revision.
import { createServer, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  preparationFixtures,
  startPreparationProofRun,
} from "../support/preparationProofRun.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { removeProofDirectories } from "../../tests/support/proofRecordRun.ts";

const preload = pathToFileURL(
  path.join(preparationFixtures, "cloneGate.mjs"),
).href;

type Held = { layout: string; release: () => void };

test.afterEach(removeProofDirectories);

for (const [runner, setup] of [
  ["Dashboard Integrated UI Test", "integratedGlobalSetup.ts"],
  ["Dashboard Backend Test", "backendGlobalSetup.ts"],
  ["E2E Test", "e2eGlobalSetup.ts"],
] as const)
  test(`${runner} prepares both hosts' origins before the first case`, async () => {
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
    const run = startPreparationProofRun({
      spec: "preparation.proof.ts",
      setup,
      env: {
        NODE_OPTIONS: [
          process.env["NODE_OPTIONS"],
          `--import ${JSON.stringify(preload)}`,
        ]
          .filter(Boolean)
          .join(" "),
        OPEN_DOUGH_ARTIFACT_PROOF_GATE: `http://127.0.0.1:${String(port)}`,
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
      expect(run.cases()).toEqual([]);
      const releasedAt = Date.now();
      for (const { release } of held) release();

      await run.passed();

      // Worker preparation and case intervals, recorded separately.
      const claude = run.completedAt("start-origin-claude-queued");
      const codex = run.completedAt("start-origin-codex-queued");
      expect(claude).toBeGreaterThanOrEqual(releasedAt);
      expect(codex).toBeGreaterThanOrEqual(releasedAt);
      // Each case's own origin setup (its first origin step; the second is
      // its teardown) starts after both bases completed.
      const originSetups = [
        ...new Map(
          run
            .fixtureSteps("origin")
            .reverse()
            .map((step) => [step.case, step]),
        ).values(),
      ];
      expect(originSetups).toHaveLength(3);
      for (const step of originSetups)
        expect(step.start).toBeGreaterThanOrEqual(
          Math.max(claude ?? Infinity, codex ?? Infinity),
        );
      const ends = run.steps().filter((step) => step.event === "end");
      // Kept visible: run-owned preparation versus each case's own time.
      await test.info().attach("preparation-and-case-intervals", {
        body: JSON.stringify({
          held: { releasedAt, claude, codex },
          cases: ends,
        }),
        contentType: "application/json",
      });

      const cases = run.cases();
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
