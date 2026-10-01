# Finding names and current follow-up

Reviewed 2026-09-30 after the owner's request to trim records. Retention is a
priority decision, not a claim that discarded problems were fixed or cannot recur.
Only **queued** entries have planned follow-up. **Open, unqueued** entries retain
material unresolved consequences; they are not an active implementation commitment.
Released responses with current exercised watches are in [the watch list](near-term-watch-list.md).
Codes are permanent; highest allocated is ODF-199. Never reuse a removed code.

## Retained evidence

Each finding keeps its meaning, disposition and linked project evidence. Source
logs keep representative incidents and recent evidence; the pre-trim catalog and
complete older occurrence details are recoverable at
`9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:docs/maintainer/finding-names.md` and the source snapshots named in each log.
Count a project/execution once; reports, renamed codes and related symptoms do
not add occurrences. Unknown releases cannot establish post-fix recurrence.

<a id="odf-003"></a>

## ODF-003 — Missed Markdown contract tests
Treating runtime Markdown changes as having no applicable maintained tests misses an affected contract and delays detection until CI.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-003--file-type-assumptions-skipped-affected-maintained-proof).

<a id="odf-012"></a>

## ODF-012 — Unbounded failure reproduction
Requiring independent reproduction without retaining the smallest observed load or ordering boundary can force repeated complete verdict runs without localizing an intermittent lifecycle failure.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-012--load-sensitive-lifecycle-failures-lack-a-bounded-reproduction-path).

<a id="odf-015"></a>

## ODF-015 — Unverified diagnostic probes
Repeating expensive failure runs before confirming that the intended diagnostic probe is present and observable in the target runtime wastes the run without improving failure evidence.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-015--diagnostic-transport-was-not-validated-before-repeating-failure-runs).

<a id="odf-018"></a>

## ODF-018 — Broken credential handoffs
A credential handoff is not operable until the actual owner can see its prompt and the real non-root runtime user can write the mounted destination.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-018--the-credential-handoff-was-not-validated-at-the-real-user-boundary).

<a id="odf-019"></a>

## ODF-019 — Unsafe host instrumentation
Combining unvalidated host-specific evidence instrumentation with a state-changing operation can strand the operation at an unintended intermediate state when the helper is non-portable.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-019--a-host-specific-timing-helper-crossed-a-destructive-boundary-untested).

<a id="odf-024"></a>

## ODF-024 — Demo isolation leaks
An isolated manual bootstrap does not isolate a packaged tool whose nested invocation falls back to default host volumes and ports. Tests that always supply explicit safe overrides miss that fallback path.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-024--a-real-single-installation-demo-isolated-the-manual-bootstrap-but-not-the-packaged-tools-own-invocation).

<a id="odf-029"></a>

## ODF-029 — Shared-checkout commit capture
An owner catch-all commit in a shared checkout absorbs an unfinished slice before its refactor and formatting gates because the active ownership boundary is not visible.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-029--shared-checkout-execution-let-an-owner-commit-absorb-an-unfinished-slice).

<a id="odf-034"></a>

## ODF-034 — Unsupported CI branches
CI observation validates workflow existence without checking target-branch trigger eligibility, then presents an impossible branch run as merely pending.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-034--ci-observer-started-for-a-feature-branch-that-this-projects-workflow-never-triggers-on).

<a id="odf-038"></a>

## ODF-038 — No-op waiting
A coordinator repeatedly issues no-op shell calls while awaiting asynchronous completion notifications, adding turns without obtaining state or accelerating completion.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-038--repeated-no-op-tool-calls-while-waiting-for-background-task-notifications).
- **Response / limit:** 89728cb / 0.3.18 forbids no-op waits; an actual 0.3.18 execution still made them. The 0.3.45 delegated no-op spawn is related, not another shell-wait occurrence.

<a id="odf-040"></a>

## ODF-040 — Premature delegated publication
A delegated implementer commits and pushes changes and plan delivery notes before the coordinator performs the required review and refactor gates.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-040--a-delegated-implementation-subagent-committed-and-pushed-without-coordinator-review).

