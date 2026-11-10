// Canonical MakeMe inputs for ledger process tests; no product behavior is supplied.
import { makeMe } from "./makeMe.mjs";

export function repeatLedgerFacts() {
  const landing = makeMe.aLaunchLanding
    .comparing({ base: "b".repeat(40), revision: "a".repeat(40) })
    .please();
  const history = makeMe.aLandedCiHistory
    .measuredLanding({
      ...landing,
      runId: 71,
      startedAt: "2026-11-10T00:00:00Z",
      completedAt: "2026-11-10T00:02:00Z",
    })
    .please();
  const original = history.builds["run/71/1"];
  const request = makeMe.aCiRepeatRequest
    .with({
      repository: "example/project",
      workflow: "ci.yml",
      workflowId: 7,
      original,
      reference: {
        endpoint: landing.revision,
        sampleCount: 5,
        averageMs: 100000,
        evidence: [],
      },
      rule: { percent: 5, provisional: true, timingBasis: "attempt-start" },
      originalJobs: [
        makeMe.aGitHubJob
          .withFacts({
            databaseId: 1,
            name: "test",
            run_id: 71,
            head_sha: landing.revision,
            started_at: original.startedAt,
            completed_at: original.completedAt,
            status: "completed",
          })
          .please(),
      ],
      requestedAt: "2026-11-10T00:03:00Z",
      submission: { kind: "intent" },
      outcome: { kind: "unverified", explanation: "intent" },
    })
    .please();
  return { project: "project", landing, request };
}
