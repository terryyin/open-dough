// Hold the cold run's two shared clones until both have reached the gate.
// The completed run's observations can then serve independent assertions.
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { removeProofDirectories } from "../../test-support/support/proofRecordRun.ts";
import { startOriginArtifactKey } from "../../test-support/support/startOriginPreparation.ts";
import {
  preparationFixtures,
  startPreparationProofRun,
} from "./preparationProofRun.ts";

const preload = pathToFileURL(
  path.join(preparationFixtures, "cloneGate.mjs"),
).href;

export async function observeQueuedOrigins() {
  let reached = () => {};
  let release = () => {};
  const bothHeld = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  const heldLayouts: string[] = [];
  const gate = createServer((request, response) => {
    heldLayouts.push(request.url?.slice(1) ?? "");
    if (heldLayouts.length === 2) reached();
    void released.then(() => response.end("continue"));
  });
  await new Promise<void>((resolve, reject) => {
    gate.once("error", reject);
    gate.listen(0, "127.0.0.1", resolve);
  });
  let run: ReturnType<typeof startPreparationProofRun> | undefined;
  try {
    const address = gate.address();
    if (!address || typeof address === "string")
      throw new Error("Clone gate has no port");
    run = startPreparationProofRun({
      spec: "preparation.proof.ts",
      setup: "backendGlobalSetup.ts",
      env: {
        NODE_OPTIONS: [
          process.env["NODE_OPTIONS"],
          `--import ${JSON.stringify(preload)}`,
        ]
          .filter(Boolean)
          .join(" "),
        OPEN_DOUGH_ARTIFACT_PROOF_GATE: `http://127.0.0.1:${String(address.port)}`,
      },
    });
    await Promise.race([
      bothHeld,
      run.result.then(({ stdout, stderr }) => {
        throw new Error(
          `Playwright exited before both clones reached the gate: ${stdout}${stderr}`,
        );
      }),
    ]);
    const casesWhileHeld = run.cases();
    const releasedAt = Date.now();
    release();
    await run.passed();

    return {
      heldLayouts: heldLayouts.sort(),
      casesWhileHeld,
      timing: {
        releasedAt,
        completed: {
          claude: run.completedAt(startOriginArtifactKey("claude", "queued")),
          codex: run.completedAt(startOriginArtifactKey("codex", "queued")),
        },
        firstCopyStartedAt: run.fixtureSteps("origin")[0]?.start,
        caseIntervals: run.steps().filter((step) => step.event === "end"),
      },
      cases: run.cases(),
    };
  } finally {
    release();
    const closed = new Promise<void>((resolve) =>
      gate.close(() => {
        resolve();
      }),
    );
    gate.closeAllConnections();
    await closed;
    await run?.stop();
    removeProofDirectories();
  }
}
