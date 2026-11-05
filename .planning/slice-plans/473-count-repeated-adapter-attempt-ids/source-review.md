# Source review — SEED-236#count-repeated-adapter-attempt-ids

**Launch:** Fresh general-purpose reviewer (no conversation inheritance); source-only
inputs: Goal, Scope Required and Preserved from
`.planning/seeds/SEED-236-show-ci-adapter-proof.md#count-repeated-adapter-attempt-ids`.
No plan, return, product, or proof supplied. Reviewer instructed to read no other
project files and change nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| J1 | A developer opens Intent → CI status for a `ciAdapter` project whose attempt IDs repeat across runs at one revision. | slice 1 | observed: trigger setup: intent-ci-proof-adapter-reasons.spec.ts same-check fixture (r2/r1 attempt 1 unit at login) |
| 1 | At that journey, the developer sees that the shown attempt is ambiguous at its revision, with no counts. Qualification: Instead of counts from a summary that may belong to another run's attempt. | slice 1 | observed: intent-ci-proof-adapter-reasons.spec.ts same check: intent-ci-proof-unavailable ambiguous line; getByRole(listitem) count 0 |
| 2 | Ambiguity of the shown adapter attempt counts every attempt the adapter's `discover` answered at that revision, before the newest attempt per check is kept. Trigger example: An earlier run's attempt with the same `attemptId` and check makes the shown one ambiguous. | slice 1 | observed: baseCiAdapterAttempts.ts counts answered; ci-command-adapter discoverAnsweredAttempts; dashboard-story-branch-ci-adapter sameCheck ambiguous true with retained run 8 |
| 3 | When that ambiguity holds, the adapter is asked no proof. | slice 1 | observed: intent-ci-proof-adapter-reasons.spec.ts same check: proofRequests() === [] |
| 4 | The adapter manual states the rule as built. | slice 1 | observed: src/skills/dough-execute-plan/manuals/custom-ci-proof.md: discover-answered before newest-per-check; custom-ci.md links there |
| 5 | The dashboard development doc states the rule as built. | slice 1 | observed: docs/dashboard-development-intent.md: discover answered before newest-per-check retention; no adapter asked |
| 6 | The shown verdict and attempt are preserved. | slice 1 | observed: intent-ci-proof-adapter-reasons + sameCheck: intent-ci-state verdict; Attempt 1 / adapterAttempt runId 8 attemptId 1 |
| 7 | The execution observer's choice of the newest attempt per check is preserved. | slice 1 | observed: ci-command-adapter: discoverAncestorCandidates still retained newest; observer consumers unchanged |
| 8 | The CI status judgment's choice of the newest attempt per check is preserved. | slice 1 | observed: baseCiJudgment judgeNearest over retained; sameCheck state pass with newest run 8 |
| 9 | Every other proof reason is preserved. | slice 1 | observed: intent-ci-proof-adapter-reasons different-checks + intent-ci-proof-adapter.spec.ts still pass |
| 10 | The GitHub Actions path is preserved. | slice 1 | observed: no GitHub Actions proof path edits in diff (ciProofArtifact / GHA path untouched) |
