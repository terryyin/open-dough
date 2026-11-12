// Canonical MakeMe inputs for ledger process tests and for the requests a
// dashboard case saves on a machine; no product behavior is supplied.
import { makeMe } from "./makeMe.mjs";

/** @typedef {import("../../dashboard/server/ciFollowUpStore.ts").RepeatRequest} RepeatRequest */

/**
 * A landing and the repeat request the ledger holds for it: run 71, whose
 * first attempt took 120 s against a 100 s average of five prior builds, with
 * the intent saved, unless the case states otherwise.
 * @param {{
 *   run?: number,
 *   seconds?: number,
 *   averageSeconds?: number,
 *   submission?: RepeatRequest["submission"],
 *   revision?: string,
 *   repository?: string,
 * }} [facts]
 */
export function repeatLedgerFacts({
  run = 71,
  seconds = 120,
  averageSeconds = 100,
  submission = { kind: "intent" },
  revision = "a".repeat(40),
  repository = "example/project",
} = {}) {
  const landing = makeMe.aLaunchLanding
    .comparing({ base: "b".repeat(40), revision })
    .please();
  const startedAt = "2026-11-10T00:00:00.000Z";
  const completed = new Date(Date.parse(startedAt) + seconds * 1000);
  const history = makeMe.aLandedCiHistory
    .measuredLanding({
      ...landing,
      runId: run,
      startedAt,
      completedAt: completed.toISOString(),
    })
    .please();
  const original = history.builds[`run/${String(run)}/1`];
  const request = makeMe.aCiRepeatRequest
    .with({
      repository,
      workflow: "ci.yml",
      workflowId: 7,
      original,
      reference: {
        endpoint: landing.revision,
        sampleCount: 5,
        averageMs: averageSeconds * 1000,
        evidence: [],
      },
      rule: { percent: 5, provisional: true, timingBasis: "attempt-start" },
      originalJobs: [
        makeMe.aGitHubJob
          .withFacts({
            databaseId: 1,
            name: "test",
            run_id: run,
            head_sha: landing.revision,
            started_at: original.startedAt,
            completed_at: original.completedAt,
            status: "completed",
          })
          .please(),
      ],
      requestedAt: "2026-11-10T00:03:00Z",
      submission,
      outcome: { kind: "unverified", explanation: submission.kind },
    })
    .please();
  return { project: "project", landing, request };
}
