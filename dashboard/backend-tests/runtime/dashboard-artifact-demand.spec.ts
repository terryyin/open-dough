import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appendedRecords } from "../../tests/support/appendedRecords.ts";
import {
  dashboardAppArtifactKey,
  sharedDashboardBuild,
} from "../../tests/support/dashboardBuild.ts";
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
const setupOf = (file: string) =>
  path.join(repoRoot, "dashboard/tests/support", file);
const setup = setupOf("integratedGlobalSetup.ts");

type Trace = { event: string; key: string; directory?: string };
type Consumer = { pid: number; directory?: string; error?: string };
type Build = { pid: number; outDir: string };
type Outcome = "complete" | "fail" | "interrupt";

function records<T>(file: string): T[] {
  return existsSync(file) ? appendedRecords<T>(readFileSync(file, "utf8")) : [];
}

function appOutput(directory: string) {
  if (!existsSync(directory)) return undefined;
  const entry = path.join(directory, "index.html");
  return {
    modified: statSync(directory).mtimeMs,
    index: existsSync(entry) ? readFileSync(entry, "utf8") : undefined,
  };
}

test.afterEach(removeProofDirectories);

function proveArtifact(
  artifact: {
    readonly name: string;
    readonly key: string;
    readonly preload: string;
    readonly spec: string;
    readonly partial: string;
    readonly error: RegExp;
    // The run's global setup; Dashboard Integrated UI Test's unless named.
    readonly setup?: string;
  },
  outcomes: readonly Outcome[],
): void {
  const preload = pathToFileURL(path.join(fixtures, artifact.preload)).href;
  for (const outcome of outcomes) {
    test(`a shared real ${artifact.name} can ${outcome} while workers are waiting`, async () => {
      // Keep a completed app in the outer run while the inner run fails or exits.
      const peer =
        artifact.key === dashboardAppArtifactKey && outcome !== "complete"
          ? await sharedDashboardBuild()
          : undefined;
      const peerBefore = peer === undefined ? undefined : appOutput(peer);
      const dist = path.join(repoRoot, "dashboard", "dist");
      const distBefore = peer === undefined ? undefined : appOutput(dist);
      if (peer !== undefined) {
        expect(peer).not.toBe(dist);
        expect(peerBefore?.index).toContain("/assets/");
      }
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
        spec: artifact.spec,
        config: {
          testDir: fixtures,
          fullyParallel: true,
          workers: 2,
          globalSetup: artifact.setup ?? setup,
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
        expect(existsSync(path.join(build.outDir, artifact.partial))).toBe(
          true,
        );
        const events = () =>
          records<Trace>(trace).filter(({ key }) => key === artifact.key);
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
        if (peer !== undefined) {
          expect(build.outDir).not.toBe(peer);
          expect(appOutput(peer)).toEqual(peerBefore);
          expect(appOutput(dist)).toEqual(distBefore);
        }

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
          expect(observed[0]?.error).toMatch(artifact.error);
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
}

const appBuild = {
  name: "app build",
  key: dashboardAppArtifactKey,
  preload: "buildGate.mjs",
  spec: "app.proof.ts",
  partial: "partial",
  error: /Vite app build failed at the proof gate/,
};

proveArtifact(appBuild, ["complete", "fail", "interrupt"]);

proveArtifact(
  {
    name: "server bundle",
    key: "server-bundle",
    preload: "bundleGate.mjs",
    spec: "bundle.proof.ts",
    partial: "vite.config.mjs",
    error: /boundaryServer\.mjs.*(?:os error 21|is a directory)/is,
  },
  ["complete", "fail"],
);

// Each other group runner's own setup shares the app build the same way and
// removes it when interrupted.
for (const [runner, file] of [
  ["Dashboard Frontend Test", "frontendGlobalSetup.ts"],
  ["Dashboard Backend Test", "backendGlobalSetup.ts"],
  ["E2E Test", "e2eGlobalSetup.ts"],
] as const)
  proveArtifact(
    { ...appBuild, name: `${runner} app build`, setup: setupOf(file) },
    ["interrupt"],
  );
