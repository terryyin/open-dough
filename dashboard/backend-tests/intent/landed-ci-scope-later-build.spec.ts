// Actual Landed resolution and artifact acquisition through a local scoped read.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
} from "../../tests/support/ciProofCollected.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  collectingLandedCi,
  restartAsLandedCiReader,
  resultToLand,
} from "../../tests/support/landedCiHistory.ts";
import {
  retainedHistory,
  collectedScopeHistory,
} from "../../tests/support/collectedScopeHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";
import { commonGitDir } from "../../tests/support/launchLanding.ts";
import { keepMoreLaunchRecords } from "../../tests/support/launchStore.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";
import { publishCodeLandedBeforeCompletion } from "../../tests/support/storyCiComparisonEarlierLanding.ts";
import {
  laterTrunkRevisions,
  serveEarlierLandingWithLandedOutcome,
} from "../../tests/support/storyCiComparisonLandedOutcome.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});
const retainedProof = (home: string, key: string) =>
  retainedHistory(home)?.builds[key]?.proof;
const scopedHistory = (origin: string, revision: string) =>
  collectedScopeHistory(
    origin,
    "dashboard/tests",
    revision,
    "2026-11-05T14:00:00.000Z",
  );

test("a cancelled landing's collected scope uses its labelled later attempt and omits unrelated later landing points", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const landing = setup.landingMerge ?? setup.completion;
  const later = laterTrunkRevisions(origin.origin, landing);
  const unrelated = later.at(-1);
  expect(later[0]).toBe(setup.completion);
  if (unrelated === undefined || unrelated === setup.completion)
    throw new Error("Fixture needs an unrelated later trunk landing.");
  const recorded = [
    {
      revision: landing,
      receipt: "30000000-0000-4000-8000-000000000001",
      at: "2026-11-05T14:00:00.000Z",
    },
    {
      revision: unrelated,
      receipt: "30000000-0000-4000-8000-000000000002",
      at: "2026-11-05T15:00:00.000Z",
    },
  ];
  keepMoreLaunchRecords(
    dashboard,
    recorded.map(({ revision, receipt, at }) =>
      makeMe.aLaunchRecord
        .executing({ identity: setup.identity, title: "Story A" })
        .inClaudeSession({ sessionId: receipt })
        .launchedAt(at)
        .completedWith({ message: "", receivedAt: at })
        .markedDoneAt(at)
        .withCapturedLanding(
          makeMe.aLaunchLanding
            .capturedFrom({
              repository: commonGitDir(origin.project),
              identity: setup.identity,
            })
            .forLaunch(receipt)
            .deliveredAs({ delivery: receipt, receipt })
            .comparing({
              base: git(origin.project, "rev-parse", `${revision}^`),
              revision,
            })
            .receivedAt(at)
            .please(),
        )
        .please(),
    ),
  );
  const trigger = await resultToLand(
    dashboard,
    "trigger-later-scope-proof.txt",
  );
  serveEarlierLandingWithLandedOutcome(setup, "cancelled", {
    [setup.completion]: [
      makeMe.aCiRun
        .with({
          headSha: setup.completion,
          id: 304,
          attempt: 1,
          conclusion: "success",
          url: "https://ci.invalid/runs/304",
          createdAt: "2026-11-06T10:00:00Z",
          startedAt: "2026-11-06T10:00:00Z",
          completedAt: "2026-11-06T10:01:00Z",
        })
        .please(),
    ],
    [unrelated]: [
      makeMe.aCiRun
        .with({
          headSha: unrelated,
          id: 399,
          attempt: 1,
          conclusion: "success",
          url: "https://ci.invalid/runs/399",
          createdAt: "2026-11-07T10:00:00Z",
          startedAt: "2026-11-07T10:00:00Z",
          completedAt: "2026-11-07T10:01:00Z",
        })
        .please(),
    ],
    [trigger.revision]: [],
  });
  const texts = new Map<number, string>();
  for (const [runId, revision, ms] of [
    [304, setup.completion, 3400],
    [399, unrelated, 9900],
  ] as const)
    texts.set(
      runId,
      collectedSummary(
        { repository: "terryyin/open-dough", runId, attempt: 1, revision },
        [{ entry: "dashboard/tests", parts: 1, unit: "case" }],
        [
          {
            entries: ["dashboard/tests"],
            part: 1,
            of: 1,
            byFile: true,
            record: playwrightRecord([
              ["dashboard/tests/a.spec.ts", "expected", [ms]],
            ]),
          },
        ],
      ),
    );
  setup.serveProofs(
    Object.fromEntries(
      [...texts].map(([runId, text]) => [
        runId,
        {
          kind: "summary" as const,
          artifactId: runId + 1000,
          summary: JSON.parse(text) as unknown,
        },
      ]),
    ),
  );
  setup.interceptActions((argv) => {
    const route = argv.find((argument) => argument.startsWith("repos/")) ?? "";
    const artifact = /\/actions\/artifacts\/(\d+)\/zip$/.exec(route)?.[1];
    const text =
      artifact === undefined ? undefined : texts.get(Number(artifact) - 1000);
    return text === undefined ? undefined : summaryTextZipAnswer(text);
  });
  expect(
    land(trigger.record, origin, dashboard.home).result.landing.receipt
      .revision,
  ).toBe(trigger.revision);
  await expect
    .poll(() => retainedProof(dashboard.home, "run/304/1"))
    .toMatchObject({
      kind: "summary",
      summary: {
        revision: setup.completion,
        runId: 304,
        entries: [
          {
            path: "dashboard/tests",
            evidence: [{ unit: "case", durationMs: 3400 }],
          },
        ],
      },
    });
  await expect
    .poll(() => scopedHistory(dashboard.origin, landing))
    .toMatchObject({
      status: 200,
      body: {
        selectedRevision: landing,
        availability: "retained",
        entries: [
          {
            kind: "point",
            readings: [{ kind: "point", unit: "case", ms: 3400 }],
            selected: true,
            date: "2026-11-06T10:00:00Z",
            build: {
              revision: setup.completion,
              runId: 304,
              runAttempt: 1,
              runUrl: "https://ci.invalid/runs/304",
              provenance: "later",
            },
            landings: [
              { revision: landing, selected: true, provenance: "later" },
            ],
          },
        ],
      },
    });
  const reader = await restartAsLandedCiReader(dashboard, origin, "boundary");
  readers.push(reader);
  const answer = await scopedHistory(reader.origin, landing);
  expect((answer.body as { entries: unknown[] }).entries).toHaveLength(1);
  expect(JSON.stringify(answer.body)).not.toContain(unrelated);
  expect(
    github.calls.filter(
      ({ request }) =>
        request.kind === "actions-artifact-zip" && request.artifactId === 1304,
    ),
  ).toHaveLength(1);
  const asked = github.calls.length;
  expect(await scopedHistory(reader.origin, landing)).toEqual(answer);
  expect(github.calls.slice(asked)).toEqual([]);
});
