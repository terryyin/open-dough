// A real completion delivery is idempotent beside the measured attempt's proof.
import assert from "node:assert/strict";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import type { CompletionSubmission } from "../../server/completionAdmission.ts";
import {
  collectedScopeHistory,
  retainedHistory,
} from "../../tests/support/collectedScopeHistory.ts";
import {
  collectingLandedCi,
  minutesAgo,
  restartAsLandedCiReader,
  resultToLand,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { passedFrom, trunkRun } from "../../tests/support/landedCiTrunk.ts";
import { serveCollectedTrunkRuns } from "../../tests/support/landedCiScopeProofs.ts";
import { postCompletion } from "../../tests/support/completionRecovery.ts";
import { collectedScopeFileSummary } from "../../tests/support/scopeHistoryProofs.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });

test("an actual Done submission and delivery retry keep the same collected proof and one scoped measurement", async ({
  dashboard,
  origin,
  github,
}) => {
  const result = await resultToLand(dashboard, "scope-proof-completion.txt");
  const at = minutesAgo(1);
  const text = collectedScopeFileSummary(
    {
      repository: "terryyin/open-dough",
      runId: 63,
      attempt: 1,
      revision: result.revision,
    },
    [
      ["folder/a.spec.ts", 300, 30],
      ["folder/zero.spec.ts", 0, 0],
      ["root.spec.ts", 200, 20],
    ],
  );
  serveCollectedTrunkRuns(
    github,
    origin,
    () => [trunkRun(result.revision, 63, passedFrom(at, 30_000))],
    () => ({ 63: { kind: "collected", artifactId: 630, text } }),
  );
  const accepted = land(result.record, origin, dashboard.home).result.landing
    .receipt;
  expect(accepted.revision).toBe(result.revision);
  await expect
    .poll(() => retainedHistory(dashboard.home)?.builds["run/63/1"]?.proof)
    .toEqual({ kind: "summary", summary: JSON.parse(text) as unknown });
  const kept = retainedHistory(dashboard.home);
  const asked = github.calls.filter(
    ({ request }) => request.kind === "actions-artifact-zip",
  ).length;
  expect(asked).toBe(1);
  const reporting = result.record.request.reporting;
  assert(
    reporting !== undefined,
    "The real launch supplied its reporting reference.",
  );
  const reportingFor = {
    host: result.record.session.host,
    reference: reporting.reference,
  };
  const post = (submission: CompletionSubmission) =>
    postCompletion(dashboard.origin, submission);
  const firstResponse = await post(
    makeMe.aCompletionSubmission.reportingFor(reportingFor).please(),
  );
  expect(firstResponse.status).toBe(200);
  const first = completionReceiptSchema.parse(JSON.parse(firstResponse.body));
  assert(
    first.delivery !== undefined,
    "The accepted report names its retry delivery.",
  );
  expect(first).toMatchObject({
    reference: reporting.reference,
    outcome: "completed",
    message: "",
    state: "recorded",
  });
  const replayResponse = await post(
    makeMe.aCompletionSubmission
      .reportingFor(reportingFor)
      .retrying(first.delivery)
      .please(),
  );
  expect(replayResponse.status).toBe(200);
  expect(
    completionReceiptSchema.parse(JSON.parse(replayResponse.body)),
  ).toEqual(first);
  expect(retainedHistory(dashboard.home)).toEqual(kept);
  expect(Object.keys(kept?.builds ?? {})).toEqual(["run/63/1"]);
  expect(
    github.calls.filter(
      ({ request }) => request.kind === "actions-artifact-zip",
    ),
  ).toHaveLength(asked);

  const reader = await restartAsLandedCiReader(dashboard, origin, "boundary");
  try {
    const beforeRead = github.calls.length;
    for (const [scope, caseMs, fileMs] of [
      ["dashboard/tests", 500, 50],
      ["dashboard/tests/folder", 300, 30],
      ["dashboard/tests/folder/zero.spec.ts", 0, 0],
    ] as const) {
      const read = await collectedScopeHistory(
        reader.origin,
        scope,
        accepted.revision,
        accepted.receivedAt,
      );
      expect(read.status).toBe(200);
      expect(read.body.entries).toMatchObject([
        {
          kind: "point",
          key: "run/63/1",
          selected: true,
          readings: [
            { kind: "point", unit: "case", ms: caseMs },
            { kind: "point", unit: "file", ms: fileMs },
          ],
        },
      ]);
      expect(
        await collectedScopeHistory(
          reader.origin,
          scope,
          accepted.revision,
          accepted.receivedAt,
        ),
      ).toEqual(read);
    }
    expect(github.calls).toHaveLength(beforeRead);
  } finally {
    await reader.close();
  }
});
