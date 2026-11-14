// The judgment landed history collection shares with Done comparison memory
// (`landedSlotResolution`), asked directly over supplied history: no server,
// Git repository or process starts.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { lookupResultBuild } from "../../server/baseCiRevisionLookup.ts";
import { storyBranchLandedExactLookup } from "../../server/exactSkippedEquivalent.ts";
import { landedSlotResolution } from "../../server/landedCiResolution.ts";
import { landing } from "../support/comparisonRead.ts";
import { representedFinalityFacts } from "../support/finalityComparisonFacts.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import { finalityArtifacts } from "../support/finalityArtifacts.ts";
import { archiveOf, listedArtifact } from "../support/ciProofMemory.ts";

test("later malformed listing past the walk and the landing hour waits for proof of the represented run, then is its later build", async () => {
  // Completion plus thirty following revisions exceeds the fixed walk.
  const facts = representedFinalityFacts("later", 30);
  const subject = makeMe.aCiProofRun
    .with({ revision: facts.represented, runId: 201, runAttempt: 1 })
    .please();
  const proof = facts.proofs[201];
  if (proof?.kind !== "summary") throw new Error("Expected arranged summary");
  let unanswered = true;
  const artifacts = finalityArtifacts(facts, {
    listing: () =>
      Promise.resolve({
        artifacts: unanswered
          ? "not an artifact listing"
          : [listedArtifact(subject)],
      }),
    archive: () => Promise.resolve(archiveOf(proof.summary)),
  });
  const { builds, source } = storyCiComparisonEvidence({
    ...facts,
    proofReader: artifacts.proofReader,
  });
  const receivedAt = "2026-11-05T15:00:00.000Z";
  const judgment = async () =>
    landedSlotResolution(
      await lookupResultBuild(
        landing,
        landing,
        builds,
        "No completed CI build was found at the landed revision.",
        storyBranchLandedExactLookup(true, source.trunkHead),
      ),
      { revision: landing, receivedAt },
      source.trunkHead,
      builds,
      () => Date.parse(receivedAt) + 3 * 3_600_000,
    );

  expect(await judgment()).toEqual({
    kind: "pending",
    waitsFor: "proof",
    run: { runId: 201, runAttempt: 1 },
  });
  expect(artifacts.asked()).toEqual([1, 0]);

  unanswered = false;
  expect(await judgment()).toMatchObject({
    kind: "build",
    revision: facts.represented,
    selection: "later",
    runId: 201,
    runAttempt: 1,
    requestedStatus: { kind: "cancelled" },
  });
  expect(artifacts.asked()).toEqual([2, 1]);
});
