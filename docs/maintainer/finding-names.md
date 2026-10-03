# Finding names and current follow-up

Reviewed 2026-10-03 under the retrospective-findings runbook. Retention is a
priority decision, not a claim that discarded problems were fixed or cannot recur.
Only **queued** entries have planned follow-up. **Open, unqueued** entries retain
material unresolved consequences; they are not an active implementation commitment.
Released responses under observation are in [the watch list](near-term-watch-list.md).
Codes are permanent; highest allocated is ODF-208. Never reuse a removed code.

## Retained evidence

Each finding keeps its meaning, disposition and linked project evidence. Entries
removed on 2026-10-03 are recoverable at
`99292557:docs/maintainer/finding-names.md`; the earlier pre-trim catalog is at
`9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:docs/maintainer/finding-names.md`.
Count a project/execution once; reports, renamed codes and related symptoms do
not add occurrences. Unknown releases cannot establish post-fix recurrence.

<a id="odf-059"></a>

## ODF-059 — Interrupted agent handoffs
A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-059--delegated-refactor-pass-stalled-after-editing-and-before-reporting).
- **Response / limit:** No lost-agent protocol in delegation guidance. Doughnut plan 132 (0.3.24) reported the same; its log entry was pruned on 2026-10-03.

<a id="odf-074"></a>

## ODF-074 — Unverified planning premises
Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-074--a-ready-plan-named-a-validation-command-the-backlog-tool-does-not-have), [open-dough](../../DearDough.md#odf-074--a-plan-left-a-decisive-browser-delivery-premise-open-for-the-developer-though-it-was-locally-observable), [pygardon](../../../pygardon/DearDough.md#odf-074--plan-statements-about-existing-code-and-host-state-were-not-verified-at-planning-time), [pygardon](../../../pygardon/DearDough.md#odf-074--shared-listing-analysis-overlooked-random-setups-explicit-history-rule), [doughnut](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test).
- **Response / limit:** 2c5ff71 / 0.3.43 and fcc29fad / 0.3.48 (SEED-059, closed at f50499c0) require observing a decisive premise through its consumer. Post-fix reports: Pygardon dependency refresh on 0.3.51, Open Dough plan 197 (base 0.3.51) and plan 206 (0.3.52). The response is not shown to resolve the class; reconsider it in triage (ranked third on 2026-10-03).

<a id="odf-087"></a>

## ODF-087 — Skipped preparation gates
Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-087--cheap-worktree-readiness-substitutes-can-pass-while-native-hosts-skip-the-gate).
- **Response / limit:** Queued-start native acceptance completed; it does not prove the original standalone greeting case obeys preparation. That exact exercise remains unverified.

<a id="odf-097"></a>

## ODF-097 — Publishing after a failed check
A failed formatter or verification result is visible but does not gate the next commit or publication step.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-097--a-failed-verification-result-was-collected-without-gating-the-next-action).
- **Response / limit:** No released guidance response. Three Pygardon executions on 0.3.52–0.3.54 each cost an extra publication. Open Dough's own rows are covered by its pre-commit hook (8a165806 / 0.3.52) and were pruned.

<a id="odf-100"></a>

## ODF-100 — Masked formatter failure
A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-100--agents-reported-vue-tscs-exit-code-from-a-pipe-into-tail-so-the-coordinator-had-to-rerun-the-typecheck).
- **Response / limit:** Released guidance has no exit-status rule for piped checks. Open Dough's pre-commit hook (8a165806 / 0.3.52, exercised by plan 207) covers only this repository. Four Doughnut executions, latest 0.3.46 accepted a wrong typecheck result. Open Dough and Pygardon rows pruned.

<a id="odf-101"></a>

## ODF-101 — Late CI capacity recovery
A plan inherits a known CI capacity shortage but schedules the owned resource cleanup near the end, leaving early increments without CI verdicts.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-101--low-docker-capacity-blocked-in-app-ci-while-the-capacity-freeing-cleanup-was-planned-last).
- **Response / limit:** Pygardon in-app CI capacity; recurred on 0.3.54 (plan 296, whole story unobserved). May belong in Pygardon's ProjectFindings.md; not moved under this run's authorization.

