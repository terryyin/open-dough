# Source-only review

Reviewer launch: collaboration agent `/root/source_review`, fresh context (`fork_turns: none`).
Input: only the selected story's original Goal, Scope, exclusions and five key examples;
no plan, implementation or proof. The launch and numbered return are retained in
the execution conversation. Source unchanged at claim `cad4e6746`.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | A developer reviewing a Done story can recover its Landed comparison when its CI run becomes available. | slice 2 | |
| C02 | Recovery also works when the run’s proof becomes available. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| C03 | Check again supports recovery within the same dashboard process. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-pending-proof.spec.ts: actual Check again changes Branch fallback to Landed, shows equivalent source and then asks no provider requests |
| C04 | Selecting the story again supports recovery within that same process. | slice 2 | |
| C05 | Pending evidence never becomes a permanently remembered negative answer. |  | G3 |
| C06 | History collection and Done comparison memory share the existing Landed pending/final judgment. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| C07 | A queued build stays refreshable. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| C08 | A running build stays refreshable. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| C09 | A cancelled landing awaiting a later build stays refreshable. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts: running later build finishes and a new later run is pushed; real reselection recovers later provenance |
| C10 | An unread CI request stays refreshable. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| C11 | An unanswered equivalent-build proof read stays refreshable. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| C12 | An unanswered later-build proof read stays refreshable. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| C13 | A run that CI may still create stays refreshable. | slice 2 | |
| C14 | An answered missing artifact produces a final, explained gap. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| C15 | An answered expired artifact produces a final, explained gap. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| C16 | An answered invalid artifact produces a final, explained gap. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| C17 | An answered unopenable artifact produces a final, explained gap. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| C18 | Completed answers retain final-answer reuse. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-retry.spec.ts and new pending-proof specs: repeated Check again/reselection preserves final answer and valid proof without upstream requests; corrected terminal fixture leaves Landed No build |
| C19 | Final Done answers remain remembered. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-retry.spec.ts and new pending-proof specs: repeated Check again/reselection preserves final answer and valid proof without upstream requests; corrected terminal fixture leaves Landed No build |
| C20 | Repeated reads reuse final answers without further provider requests. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-retry.spec.ts and new pending-proof specs: repeated Check again/reselection preserves final answer and valid proof without upstream requests; corrected terminal fixture leaves Landed No build |
| C21 | Repeated reads reuse valid proofs without further provider requests. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-retry.spec.ts and new pending-proof specs: repeated Check again/reselection preserves final answer and valid proof without upstream requests; corrected terminal fixture leaves Landed No build |
| C22 | A gap never becomes zero. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| C23 | Existing build selection is preserved. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-skipped.spec.ts, intent-ci-comparison-cancelled-landing.spec.ts, intent-ci-comparison-fast-forward.spec.ts: independent existing endpoint/provenance/timing assertions unchanged and passing |
| C24 | Exact-build provenance is preserved. | slice 2 | |
| C25 | Equivalent-build provenance is preserved. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| C26 | Later-build provenance is preserved. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| C27 | Existing timing explanations are preserved. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-skipped.spec.ts, intent-ci-comparison-cancelled-landing.spec.ts, intent-ci-comparison-fast-forward.spec.ts: independent existing endpoint/provenance/timing assertions unchanged and passing |
| C28 | Endpoint proof reuse is preserved. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-retry.spec.ts and new pending-proof specs: repeated Check again/reselection preserves final answer and valid proof without upstream requests; corrected terminal fixture leaves Landed No build |
| C29 | Taken freshness is preserved. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-taken.spec.ts: advancing actual published branch head refreshes the provisional comparison and reads newly shown attempt jobs |
| C30 | Taken answers continue to follow live evidence. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-taken.spec.ts: advancing actual published branch head refreshes the provisional comparison and reads newly shown attempt jobs |
| C31 | Published comparison remains available without local capture evidence, as required by ADR 0008. | slice 2 | |
| C32 | Baseline retains its existing selection semantics. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-skipped.spec.ts, intent-ci-comparison-cancelled-landing.spec.ts, intent-ci-comparison-fast-forward.spec.ts: independent existing endpoint/provenance/timing assertions unchanged and passing |
| C33 | Branch retains its existing selection semantics. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-skipped.spec.ts, intent-ci-comparison-cancelled-landing.spec.ts, intent-ci-comparison-fast-forward.spec.ts: independent existing endpoint/provenance/timing assertions unchanged and passing |
| C34 | Both execution modes retain their existing selection semantics. | slice 2 | |
| Q01 | A later first-parent trunk run within the existing walk settles a no-run wait. | slice 2 | |
| Q02 | Reaching the existing walk limit settles a no-run wait. | slice 2 | |
| Q03 | Reaching one hour after the matching recorded landing settles a no-run wait. | slice 2 | |
| Q04 | Any receipt used must match the project. | slice 2 | |
| Q05 | Any receipt used must match the target. | slice 2 | |
| Q06 | Any receipt used must match the story. | slice 2 | |
| Q07 | Any receipt used must match the resolved landed revision. | slice 2 | |
| Q08 | Another preparation landing must not supply the landing’s age. | slice 2 | |
| Q09 | Another execution landing must not supply the landing’s age. | slice 2 | |
| Q10 | Unknown receipt time does not establish that the hour expired. | slice 2 | |
| Q11 | Completion time must not substitute for unknown receipt time. | slice 2 | |
| Q12 | Commit time must not substitute for unknown receipt time. | slice 2 | |
| Q13 | Reading again must not restart the clock. | slice 2 | |
| Q14 | Remaining CI evidence can settle the judgment despite unknown receipt time. | slice 2 | |
| Q15 | Remaining walk evidence can settle the judgment despite unknown receipt time. | slice 2 | |
| Q16 | An unanswered equivalent-build proof remains pending even beyond an hour. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| Q17 | An unanswered later-build proof remains pending even beyond an hour. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| Q18 | A running equivalent build remains refreshable until it finishes. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| Q19 | Sharing finality preserves Trunk Mode’s existing completion ancestor selection. | slice 2 | |
| J01 | A captured landing initially has no run; GitHub subsequently creates a queued run and completes it; Check again advances to the measured exact build in the same process. | slice 2 | |
| J02 | Selecting that story again also recovers its comparison. | slice 2 | |
| J03 | History supplied with the same landing facts agrees with the Done judgment. | slice 2 | |
| J04 | A confirmed skip’s equivalent-build proof request is held; reading again after the provider answers recovers Landed. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: provider-directed wait tests advance real request-owner controlled clock, then recover same source and count two artifact listings |
| J05 | That equivalent-build proof request transiently fails; reading again after the provider answers recovers Landed. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| J06 | That equivalent-build proof request has not received a valid artifact listing; reading again after the provider answers recovers Landed. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| J07 | A cancelled landing’s later-build proof request is held; reading again after the provider answers recovers Landed. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: provider-directed wait tests advance real request-owner controlled clock, then recover same source and count two artifact listings |
| J08 | That later-build proof request transiently fails; reading again after the provider answers recovers Landed. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| J09 | That later-build proof request has not received a valid artifact listing; reading again after the provider answers recovers Landed. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| J10 | Equivalent-build recovery retains the same represented revision. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| J11 | Equivalent-build recovery retains equivalent provenance. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| J12 | Later-build recovery retains the same represented revision. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| J13 | Later-build recovery retains later provenance. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: real published comparison/history reads, controlled provider transitions and counted final reuse |
| J14 | CI answers that an artifact is missing; the explained gap is final. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| J15 | CI answers that an artifact is expired; the explained gap is final. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| J16 | CI answers that an artifact is invalid; the explained gap is final. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| J17 | CI answers that an artifact cannot be opened; the explained gap is final. | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts: unchanged queued/running equivalent, unread CI and terminal artifact assertions relocated by independent refactor; actual reader and provider accounting retained |
| J18 | A captured landing still has no run before its one-hour deadline; it remains pending unless another existing bound settles it. | slice 2 | |
| J19 | Its one-hour deadline arrives with no run; the result becomes final No build. | slice 2 | |
| J20 | CI builds past that landing under the existing first-parent bound; the result becomes final No build. | slice 2 | |
| J21 | An unrelated receipt changes neither that landing’s deadline nor its judgment. | slice 2 | |
| J22 | No matching receipt exists; published comparison still works. | slice 2 | |
| J23 | No matching receipt exists; unknown age alone cannot finalize the comparison. | slice 2 | |
| X01 | This increment adds no cache TTL. | slice 2 | |
| X02 | This increment adds no timed UI polling. | slice 2 | |
| X03 | This increment adds no second resolver. | slice 2 | |
| X04 | This increment adds no adapter protocol. | slice 2 | |
| X05 | This increment adds no broader build reuse. | slice 2 | |
| X06 | Separating adapter wall time from test proof belongs to the sibling story. | slice 2 | |
| X07 | Changing Trunk Mode’s existing completion ancestor selection is outside this story. | slice 2 | |

