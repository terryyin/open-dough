# Source-only review qualifications

Verbatim return sections from `/root/source_review_current_load`; original input
and complete return retained at source-review.md locations. Previous178-item
review remains preserved externally and previous159-item at Git7305433.

## Noncommitment qualifications and historical observations

These supply context, attribution, evidence, or interpretation. They are not new commitments, implementation advice, slice ownership, or an acceptance decision.

1. **Goal context:** The intended result supports trustworthy local full gates and hosted shards. “Usual parallel load” is source wording, not an independently measured number.
2. **Scope target qualification:** The routed findings/cases are included because they share this margin problem. The input names three SEED-284 candidates but does not supply their individual identities.
3. **Admission evidence, unchanged main:** At unchanged main `f9ed9f52b` on 2026-11-11, two two-worker runs at load 19–23 missed the 5 s observation in “an unspent eligible receipt disabled while original jobs are unavailable stays old on re-enable” in both runs. “eligible105-second receipt prepared before enablement stays old after acceptance” missed in one of those runs. Terry routed them here that day. The exact source spelling `eligible105-second` is retained; no correction or inferred alternate title is supplied.
4. **Admission evidence, scratch-fixture-only misses:** The admission sibling “an otherwise eligible receipt for Taken work does not authorize a Done follow-up” and `landed-ci-history-no-proof-recovery.spec.ts:36` each missed a 5 s history poll once beside a scratch fixture change, and in no run of main. This input does not establish an unchanged-main failure for either.
5. **Separate work:** The automatic-repeat and verdict specs belong to SEED-314. This source attribution is retained without reading that story or inventing its scope.
6. **Restriction rationale:** The deadline/load restrictions protect trustworthy gate meaning. The input explicitly says omitted examples are not thereby rejections.
7. **External failure policy:** The input invokes the project's failing and flaky test policy by link. That linked policy was not read; no additional policy text is inferred from its title. The input itself says a flaky or environment-dependent timeout remains a defect until stable locally and in CI, and the amendment retains all failure duties.
8. **Original evidence retention:** The original failure inventory and retained baseline are said to retain the 2026-11-10 diagnosis and source links unchanged. Their contents were not read.
9. **Measurement history:** The source audit used retained CI evidence. It did not run an experiment or measure a saving.
10. **Earlier lead evidence:** A synchronous `git rev-parse` per fake Actions branch-tip answer was about 46 ms per call in the earlier diagnosis. A shell and curl client measured about 3× cheaper. These are supplied earlier observations, not newly observed savings.
11. **Earlier lead evidence:** The hosted fixture had roughly 66 sequential Git commands; they took 60% of the comparison case's time in the earlier diagnosis. Whether they affect in-scope cases remains a question in the source.
12. **Earlier lead evidence:** The touch review journey used 31 phone strokes and 186 touch commands. Twenty strokes read a 3,000 px line to its end and back.
13. **Human instruction, exact quotation:** “I think you will have to proceed with this average load because the other tasks are likely to finish anytime soon. So please adjust things proportionally.” The input identifies this as Terry's explicit instruction of 2026-11-12. It does not supply a numeric contemporaneous load.
14. **Amendment precedence:** The amendment explicitly supersedes the earlier requirement to wait for local load 20–30 for remaining verification. It changes planning estimates and the remaining local load condition; it supplies no permission to stretch timeouts, observations, or shard deadlines. It supplies no linear performance evidence and no observed speedup derived from a load ratio.

## Location references supplied by the input

These are references only. None was opened or read. Relative destinations are reproduced as supplied by the input; no target resolution is asserted.

- Original failure inventory and retained baseline: `../slice-plans/576-fit-dashboard-journeys-in-default-timeout/design-and-proof.md#original-ci-evidence-from-the-seed`.
- Failure journey: `../../dashboard/tests/runtime/production-watcher-failures.spec.ts`.
- Restart journey: `../../dashboard/tests/runtime/production-watcher.spec.ts`.
- Closure journeys: `../../dashboard/tests/sessions/agent-completion-quiet.spec.ts`.
- Reporting boundary: `../../dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts`.
- Touch review: `../../dashboard/tests/review/story-review-touch.spec.ts`.
- Story-branch landed: `../../dashboard/tests/review/story-review-story-branch-landed.spec.ts`.
- Completed conflicts: `../../dashboard/backend-tests/review/story-review-completed-conflicts.spec.ts`.
- One-shot choice: `../../dashboard/tests/review/story-review-one-shot-choice.spec.ts`.
- One-shot choice races: `../../dashboard/tests/review/story-review-one-shot-choice-races.spec.ts`.
- Completed merge edits: `../../dashboard/tests/review/story-review-completed-merge-edits.spec.ts`.
- Production deployment: `../../dashboard/backend-tests/runtime/production-deployment.spec.ts`.
- Landed CI repeat admission: `../../dashboard/backend-tests/intent/landed-ci-repeat-admission.spec.ts`.
- Separate repeat-checks story: `SEED-314-landed-ci-repeat-checks.md#speed-up-landed-ci-repeat-checks`.
- Failing and flaky test policy: `../../AGENTS.md#failing-and-flaky-tests`.
- Maintained macOS sleep guard and power condition: `../../tests/local-test-resources.md#machine-sleep-on-macos`.