<a id="odf-059"></a>

## ODF-059 — Interrupted agent handoffs
A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-059--delegated-refactor-pass-stalled-after-editing-and-before-reporting), [doughnut](../../../doughnut/DearDough.md#odf-059--delegation-guidance-has-no-protocol-for-a-subagent-that-dies-mid-edit-from-an-infrastructure-error-leaving-a-silent-partial-change).

<a id="odf-067"></a>

## ODF-067 — Tautological refusal tests
A Git refusal test elects not to mutate using fixture-known state rather than attempting and observing the real operation reject.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-067--delegated-git-fixture-proof-for-a-stop-behavior-defaults-to-a-tautology).

<a id="odf-069"></a>

## ODF-069 — Missing CI verdicts
Registered revisions are reported uncovered during discovery and their later real verdicts are missed in the observed execution.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-069--a-genuinely-failed-ci-run-was-reported-as-merely-uncovered-not-failed), [doughnut](../../../doughnut/DearDough.md#odf-069--the-ci-observers-fixed-discovery-poll-bound-reports-lost-coverage-for-revisions-whose-ci-run-exists-and-later-succeeds).
- **Response / limit:** 5317499 / 0.3.40 corrects selected-workflow identity. Doughnut plan 045 / 574d61b52c delivered a failure after manual attachment. Earlier missing-verdict causes and end-to-end managed binding remain unresolved; no successful watch is claimed.

<a id="odf-074"></a>

## ODF-074 — Unverified planning premises
Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

- **Follow-up:** delivered with a weak replay result, not shown to resolve: Observe a planning premise through the operation that consumes it — SEED-059#observe-premise-consumers (story and plan recoverable at d9137ef5). **Evidence:** [open-dough](../../DearDough.md#odf-074--a-ready-plan-named-a-validation-command-the-backlog-tool-does-not-have), [pygardon](../../../pygardon/DearDough.md#odf-074--plan-statements-about-existing-code-and-host-state-were-not-verified-at-planning-time), [doughnut](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test).
- **Response / limit:** 2c5ff71 / 0.3.43 requires observing decisive premises. Failures to apply it recur on 0.3.45–0.3.46; unknown releases cannot establish recurrence. Moved-function caller clarifications aa650875/9d4bf02f/c97c3fe0 are delivered but unreleased through 0.3.47.

<a id="odf-077"></a>

## ODF-077 — Lost suite verdicts
Long-running verification is misclassified, duplicated, and its output discarded, delaying a verdict and leaving orphaned containers.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-077--whole-suite-verification-produced-no-verdict-for-about-two-hours).

<a id="odf-083"></a>

## ODF-083 — Stranded shared checkout
An execution switches the shared checkout to its own feature branch and leaves a large uncommitted change, blocking another execution's setup.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-083--a-prior-execution-left-the-shared-main-checkout-on-its-own-feature-branch-with-uncommitted-work-blocking-the-next-plans-execution-setup).

<a id="odf-084"></a>

## ODF-084 — Deleted active worktree
An execution worktree and branch are removed during an active delegated task, forcing recovery while another execution uses shared integration.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-084--a-concurrent-session-deleted-an-active-story-branch-execution-worktree-and-branch-while-a-delegated-subagent-was-mid-slice).

<a id="odf-087"></a>

## ODF-087 — Skipped preparation gates
Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-087--cheap-worktree-readiness-substitutes-can-pass-while-native-hosts-skip-the-gate).
- **Response / limit:** Queued-start native acceptance completed; it does not prove the original standalone greeting case obeys preparation. That exact exercise remains unverified.

<a id="odf-093"></a>

## ODF-093 — Foreign stash restoration
A failed stash push is followed by an unqualified stash pop, applying another session's shared stash.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [open-dough](../../DearDough.md#odf-093--a-delegated-agents-git-stash-pop-applied-another-sessions-stash).
- **Response / limit:** f157f0e and 86e5069 / 0.3.42 isolate the owned stash and prohibit destructive shared-checkout operations; 8f88364/ab3cb42/40cb0bc / 0.3.43 add restore/drop safety. The real foreign-stash boundary remains unexercised; retained for potential work loss.

