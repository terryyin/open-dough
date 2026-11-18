// Actual collector summaries and ZIP artifacts for one Actions or adapter attempt.
// Uses the published summary producer; GitHub answers retain the real wire shape.

import { crc32, deflateRawSync } from "node:zlib";
import { summarize } from "../../../Distribution/src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CiProofEntry } from "../../src/ciProof.ts";
import type { OriginAnswer } from "../originAnswers.ts";
import { proofInputsForEntries } from "./ciProofEntryInputs.ts";

export type ProofRun = {
  readonly repository: string;
  readonly runId: number;
  readonly attempt: number;
  readonly revision: string;
};

// A ciAdapter attempt, named by its text `attemptId`.
export type AdapterProofAttempt = {
  readonly repository: string;
  readonly attemptId: string;
  readonly revision: string;
};

// Real collector summaries from explicitly arranged canonical entry facts.
export function proofSummaryForEntries(
  run: ProofRun | AdapterProofAttempt,
  entries: readonly CiProofEntry[],
): unknown {
  const { fragments, expect } = proofInputsForEntries(entries, run);
  return summarize({ fragments, expect, run }).summary;
}

export function proofSummaryForEntry(
  run: ProofRun | AdapterProofAttempt,
  entry: CiProofEntry,
): unknown {
  return proofSummaryForEntries(run, [entry]);
}

// A zip archive holding `text` as its one deflated file `name`.
export function zipOf(name: string, text: string): Buffer {
  const data = Buffer.from(text);
  const packed = deflateRawSync(data);
  const named = Buffer.from(name);
  const sizes = (header: Buffer, at: number) => {
    header.writeUInt32LE(crc32(data), at);
    header.writeUInt32LE(packed.length, at + 4);
    header.writeUInt32LE(data.length, at + 8);
    header.writeUInt16LE(named.length, at + 12);
  };
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(8, 8);
  sizes(local, 14);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(8, 10);
  sizes(central, 16);
  const directoryAt = local.length + named.length + packed.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + named.length, 12);
  end.writeUInt32LE(directoryAt, 16);
  return Buffer.concat([local, named, packed, central, named, end]);
}

// The run's artifact listing, filtered by name as GitHub filters it: the
// summary artifact, as `artifactId`, when one is given, and `expired` when
// GitHub says so.
export function runArtifactsAnswer(
  run: ProofRun,
  artifactId: number | undefined,
  expired = false,
): OriginAnswer {
  const artifacts =
    artifactId === undefined
      ? []
      : [
          makeMe.aCiProofArtifact
            .with({
              id: artifactId,
              runId: run.runId,
              runAttempt: run.attempt,
              revision: run.revision,
              expired,
            })
            .please(),
        ];
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({ total_count: artifacts.length, artifacts }),
  };
}

// The summary artifact's zip, as GitHub serves it after its redirect.
export function summaryZipAnswer(summary: unknown): OriginAnswer {
  return {
    status: 200,
    contentType: "application/zip",
    encoding: "base64",
    body: zipOf(
      "ci-proof-summary.json",
      `${JSON.stringify(summary)}\n`,
    ).toString("base64"),
  };
}
