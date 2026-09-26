# Open Dough finding names

Current findings reported by Open Dough, Pygardon, or Doughnut, plus linked
active follow-ups. Reviewed 2026-09-26 (Asia/Singapore), source revision `a951fc0`. Unreferenced findings are removed at the
owner's request; removal does not assert that a problem is fixed.

Released responses with verified use are in the [watch list](near-term-watch-list.md).

Keep each entry to its meaning, source links, decisive current evidence and
follow-up. Source logs retain execution details and former local codes.
Older catalog detail is recoverable at
`36fb9366295d1e6000cb3901a7ad3ce074382778:docs/maintainer/finding-names.md`.
Unknown execution releases stay unknown; current installations do not date old
reports. Count a project/execution once. Preserve distinct causes and uncertainty.

Codes are permanent; highest allocated is ODF-126. Check Git history and the
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

<a id="odf-060"></a>

## ODF-060 — Missing payload declarations

Adding a referenced source file without the matching delivery declarations creates an incomplete installable payload, discovered only in CI.

- **Sources:** [open-dough / DD-058](../../DearDough.md#odf-060--a-new-payload-file-was-published-without-being-declared-and-only-ci-noticed).
- **Current evidence:** `b6f9515` / 0.3.26 and `128b404` / 0.3.28 repair particular declarations; general omission prevention remains open.

<a id="odf-061"></a>

## ODF-061 — Ineffective shell assertions

Bare shell assertions under the observed bash 3.2 errexit behavior silently pass locally and fail without diagnostics in Linux CI.

- **Sources:** [open-dough / DD-059](../../DearDough.md#odf-061--a-shell-assertion-silently-enforced-nothing-on-the-developers-bash).
- **Current evidence:** `8570064` / 0.3.26 repairs one installed-link assertion, not the broader shell-assertion problem.
- **2026-09-26 assessment:** Plan 104 reports a different Bash mechanism (trap-called bare return before Bash 5.3), not recurrence of the repaired installed-link assertion. Two exact historical errexit incidents plus this related incident; broader portability work remains open.

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
- **Follow-up:** queued, not resolved: [Verify planning premises and proof setup before declaring readiness](../../.planning/seeds/SEED-044-verify-planning-premises.md#verify-planning-premises).

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
- **Follow-up:** open, no queued response. Excluded on 2026-09-26 from [Preserve other writers' work in shared worktrees](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#preserve-other-executions-work): the remover is unknown and the incident predates Dough Land's retirement gate.

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

<a id="odf-092"></a>

## ODF-092 — Missing Claude session identity

Managed delivery needs Claude Code session identity, but its taught invocation omits the identity source; the first publication is unobserved until the coordinator discovers and supplies it.

- **Sources:** [open-dough / DD-095](../../DearDough.md#odf-092--claude-code-managed-delivery-lacked-session-identity-a-refused-retry-left-a-hidden-observer); [pygardon / DD-085](../../../pygardon/DearDough.md#odf-092--managed-delivery-could-not-verify-the-claude-code-notification-bridge); [doughnut / DD-107](../../../doughnut/DearDough.md#odf-092--managed-increment-delivery-left-the-first-claude-code-publication-unobserved-because-no-guidance-names-the-session-identity-it-needs).
- **Current evidence:** Current source logs retain 35 distinct failing executions (Open Dough 7, Pygardon 14, Doughnut 14), plus historical evidence recoverable from their retention snapshots. Pygardon plan 185 is a successful session-input workaround and is excluded. The plan 200 occurrence was moved from ODF-103 because it reports missing session input, not mismatched owners. Reports through 0.3.40 predate the still-unreleased response; unknown releases cannot establish recurrence.
- **Response:** `9880cbb` / unreleased makes `deliver --host claude` take the coordinator's identity from `CLAUDE_CODE_SESSION_ID` when no `--session-json` is supplied, using one resolved owner for bridge verification and binding; explicit input stays authoritative and a missing identity reports an actionable coverage gap while publication stands. A CLI-boundary journey proves first attachment, owner-only failure delivery and second-increment reuse; fresh native Claude Code 2.1.283 `--print` and `--bg` coordinators followed the taught command without session JSON and received `CI_FAILURE` for both accepted revisions. Remaining uncertainty: unreleased, so client projects still run the old guidance; interactive native, runtimes older than 2.1.282, and effectiveness in client projects are unobserved.

<a id="odf-093"></a>

## ODF-093 — Foreign stash restoration

A failed stash push is followed by an unqualified stash pop, applying another session's shared stash.

- **Sources:** [open-dough / DD-094](../../DearDough.md#odf-093--a-delegated-agents-git-stash-pop-applied-another-sessions-stash).
- **Current evidence:** Four conflicted files were restored; no permanent loss reported. Distinct from stashing a live writer's files (ODF-105). High potential harm, one observed incident.
- **Response:** `f157f0e` moves the CI repair pause into `ci-repair-stash.mjs`, which records its own entry's OID and applies and drops only that entry; `86e5069` bars delegated agents from stash, pop, reset, clean, path checkout, and branch switch in a shared checkout. Not yet in a release (after 0.3.41). Proof is deterministic tests plus behavior review (ADR 0005 section 4); effectiveness is judged from later use. See the [watch](near-term-watch-list.md#odf-093).

<a id="odf-094"></a>

## ODF-094 — Overbroad lint restrictions

Delegation treats the restriction on hook-owned lint as a ban on all lint in a project without a commit hook, delaying mechanical defects until coordinator delivery.

- **Sources:** [open-dough / DD-093](../../DearDough.md#odf-094--implementation-and-refactor-agents-were-barred-from-lint-the-project-has-no-hook-for).

<a id="odf-095"></a>

## ODF-095 — Duplicated acceptance harnesses

Successive behavior slices clone native run and fixture scaffolding instead of sharing the same orchestration responsibility.

- **Sources:** [open-dough / DD-092](../../DearDough.md#odf-095--behavior-only-delivery-evidence-slices-cloned-native-run-scaffolding-four-times).
- **Current evidence:** `8c2fa5a` / 0.3.35 removes the four copied harnesses. The local residue is fixed; general prevention of cross-slice duplication is unverified.

<a id="odf-096"></a>

## ODF-096 — Invalid acceptance fixtures

Nominally sufficient native acceptance fixtures do not actually satisfy their promises, and the same fault class is rediscovered through paid failing runs.

- **Sources:** [open-dough / DD-096](../../DearDough.md#odf-096--native-acceptance-fixtures-sufficient-side-was-not-credible-and-each-case-paid-a-failed-run-to-learn-it).

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

<a id="odf-101"></a>

## ODF-101 — Late CI capacity recovery

A plan inherits a known CI capacity shortage but schedules the owned resource cleanup near the end, leaving early increments without CI verdicts.

- **Sources:** [pygardon / DD-086](../../../pygardon/DearDough.md#odf-101--low-docker-capacity-blocked-in-app-ci-while-the-capacity-freeing-cleanup-was-planned-last).

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
- **Response:** `86e5069` makes coordinator commits isolate owned work by staging owned paths only, never stashing, resetting, or restaging a sibling writer's work; `f157f0e` leaves the CI repair pause as the only sanctioned stash. Not yet in a release (after 0.3.41). See the [watch](near-term-watch-list.md#odf-105).

<a id="odf-106"></a>

## ODF-106 — Colliding plan numbers

Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.

- **Sources:** [pygardon / DD-095](../../../pygardon/DearDough.md#odf-106--two-concurrently-planned-quick-plans-received-the-same-number).
- **Additional source:** [Doughnut / ODF-106](../../../doughnut/DearDough.md#odf-106--two-concurrent-executions-allocated-the-same-quick-plan-number-from-different-bases). Two distinct 0.3.38 executions now report stale/concurrent allocation. v0.3.38..a951fc0 slice-planning guidance retains checkout-local allocation; no intervening correction of that mechanism.

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
- **Follow-up:** queued, not resolved: [Verify planning premises and proof setup before declaring readiness](../../.planning/seeds/SEED-044-verify-planning-premises.md#verify-planning-premises).

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
- **Follow-up:** queued, not resolved: [Verify planning premises and proof setup before declaring readiness](../../.planning/seeds/SEED-044-verify-planning-premises.md#verify-planning-premises).

<a id="odf-115"></a>

## ODF-115 — Unrepresentative regression measurements

A performance guard times a different calculation path or workload from the changed product, allowing a large regression to pass.

- **Sources:** [Pygardon / ODF-115](../../../pygardon/DearDough.md#odf-115--a-non-regression-measurement-did-not-exercise-the-product-path-it-guarded).
- **Assessment:** One 0.3.40 execution; about 35× refresh slowdown, a red CI revision and an added correction slice. Distinct from unverified fixture availability (ODF-114).

<a id="odf-116"></a>

## ODF-116 — Sibling edits invalidate readiness

Readiness hashes a whole shared seed, so an unrelated sibling edit or closure forces reassessment of an unchanged ready story.

- **Sources:** [Pygardon / ODF-116](../../../pygardon/DearDough.md#odf-116--a-sibling-storys-edit-to-a-shared-seed-made-a-ready-plan-unclaimable); [Doughnut / ODF-116](../../../doughnut/DearDough.md#odf-116--closing-one-story-in-a-shared-seed-made-a-sibling-storys-ready-assessment-stale).
- **Assessment:** Two distinct 0.3.40 executions across Pygardon and Doughnut. v0.3.40 and a951fc0 product-backlog-story-state-basis.mjs computeBasis digest the whole document; no intervening correction.
- **Follow-up:** queued, not resolved: [Preserve readiness when an unrelated sibling story changes](../../.planning/seeds/SEED-043-preserve-relevant-readiness.md#preserve-sibling-readiness).

<a id="odf-117"></a>

## ODF-117 — Idle-machine measurement prerequisites

A speed-comparison plan requires an idle shared machine and blocks execution until the owner replaces it with comparable paired measurements.

- **Sources:** [Open Dough / ODF-117](../../DearDough.md#odf-117--an-idle-machine-precondition-for-the-speed-baseline-stalled-execution-on-a-shared-machine).
- **Assessment:** One 0.3.39 execution, roughly 40 minutes blocked. The paired-run response is now in Taken SEED-037#fourfold-local-suite; do not duplicate that ongoing work.
- **Follow-up:** ongoing, not resolved: [Cut total test work and the CI verdict wait, and keep them within budget](../../.planning/seeds/SEED-037-quiet-stable-fast-tests.md#fourfold-local-suite) is Taken; paired measurement already replaces the idle precondition. No duplicate story queued.

<a id="odf-118"></a>

## ODF-118 — Missed meta-test consumers

Removing an assertion changes a test consumed by a mutation meta-test, but proof acceptance treats only shared helpers as consumer contracts.

- **Sources:** [Open Dough / ODF-118](../../DearDough.md#odf-118--removing-a-tests-assertion-broke-a-meta-test-that-mutated-against-it).
- **Assessment:** One execution, release unknown, one failed CI run. Related to ODF-003 and ODF-107; neither common cause nor post-fix recurrence is established.

<a id="odf-119"></a>

## ODF-119 — Stale default-checkout state blocks startup

Already-published planning bytes left in the default checkout look unpublished to startup; unignored nested worktrees also keep refresh deferred.

- **Sources:** [Open Dough / ODF-119](../../DearDough.md#odf-119--leftover-state-in-the-default-checkout-blocked-execution-startup-and-never-let-it-refresh).
- **Assessment:** One execution, release unknown. Existing default-checkout coordination story covers the shared maintenance boundary; preserve its bounded scope.
- **Follow-up:** queued, not resolved: [Coordinate direct edits and refreshes of the default checkout](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue). Existing scope and queue position retained.

<a id="odf-120"></a>

## ODF-120 — Satisfied prerequisites leave stale readiness

A dependency lands but its dependent story retains a not-ready assessment whose only reason was that unmet dependency.

- **Sources:** [Doughnut / ODF-120](../../../doughnut/DearDough.md#odf-120--a-not-ready-assessment-whose-only-reason-was-a-satisfied-start-condition-blocked-queued-startup).
- **Assessment:** One 0.3.38 execution; about six extra calls. Distinct from unrelated sibling edits (ODF-116): the dependency changed relevant readiness context.

<a id="odf-121"></a>

## ODF-121 — Transient transport failure ends observation

A reported GitHub transport failure ends observation and leaves later revisions without notification coverage.

- **Sources:** [Doughnut / ODF-121](../../../doughnut/DearDough.md#odf-121--one-transient-github-tls-timeout-ended-ci-observation-for-the-rest-of-the-execution).
- **Assessment:** One 0.3.38 execution. Distinct from ODF-089 false live reporting: this observer reported unavailable and the later delivery reported unobserved. A single delivered event does not prove only one failed transport attempt; retry mechanism remains unverified.

<a id="odf-122"></a>

## ODF-122 — Correction plans lack startup preparation

A queued retrospective correction lacks recorded preparation; startup then refuses both missing readiness and a redundant plan selector.

- **Sources:** [Doughnut / ODF-122](../../../doughnut/DearDough.md#odf-122--a-correction-plan-written-by-a-retrospective-had-no-readiness-record-so-queued-startup-refused-it).
- **Assessment:** One 0.3.38 execution; about seven extra calls and a separate readiness commit. Missing preparation differs from stale readiness.

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
- **Assessment:** One 0.3.40 execution; 11 status turns and about 2.6M cache-read tokens. Different from ODF-038 coordinator-generated no-op calls; the host generates these wakeups.

<a id="odf-126"></a>

## ODF-126 — Host isolation blocks closure integration

A host-entered worktree session refuses the wrap-up operations against the originating checkout until the owner exits isolation.

- **Sources:** [Pygardon / ODF-126](../../../pygardon/DearDough.md#odf-126--entering-a-harness-worktree-for-story-branch-mode-blocked-wrap-ups-later-main-checkout-integration).
- **Assessment:** Historical 0.3.27 report returned from ProjectFindings.md (37b86f9dc), not a new execution. f9dd881 first shipped owned-workspace closure in 0.3.28 (verified tag and diff), earlier than the source claim of 0.3.30. No verified restricted-host closure exercise or demonstrated recurrence; keep the owner's request for observation.
- **Follow-up:** queued, not resolved: [Complete execution and wrap-up in fresh Claude Code background mode](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#claude-code-background-mode) retains the host restriction/handoff outcome. Historical integration-location response alone does not establish restricted-host closure success.
