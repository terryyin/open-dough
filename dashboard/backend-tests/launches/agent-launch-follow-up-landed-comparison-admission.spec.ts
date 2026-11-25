// A Done story's whole landed comparison through the actual launch boundary.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { defaultBacklogPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-store.mjs";
import type { FollowUpComparison } from "../../src/followUpRequest.ts";
import { accept, launch } from "../../test-support/agentLaunchBoundary.ts";
import { readLandedReview } from "../../test-support/support/completedReviewRequests.ts";
import { ordinaryJourneyCompletedHistory } from "../../test-support/support/completedFollowUpHistory.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { serveDoneAtTrunk } from "../../test-support/support/followUpCompletedFile.ts";
import { otherStory } from "../../test-support/support/followUpStories.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  queuedIdentity,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

test.use({
  serverMode: "boundary",
  originRepository: ordinaryJourneyCompletedHistory(),
});

const storyA = { identity: queuedIdentity, title: "Story A" };
const compare = (origin: StartOrigin) => ({
  baseline: origin.revision("interleaving"),
  tree: origin.revision("completion"),
});

function retainedRun(
  dashboard: DashboardServer,
  origin: StartOrigin,
  story: typeof storyA,
) {
  const { baseline, tree } = compare(origin);
  const record = makeMe.aLaunchRecord
    .executing(story)
    .inClaudeSession({ sessionId: story.identity })
    .onStoryBranch({
      workspace: path.join(dashboard.home, "retired", story.identity),
      branch: "claude/landed-comparison",
    })
    .reportingThrough({ origin: dashboard.origin, command: "claude" })
    .withLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository: origin.origin, identity: story.identity })
        .comparing({ base: baseline, revision: tree }),
    )
    .please();
  if (record.request.reporting === undefined)
    throw new Error("expected a reported launch");
  return { record, reference: record.request.reporting.reference };
}

const followUpRequest = (revision: string, comparison: FollowUpComparison) => ({
  ...request,
  instruction: "Review this accepted landing",
  followUp: makeMe.aFollowUp
    .ofStory(storyA, revision)
    .onComparison(comparison)
    .please(),
});

for (const source of ["retained", "published"] as const) {
  test(`a whole follow-up admits the exact pair of a ${source} landing`, async ({
    request: http,
    dashboard,
    origin,
  }) => {
    const { baseline, tree } = compare(origin);
    let reference: string;
    if (source === "retained") {
      const run = retainedRun(dashboard, origin, storyA);
      keepLaunchRecords(dashboard, [run.record]);
      reference = run.reference;
    } else {
      const record = makeMe.aSessionRecord
        .forExecutionOf(queuedIdentity)
        .closing({ base: baseline, candidate: tree })
        .please();
      reference = record.sessionId;
      await origin.publishRevision({
        files: {
          [sessionRecordPathBeside(defaultBacklogPath, reference)]:
            JSON.stringify(record),
        },
      });
    }
    const { revision } = await serveDoneAtTrunk(dashboard, origin);
    expect(await readLandedReview(http, dashboard, reference)).toMatchObject({
      kind: "landed",
      baseline,
      tree,
    });
    dashboard.claudeScenario("launched");

    const result = await answerOf(
      launch(
        dashboard,
        followUpRequest(revision, { reference, baseline, tree }),
      ),
    );

    expect(result.kind, JSON.stringify(result)).toBe("launched");
    const [started, ...others] = dashboard.claudeLaunches();
    expect(others).toEqual([]);
    expect(started?.instruction).toContain(
      `- Comparison: Landed run ${baseline} → ${tree}`,
    );
  });
}

test("a mismatched baseline or tree and another story's reference are refused before host startup", async ({
  request: http,
  dashboard,
  origin,
}) => {
  const { baseline, tree } = compare(origin);
  const own = retainedRun(dashboard, origin, storyA);
  const foreign = retainedRun(dashboard, origin, otherStory);
  keepLaunchRecords(dashboard, [own.record, foreign.record]);
  const { revision } = await serveDoneAtTrunk(dashboard, origin);
  expect(await readLandedReview(http, dashboard, own.reference)).toMatchObject({
    kind: "landed",
    baseline,
    tree,
  });
  dashboard.claudeScenario("launched");

  const valid = { reference: own.reference, baseline, tree };
  for (const { comparison, status, reason } of [
    {
      comparison: { ...valid, baseline: origin.revision("implementation") },
      status: 409,
      reason: "The file or comparison does not belong to this captured run.",
    },
    {
      comparison: { ...valid, tree: baseline },
      status: 409,
      reason: "The file or comparison does not belong to this captured run.",
    },
    {
      comparison: { ...valid, reference: foreign.reference },
      status: 404,
      reason: "This story has no landed run with that reference.",
    },
  ]) {
    const result = await accept(
      dashboard,
      followUpRequest(revision, comparison),
    );
    expect(result.status, result.body).toBe(status);
    expect(result.body).toContain(reason);
    expect(dashboard.claudeCalls()).toEqual([]);
  }
});
