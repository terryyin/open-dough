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
import {
  collectLandedCiPass,
  type LandedCiPassInputs,
} from "../../server/landedCiPass.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { landedCiHistorySchema } from "../../src/landedCiHistory.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
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

// The pass over a project's CI builds: the trunk order of its recorded
// landings, its launch records, whether its CI can be read and the clock.
export function landedCiPass(answers: {
  readonly builds: ComparisonBuildSource;
  readonly trunk: readonly string[];
  readonly records: () => readonly LaunchRecord[];
  readonly project?: PublishedSource;
  readonly readable?: () => boolean;
  readonly now?: () => number;
  readonly home?: string;
  // The revision the project's remote trunk ref names; the last landing's.
  readonly trunkHead?: string;
}) {
  const project = answers.project ?? passProject;
  const remoteTrunk = `origin/${project.ref}`;
  const head = answers.trunkHead ?? answers.trunk.at(-1) ?? "";
  const { history } = answers.builds;
  const builds: ComparisonBuildSource = {
    ...answers.builds,
    history: {
      ...history,
      laterTrunk: (landing, at, limit) =>
        history.laterTrunk(landing, at === remoteTrunk ? head : at, limit),
    },
  };
  const home = answers.home ?? machineHome();
  const asked = { proofs: 0 };
  const inputs = (stopped: AbortSignal): LandedCiPassInputs => ({
    projects: [project],
    records: new Map([[project.id, answers.records()]]),
    landingOrder: () => Promise.resolve(answers.trunk),
    read: () => () =>
      Promise.resolve(
        answers.readable?.() === false
          ? { kind: "unread" }
          : { kind: "read", builds },
      ),
    readProof: () => {
      asked.proofs += 1;
      return Promise.resolve(makeMe.aCiProof.unavailable("none").please());
    },
    now: answers.now ?? Date.now,
    home,
    followUps: () => Promise.resolve(),
    stopped,
  });
  // One whole pass, as the collection runs it.
  const collect = () =>
    collectLandedCiPass(inputs(new AbortController().signal));
  return { inputs, collect, asked, home };
}

// The history read's entries from the kept history alone.
export async function historyEntries(home: string, project = passProject) {
  const read = await performIntentCiHistoryRead(project, undefined, { home });
  if (read.kind !== "answered") throw new Error("No history answer");
  return landedCiHistorySchema.parse(read.answer).entries;
}

// Trunk revisions in order, oldest first, each building the project.
export function landedCiPassInputs(
  trunk: readonly string[],
  answers: {
    readonly runs: () => readonly ListedRun[];
    readonly records: () => readonly LaunchRecord[];
    readonly readable?: () => boolean;
    readonly now?: () => number;
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
  const runsAt: string[] = [];
  const builds: ComparisonBuildSource = {
    history: git.history,
    workflow: "ci.yml",
    lookup: {
      listRunsAt: (revision) => {
        runsAt.push(revision);
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
  const pass = landedCiPass({ ...answers, builds, trunk, home });
  return {
    ...pass,
    asked: {
      get runsAt() {
        return runsAt;
      },
      get proofs() {
        return pass.asked.proofs;
      },
    },
  };
}