<a id="odf-096"></a>

## ODF-096 — Invalid acceptance fixtures
Nominally sufficient native acceptance fixtures do not actually satisfy their promises, and the same fault class is rediscovered through paid failing runs.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [open-dough](../../DearDough.md#odf-096--native-acceptance-fixtures-sufficient-side-was-not-credible-and-each-case-paid-a-failed-run-to-learn-it).
- **Response / limit:** 2c5ff71 / 0.3.43 addresses decisive fixture premises. Plan 141 reports 0.3.46 only on resume; original guidance is unknown, so its paid inconclusive run cannot establish post-fix recurrence. Project-owned harness faults remain in ProjectFindings.md.

<a id="odf-097"></a>

## ODF-097 — Publishing after formatter failure
A formatter failure does not stop a semicolon-separated commit and push sequence.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-097--coordinator-published-a-commit-after-the-formatter-failed).

<a id="odf-098"></a>

## ODF-098 — Unfinishable early slices
A slice is planned with a required existing suite that cannot pass until a later slice implements its new invariant.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-098--a-slices-proof-named-a-suite-only-a-later-slices-behavior-keeps-green).

<a id="odf-100"></a>

## ODF-100 — Masked formatter failure
A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [open-dough](../../DearDough.md#odf-100--a-piped-lint-failure-did-not-stop-publication), [pygardon](../../../pygardon/DearDough.md#odf-100--a-piped-formatter-failure-did-not-stop-the-delivery-command-chain), [doughnut](../../../doughnut/DearDough.md#odf-100--agents-reported-vue-tscs-exit-code-from-a-pipe-into-tail-so-the-coordinator-had-to-rerun-the-typecheck).
- **Response / limit:** SEED-065#pre-commit-lint-hook delivers a check-only pre-commit lint hook enabled by `npm ci`. It does not stop `--no-verify` or merge commits, and no later execution has yet shown it on a real masked-status chain.

<a id="odf-101"></a>

## ODF-101 — Late CI capacity recovery
A plan inherits a known CI capacity shortage but schedules the owned resource cleanup near the end, leaving early increments without CI verdicts.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-101--low-docker-capacity-blocked-in-app-ci-while-the-capacity-freeing-cleanup-was-planned-last).

<a id="odf-105"></a>

## ODF-105 — Stashing another writer's work
A delivery command stashes another active slice's uncommitted files instead of staging only owned paths.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-105--a-coordinator-command-stashed-a-concurrent-slices-uncommitted-files).
- **Response / limit:** 86e5069 and f157f0e / 0.3.42 require owned-path staging and restrict stashing to owned CI repair. No verified live-writer avoidance exercise; retained for work safety, without claiming a successful watch.

<a id="odf-106"></a>

## ODF-106 — Colliding plan numbers
Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-106--two-plans-planned-concurrently-on-different-checkouts-both-took-number-132), [pygardon](../../../pygardon/DearDough.md#odf-106--two-concurrently-planned-quick-plans-received-the-same-number), [doughnut](../../../doughnut/DearDough.md#odf-106--two-concurrent-executions-allocated-the-same-slice-plan-number-from-different-bases).

<a id="odf-107"></a>

## ODF-107 — Missed message consumers
A changed user-visible error message is accepted using local unit/API proof while another test consumer of the old contract remains broken.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-107--a-changed-user-visible-message-was-accepted-without-checking-its-other-consumers).
- **Response / limit:** A changed-message consumer failed on 0.3.38 after f0f355c / 0.3.33; the mechanism is not established as the same earlier consumer-exclusion defect. Later failed CI is retained at source.

<a id="odf-109"></a>

## ODF-109 — Unowned ancestor failures
A new observer reports a recent ancestor revision's failure that this execution did not produce or register.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-109--the-execution-observers-first-event-was-a-failure-for-a-pre-execution-trunk-revision).
- **Response / limit:** 50b6d71 / 0.3.38 filters old adapter attempts but intentionally retains the newest completed attempt. Reports on 0.3.38 and 0.3.40 leave ancestor ownership unresolved; a shared cause is not established.