## Execution resume context

Established start: Story Branch Mode, owned reused worktree
`/Users/terryyin/git/open-dough/.worktrees/keep-done-ci-comparisons-refreshable-while-lande`,
branch `codex/keep-done-ci-comparisons-refreshable-while-lande`, publisher
`dashboard-territory.local-open-dough`, agent `terry-chan`.
Starting revision `14c211d145385d2fbbc50fb032781d3e45046354`; accepted claim
`cad4e6746a7bbd198096b5fe6a8a4b64df620320` on origin/main and the execution
branch. Default checkout `/Users/terryyin/git/open-dough` is separate.
Replanning retains existing planning authority; no slice limit is configured.
Checkout setup: `npm ci --no-audit --no-fund` and
`npm run typecheck:dashboard` passed with the current lockfile.
Hook `.githooks/pre-commit` is check-only staged lint plus dashboard typecheck;
selective formatting is `npm run format`. No generation trigger is implicated.

CI: GitHub Actions `ci.yml` (verified workflow 351271804, name CI), repository
`terryyin/open-dough`, target execution branch. Observer coordinator
`seed288-refresh`, directory `/tmp/dough-ci-501/watch-Sl8kNb`, PID 34654,
session 68699, yielded cell `g541:13`, bound to this checkout. The trunk claim
predates this observer and has `pendingCi: unobserved`.

