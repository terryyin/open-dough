// Scoped history's runner facts per file under dashboard/tests: the actual
// CLI summary bytes the shared native producer makes of them, with
// independent case and file evidence, and the proof collection keeps of them.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { ProofRun } from "./ciProofArtifacts.ts";
import { collectedSummary, playwrightRecord } from "./ciProofCollected.ts";

export type ScopeFileTiming = readonly [
  file: string,
  caseMs: number,
  fileMs?: number | undefined,
];

export function collectedScopeFileSummary(
  run: ProofRun,
  files: readonly ScopeFileTiming[],
  {
    caseParts = 1,
    byFile = true,
  }: { readonly caseParts?: number; readonly byFile?: boolean } = {},
): string {
  const countedFiles = files.flatMap(([file, , ms]) =>
    ms === undefined ? [] : [[file, ms] as const],
  );
  const declarations: {
    entry: string;
    parts: number;
    unit: "case" | "file";
  }[] = [{ entry: "dashboard/tests", parts: caseParts, unit: "case" }];
  if (countedFiles.length > 0)
    declarations.push({ entry: "dashboard/tests", parts: 1, unit: "file" });
  return collectedSummary(run, declarations, [
    {
      entries: ["dashboard/tests"],
      part: 1,
      of: caseParts,
      byFile,
      record: playwrightRecord(
        files.map(([file, ms]) => [
          `dashboard/tests/${file}`,
          "expected",
          [ms],
        ]),
      ),
    },
    ...(countedFiles.length === 0
      ? []
      : [
          {
            entries: ["dashboard/tests"],
            part: 1,
            of: 1,
            byFile,
            unit: "file" as const,
            outcomes: countedFiles
              .map(([file]) => `passed\tdashboard/tests/${file}\n`)
              .join(""),
            // The case states milliseconds; outcomes' times wire is seconds.
            times: countedFiles
              .map(
                ([file, ms]) =>
                  `${String(ms / 1000)}\tdashboard/tests/${file}\n`,
              )
              .join(""),
          },
        ]),
  ]);
}

// The proof collection keeps of a run with these facts: under `entry`, the
// case evidence of its files and the file evidence of those with a file time,
// in the units named.
export function keptScopeFileProof(
  run: { readonly revision: string; readonly runId: number },
  files: readonly ScopeFileTiming[],
  {
    entry = "dashboard/tests",
    units = ["case", "file"],
  }: {
    readonly entry?: string;
    readonly units?: readonly ("case" | "file")[];
  } = {},
) {
  const held = files
    .map(([file, caseMs, fileMs]) => ({
      path: `dashboard/tests/${file}`,
      caseMs,
      fileMs,
    }))
    .filter(({ path }) => path.startsWith(`${entry}/`));
  return makeMe.aCiProof
    .forRun(run)
    .entries([
      makeMe.aCiProofEntry
        .at(entry)
        .holding(
          ...units.map((unit) =>
            makeMe.aCiProofEvidence
              .inUnit(unit)
              .brokenDown(
                ...held.flatMap(({ path, caseMs, fileMs }) => {
                  const durationMs = unit === "case" ? caseMs : fileMs;
                  return durationMs === undefined
                    ? []
                    : [{ path, passed: 1, durationMs }];
                }),
              )
              .please(),
          ),
        )
        .please(),
    ])
    .please();
}