<a id="odf-106"></a>

## ODF-106 — Colliding plan numbers
Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-106--two-plans-planned-concurrently-on-different-checkouts-both-took-number-132), [pygardon](../../../pygardon/DearDough.md#odf-106--two-concurrently-planned-quick-plans-received-the-same-number), [doughnut](../../../doughnut/DearDough.md#odf-106--two-concurrent-executions-allocated-the-same-slice-plan-number-from-different-bases).

<a id="odf-107"></a>

## ODF-107 — Missed message consumers
A changed user-visible error message is accepted using local unit/API proof while another test consumer of the old contract remains broken.

- **Follow-up:** delivered, unreleased: SEED-095#prove-slices-through-consumers (story and plan recoverable at `56ed987b:.planning/seeds/SEED-095-slice-proof-through-consumers.md` and `56ed987b:.planning/slice-plans/237-prove-slices-through-consumers/PLAN.md`). **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-107--a-changed-user-visible-message-was-accepted-without-checking-its-other-consumers).
- **Response / limit:** Delivered on main, first containing release pending: proof selection, delegation and acceptance now choose a slice's proof from every consumer of what it changes: retired literals and values found by search, callers relying on a changed default, every stand-in of a changed contract, page-wide specs, and the changed surface's suite when it fits the focused-check time; a plan's named proof is a minimum, and the coordinator neither accepts nor publishes while a known consumer, including one left for CI, is unrun. Before it: a changed-message consumer failed on 0.3.38 after f0f355c / 0.3.33.

<a id="odf-110"></a>

## ODF-110 — Incomplete readiness replays
A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-110--a-publisher-seam-premise-was-observed-by-reading-the-seam-not-the-race-it-had-to-stop), [open-dough](../../DearDough.md#odf-110--a-plans-consumer-premise-for-an-admission-rule-swept-function-callers-missing-specs-that-relaunch-the-same-story), [doughnut](../../../doughnut/DearDough.md#odf-110--a-readiness-replay-observed-only-the-plans-named-seam-not-the-rest-of-the-slices-journey).
- **Response / limit:** 2c5ff71 / 0.3.43 and fcc29fad / 0.3.48 (SEED-059, closed at f50499c0) require observing a decisive premise through its consumer. Post-fix reports: Pygardon dependency refresh on 0.3.51, Open Dough plan 197 (base 0.3.51) and plan 206 (0.3.52). The response is not shown to resolve the class; reconsider it in triage (ranked third on 2026-10-03).

<a id="odf-121"></a>

## ODF-121 — Transient transport failure ends observation
A reported GitHub transport failure ends observation and leaves later revisions without notification coverage.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-121--one-transient-github-tls-timeout-ended-ci-observation-for-the-rest-of-the-execution).
- **Response / limit:** No retry for transient `gh` errors. Second execution on 0.3.50; managed delivery re-attached at the next publication.

<a id="odf-141"></a>

## ODF-141 — Fixed refactor cost on small accepted slices
Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-141--a-delegated-refactor-pass-ran-on-each-of-two-tiny-guidance-changes-and-edited-nothing), [pygardon](../../../pygardon/DearDough.md#odf-141--most-per-slice-refactor-passes-on-a-small-correction-made-no-edits), [doughnut](../../../doughnut/DearDough.md#odf-141--a-fresh-refactor-agent-per-slice-returned-no-edits-on-three-of-eight-small-slices).
- **Response / limit:** No proportionality rule in released guidance. Four Open Dough, nine Pygardon and three Doughnut executions, latest 0.3.54; cost only, and the pass did pay off in Open Dough plans 200 and 221.

<a id="odf-147"></a>

## ODF-147 — Reasoned red proof leaves ineffective tests
An agent reasons that new tests would fail instead of observing them against pre-change behavior; round-trip or wrong-boundary tests can pass without the fix.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-147--an-implementer-reasoned-that-a-new-test-would-fail-instead-of-running-it-red-and-one-of-its-tests-could-not-fail).

