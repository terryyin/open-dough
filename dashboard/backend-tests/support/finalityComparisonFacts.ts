// Canonical external facts for the actual Done finality reader. No Git is
// materialized; matching, slot selection and memory remain production owners.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CiProof } from "../../src/ciProof.ts";
import {
  baseline,
  start,
  branch,
  landing,
  completion,
  later,
  workflow,
} from "./comparisonRead.ts";

export const finalityIdentity = "SEED-1#story";
export const trunkSide = later;

export function finalityRun(revision: string, id: number) {
  return makeMe.aRevisionCiRun
    .with({
      headSha: revision,
      databaseId: id,
      attempt: 1,
      createdAt: "2026-11-05T14:00:00Z",
      startedAt: "2026-11-05T14:00:00Z",
      completedAt: "2026-11-05T14:04:00.000Z",
    })
    .please();
}

export function finalityComparisonFacts(
  landingChange: "code" | "planning",
  laterTrunkRevisions = 0,
) {
  const change =
    landingChange === "code"
      ? { "src/app.ts": "changed\n" }
      : { "docs/story.md": "planning\n" };
  let repository = makeMe.aRepository
    .withRevision(baseline, {
      files: { ".github/workflows/ci.yml": workflow, "src/app.ts": "before\n" },
    })
    .withRevision(start)
    .withRevision(branch, { files: change })
    .withRevision(trunkSide, { parents: [start] })
    .withRevision(landing, { parents: [trunkSide, branch], files: change })
    .withRevision(completion, { files: { "docs/completion.md": "done\n" } });
  for (let index = 0; index < laterTrunkRevisions; index += 1) {
    repository = repository.withRevision(
      (index + 1).toString(16).padStart(40, "0"),
    );
  }
  const history = repository.please();
  const done = makeMe.aPublishedStoryEndpoint
    .with({
      identity: finalityIdentity,
      mode: "story-branch",
      storyStart: start,
      completion,
      landing: { merge: landing, branchSide: branch },
    })
    .please();
  const runs = [finalityRun(baseline, 101), finalityRun(branch, 102)];
  const proofs: Record<number, CiProof> = Object.fromEntries<CiProof>(
    (
      [
        [baseline, 101],
        [branch, 102],
        [landing, 103],
        [trunkSide, 201],
      ] as const
    ).map(
      ([revision, runId]) =>
        [
          runId,
          makeMe.aCiProof
            .summaryFor({
              revision,
              runId,
              runAttempt: 1,
            })
            .please(),
        ] as const,
    ),
  );
  return { history, done, runs, proofs };
}

export function representedFinalityFacts(
  provenance: "equivalent" | "later",
  laterTrunkRevisions: number,
) {
  const facts = finalityComparisonFacts(
    provenance === "equivalent" ? "planning" : "code",
    laterTrunkRevisions,
  );
  const represented = provenance === "equivalent" ? trunkSide : completion;
  facts.runs.push(finalityRun(represented, 201));
  facts.proofs[201] = makeMe.aCiProof
    .summaryFor({
      revision: represented,
      runId: 201,
      runAttempt: 1,
    })
    .please();
  if (provenance === "later")
    facts.runs.push(
      makeMe.aRevisionCiRun
        .with({
          ...finalityRun(landing, 202),
          conclusion: "cancelled",
        })
        .please(),
    );
  return { ...facts, represented };
}
