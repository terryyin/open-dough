# Open Dough finding names

Current findings reported by Open Dough, Pygardon, or Doughnut, plus linked
active follow-ups. Reviewed 2026-09-27 (Asia/Singapore), source revision `2d2c4cda`. Settled local records and clear noise are removed under the maintainer runbook;
removal does not assert that a problem can never recur.

Released responses with verified use are in the [watch list](near-term-watch-list.md).

Keep each entry to its meaning, source links, decisive current evidence and
follow-up. Source logs retain execution details and former local codes.
Older catalog detail is recoverable at
`36fb9366295d1e6000cb3901a7ad3ce074382778:docs/maintainer/finding-names.md`.
Unknown execution releases stay unknown; current installations do not date old
reports. Count a project/execution once. Preserve distinct causes and uncertainty.

Codes are permanent; highest allocated is ODF-155. Check Git history and the
[watch list](near-term-watch-list.md) before allocating. Use stable `#odf-NNN`
links. Queued means unresolved. A delivered response records its commit and first
containing release; effectiveness requires relevant use, not publication alone.

<a id="retained-evidence"></a>
Evidence updates belong beside the finding or in its linked source log; retain
execution identity, timestamp, tool, release, observation and uncertainty there.
Do not duplicate entire source logs here.

<a id="odf-003"></a>

## ODF-003 — Missed Markdown contract tests

Treating runtime Markdown changes as having no applicable maintained tests misses an affected contract and delays detection until CI.