<a id="odf-150"></a>

## ODF-150 — Implementation proof misses indirect consumers
Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario.

- **Follow-up:** delivered, unreleased: SEED-095#prove-slices-through-consumers (story and plan recoverable at `56ed987b:.planning/seeds/SEED-095-slice-proof-through-consumers.md` and `56ed987b:.planning/slice-plans/237-prove-slices-through-consumers/PLAN.md`). **Evidence:** [open-dough](../../DearDough.md#odf-150--slice-proof-chosen-by-the-changed-components-missed-page-wide-invariant-specs), [open-dough](../../DearDough.md#odf-150--shared-readiness-caller-analysis-missed-queued-escalation-continuation), [pygardon](../../../pygardon/DearDough.md#odf-150--focused-slice-proof-missed-consumers-of-a-changed-shared-default-caught-only-by-coordinator-run-wider-suites), [doughnut](../../../doughnut/DearDough.md#odf-150--an-implementers-slice-proof-ran-only-the-specs-it-chose-missing-consumers-of-the-store-method-it-changed).
- **Response / limit:** Delivered on main, first containing release pending: proof selection, delegation and acceptance now choose a slice's proof from every consumer of what it changes: retired literals and values found by search, callers relying on a changed default, every stand-in of a changed contract, page-wide specs, and the changed surface's suite when it fits the focused-check time; a plan's named proof is a minimum, and the coordinator neither accepts nor publishes while a known consumer, including one left for CI, is unrun. Before it: more than ten Open Dough, five Doughnut and one Pygardon executions, latest 0.3.54, about one failed CI run and repair per execution. Reports continue after f0f355c / 0.3.33 and fcc29fad / 0.3.48; a same-cause match with either is not established. Rows once filed under ODF-003 (plans 113, 140) and ODF-100 (plan 181) are this mechanism.

<a id="odf-152"></a>

## ODF-152 — File-size gate conflicts with approved intermediate scope
An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-152--an-unconditional-file-size-check-stopped-a-refactor-with-no-conceptual-candidate), [doughnut](../../../doughnut/DearDough.md#odf-152--the-file-size-rule-conflicted-with-an-approved-staged-simplification-and-mechanical-callers).

<a id="odf-153"></a>

## ODF-153 — Sibling-branch CI failure attribution
A new observer labels a non-ancestor sibling revision as this execution’s branch; observer versus adapter responsibility is unknown.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-153--an-observer-attributed-a-sibling-branch-failure-to-this-execution).
- **Response / limit:** No response. Three Pygardon executions, latest 0.3.54; Pygardon uses a custom CI adapter, so observer versus adapter responsibility is still unknown.

<a id="odf-154"></a>

## ODF-154 — Missing Cursor coordinator identity
Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.

- **Follow-up:** queued, not resolved: [Keep CI observed for Codex and Cursor executions](../../.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md#observe-ci-on-codex-and-cursor) — SEED-094#observe-ci-on-codex-and-cursor. Selected under the authorized 2026-10-03 runbook. **Evidence:** [open-dough](../../DearDough.md#odf-154--cursor-managed-delivery-lacks-its-coordinator-session-identity).
- **Response / limit:** No response: `resolveHostSession` falls back only to CLAUDE_CODE_SESSION_ID. Six Cursor executions, latest 0.3.54; each loses CI observation.

<a id="odf-156"></a>

## ODF-156 — Lost acceptance obligations in delegation
A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-156--a-slice-acceptance-obligation-recorded-as-a-plan-learning-never-reached-the-next-delegation), [pygardon](../../../pygardon/DearDough.md#odf-156--a-gap-deferred-to-a-later-slice-was-not-carried-into-that-slices-delegation).
- **Response / limit:** No response. Second project: Pygardon plan 296 (0.3.54) delivered a story promise incomplete and needed a correction plan.

<a id="odf-157"></a>

## ODF-157 — Identifier-only conceptual searches
An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-157--a-no-other-location-premise-was-swept-with-the-removed-rules-words-missing-the-concepts-other-wording).

