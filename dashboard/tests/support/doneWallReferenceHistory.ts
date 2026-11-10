// Canonical raw retained observations beside an actual published Done story.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { KeptBuild } from "../../server/landedCiHistoryStore.ts";
import type { StartOrigin } from "./startOrigin.ts";
import type { StoryCiComparisonSetup } from "./storyCiComparisonFixture.ts";
import { git } from "./storyReviewWorktree.ts";
import { commonGitDir } from "./launchLanding.ts";

export function doneWallReferenceHistory(
  origin: StartOrigin,
  setup: StoryCiComparisonSetup,
  options: { selected?: KeptBuild; drop?: number; later?: boolean } = {},
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
  const end = order.indexOf(setup.completion);
  const priors = order.slice(end - 6, end);
  if (priors.length !== 6)
    throw new Error("Done reference needs six actual preceding revisions");
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(order);
  for (const [index, revision] of priors.entries()) {
    if (index < (options.drop ?? 0)) continue;
    const startedAt = `2026-11-0${index + 1}T10:00:00Z`;
    const ms = [100000, 100000, 100000, 100000, 115000, 116000][index];
    if (ms === undefined) throw new Error("Prior observation is missing");
    builder.measuredLanding({
      receipt: `prior-${index}`,
      revision,
      identity: setup.identity,
      repository: commonGitDir(origin.project),
      receivedAt: startedAt,
      runId: index + 201,
      startedAt,
      completedAt: new Date(Date.parse(startedAt) + ms).toISOString(),
    });
    builder.proofFor(
      `run/${index + 201}/1`,
      makeMe.aCiProof
        .forRun({ revision, runId: index + 201 })
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
        .capturedFrom({
          identity: setup.identity,
          repository: commonGitDir(origin.project),
        })
        .comparing({ base: setup.baseline, revision })
        .deliveredAs({ receipt, delivery: receipt })
        .receivedAt("2026-11-07T10:10:00Z")
        .please(),
      `run/${runId}/1`,
      build,
    );
  if (options.selected !== undefined)
    record(setup.completion, "selected", 103, options.selected);
  if (options.later) {
    for (const [index, revision] of order.slice(end + 1).entries()) {
      const runId = index + 301;
      record(revision, `later-${index}`, runId, {
        revision,
        state: "pass",
        runId,
        runAttempt: 1,
        startedAt: "2026-11-08T10:00:00Z",
        completedAt: "2026-11-08T10:01:40Z",
        proof: makeMe.aCiProof
          .forRun({ revision, runId })
          .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
          .please(),
      });
    }
  }
  return builder.please();
}
