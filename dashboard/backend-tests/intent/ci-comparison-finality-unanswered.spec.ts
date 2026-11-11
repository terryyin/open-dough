// Raw request failures, held errors and malformed listings retain the actual
// artifact reader's private brand through the shared finality/memory path.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  GitHubAcquisitionFailed,
  GitHubAcquisitionHeld,
} from "../../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import {
  baseline,
  landing,
  comparisonProject,
} from "../support/comparisonRead.ts";
import {
  finalityIdentity,
  representedFinalityFacts,
} from "../support/finalityComparisonFacts.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import { finalityArtifacts } from "../support/finalityArtifacts.ts";
import { archiveOf, listedArtifact } from "../support/ciProofMemory.ts";
import { capturedComparisonLanding } from "../../tests/support/capturedComparisonLanding.ts";
import {
  expect,
  test,
  observedComparisonSource,
  comparisonAcquisitions,
} from "../support/comparisonMemory.ts";

for (const provenance of ["equivalent", "later"] as const) {
  for (const failure of [
    "transient request",
    "malformed listing",
    "provider wait",
  ] as const) {
    test(`${provenance} ${failure} stays live beyond receipt and walk bounds, then remembers actual proof`, async ({
      comparisonRead,
    }) => {
      // Completion plus thirty following revisions exceeds the fixed walk.
      const facts = representedFinalityFacts(
        provenance,
        provenance === "later" ? 30 : 0,
      );
      const subject = makeMe.aCiProofRun
        .with({
          revision: facts.represented,
          runId: 201,
          runAttempt: 1,
        })
        .please();
      const proof = facts.proofs[201];
      if (proof?.kind !== "summary")
        throw new Error("Expected arranged summary");
      let unanswered = true;
      const artifacts = finalityArtifacts(facts, {
        listing: () => {
          if (!unanswered)
            return Promise.resolve({ artifacts: [listedArtifact(subject)] });
          if (failure === "malformed listing")
            return Promise.resolve({ artifacts: "not an artifact listing" });
          throw failure === "provider wait"
            ? new GitHubAcquisitionHeld(120)
            : new GitHubAcquisitionFailed("artifacts", { kind: "unreachable" });
        },
        archive: () => Promise.resolve(archiveOf(proof.summary)),
      });
      const receivedAt = "2026-11-05T15:00:00.000Z";
      const capture = capturedComparisonLanding(
        { identity: finalityIdentity, baseline, landingMerge: landing },
        receivedAt,
      );
      const observed = observedComparisonSource(
        storyCiComparisonEvidence({
          ...facts,
          now: () => Date.parse(receivedAt) + 3 * 3_600_000,
          receipts: {
            launchesByProject: new Map([
              [
                comparisonProject.id,
                [
                  makeMe.aLaunchRecord
                    .executing({
                      source: comparisonProject.id,
                      identity: finalityIdentity,
                      title: "Comparison",
                    })
                    .withCapturedLanding(capture)
                    .please(),
                ],
              ],
            ]),
            retained: { kind: "document", document: {} },
          },
          proofReader: artifacts.proofReader,
        }).source,
      );
      const first = await comparisonRead(observed.source);
      expect(first).toMatchObject({ landed: { kind: "none" } });
      if (first.kind !== "comparison") throw new Error("Expected comparison");
      expect(first.landed).not.toHaveProperty("timeWithoutRunnerWaits");
      expect(artifacts.asked()).toEqual([1, 0]);
      await comparisonRead(observed.source);
      expect(artifacts.asked()).toEqual([2, 0]);
      unanswered = false;
      const recovered = await comparisonRead(observed.source);
      expect(recovered).toMatchObject({
        landed: {
          kind: "build",
          revision: facts.represented,
          selection: provenance,
          runId: 201,
          runAttempt: 1,
          requestedStatus: {
            kind: provenance === "equivalent" ? "skipped" : "cancelled",
          },
        },
      });
      expect(artifacts.asked()).toEqual([3, 1]);
      const asked = comparisonAcquisitions(observed);
      expect(await comparisonRead(observed.source)).toBe(recovered);
      expect(comparisonAcquisitions(observed)).toEqual(asked);
      expect(artifacts.asked()).toEqual([3, 1]);
    });
  }
}
