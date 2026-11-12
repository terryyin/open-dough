// Landings the origin's machine keeps, each at a stage of its automatic CI
// repeat, before a dashboard starts there: what a real receipt journey
// (./ciFollowUpScenario.ts) leaves in the follow-up ledger
// (../../server/ciFollowUpStore.ts), the landed CI history
// (../../server/landedCiHistoryStore.ts) and the launch records, with the
// provider's facts for each landing's run (./ciFollowUpRepeatRun.ts). A case
// starts real collection and reading from the stage it states.
//
// `keepRepeatLanding` keeps Story A's landing, published as completed, after
// five measured prior builds (./ciFollowUpKeptPriors.ts), at the stage the
// case states (./ciFollowUpRepeatStage.ts). `keepRepeats` keeps
// any landings' ledger entries and serves their runs; saved requests for
// landings no story published (./ciFollowUpSavedRequests.ts) state theirs to
// it. A dashboard may already run on the machine, as a page's does: the
// provider answers before the ledger names its runs, and the ledger is kept
// as that dashboard's own writers keep it (./machineDocument.ts).
import { hostname } from "node:os";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  followUpKey,
  type FollowUpLedger,
} from "../../server/ciFollowUpStore.ts";
import { machineHome } from "../machineLaunchRecords.ts";
import { completedPublishedStory } from "./completedPublishedStory.ts";
import {
  serveRepeatRuns,
  storyLandingRun,
  type OtherAnswers,
  type providerRepeatRun,
} from "./ciFollowUpRepeatRun.ts";
import { heldAt, type RepeatStage } from "./ciFollowUpRepeatStage.ts";
import { followUpFile } from "./ciFollowUpScenario.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import {
  keptPriors,
  keptProofOf,
  landingsNoRepositoryHolds,
} from "./ciFollowUpKeptPriors.ts";
import { keepLandedCiHistory, minutesAgo } from "./landedCiHistory.ts";
import { commonGitDir, git } from "./launchLanding.ts";
import { keepMachineDocument } from "./machineDocument.ts";
import { keepMoreLaunchRecords } from "./launchStore.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";

type LedgerEntry = FollowUpLedger["landings"][string];

// One kept landing: the run of its landed revision, the ledger entry the
// machine holds for it, and the provider's facts for that run.
export type KeptRepeat = {
  readonly run: number;
  readonly entry: LedgerEntry;
  readonly provider: ReturnType<typeof providerRepeatRun>;
};

// `kept` held by the origin's machine in that order, after the entries of
// `earlier` receipts, with follow-up as the machine set it for Open Dough,
// when it did; and the provider serving each kept landing's run, with
// `otherwise` for the repository's other answers: the provider's facts for
// one of those runs.
export async function keepRepeats(
  origin: StartOrigin,
  github: FakeGitHub,
  kept: readonly KeptRepeat[],
  machine: {
    readonly followUp?: "enabled";
    readonly earlier?: readonly LedgerEntry[];
  } = {},
  otherwise?: OtherAnswers,
) {
  const entries = [
    ...(machine.earlier ?? []),
    ...kept.map(({ entry }) => entry),
  ];
  const ledger: FollowUpLedger = {
    projects:
      machine.followUp === undefined
        ? {}
        : { "open-dough": { enabled: true, authority: hostname() } },
    landings: Object.fromEntries(
      entries.map((entry) => [followUpKey(entry.project, entry), entry]),
    ),
  };
  serveRepeatRuns(
    github,
    origin,
    kept.map(({ provider }) => provider),
    otherwise,
  );
  await keepMachineDocument(
    followUpFile({ home: machineHome(origin.machine) }),
    ledger,
  );
  return (run: number) => {
    const found = kept.find((each) => each.run === run);
    if (found === undefined)
      throw new Error(`No kept landing names run ${String(run)}.`);
    return found.provider;
  };
}

// Story A published as completed on the origin's trunk, and its landing as
// the machine keeps it at `stage`: recorded for the story's execution,
// measured by `run`, whose first attempt passed in `seconds`, after five prior
// landings whose builds each passed in `averageSeconds`, every build with its
// CI proof; follow-up enabled on this machine after those five and before the
// story's receipt. `beside` are other landings the machine keeps, and
// `otherwise` the repository's answers beside the provider's. Answers the
// provider's facts by run.
export async function keepRepeatLanding(
  origin: StartOrigin,
  github: FakeGitHub,
  facts: {
    readonly stage: RepeatStage;
    readonly run: number;
    readonly seconds: number;
    readonly averageSeconds: number;
    readonly beside?: readonly KeptRepeat[];
    readonly otherwise?: OtherAnswers;
  },
) {
  const { stage, run, seconds, averageSeconds, beside = [] } = facts;
  const home = machineHome(origin.machine);
  const target = "refs/heads/main";
  const story = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    undefined,
    undefined,
    { interleaved: false, retainWorkspace: true },
  );
  const completion = story.completion;
  const capture = makeMe.aLaunchLanding
    .capturedFrom({
      repository: commonGitDir(origin.project),
      identity: queuedIdentity,
    })
    .forLaunch(`11111111-0000-4000-8000-${String(run).padStart(12, "0")}`)
    .deliveredAs({
      delivery: "33333333-3333-4333-8333-333333333333",
      receipt: `cccccccc-0000-4000-8000-${String(run).padStart(12, "0")}`,
    })
    .comparing({
      base: git(origin.project, "rev-parse", `${completion}^`),
      revision: completion,
    })
    .receivedAt(new Date().toISOString())
    .please();
  const priors = keptPriors(
    landingsNoRepositoryHolds(5),
    averageSeconds,
    target,
  );
  const provider = storyLandingRun(completion, run, seconds);
  const key = `run/${String(run)}/1`;
  const { startedAt, completedAt, workflowId } = provider.original;
  if (
    startedAt === undefined ||
    completedAt === undefined ||
    workflowId === undefined
  )
    throw new Error("A story landing's run names its workflow and bounds.");
  const original = makeMe.aKeptBuild
    .with({
      revision: completion,
      state: "pass",
      runUrl: provider.original.url,
      runId: run,
      runAttempt: 1,
      runBranch: "main",
      startedAt,
      completedAt,
      timingBasis: "attempt-start",
      proof: keptProofOf(completion, run),
      proofPending: false,
    })
    .please();
  const history = priors
    .measuredIn(makeMe.aLandedCiHistory)
    .recording(capture, key, original)
    .inTrunkOrder([...priors.revisions, completion]);
  await keepLandedCiHistory(home, history.please());
  keepMoreLaunchRecords(home, [
    ...priors.records,
    makeMe.aLaunchRecord
      .executing({ identity: queuedIdentity, title: "Story A" })
      .launchedAt(minutesAgo(1))
      .withLanding(capture)
      .please(),
  ]);
  const entry = makeMe.aCiFollowUpEntry
    .with({
      project: "open-dough",
      revision: completion,
      target,
      identity: queuedIdentity,
      receipts: [capture.receipt],
      eligible: true,
      capture,
      ...heldAt(stage, {
        original,
        workflowId,
        reference: priors.referenceFor(completion, {
          key,
          date: startedAt,
          ms: seconds * 1000,
        }),
        job: provider.job,
      }),
    })
    .please();
  const kept = [{ run, entry, provider }, ...beside];
  return {
    provider: await keepRepeats(
      origin,
      github,
      kept,
      { followUp: "enabled", earlier: priors.ledgerEntries },
      facts.otherwise,
    ),
  };
}
