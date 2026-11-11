import assert from "node:assert/strict";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryOf } from "../../dashboard/server/ciScopeHistory.ts";
import { ciScopeHistorySchema } from "../../dashboard/src/ciScopeHistory.ts";

export const scopeReferenceFilePath = "tests/folder/a.spec.ts";
export const scopeReferenceEntry = (ms, options = {}) => {
  const evidence = makeMe.aCiProofEvidence.inUnit(options.unit ?? "case");
  const owner = options.owner ?? "tests";
  if (options.entryOnly) {
    evidence.counting(2).timed(ms);
  } else {
    evidence.brokenDown(
      ...[
        { path: scopeReferenceFilePath, passed: 1, durationMs: ms },
        { path: "tests/folder/hidden.spec.ts", passed: 1, durationMs: ms * 2 },
        { path: "tests/root.spec.ts", passed: 1, durationMs: ms * 3 },
      ].filter(({ path }) => path.startsWith(`${owner}/`)),
    );
  }
  if (options.partial) {
    evidence.missingPart(2);
  }
  return makeMe.aCiProofEntry.at(owner).holding(evidence.please()).please();
};

export function scopeReferenceReading(
  entries,
  path = "tests/folder",
  options = {},
) {
  const history = makeMe.aLandedCiHistory;
  const revisions = [...entries.keys()].map((index) =>
    (index + 1).toString(16).padStart(40, "0"),
  );
  revisions.forEach((revision, index) => {
    const buildIndex =
      options.sameAttempt && index === entries.length - 1 ? 0 : index;
    const runId = buildIndex + 1;
    const measuredRevision =
      options.future && index === 0 ? revisions.at(-1) : revisions[buildIndex];
    const measuredEntries = entries[buildIndex];
    const landing = makeMe.aLaunchLanding
      .comparing({ base: "0".repeat(40), revision })
      .deliveredAs({
        delivery: `scope-${index + 1}`,
        receipt: `scope-${index + 1}`,
      })
      .receivedAt(`2026-11-${String(index + 1).padStart(2, "0")}T00:00:00Z`)
      .please();
    history.recording(
      landing,
      `run/${runId}/1`,
      makeMe.aKeptBuild
        .with({
          revision: measuredRevision,
          state: "pass",
          runId,
          runAttempt: 1,
          startedAt: `2026-11-${String(runId).padStart(2, "0")}T00:00:00Z`,
          proof:
            measuredEntries === undefined
              ? makeMe.aCiProof.unavailableBecause("expired").please()
              : makeMe.aCiProof
                  .forRun({ revision: measuredRevision, runId })
                  .entries(measuredEntries)
                  .please(),
        })
        .please(),
      options.future && index === 0
        ? "later"
        : options.sameAttempt && index === entries.length - 1
          ? "equivalent"
          : "exact",
    );
  });
  const answer = scopeHistoryOf(
    history.please(),
    path,
    { revision: revisions.at(-1), at: "2026-11-20T00:00:00Z" },
    revisions,
  );
  assert.equal(ciScopeHistorySchema.safeParse(answer).success, true);
  return answer;
}
export const scopeReferenceOf = (answer, unit = "case") =>
  answer.references.find((candidate) => candidate.unit === unit).reference;