<a id="odf-158"></a>

## ODF-158 — Disproportionate required reference reads
Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-158--execute-plans-required-reference-reads-cost-more-than-a-clean-one-slice-run-used).

<a id="odf-169"></a>

## ODF-169 — Stale replay base includes sibling commits
A managed-delivery retry carries the old published base instead of its newly reconciled suffix base and replays sibling commits into conflicts.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-169--a-stale-previously-published-base-after-a-trunk-merge-made-delivery-replay-a-siblings-commits).

<a id="odf-170"></a>

## ODF-170 — Merge driver rooted in a retired worktree
Repository-wide Git configuration names an absolute merge-driver script in one worktree; retiring it breaks backlog merges in all checkouts.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-170--the-shared-product-backlog-merge-driver-points-at-one-worktrees-copy-of-its-script).

<a id="odf-184"></a>

## ODF-184 — Unbounded managed push stalls delivery
A stalled SSH push leaves managed delivery and the coordinator waiting about fifty minutes with no command bound.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-184--managed-deliverys-git-push-stalled-for-about-50-minutes-with-no-bound).

<a id="odf-189"></a>

## ODF-189 — Small additions force unrelated size extractions
A small addition crosses the numeric file-size ceiling and triggers relocation and re-proof of a substantial previously untouched responsibility.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-189--a-four-line-repository-tip-over-forced-extracting-an-unrelated-assimilation-query-block).
- **Response / limit:** File-size rule unchanged since b86175e4. Five Doughnut executions, latest 0.3.54; with ODF-152, ODF-195 and ODF-207 this is one rule family.

<a id="odf-190"></a>

## ODF-190 — Planned observation route is unavailable
Planning names an observation route or log source that is not available to the executing project, causing owner probing or loss of the intended proof.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-190--the-plan-prescribed-production-observations-whose-access-route-or-log-source-did-not-exist-and-whose-results-could-not-change-the-approach).
- **Response / limit:** fcc29fad / 0.3.48 plausibly covers observation routes, but a third Doughnut execution on 0.3.54 (2026-10-03) again planned a paid journey with no available route. Not shown to resolve.

<a id="odf-195"></a>

## ODF-195 — Pre-existing size overrun handled inconsistently
Two refactor passes within one story treat barely touched, already oversized files differently, forcing an unrelated extraction in one and retaining another.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-195--the-file-size-check-split-an-untouched-block-in-one-slice-of-an-execution-and-was-waived-in-a-later-slice).

<a id="odf-200"></a>

