// Actual wire bytes and a configured folder for proof-reader memory rules.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import { zipOf } from "../../tests/support/ciProofArtifacts.ts";
import type { CiProofRun } from "../../src/ciProof.ts";

export const repository = "example/project";
export const revision = "a".repeat(40);
export const run = makeMe.aCiProofRun
  .with({ runId: 1, runAttempt: 1, revision })
  .please();
export const signal = () => new AbortController().signal;
export const archiveOf = (summary: unknown) =>
  zipOf("ci-proof-summary.json", JSON.stringify(summary));

export function listedArtifact(subject: CiProofRun, id = 41) {
  return makeMe.aCiProofArtifact
    .with({ id, runId: subject.runId, runAttempt: subject.runAttempt })
    .please();
}

export function configuredAdapter() {
  const described = makeMe.aRepository
    .withRevision("configured", {
      files: {
        ".planning/open-dough.json": JSON.stringify(
          makeMe.projectCiSettings
            .with({ ciAdapter: ["adapter", "proof"] })
            .please(),
        ),
      },
    })
    .please();
  const folder = mkdtempSync(path.join(tmpdir(), "ci-proof-memory-"));
  writeRevisionFiles(folder, described.revisions[0]);
  return {
    folder,
    cleanup: () => {
      rmSync(folder, { recursive: true, force: true });
    },
  };
}