<a id="odf-110"></a>

## ODF-110 — Incomplete readiness replays
A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

- **Follow-up:** delivered with a weak replay result, not shown to resolve: Observe a planning premise through the operation that consumes it — SEED-059#observe-premise-consumers (story and plan recoverable at d9137ef5). **Evidence:** [open-dough](../../DearDough.md#odf-110--a-publisher-seam-premise-was-observed-by-reading-the-seam-not-the-race-it-had-to-stop), [doughnut](../../../doughnut/DearDough.md#odf-110--a-readiness-replay-observed-only-the-plans-named-seam-not-the-rest-of-the-slices-journey).
- **Response / limit:** 2c5ff71 / 0.3.43 requires the promised journey through its consumer. Doughnut plans 049 (0.3.46), 056 and 053 (0.3.47) repeat shallow observations. Open Dough plan 112 uses modified guidance with unknown release; it is not a numbered-release recurrence.

<a id="odf-112"></a>

## ODF-112 — Silent story-branch failures
An attached observer delivers no failure for registered failing story-branch revisions, allowing dependent slices to continue on a red branch.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-112--the-ci-observer-delivered-no-failure-for-failed-story-branch-runs-so-later-slices-were-built-on-a-red-branch).
- **Response / limit:** 5317499 / 0.3.40 corrects demonstrated workflow selection, but the original environment is unrecoverable and its mailbox also lost gh connectivity. Manual failure delivery in plan 045 proves that path only; no success watch covers initial managed attachment.

<a id="odf-113"></a>

## ODF-113 — Wrong regression baseline
A failed previous-slice tip is used to label a regression pre-existing and out of scope, although the execution introduced it earlier.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-113--a-failure-was-called-pre-existing-by-comparing-against-a-revision-that-already-contained-this-executions-earlier-slices).

<a id="odf-115"></a>

## ODF-115 — Unrepresentative regression measurements
A performance guard times a different calculation path or workload from the changed product, allowing a large regression to pass.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-115--a-non-regression-measurement-did-not-exercise-the-product-path-it-guarded).

<a id="odf-120"></a>

## ODF-120 — Satisfied prerequisites leave stale readiness
A dependency lands but its dependent story retains a not-ready assessment whose only reason was that unmet dependency.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-120--a-not-ready-reason-waiting-on-another-storys-landing-was-not-revisited-when-it-landed), [pygardon](../../../pygardon/DearDough.md#odf-120--a-plan-held-not-ready-on-a-siblings-unintegrated-story-branch-with-nothing-to-reassess-it-when-that-branch-landed), [doughnut](../../../doughnut/DearDough.md#odf-120--a-not-ready-assessment-whose-only-reason-was-a-satisfied-start-condition-blocked-queued-startup).

<a id="odf-121"></a>

## ODF-121 — Transient transport failure ends observation
A reported GitHub transport failure ends observation and leaves later revisions without notification coverage.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-121--one-transient-github-tls-timeout-ended-ci-observation-for-the-rest-of-the-execution).

<a id="odf-124"></a>

## ODF-124 — Incomplete guidance searches
A negative claim about guidance searches skill entry files but omits their references, then misdirects delegated work.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-124--the-coordinator-told-parallel-agents-a-guidance-rule-did-not-exist-after-searching-only-skillmd-files).

<a id="odf-125"></a>

## ODF-125 — Interim delegated notifications wake the coordinator
Delegated background tests generate report-pending completion notifications that repeatedly wake a coordinator with no decision to make.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-125--interim-agent-has-not-reported-yet-notifications-repeatedly-woke-the-coordinator-with-nothing-to-decide).

<a id="odf-132"></a>

## ODF-132 — Delegated proof handed back incomplete
An implementer returns normally with required measurements unfinished and asks the coordinator to complete its background proof.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-132--a-delegated-implementation-agent-handed-back-before-finishing-its-own-required-proof).

<a id="odf-134"></a>

