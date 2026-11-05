// Fake GitHub answers for the CI proof of one Actions run attempt
// (../../server/ciProofArtifact.ts): a summary built by the collector itself
// from fragments (../../../src/skills/dough-test-optimization/scripts/
// ci-proof-summary.mjs), so it is schema-valid; the run's artifact listing;
// and the artifact's zip, a real archive as GitHub serves it. The collector
// also writes a ciAdapter attempt's summary, named by its `attemptId`.

import { crc32, deflateRawSync } from "node:zlib";
import {
  fragment,
  summarize,
  summaryArtifactName,
} from "../../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import type { OriginAnswer } from "../originAnswers.ts";

// The collector is untyped JavaScript; this names the one result it gives.
type SummarizeFragments = (input: unknown) => { readonly summary: unknown };

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

type Counts = {
  readonly passed: number;
  readonly failed: number;
  readonly other: number;
};

// One part's counts for one entry: [entry, part, of, unit, counts].
export type ProofPart = readonly [string, number, number, string, Counts];

export const counts = (passed: number, failed = 0, other = 0): Counts => ({
  passed,
  failed,
  other,
});

// The summary the collector writes for `run` from `parts`, declaring
// `expect` (`<entry>` and its part count, in declaration order).
export function proofSummary(
  run: ProofRun | AdapterProofAttempt,
  expect: readonly (readonly [string, number])[],
  parts: readonly ProofPart[],
): unknown {
  const attempt =
    "attemptId" in run
      ? { attemptId: run.attemptId }
      : { attempt: run.attempt };
  const { summary } = (summarize as unknown as SummarizeFragments)({
    fragments: parts.map(([entry, part, of, unit, partCounts], index) => ({
      source: `fragment-${String(index)}.json`,
      value: fragment(
        { part, of, ...attempt, revision: run.revision },
        entry,
        unit,
        partCounts,
      ) as unknown,
    })),
    expect: expect.map(([entry, declared]) => ({ entry, parts: declared })),
    run: {
      repository: run.repository,
      ...("attemptId" in run ? {} : { runId: run.runId }),
      ...attempt,
      revision: run.revision,
    },
  });
  return summary;
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
  const name = summaryArtifactName(run.attempt);
  const artifacts =
    artifactId === undefined
      ? []
      : [
          {
            id: artifactId,
            name,
            size_in_bytes: 512,
            expired,
            workflow_run: { id: run.runId, head_sha: run.revision },
          },
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
