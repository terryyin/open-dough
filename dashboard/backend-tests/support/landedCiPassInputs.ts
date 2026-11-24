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
import type { RevisionCiBuild } from "../../server/baseCiRevisionNearest.ts";
import { timeWithoutAdapterRunnerWaits } from "../../server/ciTimeWithoutRunnerWaits.ts";
import type { ComparisonBuildSource } from "../../server/comparisonBuildSource.ts";
import type { CiProof, CiProofRun } from "../../src/ciProof.ts";
import type { CiTimeWithoutRunnerWaits } from "../../src/storyCiComparison.ts";
import {
  collectLandedCiPass,
  type LandedCiPassInputs,
} from "../../server/landedCiPass.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { landedCiHistorySchema } from "../../src/landedCiHistory.ts";
import {
  historyStore,
  keptLandedCiHistory,
  type ProjectHistory,
} from "../../server/landedCiHistoryStore.ts";
import { updateProjectHistory } from "../../server/landedCiKeepEvidence.ts";
import {
  performIntentCiHistoryRead,
  type IntentCiHistoryRead,
} from "../../server/intentCiHistoryRead.ts";
import { buildKeyOf } from "../../src/landedCiBuildKey.ts";
import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import type { KeptBuild } from "../../server/landedCiObservation.ts";
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
  const inputs = async (stopped: AbortSignal): Promise<LandedCiPassInputs> => ({
    source: project,
    receipts: answers
      .records()
      .flatMap(({ landing }) => (landing === undefined ? [] : [landing])),
    history: await keptLandedCiHistory(project.id, home),
    landingOrder: () => Promise.resolve(answers.trunk),
    read: () =>
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
    stopped,
  });
  // One whole pass, as the collection runs it.
  const collect = async () =>
    collectLandedCiPass(await inputs(new AbortController().signal));
  return { inputs, collect, asked, home };
}

// The machine's kept landed CI history for `project` is `history`; answers
// the document's file.
export async function keepHistory(
  home: string,
  history: ProjectHistory,
  project = passProject,
): Promise<string> {
  await updateProjectHistory(project.id, () => history, home);
  return historyStore(home).file;
}

async function entriesRead(
  home: string,
  project: PublishedSource,
  named: IntentCiHistoryRead | undefined,
) {
  const read = await performIntentCiHistoryRead(project, named, { home });
  if (read.kind !== "answered") throw new Error("No history answer");
  return landedCiHistorySchema.parse(read.answer).entries;
}

// The wall-time history read's entries from the kept history alone.
export function historyEntries(home: string, project = passProject) {
  return entriesRead(home, project, undefined);
}

// The entries of the history read naming CI time without runner waits, from
// the kept history alone.
export function measuredHistoryEntries(home: string, project = passProject) {
  return entriesRead(home, project, {
    kind: "intent-ci-history",
    measure: historyMeasure.value,
  });
}

// Trunk revisions in order, oldest first, each building the project but
// the planning-only `skips` its CI workflow ignores. A run's CI proof is
// `proofOf`'s answer, or none. A selected attempt's CI time without runner
// waits is `measureOf`'s answer, or the reason an empty job graph gives.
export function landedCiPassInputs(
  trunk: readonly string[],
  answers: {
    readonly runs: () => readonly ListedRun[];
    readonly records: () => readonly LaunchRecord[];
    readonly readable?: () => boolean;
    readonly now?: () => number;
    readonly skips?: readonly string[];
    readonly proofOf?: (run: CiProofRun) => CiProof;
    readonly measureOf?: (build: RevisionCiBuild) => CiTimeWithoutRunnerWaits;
  },
  home = machineHome(),
) {
  let repository = makeMe.aRepository.withRevision("0".repeat(40), {
    files: { ".github/workflows/ci.yml": workflow, "src/app.ts": "0\n" },
  });
  for (const revision of trunk)
    repository = repository.withRevision(revision, {
      files: answers.skips?.includes(revision)
        ? { "docs/plan.md": `${revision}\n` }
        : { "src/app.ts": `${revision}\n` },
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
      timeWithoutRunnerWaitsOf: (build) =>
        Promise.resolve(
          answers.measureOf?.(build) ?? timeWithoutAdapterRunnerWaits([]),
        ),
    },
    proofOf: (run) =>
      Promise.resolve(
        answers.proofOf?.(run) ?? makeMe.aCiProof.unavailable("none").please(),
      ),
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

// Kept passed builds of the stated attempts, measured with wall time alone,
// each landing its own revision in trunk order under a receipt its launch
// record repeats; answers those launch records.
export async function keepWallTimeBuilds(
  home: string,
  attempts: readonly Omit<KeptBuild, "state" | "timeWithoutRunnerWaits">[],
): Promise<readonly LaunchRecord[]> {
  const builds = attempts.map((attempt) =>
    makeMe.aKeptBuild
      .with({
        ...attempt,
        state: "pass" as const,
        timeWithoutRunnerWaits: undefined,
      })
      .please(),
  );
  const receiptOf = (build: KeptBuild) => `receipt-${build.revision}`;
  const at = (index: number) =>
    new Date(Date.parse("2026-11-05T09:00:00Z") + index * 60_000).toISOString();
  let history = makeMe.aLandedCiHistory.inTrunkOrder(
    builds.map((build) => build.revision),
  );
  builds.forEach((build, index) => {
    history = history.recording(
      makeMe.aLaunchLanding
        .comparing({ base: "b".repeat(40), revision: build.revision })
        .deliveredAs({ delivery: "landing", receipt: receiptOf(build) })
        .receivedAt(at(index))
        .please(),
      buildKeyOf(build),
      build,
    );
  });
  await keepHistory(home, history.please());
  return builds.map((build, index) =>
    makeMe.aLaunchRecord
      .executing({ identity: `SEED-9#${build.revision}`, title: "t" })
      .launchedAt(at(index))
      .landedAt(build.revision, { receipt: receiptOf(build) })
      .please(),
  );
}
