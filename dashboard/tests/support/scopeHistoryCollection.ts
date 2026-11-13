// Canonical landing inputs and actual collected-summary producer answers for
// scoped history journeys. The case supplies dates, identities and measurements.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { CiProof } from "../../src/ciProof.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";
import type { StoryCiComparisonSetup } from "./storyCiComparisonFixture.ts";
import { retainedHistory } from "./collectedScopeHistory.ts";
import { keepMoreLaunchRecords } from "./launchStore.ts";
import { commonGitDir } from "./launchLanding.ts";
import { git } from "./storyReviewWorktree.ts";
import { summaryTextZipAnswer } from "./ciProofCollected.ts";
import {
  collectedScopeFileSummary,
  type ScopeFileTiming,
} from "./scopeHistoryProofs.ts";

export function retainedProofs(
  home: string,
): Record<string, CiProof | undefined> {
  return Object.fromEntries(
    Object.entries(retainedHistory(home)?.builds ?? {}).map(([key, build]) => [
      key,
      build.proof,
    ]),
  );
}

export function recordScopeHistoryLandings(
  dashboard: DashboardServer,
  origin: StartOrigin,
  identity: string,
  recorded: readonly {
    revision: string;
    at: string;
    workflow: "execution" | "refinement";
    receipt: string;
    title: string;
  }[],
) {
  keepMoreLaunchRecords(
    dashboard,
    recorded.map(({ revision, at, workflow, receipt, title }) => {
      const landing = makeMe.aLaunchLanding
        .capturedFrom({
          repository: commonGitDir(origin.project),
          identity,
        })
        .forLaunch(receipt)
        .deliveredAs({ delivery: receipt, receipt })
        .comparing({
          base: git(origin.project, "rev-parse", `${revision}^`),
          revision,
        })
        .receivedAt(at)
        .please();
      return makeMe.aLaunchRecord
        .ofWorkflow(workflow, { identity, title })
        .inClaudeSession({ sessionId: receipt })
        .launchedAt(at)
        .completedWith({ message: "", receivedAt: at })
        .markedDoneAt(at)
        .withCapturedLanding(landing)
        .please();
    }),
  );
}

export function serveCollectedScopeRuns(
  setup: StoryCiComparisonSetup,
  observations: readonly (readonly [
    revision: string,
    runId: number,
    startedAt: string,
    caseMs: number,
    fileMs?: number,
  ])[],
) {
  serveCollectedScopeFileRuns(
    setup,
    observations.map(
      ([revision, runId, startedAt, caseMs, fileMs]) =>
        [
          revision,
          runId,
          startedAt,
          [["root.spec.ts", caseMs, fileMs]],
        ] as const,
    ),
  );
}

// Publish explicit per-file runner facts through the same real CLI producer.
export function serveCollectedScopeFileRuns(
  setup: StoryCiComparisonSetup,
  observations: readonly (readonly [
    revision: string,
    runId: number,
    startedAt: string,
    files: readonly ScopeFileTiming[],
  ])[],
) {
  serveCollectedScopeProofs(
    setup,
    observations.map(([revision, runId, startedAt, files]) => {
      return [
        revision,
        runId,
        startedAt,
        collectedScopeFileSummary(
          { repository: "terryyin/open-dough", runId, attempt: 1, revision },
          files,
        ),
      ] as const;
    }),
  );
}

// Serve each run's proof as the machine keeps it: the provider answers its
// summary, so no case spawns the summary producer.
export function serveKeptScopeProofs(
  setup: StoryCiComparisonSetup,
  observations: readonly (readonly [
    revision: string,
    runId: number,
    startedAt: string,
    proof: CiProof,
  ])[],
) {
  serveCollectedScopeProofs(
    setup,
    observations.map(([revision, runId, startedAt, proof]) => {
      if (proof.kind !== "summary")
        throw new Error(`No summary of run ${String(runId)}`);
      return [
        revision,
        runId,
        startedAt,
        JSON.stringify(proof.summary),
      ] as const;
    }),
  );
}

// Serve each run's serialized summary through the same Actions boundary: the
// producer's actual output, or the summary of a proof the machine keeps.
export function serveCollectedScopeProofs(
  setup: StoryCiComparisonSetup,
  observations: readonly (readonly [
    revision: string,
    runId: number,
    startedAt: string,
    summary: string,
  ])[],
) {
  setup.serveRuns(
    Object.fromEntries(
      observations.map(([revision, runId, startedAt]) => [
        revision,
        [
          makeMe.aCiRun
            .with({
              headSha: revision,
              id: runId,
              attempt: 1,
              conclusion: "success",
              url: `https://ci.invalid/runs/${String(runId)}`,
              createdAt: startedAt,
              startedAt,
              completedAt: new Date(Date.parse(startedAt) + 60_000)
                .toISOString()
                .replace(".000Z", "Z"),
            })
            .please(),
        ],
      ]),
    ),
  );
  const proofText = new Map(
    observations.map(([, runId, , text]) => [runId, text]),
  );
  setup.serveProofs(
    Object.fromEntries(
      [...proofText].map(([runId, text]) => [
        runId,
        {
          kind: "summary" as const,
          artifactId: runId + 900,
          summary: JSON.parse(text) as unknown,
        },
      ]),
    ),
  );
  setup.interceptActions((argv) => {
    const route = argv.find((argument) => argument.startsWith("repos/")) ?? "";
    const zip = /\/actions\/artifacts\/(\d+)\/zip$/.exec(route);
    const text =
      zip?.[1] === undefined ? undefined : proofText.get(Number(zip[1]) - 900);
    return text === undefined ? undefined : summaryTextZipAnswer(text);
  });
}
