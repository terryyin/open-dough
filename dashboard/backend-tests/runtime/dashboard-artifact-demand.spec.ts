import { existsSync, readFileSync } from "node:fs";
import { createServer, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "../../tests/support/pageTest.ts";
import { processRunning } from "../../tests/support/processGroup.ts";
import {
  proofDirectory,
  readProof,
  removeProofDirectories,
  startProofRun,
} from "../../tests/support/proofRecordRun.ts";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";

const fixtures = path.join(
  repoRoot,
  "dashboard/tests/fixtures/artifact-demand",
);
const setup = path.join(repoRoot, "dashboard/tests/support/globalSetup.ts");
const preload = pathToFileURL(path.join(fixtures, "buildGate.mjs")).href;

type Trace = { event: string; key: string; directory?: string };
type Consumer = { pid: number; directory?: string; error?: string };
type Build = { pid: number; outDir: string };

function records<T>(file: string): T[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as T);
}

test.afterEach(removeProofDirectories);

for (const outcome of ["complete", "fail", "interrupt"] as const) {
  test(`a shared real app build can ${outcome} while workers are waiting`, async () => {
    const directory = proofDirectory();
    const trace = path.join(directory, "artifacts.jsonl");
    const consumers = path.join(directory, "consumers.jsonl");
    let atGate: (
      build: Build & { release(value: string): void },
    ) => void = () => {};
    const held = new Promise<Build & { release(value: string): void }>(
      (resolve) => {
        atGate = resolve;
      },
    );
    const gate = createServer((request, response: ServerResponse) => {
      const input: Buffer[] = [];
      request.on("data", (chunk: Buffer) => input.push(chunk));
      request.once("end", () => {
        const build = JSON.parse(
          Buffer.concat(input).toString("utf8"),
        ) as Build;
        atGate({ ...build, release: (value) => response.end(value) });
      });
    });
    await new Promise<void>((resolve, reject) => {
      gate.once("error", reject);
      gate.listen(0, "127.0.0.1", resolve);
    });
    const { port } = gate.address() as AddressInfo;
    const run = startProofRun({
      directory,
      spec: "app.proof.ts",
      config: {
        testDir: fixtures,
        fullyParallel: true,
        workers: 2,
        globalSetup: setup,
      },
      args: outcome === "interrupt" ? ["--grep", "static server"] : [],
      env: {
        NODE_OPTIONS: [
          process.env["NODE_OPTIONS"],
          `--import ${JSON.stringify(preload)}`,
        ]
          .filter(Boolean)
          .join(" "),
        OPEN_DOUGH_ARTIFACT_PROOF_GATE: `http://127.0.0.1:${String(port)}`,
        OPEN_DOUGH_ARTIFACT_PROOF_CONSUMERS: consumers,
        OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE: trace,
      },
    });
    try {
      const build = await Promise.race([
        held,
        run.result.then((result) => {
          throw new Error(
            `Playwright exited before the build gate: ${result.stdout}${result.stderr}`,
          );
        }),
      ]);
      expect(processRunning(build.pid)).toBe(true);
      expect(existsSync(path.join(build.outDir, "partial"))).toBe(true);
      const events = () =>
        records<Trace>(trace).filter(({ key }) => key === "app");
      const eventCount = (event: string) =>
        events().filter((entry) => entry.event === event).length;
      const selected = outcome === "interrupt" ? 1 : 2;
      await expect.poll(() => eventCount("request")).toBe(selected);
      expect(eventCount("start")).toBe(1);
      expect(eventCount("complete")).toBe(0);
      expect(records<Consumer>(consumers)).toEqual([]);

      if (outcome === "interrupt") run.child.kill("SIGINT");
      else build.release(outcome === "fail" ? "fail" : "continue");
      const result = await run.result;
      const proof = readProof(run.recordPath);
      expect(proof.selectedCount).toBe(selected);
      expect(proof.phase).toBe("completed");
      expect(processRunning(build.pid)).toBe(false);
      expect(existsSync(build.outDir)).toBe(false);

      const observed = records<Consumer>(consumers);
      if (outcome === "complete") {
        expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
        expect(proof.terminal?.strictStatus).toBe("passed");
        expect(eventCount("complete")).toBe(1);
        expect(observed).toHaveLength(2);
        expect(new Set(observed.map(({ pid }) => pid)).size).toBe(2);
        expect(observed.map((entry) => entry.directory)).toEqual([
          build.outDir,
          build.outDir,
        ]);
      } else if (outcome === "fail") {
        expect(result.status).toBe(1);
        expect(proof.terminal?.strictStatus).toBe("failed");
        expect(eventCount("complete")).toBe(0);
        expect(observed).toHaveLength(2);
        expect(new Set(observed.map(({ pid }) => pid)).size).toBe(2);
        expect(observed.every((entry) => entry.directory === undefined)).toBe(
          true,
        );
        expect(observed[0]?.error).toContain(
          "Vite app build failed at the proof gate",
        );
        expect(observed[1]?.error).toBe(observed[0]?.error);
      } else {
        expect(result.status).toBe(1);
        expect(proof.terminal).toMatchObject({
          runnerStatus: "interrupted",
          strictStatus: "failed",
        });
        expect(eventCount("complete")).toBe(0);
      }
    } finally {
      const closed = new Promise<void>((resolve) =>
        gate.close(() => {
          resolve();
        }),
      );
      gate.closeAllConnections();
      await closed;
      if (run.child.exitCode === null && run.child.signalCode === null) {
        run.child.kill("SIGINT");
        await run.result;
      }
      await run.stop();
    }
  });
}