Proof decision: this Mac is awake on AC, load 7.99/5.62/5.25; another
comparison-test execution and unrelated Pygardon proof are active. Use
`caffeinate -s -i` and one Playwright worker for bounded focused checks.
Implementation owns its commands through terminal results. Reconsider if
contention, failure or changed workload invalidates the basis. Preserve other
worktrees and owners; no full suite is a routine gate.

## Slice 1 acceptance evidence

Accepted the source-to-output comparison in source-review.md against actual
production reader, fixture setup and assertions. Internal Landed finality is
judged before projection; the public DTO and existing selection are unchanged.
The new backend pending-proof matrix observes equivalent/later transient,
malformed and provider-held recovery, including beyond the hour/walk bound;
queued/running equivalent recovery; all four terminal artifact gaps; unread CI;
and provider-free final reuse. The browser pending-proof test uses the actual
Check again control from Branch fallback to Landed, including displayed source.
Existing cancelled-gap journeys observe both future-run continuations, and
Taken proof observes a real published head advancing. Missing-run receipt
acquisition/deadline and reselection remain slice 2's obligations.

Terminal passes on the uncommitted slice-1 candidate:

```sh
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison- backend-tests/intent/landed-ci-history- backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts backend-tests/observation/authenticated-read-shared-listing-failures.spec.ts backend-tests/intent/landed-ci-scope-build-provenance.spec.ts backend-tests/intent/landed-ci-scope-proof-finality.spec.ts backend-tests/intent/landed-ci-scope-proof-recovery.spec.ts backend-tests/intent/landed-ci-scope-proof-lifecycle.spec.ts backend-tests/intent/landed-ci-scope-pending-order.spec.ts --workers=1
npm run typecheck:dashboard
PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i npm test -- tests/support/dashboard-later-trunk-landed.test.mjs tests/support/dashboard-landed-exact-build.test.mjs tests/support/dashboard-ci-revision-nearest.test.mjs
git diff --check
```

Dashboard result: 99 tests across 34 files passed. The earlier 92-case run's
single terminal-fixture failure and its correction are retained in G2; failed
run `dashboard/test-results/2026-11-09T17-56-46.163Z-54918`. No failing verdict
was waived. Consumer trace `/tmp/seed288-slice1-final-consumer-trace.md` lists
651 per-file dispositions, including fixture/control callers, request accounting
and scoped-history consumers; initial-render-only views have unchanged DTOs and
selection and are excluded by effect. Coordinator inspected new setup/assertions,
existing cancellation/Taken continuations, fixture correction and relevant trace
dispositions. Proof ownership: implementation agent `/root/slice1`, terminal
return in this execution conversation.

Independent refactor `/root/refactor1` returned `## REFACTOR COMPLETE`.
No product edits: pending-proof recovery and answer-memory lifecycle proof
were split at cohesive seams, shared provider helpers moved into
pendingLandedComparison.ts, and retry comments compacted. Coordinator inspected
the relocated setup/assertions and reused unchanged 99-test proof. All changed
files fit 250 lines in formatted form. Refactor trace
`/tmp/seed288-refactor1-consumer-trace.md` supplies nine dispositions.
Terminal passes after relocation:

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts --workers=1
npm run typecheck:dashboard
git diff --check
```

Both specs passed all 13 cases. No unresolved proof or refactor gap remains.

Fresh preparation first stopped before staging/commit on the existing lint
rule requiring `return await` inside the history resolver's try/catch. Applied
that mechanical correction within refactor1's traced return; it adds no concept
or path and preserves all accepted resolution/proof boundaries. The helper
already converts rejected pending-judgment reads to unread. Formatting must
repeat after this repair; no older HEAD was delivered.
