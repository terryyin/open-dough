// Raw retained attempts before a real published Done endpoint. The selected
// proof is acquired by the normal collector in the receiving journey.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import type { StoryCiComparisonSetup } from "./storyCiComparisonFixture.ts";
import { git } from "./storyReviewWorktree.ts";
import { commonGitDir } from "./launchLanding.ts";
import type { CiProof } from "../../src/ciProof.ts";

export function scopePriorReferenceHistory(
  origin: StartOrigin,
  setup: StoryCiComparisonSetup,
  values: readonly number[],
  options: {
    selectedProof?: CiProof;
    priorIdentities?: Readonly<
      Record<number, { entry: string; units: readonly ("case" | "file")[] }>
    >;
  } = {},
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
  const priors = order.slice(end - values.length, end);
  if (priors.length !== values.length) {
    throw new Error("Scope reference needs its actual preceding revisions");
  }
  const history = makeMe.aLandedCiHistory.inTrunkOrder(order);
  for (const [index, revision] of priors.entries()) {
    const ms = values[index];
    if (ms === undefined) {
      throw new Error("Missing prior scope duration");
    }
    const runId = index + 201;
    const at = `2026-11-0${index + 1}T10:00:00Z`;
    history.measuredLanding({
      receipt: `prior-scope-${index}`,
      revision,
      identity: setup.identity,
      repository: commonGitDir(origin.project),
      receivedAt: at,
      runId,
      startedAt: at,
      completedAt: new Date(Date.parse(at) + 60_000).toISOString(),
    });
    const identity = options.priorIdentities?.[index];
    const owner = identity?.entry ?? "dashboard/tests";
    history.proofFor(
      `run/${runId}/1`,
      makeMe.aCiProof
        .forRun({ revision, runId })
        .entries([
          makeMe.aCiProofEntry
            .at(owner)
            .holding(
              ...(identity?.units ?? (["case", "file"] as const)).map((unit) =>
                makeMe.aCiProofEvidence
                  .inUnit(unit)
                  .brokenDown(
                    ...(
                      [
                        ["folder/a.spec.ts", ms],
                        ["folder/nested/c.spec.ts", ms * 2],
                        ["root.spec.ts", ms * 3],
                      ] as const
                    )
                      .map(([path, duration]) => ({
                        path: `dashboard/tests/${path}`,
                        passed: 1,
                        durationMs: unit === "case" ? duration : duration / 10,
                      }))
                      .filter(({ path }) => path.startsWith(`${owner}/`)),
                  )
                  .please(),
              ),
            )
            .please(),
        ])
        .please(),
    );
  }
  if (options.selectedProof !== undefined) {
    history.recording(
      makeMe.aLaunchLanding
        .capturedFrom({
          identity: setup.identity,
          repository: commonGitDir(origin.project),
        })
        .comparing({ base: setup.baseline, revision: setup.completion })
        .deliveredAs({ receipt: "selected-scope", delivery: "selected-scope" })
        .receivedAt("2026-11-07T10:10:00Z")
        .please(),
      "run/103/1",
      {
        revision: setup.completion,
        state: "pass",
        runId: 103,
        runAttempt: 1,
        runUrl: "https://ci.invalid/runs/103",
        startedAt: "2026-11-07T10:00:00Z",
        completedAt: "2026-11-07T10:01:00Z",
        proof: options.selectedProof,
      },
    );
  }
  return history.please();
}