## ODF-134 — Story branch delivery undoes a manual trunk rebase
A plan calls for integration with landed sibling work during Story Branch execution; manual rebase and managed delivery reconcile to different bases.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-134--a-story-branch-execution-rebased-onto-trunk-and-managed-delivery-rebased-it-back).

<a id="odf-135"></a>

## ODF-135 — Live trunk prerequisite contradicts execution mode
A plan requires a live action after a slice reaches main but leaves Story Branch Mode selected, which normally reaches main only at wrap-up.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-135--a-plans-after-slice-1-is-on-main-precondition-contradicted-the-default-story-branch-mode).

<a id="odf-138"></a>

## ODF-138 — Safety consequence of an accepted proof gap unexamined
A returned gap for restore-applied-none is accepted as an untested limitation; delivered guidance then drops the only copy of paused work.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [open-dough](../../DearDough.md#odf-138--a-reported-guidance-gap-was-accepted-without-checking-its-consequence-hiding-a-data-loss-path).
- **Response / limit:** b7930baf / release pending after 0.3.47 adds the gap-and-fixture check to `wrap-up.md` "Accept proof". Claude Code only; returns reconstructed, one run per case. Only ODF-185 failed at baseline and returned afterward; the other defect cases already returned, so attribution is weak. Codex and Cursor unclaimed; no successful watch claimed.

<a id="odf-139"></a>

## ODF-139 — Reported defect dismissed without checking the story
An implementer reports a loss that contradicts the story goal; acceptance labels it out of scope and preserves a test that pins it.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-139--the-coordinator-accepted-an-implementers-reported-gap-as-out-of-scope-without-checking-the-story-and-the-example-test-pinned-the-defect).
- **Response / limit:** b7930baf / release pending after 0.3.47 adds the gap-and-fixture check to `wrap-up.md` "Accept proof". Claude Code only; returns reconstructed, one run per case. Only ODF-185 failed at baseline and returned afterward; the other defect cases already returned, so attribution is weak. Codex and Cursor unclaimed; no successful watch claimed.

<a id="odf-141"></a>

## ODF-141 — Fixed refactor cost on small accepted slices
Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-141--most-per-slice-refactor-passes-on-a-small-correction-made-no-edits).

<a id="odf-144"></a>

## ODF-144 — Lost-worker notice repeatedly blocks turn completion
The Claude Stop hook repeats an already-recorded lost-worker notice without acknowledgement, blocking every later turn end.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [open-dough](../../DearDough.md#odf-144--a-lost-observer-notice-kept-blocking-every-turn-end-even-after-the-observer-was-stopped), [pygardon](../../../pygardon/DearDough.md#odf-144--after-a-completion-receipt-recorded-lost-coverage-the-claude-code-stop-hook-blocked-every-turn-end), [doughnut](../../../doughnut/DearDough.md#odf-144--the-ci-stop-hook-re-announced-an-already-stopped-lost-observer-at-every-coordinator-stop).
- **Response / limit:** 75bdc10d acknowledges a lost-worker notice once and suppresses stopped mailboxes. Unreleased through 0.3.47; the seven reported executions do not demonstrate failure of this correction. Await release and relevant use; no duplicate implementation.

<a id="odf-145"></a>

## ODF-145 — Conversion rehearsal uses a different code revision
A one-time conversion is rehearsed with branch parsers but run inside an older released image, which cannot perform the promised rewrite.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-145--a-one-time-store-conversion-was-rehearsed-with-different-code-from-the-code-that-ran-it).

<a id="odf-147"></a>

## ODF-147 — Reasoned red proof leaves ineffective tests
An agent reasons that new tests would fail instead of observing them against pre-change behavior; round-trip or wrong-boundary tests can pass without the fix.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-147--an-implementer-reasoned-that-a-new-test-would-fail-instead-of-running-it-red-and-one-of-its-tests-could-not-fail).

<a id="odf-148"></a>

## ODF-148 — Unverified refinement examples conflict with preserved rules
Key examples promise new rewrite results while excluding changes to the current rewrite rules; execution drops a promise without an owner decision.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-148--refined-key-examples-promised-link-rewrite-outcomes-that-the-existing-rewrite-rules-do-not-produce).

