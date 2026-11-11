# CI test data

Use the shared [test data architecture](test-data-architecture.md) when arranging
these CI facts. Keep each representation at its actual consuming boundary.

Build CI proof with `makeMe.aCiProof` and entries with
`makeMe.aCiProofEntry.at(path).holding(...evidence)`. Each
`makeMe.aCiProofEvidence` states its declared `.inUnit("case")` or
`.inUnit("file")`, or `.legacy(label)` when no unit was declared. Counts,
timing and breakdown belong to that evidence unit. Keep deliberately old
summary JSON outside the builder when its exact wire format is under proof.
[Proof builders](support/ciProofEntryTestData.mjs) ·
[Proof builder](support/ciProofTestData.mjs)

Build an observed GitHub Actions run with
`makeMe.aCiRun.with({ headSha, ...facts }).please()` and an attempt job with
`makeMe.aGitHubJob.withFacts({ ...facts }).please()`. State revision, run and
attempt identity, branch, event, conclusion and times at the call site when
they drive the case; incidental defaults must not invent identity or
wall-time bounds. `aRevisionCiRun` reuses the same GitHub facts for the
`ListedRun` projection and keeps provider-neutral `adapterAttempt` as a
distinct field. Encode observed facts through `apiRun` / `apiJob` at the
transport boundary so REST field names stay separate from observed
projections (`databaseId` → `id`, observed `url` → `html_url`). Keep actual
Git, response routing, pagination, request counts, faults, clocks, process
lifetime and teardown in the harness. Keep captured job timestamps, log
text, malformed or partial responses and exact encoder-input examples
literal where their form is under proof.
[Run builder](support/ciRunTestData.mjs) ·
[Job builder](support/ciJobTestData.mjs) ·
[API encoding](../src/skills/dough-execute-plan/scripts/github-actions-api-test-fixtures.mjs)

Build a custom CI adapter discovery attempt with
`makeMe.aCiAdapterAttempt` (timed `.passed` / `.failed`, untimed
`.pending` / `.incomplete` / `.passedWithoutTimes`, or `.with` for the
boundary's real optional fields). Preserve opaque and numeric identities
and omit legacy branch, check, context or timing when the case leaves them
unattested; do not invent a URL or ordering requirement from a completion
timestamp alone. Build an adapter queue entry with
`makeMe.aCiQueueEntry.with({ sha, progress, ...facts }).please()` — progress
alone is not a check result. Build a stored revision-coverage record with
`makeMe.aRevisionCoverage.with({ sha, state, ...facts }).please()` and
publish arranged starting facts through the real JSON publication seam when
the consumer reads stored records. Build reuse policy with
`makeMe.aCiReusePolicy.with({ repo, workflow, unit, configuration, context,
targetRef, refs, events, maxAgeMs }).please()` and a reuse query attempt with
`makeMe.aCiReuseAttempt.with({ ...facts }).please()`. Build a project's
integrated-state completion policy with
`makeMe.anIntegratedStatePolicy.with({ check, context, jobs }).please()`.
Build a history-read answered run with
`makeMe.anAnsweredCiRun.with({ runUrl, runId, runAttempt }).please()`. Keep
discovery input, normalized attempts, observed coverage and completion
receipts distinct. Keep actual Git, adapter programs and response encoding,
mailbox registration, workers, wake-ups, controlled clocks, process lifetime
and teardown in the harness. Keep malformed queue or reuse counterexamples,
captured evidence and independently written `validated` / `unresolved`
expectations outside builders. CI proof fragments and summaries use their
own builders.
[Attempt builder](support/ciTimingTestData.mjs) ·
[Queue builder](support/ciQueueTestData.mjs) ·
[Coverage builder](support/ciRevisionCoverageTestData.mjs) ·
[Reuse and policy builders](support/ciReusePolicyTestData.mjs)
