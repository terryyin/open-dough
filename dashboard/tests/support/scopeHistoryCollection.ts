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
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
} from "./ciProofCollected.ts";

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
  const proofText = new Map<number, string>();
  for (const [revision, runId, , caseMs, fileMs] of observations) {
    proofText.set(
      runId,
      collectedSummary(
        { repository: "terryyin/open-dough", runId, attempt: 1, revision },
        [
          ["dashboard/tests", 1, "case"],
          ...(fileMs === undefined
            ? []
            : [["dashboard/tests", 1, "file"] as const]),
        ],
        [
          {
            entries: ["dashboard/tests"],
            part: 1,
            of: 1,
            byFile: true,
            record: playwrightRecord([
              ["dashboard/tests/root.spec.ts", "expected", [caseMs]],
            ]),
          },
          ...(fileMs === undefined
            ? []
            : [
                {
                  entries: ["dashboard/tests"],
                  part: 1,
                  of: 1,
                  byFile: true,
                  unit: "file" as const,
                  outcomes: "passed\tdashboard/tests/root.spec.ts\n",
                  // Outcomes times are seconds on the wire; the case states milliseconds.
                  times: `${String(fileMs / 1000)}\tdashboard/tests/root.spec.ts\n`,
                },
              ]),
        ],
      ),
    );
  }
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
