// Canonical raw retained observations beside a published Done landing: prior
// landings on the first-parent revisions before it, its selected build, and
// later landings after it, on the revisions its published story's Git holds.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { KeptBuild } from "../../server/landedCiHistoryStore.ts";
import type { StartOrigin } from "./startOrigin.ts";
import type { StoryCiComparisonSetup } from "./storyCiComparisonFixture.ts";
import { git } from "./storyReviewWorktree.ts";
import { commonGitDir } from "./launchLanding.ts";

type DoneHistoryOptions = {
  readonly selected?: KeptBuild;
  readonly later?: boolean;
};

// Each prior landing's passed build, oldest first. The six average 103 s once
// the 116 s outlier is excluded.
const priorMs = [100000, 100000, 100000, 100000, 115000, 116000];

// A passed attempt with complete proof, measured `ms` from `startedAt`.
const provedBuild = (
  revision: string,
  runId: number,
  startedAt: string,
  ms: number,
) =>
  makeMe.aKeptBuild
    .with({
      revision,
      state: "pass",
      runId,
      runAttempt: 1,
      startedAt,
      completedAt: new Date(Date.parse(startedAt) + ms).toISOString(),
      proof: makeMe.aCiProof
        .forRun({ revision, runId })
        .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
        .please(),
    })
    .please();

export function doneWallReferenceHistory(
  origin: StartOrigin,
  setup: StoryCiComparisonSetup,
  options: DoneHistoryOptions = {},
) {
  const { completion: endpoint, identity } = setup;
  const repository = commonGitDir(origin.project);
  const order = git(
    origin.project,
    "rev-list",
    "--first-parent",
    "--reverse",
    "HEAD",
  )
    .trim()
    .split("\n");
  const end = order.indexOf(endpoint);
  const priors = end < 0 ? [] : order.slice(end - priorMs.length, end);
  if (priors.length !== priorMs.length)
    throw new Error(
      `Done reference needs ${String(priorMs.length)} actual preceding revisions`,
    );
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(order);
  for (const [index, revision] of priors.entries()) {
    const startedAt = `2026-11-0${String(index + 1)}T10:00:00Z`;
    const runId = index + 201;
    const ms = priorMs[index];
    if (ms === undefined) throw new Error("Prior observation is missing");
    builder
      .measuredLanding({
        receipt: `prior-${String(index)}`,
        revision,
        identity,
        repository,
        receivedAt: startedAt,
        runId,
        startedAt,
        completedAt: new Date(Date.parse(startedAt) + ms).toISOString(),
      })
      .proofFor(
        `run/${String(runId)}/1`,
        makeMe.aCiProof
          .forRun({ revision, runId })
          .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
          .please(),
      );
  }
  const record = (
    revision: string,
    receipt: string,
    runId: number,
    build: KeptBuild,
  ) =>
    builder.recording(
      makeMe.aLaunchLanding
        .capturedFrom({ identity, repository })
        .comparing({ base: setup.baseline, revision })
        .deliveredAs({ receipt, delivery: receipt })
        .receivedAt("2026-11-07T10:10:00Z")
        .please(),
      `run/${String(runId)}/1`,
      build,
      "exact",
    );
  if (options.selected !== undefined)
    record(endpoint, "selected", 103, options.selected);
  if (options.later)
    for (const [index, revision] of order.slice(end + 1).entries()) {
      const runId = index + 301;
      record(
        revision,
        `later-${String(index)}`,
        runId,
        provedBuild(revision, runId, "2026-11-08T10:00:00Z", 100000),
      );
    }
  return builder.please();
}
