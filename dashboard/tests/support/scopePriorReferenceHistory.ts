// Raw retained attempts before a Done endpoint, each a scope duration or a
// failed build, and the selected landing's build kept with `selectedProof`.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import type { StoryCiComparisonSetup } from "./storyCiComparisonFixture.ts";
import { git } from "./storyReviewWorktree.ts";
import { commonGitDir } from "./launchLanding.ts";
import type { CiProof } from "../../src/ciProof.ts";
import { keptScopeFileProof } from "./scopeHistoryProofs.ts";

export function scopePriorReferenceHistory(
  origin: StartOrigin,
  setup: StoryCiComparisonSetup,
  values: readonly (number | "failed")[],
  options: {
    selectedProof: CiProof;
    priorIdentities?: Readonly<
      Record<number, { entry: string; units: readonly ("case" | "file")[] }>
    >;
  },
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
    const landing = {
      receipt: `prior-scope-${index}`,
      revision,
      identity: setup.identity,
      repository: commonGitDir(origin.project),
      receivedAt: at,
      runId,
      startedAt: at,
      completedAt: new Date(Date.parse(at) + 60_000).toISOString(),
    };
    if (ms === "failed") {
      history.failedLanding(landing);
      continue;
    }
    history.measuredLanding(landing);
    history.proofFor(
      `run/${runId}/1`,
      keptScopeFileProof(
        { revision, runId },
        (
          [
            ["folder/a.spec.ts", ms],
            ["folder/nested/c.spec.ts", ms * 2],
            ["root.spec.ts", ms * 3],
          ] as const
        ).map(([file, caseMs]) => [file, caseMs, caseMs / 10] as const),
        options.priorIdentities?.[index],
      ),
    );
  }
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
    makeMe.aKeptBuild
      .with({
        revision: setup.completion,
        state: "pass",
        runId: 103,
        runAttempt: 1,
        runUrl: "https://ci.invalid/runs/103",
        startedAt: "2026-11-07T10:00:00Z",
        completedAt: "2026-11-07T10:01:00Z",
        proof: options.selectedProof,
      })
      .please(),
  );
  return history.please();
}