<a id="odf-149"></a>

## ODF-149 — Unrepresentative ordinary-content examples
Minimal one-line editable examples miss ordinary hard-wrapped content, letting a style-only refusal ship against the story promise.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-149--the-stays-editable-boundary-examples-were-all-one-line-bodies-so-a-check-that-refuses-wrapped-text-shipped).

<a id="odf-150"></a>

## ODF-150 — Implementation proof misses indirect consumers
Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-150--slice-proof-chosen-by-the-changed-components-missed-page-wide-invariant-specs), [doughnut](../../../doughnut/DearDough.md#odf-150--an-implementers-slice-proof-ran-only-the-specs-it-chose-missing-consumers-of-the-store-method-it-changed).
- **Response / limit:** Related indirect-consumer failures are retained; no same-cause match with f0f355c is established.

<a id="odf-152"></a>

## ODF-152 — File-size gate conflicts with approved intermediate scope
An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-152--the-file-size-rule-conflicted-with-an-approved-staged-simplification-and-mechanical-callers).

<a id="odf-153"></a>

## ODF-153 — Sibling-branch CI failure attribution
A new observer labels a non-ancestor sibling revision as this execution’s branch; observer versus adapter responsibility is unknown.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-153--an-observer-attributed-a-sibling-branch-failure-to-this-execution).

<a id="odf-154"></a>

## ODF-154 — Missing Cursor coordinator identity
Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-154--cursor-managed-delivery-lacks-its-coordinator-session-identity).

<a id="odf-155"></a>

## ODF-155 — Red proof restores files in a shared checkout
An implementer temporarily replaces its shared-checkout files with HEAD versions to prove tests red, despite a supplied separate-baseline rule.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-155--an-implementer-proved-fails-first-by-putting-head-versions-back-in-the-shared-execution-checkout).

<a id="odf-156"></a>

## ODF-156 — Lost acceptance obligations in delegation
A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-156--a-slice-acceptance-obligation-recorded-as-a-plan-learning-never-reached-the-next-delegation).

<a id="odf-157"></a>

## ODF-157 — Identifier-only conceptual searches
An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-157--a-no-other-location-premise-was-swept-with-the-removed-rules-words-missing-the-concepts-other-wording).

<a id="odf-158"></a>

## ODF-158 — Disproportionate required reference reads
Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-158--execute-plans-required-reference-reads-cost-more-than-a-clean-one-slice-run-used).

<a id="odf-160"></a>

## ODF-160 — Execution invokes unrequested wrap-up
A native executor proceeds into story wrap-up despite finish guidance retaining the story, plan and checkout for a separate request.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-160--cursor-ran-story-wrap-up-after-execution-although-guidance-says-to-leave-it).

<a id="odf-163"></a>

## ODF-163 — Unobserved refactor equivalence claims
A refactor removes a guard on an untested helper premise; acceptance repeats that premise and publishes a latent crash path.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-163--a-refactor-pass-removed-a-guard-as-behavior-preserving-on-an-unverified-helper-premise).

<a id="odf-164"></a>

## ODF-164 — Wrong observer repository and hidden retry side effects
Delivery accepts a repository argument inconsistent with the pushed remote; a later refused retry establishes an observer without reporting it.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-164--a-mistyped---repo-bound-managed-deliverys-observer-to-another-repository-and-a-refused-retry-left-a-second-observer).

<a id="odf-169"></a>

## ODF-169 — Stale replay base includes sibling commits
A managed-delivery retry carries the old published base instead of its newly reconciled suffix base and replays sibling commits into conflicts.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-169--a-stale-previously-published-base-after-a-trunk-merge-made-delivery-replay-a-siblings-commits).

<a id="odf-170"></a>

## ODF-170 — Merge driver rooted in a retired worktree
Repository-wide Git configuration names an absolute merge-driver script in one worktree; retiring it breaks backlog merges in all checkouts.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-170--the-shared-product-backlog-merge-driver-points-at-one-worktrees-copy-of-its-script).

<a id="odf-172"></a>

