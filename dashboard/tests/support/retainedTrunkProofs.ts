// Canonical retained measurements at actual trunk commits. Publication stays a
// Git harness action; all retained domain facts use the shared MakeMe owners.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { commonGitDir } from "./launchLanding.ts";
import { landedTrunk } from "./landedCiTrunk.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";

type RetainedTrunkFacts = {
  readonly titles: readonly string[];
  readonly receiptPrefix: string;
  readonly firstRunId: number;
  readonly firstDurationMs: number;
  readonly scope: string;
  readonly receiptAt: (index: number) => string;
  readonly measuredAt: (index: number) => string;
  readonly linkedRuns?: true;
};

export function retainedTrunkProofs(
  origin: StartOrigin,
  facts: RetainedTrunkFacts,
) {
  const trunk = landedTrunk(
    origin,
    facts.titles.map((title) => ({ title, kind: "code" })),
    facts.titles,
  );
  const repository = commonGitDir(origin.project);
  return facts.titles.map((title, index) => {
    const revision = trunk.revision(title);
    const receipt = `${facts.receiptPrefix}${String(index + 1).padStart(12, "0")}`;
    const landing = makeMe.aLaunchLanding
      .capturedFrom({ repository })
      .forLaunch(receipt)
      .deliveredAs({ delivery: receipt, receipt })
      .comparing({
        base: git(origin.project, "rev-parse", `${revision}^`),
        revision,
      })
      .receivedAt(facts.receiptAt(index))
      .please();
    const runId = facts.firstRunId + index;
    const ms = facts.firstDurationMs + index;
    const proof = makeMe.aCiProof
      .forRun({ revision, runId, runAttempt: 1 })
      .entries([
        makeMe.aCiProofEntry
          .at(facts.scope)
          .counting(1, "case")
          .timed(ms)
          .please(),
      ])
      .please();
    const startedAt = facts.measuredAt(index);
    return {
      landing,
      key: `run/${String(runId)}/1`,
      ms,
      build: {
        revision,
        state: "pass" as const,
        runId,
        runAttempt: 1,
        ...(facts.linkedRuns === true
          ? { runUrl: `https://ci.invalid/runs/${String(runId)}` }
          : {}),
        startedAt,
        completedAt: new Date(Date.parse(startedAt) + 30_000).toISOString(),
        proof,
      },
    };
  });
}
