// The external answers one landed CI collection pass reads: a temporary
// machine home for its kept history, the project's Git history, and its CI
// runs and proofs. Collection, selection and persistence stay production's.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { repositoryHistoryReads } from "../../../Distribution/tests/support/repositoryHistoryReads.mjs";
import type { ListedRun } from "../../server/baseCiNearest.ts";
import { timeWithoutAdapterRunnerWaits } from "../../server/ciTimeWithoutRunnerWaits.ts";
import type { ComparisonBuildSource } from "../../server/comparisonBuildSource.ts";
import type { LandedCiPassInputs } from "../../server/landedCiPass.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { workflow } from "./comparisonRead.ts";

export const passProject = makeMe.aPublishedSource
  .with({ id: "landed", label: "Landed", repository: "example/landed" })
  .please();

// A machine home of its own, removed after the case.
export function machineHome(): string {
  const home = mkdtempSync(path.join(tmpdir(), "landed-ci-pass-"));
  onTestFinished(() => {
    rmSync(home, { recursive: true, force: true });
  });
  return home;
}

// Trunk revisions in order, oldest first, each building the project.
export function landedCiPassInputs(
  trunk: readonly string[],
  answers: {
    readonly runs: () => readonly ListedRun[];
    readonly records: () => readonly LaunchRecord[];
  },
  home = machineHome(),
) {
  let repository = makeMe.aRepository.withRevision("0".repeat(40), {
    files: { ".github/workflows/ci.yml": workflow, "src/app.ts": "0\n" },
  });
  for (const revision of trunk)
    repository = repository.withRevision(revision, {
      files: { "src/app.ts": `${revision}\n` },
    });
  const git = repositoryHistoryReads(repository.please());
  const asked = { runsAt: [] as string[], proofs: 0 };
  const builds: ComparisonBuildSource = {
    history: git.history,
    workflow: "ci.yml",
    lookup: {
      listRunsAt: (revision) => {
        asked.runsAt.push(revision);
        return Promise.resolve(
          answers.runs().filter((run) => run.headSha === revision),
        );
      },
      subjectOf: git.subjectOf,
      timeWithoutRunnerWaitsOf: () =>
        Promise.resolve(timeWithoutAdapterRunnerWaits([])),
    },
    proofOf: () =>
      Promise.resolve(makeMe.aCiProof.unavailable("none").please()),
  };
  const inputs = (stopped: AbortSignal): LandedCiPassInputs => ({
    projects: [passProject],
    records: new Map([[passProject.id, answers.records()]]),
    landingOrder: () => Promise.resolve(trunk),
    read: () => () => Promise.resolve({ kind: "read", builds }),
    readProof: () => {
      asked.proofs += 1;
      return Promise.resolve(makeMe.aCiProof.unavailable("none").please());
    },
    home,
    followUps: () => Promise.resolve(),
    stopped,
  });
  return { inputs, asked, home };
}