## ODF-172 — Unpaired measurements on a changing host
Unpaired or distant baseline timings cannot isolate a candidate's change from shared-host load drift, causing extra runs and ambiguous comparisons.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-172--timing-comparisons-ran-on-a-host-loaded-by-sibling-sessions-test-passes).

<a id="odf-173"></a>

## ODF-173 — Dependencies not refreshed after reconciliation
A mid-execution trunk merge changes lockfiles, but the execution runs expensive proof without re-preparing the workspace.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-173--the-execution-workspace-was-not-re-prepared-after-a-trunk-merge-changed-locked-dependencies).

<a id="odf-176"></a>

## ODF-176 — Closure provenance invalidates ready corrections
Wrap-up rewrites a queued correction's own provenance, changing its plan or story basis without reconciling its readiness record.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-176--closure-provenance-invalidates-ready-corrections), [pygardon](../../../pygardon/DearDough.md#odf-176--a-siblings-wrap-up-rewrote-a-queued-correction-plans-provenance-and-made-it-unclaimable).
- **Response / limit:** 62b7b7a / 0.3.43 intentionally retains the selected story/plan basis. Closure provenance changes those inputs; this is a separate mechanism from the repaired sibling-section digest.

<a id="odf-177"></a>

## ODF-177 — Shared-context edits invalidate sibling readiness
A sibling refinement or closure changes seed-level shared context, so another story's ready record becomes stale even when its own section and plan are unchanged.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [open-dough](../../DearDough.md#odf-177--shared-context-edits-invalidate-sibling-readiness), [pygardon](../../../pygardon/DearDough.md#odf-177--shared-context-edits-invalidate-sibling-readiness).
- **Response / limit:** 62b7b7a / 0.3.43 intentionally retains shared-context hashing. These later reports changed shared context, not only a sibling section; meaningful dependency checks must remain.

<a id="odf-178"></a>

## ODF-178 — Layer exclusions miss existing E2E consumers
A plan excludes E2E proof without checking existing consumers of changed visible text and shared directories, leaving stale page objects and fixtures.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-178--a-plan-ruled-out-e2e-proof-although-its-ui-and-file-changes-reached-e2e-page-objects-and-fixtures).

<a id="odf-181"></a>

## ODF-181 — Baseline proof reads concurrent edits
An agent starts pre-change E2E proof in the background and edits files it has not loaded yet, invalidating the baseline observation.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-181--a-pre-change-proof-ran-while-the-agent-edited-a-file-it-loads).

<a id="odf-182"></a>

## ODF-182 — Fixture premise omits domain transformations
A real-calculation fixture is inspected without tracing the domain repair that transforms its genomes, leaving accepted proof gaps and a domain bypass seam.

- **Follow-up:** delivered with a weak replay result, not shown to resolve: Observe a planning premise through the operation that consumes it — SEED-059#observe-premise-consumers (story and plan recoverable at d9137ef5). **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-182--a-plans-fixture-premise-overlooked-searchs-gene-domain-repair-of-stored-genomes).

<a id="odf-183"></a>

## ODF-183 — Delegated cleanup bypasses path-checkout prohibition
An implementer drops its own debugging with a path checkout forbidden by the handoff, relying on that path having no other edits.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-183--a-slice-agent-reverted-its-own-edit-with-a-path-checkout-its-handoff-forbade).
- **Response / limit:** The 0.3.46 report bypassed the explicit path-checkout prohibition shipped by 86e5069 / 0.3.42. No data loss reported; keep the destructive shared-checkout boundary.

<a id="odf-184"></a>

## ODF-184 — Unbounded managed push stalls delivery
A stalled SSH push leaves managed delivery and the coordinator waiting about fifty minutes with no command bound.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-184--managed-deliverys-git-push-stalled-for-about-50-minutes-with-no-bound).

<a id="odf-185"></a>

