// Raw retained facts for a published Done landing distinct from completion.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import type { StoryCiComparisonSetup } from "./storyCiComparisonFixture.ts";
import { commonGitDir } from "./launchLanding.ts";
import { git } from "./storyReviewWorktree.ts";
import { keepLandedCiHistory } from "./landedCiHistory.ts";

export function keepDoneWallProvenanceHistory(
  home: string,
  origin: StartOrigin,
  setup: StoryCiComparisonSetup,
  selected: {
    readonly revision: string;
    readonly runId: number;
    readonly selection: "equivalent" | "later";
    readonly ms: number;
    readonly startedAt: string;
  },
) {
  const endpoint = setup.landingMerge;
  if (endpoint === undefined)
    throw new Error("Provenance requires a distinct landing");
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
  const prior = order
    .slice(0, end)
    .filter((revision) => revision !== selected.revision)
    .slice(-6);
  if (prior.length !== 6)
    throw new Error("Provenance requires six preceding revisions");
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(order);
  const record = (
    revision: string,
    measured: string,
    runId: number,
    ms: number,
    selection: "exact" | "equivalent" | "later",
    index: number,
  ) => {
    const startedAt =
      runId === selected.runId
        ? selected.startedAt
        : `2026-11-${String(index + 1).padStart(2, "0")}T10:00:00Z`;
    return builder.recording(
      makeMe.aLaunchLanding
        .capturedFrom({
          repository: commonGitDir(origin.project),
          identity: setup.identity,
        })
        .comparing({ base: prior[0] ?? revision, revision })
        .deliveredAs({
          delivery: `record-${index}`,
          receipt: `record-${index}`,
        })
        .receivedAt(startedAt)
        .please(),
      `run/${runId}/1`,
      {
        revision: measured,
        state: "pass",
        runId,
        runAttempt: 1,
        runUrl: `https://ci.invalid/runs/${runId}`,
        startedAt,
        completedAt: new Date(Date.parse(startedAt) + ms).toISOString(),
        proof: makeMe.aCiProof
          .forRun({ revision: measured, runId })
          .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
          .please(),
      },
      selection,
    );
  };
  prior.slice(1).forEach((revision, index) => {
    record(revision, revision, index + 401, 100000, "exact", index + 1);
  });
  if (selected.selection === "equivalent") {
    record(
      selected.revision,
      selected.revision,
      selected.runId,
      selected.ms,
      "exact",
      7,
    );
    const earlierCancellation = prior[0];
    if (earlierCancellation === undefined)
      throw new Error("Earlier cancellation missing");
    record(earlierCancellation, setup.completion, 901, 99000, "later", 0);
  }
  record(
    endpoint,
    selected.revision,
    selected.runId,
    selected.ms,
    selected.selection,
    8,
  );
  keepLandedCiHistory(home, builder.please());
}