## ODF-200 — Undocumented delivery target-ref form
Managed delivery accepts only `refs/heads/<branch>` for `--target-ref`, but its usage text and the step guidance say only `REF`, so coordinators read the script or have a first call refused.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-200--story-branch-deliverys---target-ref-value-had-to-be-read-from-the-script), [pygardon](../../../pygardon/DearDough.md#odf-200--managed-deliverys-usage-text-does-not-say-that---target-ref-must-be-a-full-branch-ref), [doughnut](../../../doughnut/DearDough.md#odf-200--managed-increment-delivery-rejected-a-remote-tracking-target-ref-the-accepted-form-is-not-shown-next-to-the-step).
- **Response / limit:** No response; `execution-increment-delivery.mjs` usage still says `--target-ref REF` at 0.3.55. Twelve executions across three projects, latest 0.3.54. A one-line wording fix; recommended next after the two queued stories.

<a id="odf-201"></a>

## ODF-201 — Codex stream leaves delivered failures unacknowledged
The Codex stream binding notifies CI failures without advancing the durable delivery cursor, so completion retains shutdown for failures already repaired.

- **Follow-up:** queued, not resolved: [Keep CI observed for Codex and Cursor executions](../../.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md#observe-ci-on-codex-and-cursor) — SEED-094#observe-ci-on-codex-and-cursor. Selected under the authorized 2026-10-03 runbook. **Evidence:** [open-dough](../../DearDough.md#odf-201--codex-stream-notifications-leave-handled-failures-unread-at-completion).
- **Response / limit:** No response. Nine Open Dough Codex executions, latest 0.3.54.

<a id="odf-202"></a>

## ODF-202 — Managed Codex delivery lacks observer attachment
Managed delivery under Codex has no supported binding to the yielded stream observer, and guidance forbids the separate stream start that would cover it, so publications go unobserved.

- **Follow-up:** queued, not resolved: [Keep CI observed for Codex and Cursor executions](../../.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md#observe-ci-on-codex-and-cursor) — SEED-094#observe-ci-on-codex-and-cursor. Selected under the authorized 2026-10-03 runbook. **Evidence:** [open-dough](../../DearDough.md#odf-202--managed-codex-delivery-and-yielded-stream-have-no-documented-attachment-seam), [pygardon](../../../pygardon/DearDough.md#odf-202--managed-codex-delivery-has-no-attachment-for-its-detached-observer), [doughnut](../../../doughnut/DearDough.md#odf-202--managed-codex-delivery-left-ci-unobserved-without-a-retained-stream-binding).
- **Response / limit:** No response; `Codex yielded-cell bridge is unavailable` remains in `ci-host-bridge.mjs` at 0.3.55. Thirteen Open Dough, six Pygardon (releases unknown) and one Doughnut Codex executions, latest 0.3.54. Arming the yielded stream before first delivery worked in Open Dough plans 203 and 204.

<a id="odf-203"></a>

## ODF-203 — Wrap-up queues a correction it already applied
Wrap-up applies a documentation correction and in the same commit queues a follow-up story whose premise quotes the old wording.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-203--a-wrap-up-applied-a-documentation-correction-and-also-queued-it-as-a-follow-up-story).
- **Response / limit:** One execution on 0.3.54, after 0bb546e4 / 0.3.53 required an explicit follow-up disposition; whether that response relates is not established.

<a id="odf-204"></a>

## ODF-204 — Interrupted delegated agent keeps running and publishes
After its call is interrupted, a delegated agent continues, commits and pushes its slice despite a no-commit delegation, leaving two writers in one checkout.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-204--an-interrupted-refactor-agent-went-on-to-commit-and-push-its-slice).
- **Response / limit:** One Cursor execution on 0.3.54; severe one-off, possibly host-side. Related to ODF-059; not the same mechanism.

<a id="odf-205"></a>

## ODF-205 — Execution starts on a red trunk unannounced
Startup does not report that the target trunk is already failing CI, so each branch publication re-raises a failure the execution does not own.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-205--execution-started-on-a-red-trunk-and-spent-ci-triage-on-a-failure-it-did-not-own).

<a id="odf-206"></a>

## ODF-206 — Over-budget slice not stopped
The slice time bound is checked only at hand-back, so a delegated slice runs past it and is accepted or extended without re-sizing.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-206--a-slice-ran-past-the-ten-minute-stop-rule-without-a-coordinator-stop).

<a id="odf-207"></a>

## ODF-207 — Size convention missing from implementation delegation
Implementation handoffs omit the file-size convention the refactor pass enforces, so newly created files are split after proof and the proof reruns.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-207--refactor-passes-repeatedly-split-files-the-same-slices-implementation-had-just-created-over-the-size-convention).
- **Response / limit:** Related to ODF-152, ODF-189 and ODF-195 (same unchanged 250-line rule); distinct cause.

<a id="odf-208"></a>

## ODF-208 — Observer worker exits without a recorded cause
The CI observer's worker exits mid-execution without a terminal result or a reported transport error, ending notification coverage.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-208--the-ci-observers-worker-exited-without-a-terminal-result-with-no-recorded-cause).
- **Response / limit:** One Doughnut execution on 0.3.54; the loss was detected and announced. Relationship to ODF-121 (transient transport failure) is not established, so this is a separate identity.