## ODF-185 — Reported preservation gap filed as a learning
An implementer reports a dropped parameter that contradicts the story's preservation goal; acceptance records the gap as a learning and finishes the story.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-185--a-slice-hand-back-reported-a-dropped-searched-gene-and-the-coordinator-filed-it-as-a-learning).
- **Response / limit:** b7930baf / release pending after 0.3.47 adds the gap-and-fixture check to `wrap-up.md` "Accept proof". Claude Code only; returns reconstructed, one run per case. Only ODF-185 failed at baseline and returned afterward; the other defect cases already returned, so attribution is weak. Codex and Cursor unclaimed; no successful watch claimed.

<a id="odf-186"></a>

## ODF-186 — Coordinator stops between hand-back and delivery
The coordinator inspects an implementation return and ends the turn before acceptance or launching the next required delivery step.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-186--the-coordinator-ended-a-turn-after-inspecting-a-hand-back-before-launching-the-next-delivery-step).

<a id="odf-187"></a>

## ODF-187 — Planned observations cannot detect regressions
Planning prescribes an absence assertion forbidden by removal policy and a scrolling case that passes regardless of the changed behavior.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-187--the-plan-prescribed-observations-that-execution-had-to-drop-an-absence-check-for-removed-ui-and-a-case-that-could-never-fail).

<a id="odf-189"></a>

## ODF-189 — Small additions force unrelated size extractions
A small addition crosses the numeric file-size ceiling and triggers relocation and re-proof of a substantial previously untouched responsibility.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-189--a-four-line-repository-tip-over-forced-extracting-an-unrelated-assimilation-query-block).

<a id="odf-190"></a>

## ODF-190 — Planned observation route is unavailable
Planning names an observation route or log source that is not available to the executing project, causing owner probing or loss of the intended proof.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-190--the-plan-prescribed-production-observations-whose-access-route-or-log-source-did-not-exist-and-whose-results-could-not-change-the-approach).

<a id="odf-192"></a>

## ODF-192 — Cheap exploratory coverage gaps left unexplored
Exploration stops below its budget while cheap same-setup gaps remain, and the coordinator supplies an unsupported explanation that more time cannot help.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-192--a-two-hour-uat-stopped-at-56-minutes-while-cheap-coverage-gaps-stayed-open).

<a id="odf-195"></a>

## ODF-195 — Pre-existing size overrun handled inconsistently
Two refactor passes within one story treat barely touched, already oversized files differently, forcing an unrelated extraction in one and retaining another.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-195--the-file-size-check-split-an-untouched-block-in-one-slice-of-an-execution-and-was-waived-in-a-later-slice).

<a id="odf-196"></a>

## ODF-196 — Fixture reshaped to avoid the real example
An implementer moves a fixture into an already-supported shape, turns the test green and reports no product change despite the story's real example still failing.

- **Follow-up:** Response delivered; verification open, no new implementation queued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-196--an-implementer-reshaped-a-test-fixture-until-the-new-scenario-passed-and-reported-that-no-product-change-was-needed).
- **Response / limit:** b7930baf / release pending after 0.3.47 adds the gap-and-fixture check to `wrap-up.md` "Accept proof". Claude Code only; returns reconstructed, one run per case. Only ODF-185 failed at baseline and returned afterward; the other defect cases already returned, so attribution is weak. Codex and Cursor unclaimed; no successful watch claimed.

<a id="odf-197"></a>

## ODF-197 — No-op plan edits lose execution learnings
Anchor replacements silently match nothing and chained later edits therefore fail to persist five slices' learnings in the resume record.

- **Follow-up:** Open, unqueued; material unresolved consequence retained. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-197--plan-edits-by-text-replacement-silently-did-nothing-and-five-slices-learnings-never-reached-the-plan).

<a id="odf-198"></a>

## ODF-198 — Bug remedy planned before reproducing the symptom
A slice assumes one code swap fixes a reported defect, but its new spec already passes and the original symptom remains unexplained.

- **Follow-up:** delivered with a weak replay result, not shown to resolve: Observe a planning premise through the operation that consumes it — SEED-059#observe-premise-consumers (story and plan recoverable at d9137ef5). **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-198--a-slices-premise-that-one-code-swap-fixes-a-uat-defect-was-not-tested-first-and-its-spec-passed-before-the-change).
