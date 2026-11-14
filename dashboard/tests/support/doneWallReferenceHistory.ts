// Canonical raw retained observations beside a published Done landing: prior
// landings on the first-parent revisions before it, its selected build, and
// later landings after it. An actual published story supplies its revisions
// from Git; a mounted comparison names its own.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { KeptBuild } from "../../server/landedCiHistoryStore.ts";
import type { StartOrigin } from "./startOrigin.ts";
import type { StoryCiComparisonSetup } from "./storyCiComparisonFixture.ts";
import { git } from "./storyReviewWorktree.ts";
import { commonGitDir } from "./launchLanding.ts";

// A prior landing before the Done endpoint, oldest first: its own passed
// build's CI wall time with complete proof, a failed build, or a landing whose
// build published no CI proof summary.
export type PriorLanding = number | "failed" | "missing";

// The trunk a Done landing was published on and what its landings record.
export type DoneTrunk = {
  // First-parent revisions, oldest first, through and after the endpoint.
  readonly order: readonly string[];
  readonly endpoint: string;
  readonly identity: string;
  readonly repository: string;
  readonly base: string;
};

export type DoneHistoryOptions = {
  readonly selected?: KeptBuild;
  // The selected landing's complete build, measured this long; another trunk
  // build at `standIn` supplies it when named.
  readonly selectedMs?: number;
  readonly standIn?: {
    readonly provenance: "equivalent" | "later";
    readonly revision: string;
  };
  readonly drop?: number;
  readonly later?: boolean;
  readonly priors?: readonly PriorLanding[];
};

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

// The six default priors average 103 s once the 116 s outlier is excluded.
// The builder is returned unfinished so a case can record more landings.
export function doneHistoryBuilder(
  trunk: DoneTrunk,
  options: DoneHistoryOptions = {},
) {
  const { order, endpoint, identity, repository } = trunk;
  const end = order.indexOf(endpoint);
  const observed = options.priors ?? [
    100000, 100000, 100000, 100000, 115000, 116000,
  ];
  const priors = end < 0 ? [] : order.slice(end - observed.length, end);
  if (priors.length !== observed.length)
    throw new Error(
      `Done reference needs ${String(observed.length)} actual preceding revisions`,
    );
  const builder = makeMe.aLandedCiHistory.inTrunkOrder([...order]);
  for (const [index, revision] of priors.entries()) {
    if (index < (options.drop ?? 0)) continue;
    const startedAt = `2026-11-0${String(index + 1)}T10:00:00Z`;
    const prior = observed[index];
    if (prior === undefined) throw new Error("Prior observation is missing");
    const runId = index + 201;
    const landing = {
      receipt: `prior-${String(index)}`,
      revision,
      identity,
      repository,
      receivedAt: startedAt,
    };
    if (prior === "missing") {
      builder.unmeasuredLanding({
        ...landing,
        reason: "no-proof",
        build: { revision, provenance: "exact", runId },
      });
      continue;
    }
    const build = {
      ...landing,
      runId,
      startedAt,
      completedAt: new Date(
        Date.parse(startedAt) + (prior === "failed" ? 60000 : prior),
      ).toISOString(),
    };
    if (prior === "failed") {
      builder.failedLanding(build);
      continue;
    }
    builder.measuredLanding(build).proofFor(
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
    selection: "exact" | "equivalent" | "later" = "exact",
  ) =>
    builder.recording(
      makeMe.aLaunchLanding
        .capturedFrom({ identity, repository })
        .comparing({ base: trunk.base, revision })
        .deliveredAs({ receipt, delivery: receipt })
        .receivedAt("2026-11-07T10:10:00Z")
        .please(),
      `run/${String(runId)}/1`,
      build,
      selection,
    );
  const selected =
    options.selectedMs === undefined
      ? options.selected
      : provedBuild(
          options.standIn?.revision ?? endpoint,
          103,
          `2026-11-0${String(observed.length + 1)}T10:00:00Z`,
          options.selectedMs,
        );
  if (selected !== undefined)
    record(endpoint, "selected", 103, selected, options.standIn?.provenance);
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
  return builder;
}

export function doneWallReferenceHistory(
  origin: StartOrigin,
  setup: StoryCiComparisonSetup,
  options: DoneHistoryOptions = {},
) {
  const order = git(
    origin.project,
    "rev-list",
    "--first-parent",
    "--reverse",
    "HEAD",
  )
    .trim()
    .split("\n");
  return doneHistoryBuilder(
    {
      order,
      endpoint: setup.completion,
      identity: setup.identity,
      repository: commonGitDir(origin.project),
      base: setup.baseline,
    },
    options,
  ).please();
}
