// Reconstruct collector inputs from canonical MakeMe-built CI proof entries.
// The real collector then establishes their summary's counts and part statuses.
import type { CiProofEntry } from "../../src/ciProof.ts";
import type {
  ProofDeclaration,
  ProofPart,
  ProofUnit,
} from "./ciProofArtifacts.ts";

export function proofInputsForEntries(entries: readonly CiProofEntry[]): {
  readonly expect: readonly ProofDeclaration[];
  readonly parts: readonly ProofPart[];
} {
  const results = entries.flatMap((entry) =>
    entry.evidence.map((evidence) => ({ path: entry.path, evidence })),
  );
  return {
    expect: results.map(({ path, evidence }): ProofDeclaration =>
      evidence.unit === "legacy"
        ? [path, evidence.parts.length]
        : [path, evidence.parts.length, evidence.unit],
    ),
    parts: results.flatMap(({ path, evidence }) => {
      // MakeMe's first broken-down present part owns its files/unassigned
      // figures; later broken-down parts are present empty observations.
      const firstBrokenDown = evidence.parts.find(
        (part) => part.status === "present" && part.breakdown === true,
      );
      return evidence.parts.flatMap((part): ProofPart[] => {
        if (part.status === "missing") return [];
        const figures = {
          passed: part.passed ?? 0,
          failed: part.failed ?? 0,
          other: part.other ?? 0,
        };
        const unit: ProofUnit =
          evidence.unit === "legacy"
            ? { legacy: evidence.label ?? "results" }
            : evidence.unit;
        const of = evidence.parts.length;
        if (part.status === "ambiguous") {
          // Two candidates cause the real producer to retain an ambiguous
          // part, whose figures are deliberately not counted.
          const candidate: ProofPart = [path, part.part, of, unit, figures];
          return [candidate, candidate];
        }
        if (part.breakdown === true && evidence.files !== undefined) {
          return [
            [
              path,
              part.part,
              of,
              unit,
              figures,
              part.durationMs,
              {
                files: part === firstBrokenDown ? evidence.files : [],
                untimed: part.untimed ?? 0,
                ...(part === firstBrokenDown &&
                evidence.unassigned !== undefined
                  ? { unassigned: evidence.unassigned }
                  : {}),
              },
            ],
          ];
        }
        return [
          part.durationMs === undefined
            ? [path, part.part, of, unit, figures]
            : [path, part.part, of, unit, figures, part.durationMs],
        ];
      });
    }),
  };
}
