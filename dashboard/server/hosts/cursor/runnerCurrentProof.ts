// Whether an accepting Cursor runner proves it runs this dashboard's current
// build and still has a usable terminal helper. Matching build with a missing
// or drifted helper is repaired from this install when possible so held
// clients stay up; only absent or differing build proof is stale.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { computeRunnerBuildId, runnerEntryPath } from "./runnerBuild.ts";
import { cursorRunnerSpawnHelper } from "./runnerSpawnHelper.ts";
import { acceptingCursorRunnerPort } from "./runnerProcess.ts";
import {
  readCursorRunnerAddress,
  writeCursorRunnerAddress,
  type CursorRunnerAddress,
} from "./runnerPaths.ts";
import { cursorRunnerSessionsResult } from "./runnerProtocol.ts";

export type RunnerProofProbe =
  | {
      readonly answered: true;
      readonly buildId: string | undefined;
      readonly spawnHelper: string | undefined;
    }
  | { readonly answered: false };

// Asks the accepting runner, over its own wire protocol, which build it
// runs. A runner that accepts TCP but does not answer the protocol has not
// answered: it is not replaced, and new work fails as unreachable today.
function probeRunnerProof(port: number): Promise<RunnerProofProbe> {
  return new Promise((resolve) => {
    const req = http.request(
      { host: "127.0.0.1", port, path: "/sessions", method: "GET" },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          try {
            const parsed = cursorRunnerSessionsResult.safeParse(
              JSON.parse(Buffer.concat(chunks).toString("utf8")),
            );
            resolve(
              parsed.success
                ? {
                    answered: true,
                    buildId: parsed.data.buildId,
                    spawnHelper: parsed.data.spawnHelper,
                  }
                : { answered: false },
            );
          } catch {
            resolve({ answered: false });
          }
        });
      },
    );
    req.setTimeout(2_000, () => {
      req.destroy(new Error("The Cursor runner did not answer."));
    });
    req.on("error", () => {
      resolve({ answered: false });
    });
    req.end();
  });
}

// A platform whose node-pty ships no separate helper is current when the
// runner reports none. Where this install has a helper, the runner must
// report a helper file that is still on disk. A dashboard update deletes
// the old install's helper while the old process keeps answering.
function spawnHelperReady(
  recorded: string | undefined,
  reported: string | undefined,
): boolean {
  const installed = cursorRunnerSpawnHelper();
  if (installed === undefined) {
    return recorded === undefined && reported === undefined;
  }
  return (
    recorded !== undefined && recorded === reported && existsSync(recorded)
  );
}

// Puts the helper file back where this same-build runner still executes it
// (the wire path), using this install's helper as the source when the
// retired checkout removed that file, and republishes the recorded address
// so recorded and wire agree. Returns whether helper proof is then ready.
function repairSpawnHelperProof(
  home: string,
  address: CursorRunnerAddress,
  reported: string | undefined,
): boolean {
  const installed = cursorRunnerSpawnHelper();
  if (installed === undefined) {
    return spawnHelperReady(address.spawnHelper, reported);
  }
  if (reported === undefined) return false;
  if (!existsSync(reported)) {
    try {
      mkdirSync(path.dirname(reported), { recursive: true });
      copyFileSync(installed, reported);
    } catch {
      return false;
    }
  }
  if (!existsSync(reported)) return false;
  if (address.spawnHelper !== reported) {
    try {
      writeCursorRunnerAddress(home, { ...address, spawnHelper: reported });
    } catch {
      return false;
    }
  }
  const refreshed = readCursorRunnerAddress(home);
  return spawnHelperReady(refreshed?.spawnHelper, reported);
}

// The one build-proof rule for new Cursor work on an accepting runner. A
// probe without a protocol answer leaves the listener alone; an answer
// whose build differs, or a recorded address without this build, takes
// the replacement path; matching proofs go on to the helper check with
// the recorded address and the helper the runner reported.
export type RunnerBuildProofDecision =
  | { readonly kind: "leave-alone" }
  | { readonly kind: "replace" }
  | {
      readonly kind: "check-helper";
      readonly recorded: CursorRunnerAddress;
      readonly reportedHelper: string | undefined;
    };

export function runnerBuildProofDecision(
  currentBuildId: string,
  probe: RunnerProofProbe,
  recorded: CursorRunnerAddress | undefined,
): RunnerBuildProofDecision {
  if (!probe.answered) return { kind: "leave-alone" };
  if (probe.buildId !== currentBuildId) return { kind: "replace" };
  if (recorded?.buildId !== currentBuildId) return { kind: "replace" };
  return { kind: "check-helper", recorded, reportedHelper: probe.spawnHelper };
}

// True only for an accepting runner whose recorded and wire proof both
// match the build this dashboard would start now, and whose terminal
// helper is ready (or repaired from this install onto the path that
// runner still executes). Null when the accepting process does not
// answer the protocol at all.
export async function acceptingRunnerIsCurrent(
  home: string,
  currentBuildId: string,
): Promise<boolean | null> {
  const port = await acceptingCursorRunnerPort(home);
  if (port === undefined) return false;
  const decision = runnerBuildProofDecision(
    currentBuildId,
    await probeRunnerProof(port),
    readCursorRunnerAddress(home),
  );
  if (decision.kind === "leave-alone") return null;
  if (decision.kind === "replace") return false;
  const { recorded, reportedHelper } = decision;
  if (spawnHelperReady(recorded.spawnHelper, reportedHelper)) return true;
  // Same build, helper proof missing or drifted: restore a usable helper
  // for this answering runner instead of stopping it and hanging up every
  // client it still holds.
  return repairSpawnHelperProof(home, recorded, reportedHelper);
}

export function currentRunnerBuildId(): string {
  return computeRunnerBuildId(runnerEntryPath());
}
