// The shared native producer for scoped history: explicit runner facts become
// actual CLI summary bytes, with independent case and file evidence.
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
