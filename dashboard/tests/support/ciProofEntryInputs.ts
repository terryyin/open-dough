// Canonical MakeMe entries encoded as the collector's own fragments and
// declaration objects. The collector establishes counts and part statuses.
import { fragment } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import type { CiProofEntry } from "../../src/ciProof.ts";
import type { AdapterProofAttempt, ProofRun } from "./ciProofArtifacts.ts";

export function proofInputsForEntries(
  entries: readonly CiProofEntry[],
  run: ProofRun | AdapterProofAttempt,
) {
  const attempt =
    "attemptId" in run
      ? { attemptId: run.attemptId }
      : { attempt: run.attempt };
  const results = entries.flatMap((entry) =>
    entry.evidence.map((evidence) => ({ path: entry.path, evidence })),
  );
  return {
    expect: results.map(({ path, evidence }) => ({
      entry: path,
      parts: evidence.parts.length,
      ...(evidence.unit === "legacy" ? {} : { unit: evidence.unit }),
    })),
    fragments: results.flatMap(({ path, evidence }) => {
      // The first broken-down present part owns the files/unassigned figures;
      // later broken-down parts are present empty observations.
      const firstBrokenDown = evidence.parts.find(
        (part) => part.status === "present" && part.breakdown === true,
      );
      return evidence.parts.flatMap((part) => {
        if (part.status === "missing") return [];
        const value: unknown = fragment(
          {
            part: part.part,
            of: evidence.parts.length,
            ...attempt,
            revision: run.revision,
          },
          path,
          evidence.unit === "legacy"
            ? { unit: "legacy", label: evidence.label ?? "results" }
            : { unit: evidence.unit },
          {
            passed: part.passed ?? 0,
            failed: part.failed ?? 0,
            other: part.other ?? 0,
          },
          {
            ...(part.durationMs === undefined
              ? {}
              : { durationMs: part.durationMs }),
            ...(part.breakdown === true && evidence.files !== undefined
              ? {
                  files: part === firstBrokenDown ? evidence.files : [],
                  untimed: part.untimed ?? 0,
                  ...(part === firstBrokenDown &&
                  evidence.unassigned !== undefined
                    ? { unassigned: evidence.unassigned }
                    : {}),
                }
              : {}),
          },
        );
        const candidate = {
          source: `${path}-${evidence.unit}-${String(part.part)}.json`,
          value,
        };
        // Duplicate candidates leave an ambiguous part uncounted. With no
        // observed legacy part its summary label remains null.
        return part.status === "ambiguous"
          ? [candidate, candidate]
          : [candidate];
      });
    }),
  };
}