- **Sources:** [open-dough / DD-003](../../DearDough.md#odf-003--file-type-assumptions-skipped-affected-maintained-proof).
- **2026-09-26 assessment:** Open Dough plan 104 adds a TypeScript consumer missed by an .mjs-only search. Retain as related evidence, not a fourth Markdown-contract occurrence; its execution release is unknown.
- **2026-09-27 harvest:** Open Dough plan 113, modified 1b66466/base 0.3.41, missed dashboard fixtures that call record-state through the CLI. Related consumer-search failure, not an additional Markdown-contract occurrence.

<a id="odf-012"></a>

## ODF-012 — Unbounded failure reproduction

Requiring independent reproduction without retaining the smallest observed load or ordering boundary can force repeated complete verdict runs without localizing an intermittent lifecycle failure.

- **Sources:** [pygardon / DD-001](../../../pygardon/DearDough.md#odf-012--load-sensitive-lifecycle-failures-lack-a-bounded-reproduction-path).

<a id="odf-015"></a>

## ODF-015 — Unverified diagnostic probes

Repeating expensive failure runs before confirming that the intended diagnostic probe is present and observable in the target runtime wastes the run without improving failure evidence.

- **Sources:** [pygardon / DD-004](../../../pygardon/DearDough.md#odf-015--diagnostic-transport-was-not-validated-before-repeating-failure-runs).

<a id="odf-016"></a>

## ODF-016 — Unverifiable timing claims

Approximate active-time estimates cannot establish compliance with a hard execution limit when the start, phase boundaries, waits, and final delivery boundary were not recorded consistently.

- **Sources:** [pygardon / DD-005](../../../pygardon/DearDough.md#odf-016--estimated-active-time-cannot-establish-compliance-with-a-hard-limit).

<a id="odf-018"></a>

## ODF-018 — Broken credential handoffs

A credential handoff is not operable until the actual owner can see its prompt and the real non-root runtime user can write the mounted destination.

- **Sources:** [pygardon / DD-007](../../../pygardon/DearDough.md#odf-018--the-credential-handoff-was-not-validated-at-the-real-user-boundary).

<a id="odf-019"></a>

## ODF-019 — Unsafe host instrumentation

Combining unvalidated host-specific evidence instrumentation with a state-changing operation can strand the operation at an unintended intermediate state when the helper is non-portable.

- **Sources:** [pygardon / DD-008](../../../pygardon/DearDough.md#odf-019--a-host-specific-timing-helper-crossed-a-destructive-boundary-untested).

<a id="odf-020"></a>

## ODF-020 — Uncommitted planning handoffs

Beginning delivery from uncommitted planning artifacts leaves the execution gate without an attributable plan boundary and forces a user ownership decision after the story has already been selected.

- **Sources:** [pygardon / DD-009](../../../pygardon/DearDough.md#odf-020--execution-began-without-a-committed-planning-handoff).

<a id="odf-024"></a>

## ODF-024 — Demo isolation leaks

An isolated manual bootstrap does not isolate a packaged tool whose nested invocation falls back to default host volumes and ports. Tests that always supply explicit safe overrides miss that fallback path.

- **Sources:** [pygardon / DD-013](../../../pygardon/DearDough.md#odf-024--a-real-single-installation-demo-isolated-the-manual-bootstrap-but-not-the-packaged-tools-own-invocation).

<a id="odf-025"></a>

## ODF-025 — Ignored execution overruns

Execution continues after its own plan records a ten-minute implementation overrun, treating cohesion or a short test wait as permission to skip refinement.

- **Sources:** [pygardon / DD-024](../../../pygardon/DearDough.md#odf-025--a-recorded-ten-minute-implementation-overrun-did-not-trigger-refinement).

<a id="odf-027"></a>

## ODF-027 — Premature release qualification

Expensive exact-source release qualification starts before the intended main-based release target is resolved and integrated, making completed candidate proof non-authoritative.

- **Sources:** [pygardon / DD-026](../../../pygardon/DearDough.md#odf-027--release-qualification-began-before-the-integration-target-was-stable).

<a id="odf-029"></a>

## ODF-029 — Shared-checkout commit capture

An owner catch-all commit in a shared checkout absorbs an unfinished slice before its refactor and formatting gates because the active ownership boundary is not visible.

- **Sources:** [pygardon / DD-028](../../../pygardon/DearDough.md#odf-029--shared-checkout-execution-let-an-owner-commit-absorb-an-unfinished-slice).

<a id="odf-030"></a>

## ODF-030 — Disposable profiling infrastructure

A one-off measurement capture adds runner options and tests as durable infrastructure, then requires a closing slice solely to undo that measurement-only change.

- **Sources:** [doughnut / DD-013](../../../doughnut/DearDough.md#odf-030--one-off-profile-capture-treated-as-durable-runner-plumbing).

<a id="odf-034"></a>

## ODF-034 — Unsupported CI branches

CI observation validates workflow existence without checking target-branch trigger eligibility, then presents an impossible branch run as merely pending.

- **Sources:** [doughnut / DD-017](../../../doughnut/DearDough.md#odf-034--ci-observer-started-for-a-feature-branch-that-this-projects-workflow-never-triggers-on).

<a id="odf-038"></a>

## ODF-038 — No-op waiting

A coordinator repeatedly issues no-op shell calls while awaiting asynchronous completion notifications, adding turns without obtaining state or accelerating completion.

- **Sources:** [pygardon / DD-039](../../../pygardon/DearDough.md#odf-038--repeated-no-op-tool-calls-while-waiting-for-background-task-notifications).
- **Current evidence:** `89728cb` / 0.3.18 forbids no-op waits; Pygardon repeated them on 0.3.18. The response was ineffective in that execution.

<a id="odf-040"></a>

## ODF-040 — Premature delegated publication

A delegated implementer commits and pushes changes and plan delivery notes before the coordinator performs the required review and refactor gates.

- **Sources:** [pygardon / DD-041](../../../pygardon/DearDough.md#odf-040--a-delegated-implementation-subagent-committed-and-pushed-without-coordinator-review).

<a id="odf-042"></a>

## ODF-042 — Incomplete migration searches

A coordinator pre-filters field-reference search results before delegation, omitting sites from a representation slice and shifting their test repairs into the later field-removal slice.

- **Sources:** [doughnut / DD-037](../../../doughnut/DearDough.md#odf-042--coordinator-pre-filtered-grep-results-for-a-test-only-representation-slice-missing-sites-the-later-field-removal-slice-had-to-fix).

<a id="odf-051"></a>

## ODF-051 — Inaccurate refactor reports

A delegated refactor report claims dead dependencies were removed even though the returned diff still contains them, requiring coordinator inspection and a resumed correction.

- **Sources:** [doughnut](../../../doughnut/DearDough.md#odf-051--refactor-subagent-reported-removing-dead-dependencies-it-did-not-actually-remove).

<a id="odf-058"></a>

## ODF-058 — Unproved CLI reports

Tests assert exit codes and published bytes while leaving user-visible summary statements unproved and sometimes wrong.

- **Sources:** [open-dough / DD-056](../../DearDough.md#odf-058--assertions-concentrated-on-exit-status-and-published-bytes-left-the-tools-own-reported-output-unproved).
- **Current evidence:** `da64969` / 0.3.26 repairs the report and assertions. No verified later exercise; watch start unknown.

<a id="odf-059"></a>

## ODF-059 — Interrupted agent handoffs

A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.

- **Sources:** [open-dough / DD-057](../../DearDough.md#odf-059--delegated-refactor-pass-stalled-after-editing-and-before-reporting); [doughnut / DD-062](../../../doughnut/DearDough.md#odf-059--delegation-guidance-has-no-protocol-for-a-subagent-that-dies-mid-edit-from-an-infrastructure-error-leaving-a-silent-partial-change).


<a id="odf-062"></a>

## ODF-062 — Unreviewed CI repairs

The coordinator delivers an interruption-path CI repair through formatting and publication without the required independent refactor pass.

- **Sources:** [open-dough / DD-060](../../DearDough.md#odf-062--a-ci-repair-was-delivered-without-the-refactor-pass-its-own-delivery-gate-requires).

<a id="odf-064"></a>

## ODF-064 — Unreviewed post-refactor changes

A post-refactor implementation correction is delivered without a further independent refactor pass; the delivery contract leaves this trigger unclear.

- **Sources:** [open-dough / DD-062](../../DearDough.md#odf-064--a-correction-returned-after-the-refactor-pass-was-delivered-without-a-refactor-pass-of-its-own).

<a id="odf-065"></a>

## ODF-065 — Undetected observer death

Push receipts and host attachment messages outlive the observing worker, hiding lost coverage until shutdown.

- **Sources:** [open-dough / DD-063](../../DearDough.md#odf-065--a-ci-observer-that-died-mid-execution-stayed-reported-as-attached-until-shutdown).
- **Current evidence:** `8a7c770` / 0.3.28 detects dead workers. No later crash exercise; watch start unknown. Normal termination is ODF-089.

<a id="odf-067"></a>

## ODF-067 — Tautological refusal tests

A Git refusal test elects not to mutate using fixture-known state rather than attempting and observing the real operation reject.

- **Sources:** [open-dough / DD-054](../../DearDough.md#odf-067--delegated-git-fixture-proof-for-a-stop-behavior-defaults-to-a-tautology).

<a id="odf-069"></a>

## ODF-069 — Missing CI verdicts

Registered revisions are reported uncovered during discovery and their later real verdicts are missed in the observed execution.

- **Sources:** [open-dough / DD-065](../../DearDough.md#odf-069--a-genuinely-failed-ci-run-was-reported-as-merely-uncovered-not-failed); [doughnut / DD-076](../../../doughnut/DearDough.md#odf-069--the-ci-observers-fixed-discovery-poll-bound-reports-lost-coverage-for-revisions-whose-ci-run-exists-and-later-succeeds).
- **Current evidence:** Partial response `5630b28` / 0.3.28 and managed delivery / 0.3.33 did not eliminate the observed gap: eight later Doughnut executions on 0.3.33, 0.3.37 and 0.3.38. Listing limits are an unproved cause. `ci-runs.mjs` required workflow display name `CI` by default, while Doughnut names it `donut CI`; the failing sessions' environment overrides are unknown, so this was a diagnostic lead, not a confirmed cause.
- **Response:** `5317499` / first released in 0.3.40 makes the `--workflow` selector the observed workflow's identity; the display-name filter that defaulted to `CI` is gone, and an explicit `DOUGH_CI_WORKFLOW_NAME` that contradicts the selected runs ends observation loudly. A controlled selected-workflow journey proves failure delivery to the owner, repair success, and coverage loss. Effectiveness is unproved until relevant Doughnut use; listing limits and the failing sessions' environments remain unexamined causes.
- **2026-09-26 watch decision:** The 0.3.40 containing tag and ci-runs.mjs diff are verified. Later Doughnut plan 035 reports 0.3.40, but its retained mailbox watch-HC7nuY has no verdict event; this does not establish successful exercise or a same-cause recurrence. Watch start remains unknown; retain active.
- **2026-09-27 exercise:** Donut plan 045 / `574d61b52c` on 0.3.40 reports delivery of slice 1’s CI failure after manual attachment; its installed ci-runs matches `5317499`. This is relevant successful story-branch verdict delivery, but does not resolve the unknown causes in the earlier mailboxes or prove end-to-end managed attachment. Keep active; watch start remains unknown pending resolution of those coverage limits.

<a id="odf-070"></a>

## ODF-070 — Assumed tool unavailability

A refactor agent calls a command unavailable without invoking it, overlooking parent-directory module resolution in a nested worktree.

- **Sources:** [open-dough / DD-066](../../DearDough.md#odf-070--a-nested-execution-worktrees-node_modules-was-assumed-absent-instead-of-tested).
- **Current evidence:** `6d7f7f3` / 0.3.28 requires running an applicable command. No verified exercise of this specific correction; watch start unknown.

<a id="odf-074"></a>

## ODF-074 — Unverified planning premises

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

- **Sources:** [pygardon / DD-061](../../../pygardon/DearDough.md#odf-074--plan-statements-about-existing-code-and-host-state-were-not-verified-at-planning-time).
- **2026-09-26 evidence:** Eight distinct Pygardon executions now retained, including plans 193, 196 and 198 (0.3.39, unknown and 0.3.40 respectively). Current-code, proof-path and workload premises remain actionable; no generic correction is claimed.
- **Response:** `2c5ff71` / unreleased makes slice planning establish each decisive premise (existing code and tests, host state, fixtures, workload data, named proof commands) with the smallest safe observation, searching for existing tests and callers wherever they live, and record it before `ready`; an unobserved cheap premise is a `not-ready` reason. Native Claude Code 2.1.283 re-planning of Doughnut plan 045 from its pre-plan revision caught the recorded "no test" premise the unchanged guidance missed; the Pygardon plan 196 seeding-proof case passed before and after, so its attribution is weak. One run per case. Remaining: [native acceptance on Codex and Cursor](../../.planning/seeds/SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases) is queued; effectiveness in client projects is unobserved.
- **2026-09-27 harvest:** Added Open Dough plan 115 / DD-121 and Donut plans 045, 005, 010, 019 / DD-126, DD-130, DD-134, DD-139. Pygardon adds plans 201 and 216; its plan 207 is a dependent-slice variant, not an exact factual-premise recurrence. The misplaced plan 212 formatter row now belongs to ODF-100. Known reports use 0.3.40–0.3.42 or pre-response modified guidance; `2c5ff71` remains unreleased, so none establishes post-fix recurrence.
- **Additional sources:** [open-dough](../../DearDough.md#odf-074--a-ready-plan-named-a-validation-command-the-backlog-tool-does-not-have); [doughnut](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test).

<a id="odf-077"></a>

## ODF-077 — Lost suite verdicts

Long-running verification is misclassified, duplicated, and its output discarded, delaying a verdict and leaving orphaned containers.

- **Sources:** [pygardon / DD-065](../../../pygardon/DearDough.md#odf-077--whole-suite-verification-produced-no-verdict-for-about-two-hours).

<a id="odf-078"></a>

## ODF-078 — Misread interrupted edits

A last agent message and selected-symbol grep are treated as proof no edits occurred, causing an inaccurate account of retained work.

- **Sources:** [pygardon / DD-067](../../../pygardon/DearDough.md#odf-078--a-stalled-agent-had-already-edited-and-a-spot-check-wrongly-concluded-it-had-not).

<a id="odf-079"></a>

## ODF-079 — Accumulating refactor deferrals

Successive refactor passes defer the same growing responsibility until a story delivers a file over twice its stated size check.

- **Sources:** [pygardon / DD-068](../../../pygardon/DearDough.md#odf-079--a-growing-file-size-overrun-was-deferred-by-five-successive-refactor-passes).

<a id="odf-081"></a>

## ODF-081 — Wrong-checkout edits

Coordinator plan edits land in shared main instead of the selected execution worktree and are published by an unrelated writer.

- **Sources:** [doughnut / DD-061](../../../doughnut/DearDough.md#odf-081--story-branch-mode-edits-made-in-the-originating-checkout-got-swept-into-an-unrelated-concurrent-commit).

<a id="odf-082"></a>

## ODF-082 — Edits during refactor review

The coordinator edits the same execution checkout while a refactor agent reviews the previous slice, invalidating its snapshot and wasting the review.

- **Sources:** [doughnut / DD-063](../../../doughnut/DearDough.md#odf-082--coordinator-kept-editing-the-shared-execution-checkout-while-a-delegated-refactor-subagent-was-inspecting-the-same-files-forcing-a-wasted-stop).

<a id="odf-083"></a>

## ODF-083 — Stranded shared checkout

An execution switches the shared checkout to its own feature branch and leaves a large uncommitted change, blocking another execution's setup.

- **Sources:** [doughnut / DD-064](../../../doughnut/DearDough.md#odf-083--a-prior-execution-left-the-shared-main-checkout-on-its-own-feature-branch-with-uncommitted-work-blocking-the-next-plans-execution-setup).

<a id="odf-084"></a>

## ODF-084 — Deleted active worktree

An execution worktree and branch are removed during an active delegated task, forcing recovery while another execution uses shared integration.

- **Sources:** [doughnut / DD-072](../../../doughnut/DearDough.md#odf-084--a-concurrent-session-deleted-an-active-story-branch-execution-worktree-and-branch-while-a-delegated-subagent-was-mid-slice).
- **Follow-up:** open, no queued response. Excluded on 2026-09-26 from `SEED-008#preserve-other-executions-work` (closed; recoverable at `d96674e:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md`): the remover is unknown and the incident predates Dough Land's retirement gate.

<a id="odf-085"></a>

## ODF-085 — Missing runtime aliases

Fresh-worktree setup treats absent .claude/skills as unavailable CI observation or copies an installation, despite a tracked .agents runtime in that same checkout.

- **Sources:** [doughnut / DD-074](../../../doughnut/DearDough.md#odf-085--the-documented-claudeskills-runtime-path-did-not-exist-at-all-in-a-freshly-created-execution-worktree).
- **Current evidence:** `02991a5` / 0.3.33 adds same-checkout runtime fallback. No verified missing-alias exercise; watch start unknown.

<a id="odf-087"></a>

## ODF-087 — Skipped preparation gates

Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.

- **Sources:** [open-dough / DD-089](../../DearDough.md#odf-087--cheap-worktree-readiness-substitutes-can-pass-while-native-hosts-skip-the-gate).
- **Current evidence:** Queued-start native acceptance completed on September 24. That does not prove the original standalone hello scenario obeys preparation gates; no equivalent successful exercise recorded.

<a id="odf-090"></a>

## ODF-090 — Skipped implementation handoff

The coordinator applies the local single-interactive-slice exception to the first slice of a multi-slice plan, bypassing its required implementation handoff.

- **Sources:** [doughnut / DD-097](../../../doughnut/DearDough.md#odf-090--coordinator-implemented-a-planned-slice-locally-during-multi-slice-execution).

<a id="odf-091"></a>

## ODF-091 — Skipped independent refactoring

Ordinary planned slices are delivered after coordinator self-review without the required fresh refactor agent and completion marker.

- **Sources:** [doughnut / DD-098](../../../doughnut/DearDough.md#odf-091--coordinator-accepted-its-own-refactor-pass-without-a-fresh-refactor-agent).


<a id="odf-093"></a>

## ODF-093 — Foreign stash restoration

A failed stash push is followed by an unqualified stash pop, applying another session's shared stash.

- **Sources:** [open-dough / DD-094](../../DearDough.md#odf-093--a-delegated-agents-git-stash-pop-applied-another-sessions-stash).
- **Current evidence:** Four conflicted files were restored; no permanent loss reported. Distinct from stashing a live writer's files (ODF-105). High potential harm, one observed incident.
- **Response:** `f157f0e` moves the CI repair pause into `ci-repair-stash.mjs`, which records its own entry's OID and applies and drops only that entry; `86e5069` bars delegated agents from stash, pop, reset, clean, path checkout, and branch switch in a shared checkout. First released in 0.3.42. Follow-on restore/drop safety corrections `8f88364`, `ab3cb42`, `40cb0bc` remain unreleased. Watch start unknown: no verified real foreign-stash avoidance exercise; deterministic proof alone does not begin a watch.

<a id="odf-094"></a>

## ODF-094 — Overbroad lint restrictions

Delegation treats the restriction on hook-owned lint as a ban on all lint in a project without a commit hook, delaying mechanical defects until coordinator delivery.

- **Sources:** [open-dough / DD-093](../../DearDough.md#odf-094--implementation-and-refactor-agents-were-barred-from-lint-the-project-has-no-hook-for).


<a id="odf-096"></a>

## ODF-096 — Invalid acceptance fixtures

Nominally sufficient native acceptance fixtures do not actually satisfy their promises, and the same fault class is rediscovered through paid failing runs.

- **Sources:** [open-dough / DD-096](../../DearDough.md#odf-096--native-acceptance-fixtures-sufficient-side-was-not-credible-and-each-case-paid-a-failed-run-to-learn-it).
- **2026-09-27 assessment:** Kept as a published-skill finding, not project-owned: plan 089's own rule deferred test-support fixes until a paid run diagnosed a fault. The related planning-premise response `2c5ff71` / unreleased treats fixture content as a decisive premise and makes a paid-only remainder an early probe slice ([ODF-074](#odf-074), [ODF-114](#odf-114)); no native acceptance fixture has exercised it. [Native acceptance on Codex and Cursor](../../.planning/seeds/SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases) is queued; no separate story.
- **2026-09-27 harvest:** Open Dough plan 110 / modified bd38782/base 0.3.40 adds a contradictory native prompt (forbade the probe’s required marker write), costing one paid failed run; still pre-response.

<a id="odf-097"></a>

## ODF-097 — Publishing after formatter failure

A formatter failure does not stop a semicolon-separated commit and push sequence.

- **Sources:** [open-dough / DD-097](../../DearDough.md#odf-097--coordinator-published-a-commit-after-the-formatter-failed).

<a id="odf-098"></a>

## ODF-098 — Unfinishable early slices

A slice is planned with a required existing suite that cannot pass until a later slice implements its new invariant.

- **Sources:** [open-dough / DD-098](../../DearDough.md#odf-098--a-slices-proof-named-a-suite-only-a-later-slices-behavior-keeps-green).

<a id="odf-100"></a>

## ODF-100 — Masked formatter failure

A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure.

- **Sources:** [pygardon / DD-084](../../../pygardon/DearDough.md#odf-100--a-piped-formatter-failure-did-not-stop-the-delivery-command-chain).
- **Current evidence:** The commit hook blocked the bad commit. Pipeline status masking differs from ODF-097's semicolon chain.
- **Additional source:** [Open Dough / ODF-100](../../DearDough.md#odf-100--a-piped-lint-failure-did-not-stop-publication). Open Dough plan 104 is the same pipeline-status mechanism. Pygardon plans 196 and 197 report other command-chain forms; retained as related evidence, excluded from the exact pipeline recurrence count. Two exact pipeline executions; the other two reports have unknown guidance releases.
- **2026-09-27 harvest:** Pygardon plan 212 / 0.3.41 moved here from ODF-074; Donut DD-135 / plan 012 / 0.3.42 adopted here with its body intact. Four exact pipeline-status executions across all three projects; related newline/errexit chains remain explicitly different mechanisms. Donut’s two typechecks were honestly flagged and rerun, not accepted as false passes.
- **Additional sources:** [doughnut](../../../doughnut/DearDough.md#odf-100--agents-reported-vue-tscs-exit-code-from-a-pipe-into-tail-so-the-coordinator-had-to-rerun-the-typecheck).

<a id="odf-101"></a>

## ODF-101 — Late CI capacity recovery

A plan inherits a known CI capacity shortage but schedules the owned resource cleanup near the end, leaving early increments without CI verdicts.

- **Sources:** [pygardon / DD-086](../../../pygardon/DearDough.md#odf-101--low-docker-capacity-blocked-in-app-ci-while-the-capacity-freeing-cleanup-was-planned-last).
- **2026-09-27 harvest:** Pygardon plan 213 adds a second execution, release unknown: capacity-freeing cleanup was again last and all four increments lacked a verdict. The report distinguishes prerequisite cleanup from already-orphaned resources.

<a id="odf-102"></a>

## ODF-102 — Historical CI notifications

Before registration, command-adapter discovery exposes retained historical CI attempts as actionable execution failures.

- **Sources:** [pygardon / DD-090](../../../pygardon/DearDough.md#odf-102--a-command-adapter-execution-observer-reported-years-old-attempts-as-this-executions-failures).
- **Current evidence:** `50b6d71` / 0.3.38 filters older completed command-adapter attempts. A later ancestor notification has uncertain cause; the filter intentionally retains the newest completed attempt. No success watch while that relationship is unresolved.

<a id="odf-103"></a>

## ODF-103 — Mismatched observer owners

Managed delivery hashes mailbox ownership from the execution checkout while the real hook hashes the originating checkout, so attached receipts can coexist with no delivered events.

- **Sources:** [pygardon / DD-091](../../../pygardon/DearDough.md#odf-103--managed-delivery-bound-the-observer-to-an-owner-the-registered-claude-code-hook-can-never-match).
- **Current evidence:** `50b6d71` / 0.3.38 normalizes the owner hash. The report used 0.3.37; later attached receipts alone do not prove cross-worktree event delivery. No confirmed recurrence; watch start unknown.
- **2026-09-26 assessment:** Pygardon plan 200 was moved to ODF-092: it reports missing session input, not mismatched owners. Plan 199 on 0.3.40 received events after a manual observer start (watch-SM5QF6), but that does not prove initial managed binding from one checkout delivered through the other checkout's hook. No confirmed recurrence; exact-boundary use remains unverified, so watch start stays unknown.

<a id="odf-104"></a>

## ODF-104 — Unexplained refresh deferral

Managed publication returns only a deferred maintenance label, preventing the coordinator from understanding why a clean default checkout was not refreshed.

- **Sources:** [pygardon / DD-092](../../../pygardon/DearDough.md#odf-104--managed-delivery-deferred-the-default-checkout-refresh-without-a-reason); [doughnut / DD-110](../../../doughnut/DearDough.md#odf-104--increment-delivery-reports-the-default-checkout-refresh-as-deferred-without-a-reason).
- **Current evidence:** Three executions across Pygardon and Doughnut. Missing explanation is established; why refresh deferred remains unverified.

<a id="odf-105"></a>

## ODF-105 — Stashing another writer's work

A delivery command stashes another active slice's uncommitted files instead of staging only owned paths.

- **Sources:** [pygardon / DD-094](../../../pygardon/DearDough.md#odf-105--a-coordinator-command-stashed-a-concurrent-slices-uncommitted-files).
- **Current evidence:** The other writer's files were restored and its proof used a separate clone. No loss reported; unsafe staging interference remains actionable.
- **Response:** `86e5069` makes coordinator commits isolate owned work by staging owned paths only, never stashing, resetting, or restaging a sibling writer's work; `f157f0e` leaves the CI repair pause as the only sanctioned stash. First released in 0.3.42. Watch start unknown: no verified released exercise at the live-writer stash boundary. Related index and formatter interference is separate (ODF-131, ODF-128).

<a id="odf-106"></a>

## ODF-106 — Colliding plan numbers

Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.

- **Sources:** [pygardon / DD-095](../../../pygardon/DearDough.md#odf-106--two-concurrently-planned-quick-plans-received-the-same-number).
- **Additional source:** [Doughnut / ODF-106](../../../doughnut/DearDough.md#odf-106--two-concurrent-executions-allocated-the-same-slice-plan-number-from-different-bases). Two distinct 0.3.38 executions now report stale/concurrent allocation. v0.3.38..a951fc0 slice-planning guidance retains checkout-local allocation; no intervening correction of that mechanism.
- **2026-09-27 harvest:** Pygardon plan 212 / 0.3.41 adds a third cross-project execution: its retrospective plan collided with trunk plan 213 and needed renumbering plus readiness re-recording. Current planning still allocates from visible checkout entries; no demonstrated correction.

<a id="odf-107"></a>

## ODF-107 — Missed message consumers

A changed user-visible error message is accepted using local unit/API proof while another test consumer of the old contract remains broken.

- **Sources:** [pygardon / DD-097](../../../pygardon/DearDough.md#odf-107--a-changed-user-visible-message-was-accepted-without-checking-its-other-consumers).
- **Current evidence:** A consumer failed on 0.3.38 after the general consumer-proof response `f0f355c` / 0.3.33. An identical stale-exclusion mechanism is not established; do not merge identities from the symptom alone.

<a id="odf-108"></a>

## ODF-108 — Lost failure tracebacks

A long proof run retains only tail output, discarding tracebacks required to diagnose failures.

- **Sources:** [pygardon / DD-098](../../../pygardon/DearDough.md#odf-108--piping-a-long-suite-through-tail-discarded-the-failure-details-needed-for-diagnosis).
- **2026-09-26 evidence:** Two Pygardon executions: plan 190 on 0.3.38 and plan 191 with unknown release. The later coordinator incident lost traceback and exit status, costing four additional 75-second installation runs and two diagnostic probes.

<a id="odf-109"></a>

## ODF-109 — Unowned ancestor failures

A new observer reports a recent ancestor revision's failure that this execution did not produce or register.

- **Sources:** [pygardon / DD-099](../../../pygardon/DearDough.md#odf-109--the-execution-observers-first-event-was-a-failure-for-a-pre-execution-trunk-revision).
- **Current evidence:** One 0.3.38 execution. Whether the recent ancestor was the intentionally retained newest completed attempt is unknown; relation to ODF-102 remains uncertain.
- **2026-09-26 evidence:** Pygardon plan 199 / fb25650c6 reports the same unowned-ancestor symptom on 0.3.40; watch-SM5QF6 event 1 names c57d02a8a and delivery.json records deliveredThrough 2. Two exact source executions (0.3.38 and 0.3.40); relationship to ODF-102 remains uncertain, so its watch cannot start.

<a id="odf-110"></a>

## ODF-110 — Incomplete readiness replays

A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

- **Sources:** [doughnut / DD-109](../../../doughnut/DearDough.md#odf-110--a-readiness-replay-observed-only-the-plans-named-seam-not-the-rest-of-the-slices-journey).
- **Response:** `2c5ff71` / unreleased: readiness settles a premise only with an observation covering the slice's promised journey through the next operation that consumes its result, and clears a premise-based reason only on a fresh observation, not re-cited evidence. Proof is behavior review only; no native case exercised it, and [native acceptance on Codex and Cursor](../../.planning/seeds/SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases) is queued. Effectiveness is unobserved.

<a id="odf-111"></a>

## ODF-111 — Missed inherited consumers

Refactor re-proof covers fewer consumers than a changed shared test helper reaches through inheritance.

- **Sources:** [doughnut / DD-111](../../../doughnut/DearDough.md#odf-111--refactor-re-proof-covered-fewer-consumers-than-the-shared-helper-it-changed).
- **Current evidence:** Reported on 0.3.37 after `f0f355c` / 0.3.33; coordinator full-suite proof contained the gap, with no defect found. Shared cause with the earlier consumer-exclusion finding is uncertain.

<a id="odf-112"></a>

## ODF-112 — Silent story-branch failures

An attached observer delivers no failure for registered failing story-branch revisions, allowing dependent slices to continue on a red branch.

- **Sources:** [doughnut / DD-112](../../../doughnut/DearDough.md#odf-112--the-ci-observer-delivered-no-failure-for-failed-story-branch-runs-so-later-slices-were-built-on-a-red-branch).
- **Current evidence:** Doughnut plan 029 / `0284ea7f52`, 0.3.38: two failed runs went unreported, dependent slices proceeded for about an hour, and completion later missed a successful run too. Discovery, registration, hook delivery and network causes remain unresolved; related to ODF-069 without an established common cause.
- **Response:** `5317499` / first released in 0.3.40 corrects the demonstrated workflow-selection loss (see ODF-069). Plan 029's environment is unrecoverable and its mailbox also shows `gh` connectivity loss, so this is not a confirmed cause; effectiveness requires relevant story-branch use.
- **2026-09-26 watch decision:** The 0.3.40 containing tag and ci-runs.mjs diff are verified. Later Doughnut plan 035 reports 0.3.40, but its retained mailbox watch-HC7nuY has no verdict event; this does not establish successful exercise or a same-cause recurrence. Watch start remains unknown; retain active.
- **2026-09-27 exercise:** Donut plan 045 / `574d61b52c` on 0.3.40 reports delivery of slice 1’s CI failure after manual attachment; its installed ci-runs matches `5317499`. This is relevant successful story-branch verdict delivery, but does not resolve the unknown causes in the earlier mailboxes or prove end-to-end managed attachment. Keep active; watch start remains unknown pending resolution of those coverage limits.

<a id="odf-113"></a>

## ODF-113 — Wrong regression baseline

A failed previous-slice tip is used to label a regression pre-existing and out of scope, although the execution introduced it earlier.

- **Sources:** [doughnut / DD-113](../../../doughnut/DearDough.md#odf-113--a-failure-was-called-pre-existing-by-comparing-against-a-revision-that-already-contained-this-executions-earlier-slices).
- **Current evidence:** The previous slice was already bad; earlier execution/trunk CI was green. The wrong baseline delayed ownership of a regression introduced by this execution.

<a id="odf-114"></a>

## ODF-114 — Unverified live-proof setup

Preparation checks token and fixture presence without exercising the claimed existing live behavior, leaving invalid data and runtime assumptions to fail during execution.

- **Sources:** [pygardon / DD-096](../../../pygardon/DearDough.md#odf-114--a-live-proofs-works-as-today-premise-and-fixture-were-never-exercised-before-execution).
- **Current evidence:** About five paid transcription calls instead of one, extra production changes and an owner stop. Cheap local fixture/runtime exercise could have exposed the defects; not evidence of bypassing an explicit live-transition regression gate.
- **Response:** `2c5ff71` / unreleased counts story-inherited premises such as "works as today" as decisive, observed by one unpaid, side-effect-free local run; a paid, credentialed or owner-held remainder becomes an early probe slice that stops dependent work. Proof is behavior review only (the diarization example); no native case exercised it, and [native acceptance on Codex and Cursor](../../.planning/seeds/SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases) is queued. Effectiveness is unobserved.

<a id="odf-115"></a>

## ODF-115 — Unrepresentative regression measurements

A performance guard times a different calculation path or workload from the changed product, allowing a large regression to pass.

- **Sources:** [Pygardon / ODF-115](../../../pygardon/DearDough.md#odf-115--a-non-regression-measurement-did-not-exercise-the-product-path-it-guarded).
- **Assessment:** One 0.3.40 execution; about 35× refresh slowdown, a red CI revision and an added correction slice. Distinct from unverified fixture availability (ODF-114).

<a id="odf-116"></a>

## ODF-116 — Sibling edits invalidate readiness

Readiness hashes a whole shared seed, so an unrelated sibling edit or closure forces reassessment of an unchanged ready story.

- **Sources:** [Pygardon / ODF-116](../../../pygardon/DearDough.md#odf-116--a-sibling-storys-edit-to-a-shared-seed-made-a-ready-plan-unclaimable); [Doughnut / ODF-116](../../../doughnut/DearDough.md#odf-116--closing-one-story-in-a-shared-seed-made-a-sibling-storys-ready-assessment-stale).
- **Assessment before response:** Source reports on 0.3.40–0.3.42 and unknown/modified revisions concern sibling preparation as well as closure, usually about 6–12 tool calls; some raced concurrent Takes. One Pygardon plan was genuinely stale through code drift. Those execution revisions digested the whole document; the delivered response and updated exact/related counts follow.
- **Follow-up:** response delivered, unreleased (after 0.3.42): Preserve readiness when an unrelated sibling story changes (SEED-043#preserve-sibling-readiness, closed; recoverable at `88c376e:.planning/seeds/SEED-043-preserve-relevant-readiness.md`), commit `62b7b7a`. The readiness basis now covers the story's own section, the seed's shared context and a distinct plan, so sibling preparation, edits and closure leave a ready story startable. Limits: a record from before the change in a multi-story seed reads `needs-reassessment` once after any sibling edit; a closure that leaves uneven blank lines mid-seed still reads as changed; code drift stays undetected. Judge effectiveness after release.
- **2026-09-27 harvest:** Open Dough DD-120 / plan 126 adopted here; Pygardon plan 208 moved here from ODF-092. Source rows now identify 17 executions: 16 whole-seed invalidations and one Donut plan-047 plan-digest change (related, excluded from the exact count); some had useful dependency/code checks as well. `62b7b7a` landed during this run; all these reports precede that unreleased response. Watch start unknown.
- **Additional sources:** [open-dough](../../DearDough.md#odf-116--a-sibling-storys-refinement-invalidated-readiness-costing-a-reassessment-cycle-before-the-claim).

<a id="odf-118"></a>

## ODF-118 — Missed meta-test consumers

Removing an assertion changes a test consumed by a mutation meta-test, but proof acceptance treats only shared helpers as consumer contracts.

- **Sources:** [Open Dough / ODF-118](../../DearDough.md#odf-118--removing-a-tests-assertion-broke-a-meta-test-that-mutated-against-it).
- **Assessment:** One execution, release unknown, one failed CI run. Related to ODF-003 and ODF-107; neither common cause nor post-fix recurrence is established.

<a id="odf-119"></a>

## ODF-119 — Stale default-checkout state blocks startup

Already-published planning bytes left in the default checkout look unpublished to startup; unignored nested worktrees also keep refresh deferred.

- **Sources:** [Open Dough / ODF-119](../../DearDough.md#odf-119--leftover-state-in-the-default-checkout-blocked-execution-startup-and-never-let-it-refresh).
- **Assessment:** Three executions, releases unknown. The evidence establishes stale-checkout dependencies and repeated refresh deferral; it does not establish a need for mutual exclusion.
- **Follow-up:** queued, not resolved: [Run worktree workflows from remote history](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue). Terry repurposed the existing story on 2026-09-28 to remove default-checkout dependencies, retaining its identity and queue position. No default-checkout coordination mechanism is selected; the original occurrences remain evidence, not proof that a lock would fix them.
- **2026-09-27 harvest:** Three Open Dough executions (111, 114, 116), not one; the latter two retain repeated stale-checkout/refresh evidence. Existing queue response remains unresolved.

<a id="odf-120"></a>

## ODF-120 — Satisfied prerequisites leave stale readiness

A dependency lands but its dependent story retains a not-ready assessment whose only reason was that unmet dependency.

- **Sources:** [Doughnut / ODF-120](../../../doughnut/DearDough.md#odf-120--a-not-ready-assessment-whose-only-reason-was-a-satisfied-start-condition-blocked-queued-startup).
- **Assessment:** Two executions on 0.3.38 and 0.3.42; about six and ten extra calls. Distinct from unrelated sibling edits (ODF-116): the dependency changed relevant readiness context.
- **2026-09-27 harvest:** Donut plan 020 adds a second execution on 0.3.42 (roughly ten calls and a readiness publication). Keep satisfied dependencies distinct from irrelevant sibling invalidation.

<a id="odf-121"></a>

## ODF-121 — Transient transport failure ends observation

A reported GitHub transport failure ends observation and leaves later revisions without notification coverage.

- **Sources:** [Doughnut / ODF-121](../../../doughnut/DearDough.md#odf-121--one-transient-github-tls-timeout-ended-ci-observation-for-the-rest-of-the-execution).
- **Assessment:** One 0.3.38 execution. Distinct from ODF-089 false live reporting: this observer reported unavailable and the later delivery reported unobserved. A single delivered event does not prove only one failed transport attempt; retry mechanism remains unverified.

<a id="odf-122"></a>

## ODF-122 — Correction plans lack startup preparation

A queued retrospective correction lacks recorded preparation; startup then refuses both missing readiness and a redundant plan selector.

- **Sources:** [Doughnut / ODF-122](../../../doughnut/DearDough.md#odf-122--a-correction-plan-written-by-a-retrospective-had-no-readiness-record-so-queued-startup-refused-it).
- **Assessment:** Two executions on 0.3.38 and 0.3.42; about seven and six extra calls plus separate readiness commits. Missing preparation differs from stale readiness.
- **2026-09-27 harvest:** Donut plan 015 adds a second execution on 0.3.42; an anchored correction story also lacked assessment, so the issue is not restricted to plan-homed corrections.

<a id="odf-123"></a>

## ODF-123 — Plan-during-execution handoff is undefined

A queued story explicitly defers planning to execution, but startup requires a selected published approach before the coordinator can begin.

- **Sources:** [Doughnut / ODF-123](../../../doughnut/DearDough.md#odf-123--a-story-whose-owner-deferred-planning-to-execution-could-not-be-started-until-the-coordinator-planned-and-published-it-separately).
- **Assessment:** One 0.3.38 execution; about ten extra calls and a preparation publication whose keep authority was inferred. Do not treat the refusal itself as a bug in authorization.

<a id="odf-124"></a>

## ODF-124 — Incomplete guidance searches

A negative claim about guidance searches skill entry files but omits their references, then misdirects delegated work.

- **Sources:** [Doughnut / ODF-124](../../../doughnut/DearDough.md#odf-124--the-coordinator-told-parallel-agents-a-guidance-rule-did-not-exist-after-searching-only-skillmd-files).
- **Assessment:** One 0.3.38 execution; two extra refactor agents, one failed commit; roughly 125k tokens reported. Distinct from field-reference search coverage (ODF-042).

<a id="odf-125"></a>

## ODF-125 — Interim delegated notifications wake the coordinator

Delegated background tests generate report-pending completion notifications that repeatedly wake a coordinator with no decision to make.

- **Sources:** [Doughnut / ODF-125](../../../doughnut/DearDough.md#odf-125--interim-agent-has-not-reported-yet-notifications-repeatedly-woke-the-coordinator-with-nothing-to-decide).
- **Assessment:** Three executions on 0.3.40, unknown and 0.3.42; 11, about 12 and one status-only turns. About 2.6M cache-read tokens were measured only for the first. Different from ODF-038 coordinator-generated no-op calls; the host generates these wakeups.
- **2026-09-27 harvest:** Three Donut executions (007 / 0.3.40, 002 / unknown, 010 / 0.3.42); 11, about 12, and one status-only turns. Token measurement exists only for the first. Related incomplete returns are ODF-132, not extra occurrences here.

<a id="odf-126"></a>

## ODF-126 — Host isolation blocks closure integration

A host-entered worktree session refuses the wrap-up operations against the originating checkout until the owner exits isolation.

- **Sources:** [Pygardon / ODF-126](../../../pygardon/DearDough.md#odf-126--entering-a-harness-worktree-for-story-branch-mode-blocked-wrap-ups-later-main-checkout-integration).
- **Assessment:** Historical 0.3.27 report returned from ProjectFindings.md (37b86f9dc), not a new execution. f9dd881 first shipped owned-workspace closure in 0.3.28 (verified tag and diff), earlier than the source claim of 0.3.30. No verified restricted-host closure exercise or demonstrated recurrence; keep the owner's request for observation.
- **Follow-up:** none; its restricted-host closure story was dropped on 2026-09-27 because shipped guidance already reuses host checkouts and commits without pushing when publication authority is absent. A demonstrated recurrence goes through bug fixing.

<a id="odf-127"></a>

## ODF-127 — Silent commit CLI through skill aliases

A newly added agent-commit CLI compares literal paths, so invocation through the .claude skill symlink exits zero without committing.

- **Sources:** [doughnut / DD-133](../../../doughnut/DearDough.md#odf-127--agent-commitmjs-run-through-the-claudeskills-symlink-exits-0-without-committing).
- **Assessment (2026-09-27):** Five distinct Donut executions on 0.3.42 (plans 011, 010, 015, 018, 020), each recovered through the real path; no wrong commit published. Prior ODF-056 corrected three CI entrypoints at eff69eb / 0.3.27; agent-commit was introduced later by 61054431 / 0.3.42 with a literal guard. v0.3.42..2d2c4cda leaves it unchanged. This is a new entrypoint defect after a demonstrated earlier correction, not recurrence in those repaired CI scripts.
- **Response:** `108fb545`, unreleased after 0.3.42: `agent-commit.mjs`, `execution-start.mjs` and `ci-repair-stash.mjs` now use the realpath-aware direct-entry helper, and a sweep test runs every directly invoked Open Dough script through a symlinked skill directory, failing on a silent exit 0. Delivered proof only; effectiveness needs relevant Donut use of a release containing it.

<a id="odf-128"></a>

## ODF-128 — Whole-checkout formatting couples parallel slices

Formatting selected by checkout state touches or judges another live slice’s unfinished files, so delivery must wait or use owned-path substitutions.

- **Sources:** [pygardon / DD-121](../../../pygardon/DearDough.md#odf-128--selective-formatting-of-the-whole-checkout-conflicts-with-concurrent-slices-in-one-execution-worktree); [open-dough / DD-117 (recovered from 48a0415)](../../DearDough.md#odf-128--a-whole-repository-formatter-coupled-concurrent-slices-deliveries).
- **Assessment (2026-09-27):** Six distinct executions: Pygardon plans 212, 214, 215, 219, 216 and Open Dough plan 127. Releases 0.3.41, 0.3.42 and unknown; no lost edits, but repeated deviations, a held delivery and one formatter failure. Recovery of Open Dough plan 127 is historical evidence, not an additional new execution.
- **Response:** `1d3a26cd`, unreleased after 0.3.42: execution runs a plan's slices one at a time in plan order, each finishing its delivery before the next starts, so no second slice of the same plan writes in its checkout; delegation and delivery keep the stash, separate-baseline and owned-staging protections for their independent reasons. Delivered proof only: the guidance test `shared-checkout-writers-guidance.test.mjs`, red first. Effectiveness is unobserved until an execution using a release containing it runs a multi-slice plan.

<a id="odf-129"></a>

## ODF-129 — Proof reads another live slice’s edits

Whole-suite proof runs against a checkout another slice is changing, producing failures absent from the isolated accepted candidate.

- **Sources:** [open-dough / DD-109](../../DearDough.md#odf-129--full-suite-proof-in-a-checkout-another-agent-was-editing-reported-false-failures).
- **Assessment (2026-09-27):** One execution, plan 107; release unknown. One wasted full suite and diagnosis. Unlike ODF-082, the unstable observer is a test run rather than a refactor reviewer; no common cause beyond shared-checkout mutation is asserted.
- **Response:** `1d3a26cd`, unreleased after 0.3.42: execution runs a plan's slices one at a time in plan order, each finishing its delivery before the next starts, so no second slice of the same plan writes in its checkout; delegation and delivery keep the stash, separate-baseline and owned-staging protections for their independent reasons. Delivered proof only: the guidance test `shared-checkout-writers-guidance.test.mjs`, red first. Effectiveness is unobserved until an execution using a release containing it runs a multi-slice plan.

<a id="odf-130"></a>

## ODF-130 — Parallel test output collisions

File-disjoint concurrent slices share a test output directory, allowing one run to delete artifacts another is writing.

- **Sources:** [open-dough / DD-106](../../DearDough.md#odf-130--concurrent-slices-in-one-checkout-shared-playwrights-output-directory).
- **Assessment (2026-09-27):** One plan 113 execution, modified 1b66466 based on 0.3.41; one Playwright ENOENT proof run, isolated rerun 4/4. Different resource from ODF-129’s source snapshot.
- **Response:** `1d3a26cd`, unreleased after 0.3.42: execution runs a plan's slices one at a time in plan order, each finishing its delivery before the next starts, so no second slice of the same plan writes in its checkout; delegation and delivery keep the stash, separate-baseline and owned-staging protections for their independent reasons. Delivered proof only: the guidance test `shared-checkout-writers-guidance.test.mjs`, red first. Effectiveness is unobserved until an execution using a release containing it runs a multi-slice plan.

<a id="odf-131"></a>

## ODF-131 — Foreign staged deletion enters a slice commit

A delegated git rm stages unfinished sibling work; committing the whole index includes it despite staging only the coordinator’s owned paths.

- **Sources:** [pygardon / DD-127](../../../pygardon/DearDough.md#odf-131--a-concurrent-slices-staged-deletion-was-swept-into-another-slices-commit).
- **Assessment (2026-09-27):** One plan 215 execution; release unknown. One amend before publication, no incorrect publication. Distinct from ODF-029 owner catch-all staging and ODF-105 stashing live files. The latter’s 86e5069 / 0.3.42 response does not prohibit delegated index writes; this unknown-release report cannot establish post-fix recurrence.
- **Response:** `1d3a26cd`, unreleased after 0.3.42: execution runs a plan's slices one at a time in plan order, each finishing its delivery before the next starts, so no second slice of the same plan writes in its checkout; delegation and delivery keep the stash, separate-baseline and owned-staging protections for their independent reasons. Delivered proof only: the guidance test `shared-checkout-writers-guidance.test.mjs`, red first. Effectiveness is unobserved until an execution using a release containing it runs a multi-slice plan.

<a id="odf-132"></a>

## ODF-132 — Delegated proof handed back incomplete

An implementer returns normally with required measurements unfinished and asks the coordinator to complete its background proof.

- **Sources:** [open-dough / DD-111](../../DearDough.md#odf-132--a-delegated-implementation-agent-handed-back-before-finishing-its-own-required-proof).
- **Assessment (2026-09-27):** One plan 107 execution, release unknown; three incomplete returns, about one hour of coordinator measurement. Unlike ODF-059’s host termination, the agent returned voluntarily; shared cause is unestablished.

<a id="odf-134"></a>

## ODF-134 — Story branch delivery undoes a manual trunk rebase

A plan calls for integration with landed sibling work during Story Branch execution; manual rebase and managed delivery reconcile to different bases.

- **Sources:** [open-dough / DD-115](../../DearDough.md#odf-134--a-story-branch-execution-rebased-onto-trunk-and-managed-delivery-rebased-it-back).
- **Assessment (2026-09-27):** One plan 124 execution, release unknown; one full suite proved a base that was never published, then proof was rewritten and repeated. Different from an explicit live-action trunk prerequisite (ODF-135).

<a id="odf-135"></a>

## ODF-135 — Live trunk prerequisite contradicts execution mode

A plan requires a live action after a slice reaches main but leaves Story Branch Mode selected, which normally reaches main only at wrap-up.

- **Sources:** [pygardon / DD-123](../../../pygardon/DearDough.md#odf-135--a-plans-after-slice-1-is-on-main-precondition-contradicted-the-default-story-branch-mode).
- **Assessment (2026-09-27):** One plan 213 execution, release unknown; owner decision and three manual integrations. Keep separate from ODF-134’s managed rebase mismatch.

<a id="odf-136"></a>

## ODF-136 — Duplicated sibling repair before fetching trunk

An unrelated local failure is repaired before checking already-published sibling work, wasting an equivalent correction.

- **Sources:** [open-dough / DD-116](../../DearDough.md#odf-136--an-out-of-scope-local-failure-was-fixed-without-first-fetching-trunk-duplicating-a-siblings-fix).
- **Assessment (2026-09-27):** One plan 124 execution, release unknown; discarded rewrite and focused run. Retain because it concerns the current parallel-trunk direction, although observed cost was small.

<a id="odf-137"></a>

## ODF-137 — Take ignores active preparation of the same story

Startup reads published readiness without considering an announced, unkept preparation of that same story.

- **Sources:** [open-dough / DD-122](../../DearDough.md#odf-137--execution-start-accepts-a-take-while-a-preparation-of-the-same-story-is-announced-but-not-kept).
- **Assessment (2026-09-27):** One truthful-repair-restore plan 115 execution, release unknown; coordinator waited by judgment, avoiding stale-plan execution and a keep/Take collision. This is same-story ownership, not ODF-116’s unrelated sibling digest.

<a id="odf-138"></a>

## ODF-138 — Safety consequence of an accepted proof gap unexamined

A returned gap for restore-applied-none is accepted as an untested limitation; delivered guidance then drops the only copy of paused work.

- **Sources:** [open-dough / DD-123](../../DearDough.md#odf-138--a-reported-guidance-gap-was-accepted-without-checking-its-consequence-hiding-a-data-loss-path).
- **Assessment (2026-09-27):** One truthful-repair-restore plan 115 execution, release unknown; retrospective reproduced data loss in a fixture after two refactor passes. Local correction 40cb0bc refuses drop when nothing applied; unreleased after 0.3.42. That repairs the stash behavior, not the broader acceptance failure. Distinct from ODF-093 applying a foreign stash; no actual user data loss was reported.

<a id="odf-139"></a>

## ODF-139 — Reported defect dismissed without checking the story

An implementer reports a loss that contradicts the story goal; acceptance labels it out of scope and preserves a test that pins it.

- **Sources:** [doughnut / DD-132](../../../doughnut/DearDough.md#odf-139--the-coordinator-accepted-an-implementers-reported-gap-as-out-of-scope-without-checking-the-story-and-the-example-test-pinned-the-defect).
- **Assessment (2026-09-27):** One plan 006 execution on 0.3.41; published story branch lost an unedited final newline and needed correction plan 009. Related to ODF-138’s acceptance gap, but here the mechanism is a false scope judgment; do not merge identities.

<a id="odf-140"></a>

## ODF-140 — Failed startup leaves a staged claim blocking retry

Failed environment preparation leaves a staged unpublished Take, causing a later start to reject the workspace after the external blocker is cleared.

- **Sources:** [pygardon / DD-118](../../../pygardon/DearDough.md#odf-140--a-failed-take-left-its-staged-claim-and-a-half-built-environment-in-the-workspace-blocking-every-retry).
- **Assessment (2026-09-27):** One plan 205 execution on 0.3.40; staged backlog and agent file caused a retry refusal. Broken partial .venv is explicitly project-owned, not an Open Dough repair promise.

<a id="odf-141"></a>

## ODF-141 — Fixed refactor cost on small accepted slices

Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost.

- **Sources:** [pygardon / DD-120](../../../pygardon/DearDough.md#odf-141--most-per-slice-refactor-passes-on-a-small-correction-made-no-edits).
- **Assessment (2026-09-27):** Three executions (212 on 0.3.41, 214 on 0.3.42, 215 unknown); roughly 655k reported subagent tokens for no or whitespace-only edits. No-edit reviews are not proof of zero value; retain the cost question without declaring review unnecessary or relaxing a gate.

<a id="odf-142"></a>

## ODF-142 — Abbreviated delivery SHAs produce misleading refusals

Managed delivery accepts SHA-shaped arguments without clearly resolving or rejecting abbreviations, then reports mismatch or a rebase failure.

- **Sources:** [pygardon / DD-124](../../../pygardon/DearDough.md#odf-142--an-abbreviated-previously-published-base-made-managed-delivery-fail-with-a-misleading-message).
- **Assessment (2026-09-27):** Plan 213, release unknown: short previously-published-base refused, full SHA accepted. Related candidate-mismatch reports survive in ODF-092 watch evidence (Pygardon 192, Donut 037 and 035) and ODF-143 (Donut 009); same entry-point family, different flags, not an invented exact recurrence count.

<a id="odf-143"></a>

## ODF-143 — Unqualified delivery branch references

Delivery usage says REF while requiring refs/heads/, so coordinators repeatedly discover the contract through a refused first delivery.

- **Sources:** [doughnut / DD-107 (argument reports only)](../../../doughnut/DearDough.md#odf-143--managed-delivery-rejects-unqualified-branch-references).
- **Assessment (2026-09-27):** Three isolated argument-only executions on 0.3.41/0.3.42 (009, 011, 019), plus the earlier mixed plan 035 report on 0.3.40 retained under watched ODF-092. Four distinct ref refusals; session-identity success is not a failure of 9880cbb.

<a id="odf-144"></a>

## ODF-144 — Lost-worker notice repeatedly blocks turn completion

The Claude Stop hook repeats an already-recorded lost-worker notice without acknowledgement, blocking every later turn end.

- **Sources:** [pygardon / DD-125](../../../pygardon/DearDough.md#odf-144--after-a-completion-receipt-recorded-lost-coverage-the-claude-code-stop-hook-blocked-every-turn-end).
- **Assessment (2026-09-27):** One plan 213 execution, release unknown; three Stop-hook blocks, resolved by moving the coordinator’s stale binding. The lost-worker detection from 8a7c770 / 0.3.28 is functioning; this is repeated delivery of that notice, not undetected death (ODF-065).

<a id="odf-145"></a>

## ODF-145 — Conversion rehearsal uses a different code revision

A one-time conversion is rehearsed with branch parsers but run inside an older released image, which cannot perform the promised rewrite.

- **Sources:** [pygardon / DD-126](../../../pygardon/DearDough.md#odf-145--a-one-time-store-conversion-was-rehearsed-with-different-code-from-the-code-that-ran-it).
- **Assessment (2026-09-27):** One plan 215 execution, release unknown; guarded production attempt wrote nothing, extra release and owner path correction. Retain the execution-revision fidelity problem; do not infer unsafe writes or post-fix recurrence.

<a id="odf-146"></a>

## ODF-146 — Guidance evaluation inherits the wrong checkout context

A fresh evaluator receives origin-checkout always-on guidance while asked to judge worktree guidance, mixing revisions.

- **Sources:** [pygardon / DD-129](../../../pygardon/DearDough.md#odf-146--guidance-dry-run-evaluators-may-read-the-originating-checkouts-claudemd-instead-of-the-worktrees).
- **Assessment (2026-09-27):** One plan 217 execution, release unknown; contradictory quoted guidance, verdict unaffected because another rule supplied it. Retain because a false native acceptance is consequential even though this verdict survived.

<a id="odf-147"></a>

## ODF-147 — Reasoned red proof leaves ineffective tests

An agent reasons that new tests would fail instead of observing them against pre-change behavior; round-trip or wrong-boundary tests can pass without the fix.

- **Sources:** [doughnut / DD-127](../../../doughnut/DearDough.md#odf-147--an-implementer-reasoned-that-a-new-test-would-fail-instead-of-running-it-red-and-one-of-its-tests-could-not-fail).
- **Assessment (2026-09-27):** Three executions on 0.3.40/0.3.41 (046, 004, 006); first two demonstrated ineffective tests, third lacks red evidence only. Different from ODF-067’s fixture-controlled refusal; no shared cause established.

<a id="odf-148"></a>

## ODF-148 — Unverified refinement examples conflict with preserved rules

Key examples promise new rewrite results while excluding changes to the current rewrite rules; execution drops a promise without an owner decision.

- **Sources:** [doughnut / DD-128](../../../doughnut/DearDough.md#odf-148--refined-key-examples-promised-link-rewrite-outcomes-that-the-existing-rewrite-rules-do-not-produce).
- **Assessment (2026-09-27):** One plan 047 execution on 0.3.41; seed promise remained inconsistent at closure. Distinct from ODF-074’s planning factual premises: this also loses a human-owned scope decision.
- **2026-09-27 related evidence:** Donut's closing review of SEED-048#story-1 ([report](https://claude.ai/artifact/5zjpVg4o5yvTtRQNn3LWjB); retained at `facb0ce8:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md`) links this pattern to a candidate story that silently relied on the no-cross-notebook-deduplication North Star rule and was dropped after an owner question (transcripts `8ed5aa4e`, `6806d413`; `506c267839`). Candidate premise against a North Star rule, not key examples against code: related, not a second occurrence.

<a id="odf-149"></a>

## ODF-149 — Unrepresentative ordinary-content examples

Minimal one-line editable examples miss ordinary hard-wrapped content, letting a style-only refusal ship against the story promise.

- **Sources:** [doughnut / DD-129](../../../doughnut/DearDough.md#odf-149--the-stays-editable-boundary-examples-were-all-one-line-bodies-so-a-check-that-refuses-wrapped-text-shipped).
- **Assessment (2026-09-27):** One plan 005 execution on 0.3.41; correction plan 008 needed before integration. Local product correction does not establish a general change to example selection.

<a id="odf-150"></a>

## ODF-150 — Implementation proof misses indirect consumers

Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario.

- **Sources:** [doughnut / DD-136](../../../doughnut/DearDough.md#odf-150--an-implementers-slice-proof-ran-only-the-specs-it-chose-missing-consumers-of-the-store-method-it-changed).
- **Assessment (2026-09-27):** Two Donut executions on 0.3.42 (014 and 016); one contained repair and one published failed frontend job. Relationship to ODF-111’s inherited test-helper refactor gap and ODF-107’s message consumers remains uncertain; allocate separately, with no claimed recurrence of f0f355c / 0.3.33.

<a id="odf-151"></a>

## ODF-151 — Retrospective asserts an unobserved UI mechanism

A retrospective infers the visible loading surface from its caller without checking the shared renderer, prescribing proof of a modal that is never shown.

- **Sources:** [doughnut / DD-137](../../../doughnut/DearDough.md#odf-151--a-retrospective-finding-asserted-the-loading-modal-which-the-product-does-not-show-for-these-requests).
- **Assessment (2026-09-27):** One plan 015 execution on 0.3.42; discarded modal-based test, correct busy-state proof retained. Distinct from a planner choosing an untried function; the false premise originates in a retrospective finding.

<a id="odf-152"></a>

## ODF-152 — File-size gate conflicts with approved intermediate scope

An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers.

- **Sources:** [doughnut / DD-138](../../../doughnut/DearDough.md#odf-152--the-file-size-rule-conflicted-with-an-approved-staged-simplification-and-mechanical-callers).
- **Assessment (2026-09-27):** One plan 016 execution on 0.3.42; two applicability exchanges, intended final store sizes achieved. Unlike ODF-124 the rule was found; retain a constraint-composition question, not a new scope exception.

<a id="odf-153"></a>

## ODF-153 — Sibling-branch CI failure attribution

A new observer labels a non-ancestor sibling revision as this execution’s branch; observer versus adapter responsibility is unknown.

- **Sources:** [pygardon / ODF-109 (plan 219 only)](../../../pygardon/DearDough.md#odf-153--an-observer-attributed-a-sibling-branch-failure-to-this-execution).
- **Assessment (2026-09-27):** One plan 219 execution on 0.3.42, one disposition of an unowned failure. Separate from ODF-109’s ancestor reports and ODF-102’s old-attempt snapshot; no common cause established.

<a id="odf-154"></a>

## ODF-154 — Missing Cursor coordinator identity

Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.

- **Sources:** [open-dough / DD-095 / ODF-092 (plan 126 Cursor only)](../../DearDough.md#odf-154--cursor-managed-delivery-lacks-its-coordinator-session-identity).
- **Assessment (2026-09-27):** One modified ff3534c/base 0.3.42 execution. 9880cbb deliberately applies its fallback only to Claude; Cursor’s problem is outside that corrected mechanism and is not a failed Claude fix.

<a id="odf-155"></a>

## ODF-155 — Red proof restores files in a shared checkout

An implementer temporarily replaces its shared-checkout files with HEAD versions to prove tests red, despite a supplied separate-baseline rule.

- **Sources:** [Donut / DD-141](../../../doughnut/DearDough.md#odf-155--an-implementer-proved-fails-first-by-putting-head-versions-back-in-the-shared-execution-checkout).
- **Assessment (2026-09-27):** One plan 021 / f8087d5845 execution, release unknown; no other writer active, no damage, intended diff restored. The return demonstrates bypass of the supplied rule; unknown release cannot establish recurrence after `86e5069` / 0.3.42. Distinct from foreign stash restoration (ODF-093) and concurrent proof reading sibling edits (ODF-129).
- **Follow-up:** none. Sequential slice execution (`1d3a26cd`) did not address it: no other writer was active, and the supplied separate-baseline rule was bypassed. This is a related baseline practice, not a ninth observed interference execution.
