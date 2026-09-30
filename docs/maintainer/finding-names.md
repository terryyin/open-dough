# Open Dough finding names

Current findings reported by Open Dough, Pygardon, or Doughnut, plus linked
active follow-ups. Reviewed 2026-09-30 (Asia/Singapore), source revision `babcbbc0`. Settled local records and clear noise are removed under the maintainer runbook;
removal does not assert that a problem can never recur.

Released responses with verified use are in the [watch list](near-term-watch-list.md).

Keep each entry to its meaning, source links, decisive current evidence and
follow-up. Source logs retain execution details and former local codes.
Older catalog detail is recoverable at
`36fb9366295d1e6000cb3901a7ad3ce074382778:docs/maintainer/finding-names.md`.
Unknown execution releases stay unknown; current installations do not date old
reports. Count a project/execution once. Preserve distinct causes and uncertainty.

Codes are permanent; highest allocated is ODF-199. Check Git history and the
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

- **2026-09-30 assessment:** New Open Dough plan 140 repeats a file-type/consumer omission; release unknown (the repository VERSION is not execution provenance). Source rows retain the failed CI repair.

- **Open Dough source retention history:** Removed on 2026-09-29 for the 1,000-line ceiling, as lower priority than DD-180, DD-181, and DD-172's third occurrence: ODF-003's two oldest occurrences (`SEED-008#script-driven-ci-observation`, `SEED-037#diagnosable-test-hangs`); two later occurrences keep the finding; recovery: `4ef13e85:DearDough.md`.

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

- **2026-09-30 assessment:** Pygardon plan 267 on 0.3.45 adds a no-op delegated spawn while waiting, after 89728cb / 0.3.18 forbade empty calls. Related wait behavior, not an additional exact no-op-shell occurrence. The reported ~100k context tokens are not measured useful work.

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

- **2026-09-30 assessment:** Open Dough plan 146, modified 3ca0b8f9/base 0.3.46, adds two reportless stalls in one execution; count that execution once. Host termination remains different from voluntary incomplete proof (ODF-132).

- **Open Dough source retention history:** Removed on 2026-09-29 for the 1,000-line ceiling, as lower priority than DD-174 and ODF-097's third occurrence: ODF-059's 0.3.25-era occurrence (`SEED-008#script-product-backlog-list-updates`); two later occurrences keep the finding; recovery: `14cd2de3:DearDough.md`.

<a id="odf-062"></a>

## ODF-062 — Unreviewed CI repairs

The coordinator delivers an interruption-path CI repair through formatting and publication without the required independent refactor pass.

- **Sources:** [open-dough / DD-060](../../DearDough.md#odf-062--a-ci-repair-was-delivered-without-the-refactor-pass-its-own-delivery-gate-requires).

<a id="odf-064"></a>

## ODF-064 — Unreviewed post-refactor changes

A post-refactor implementation correction is delivered without a further independent refactor pass; the delivery contract leaves this trigger unclear.

- **Sources:** [open-dough / DD-062](../../DearDough.md#odf-064--a-correction-returned-after-the-refactor-pass-was-delivered-without-a-refactor-pass-of-its-own).

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

- **Sources:** Open Dough / DD-066; recovered source `6fa51cb6:DearDough.md` and `0c31529b:DearDough.md` (removed earlier for the source line ceiling).
- **Current evidence:** `6d7f7f3` / 0.3.28 requires running an applicable command. No verified exercise of this specific correction; watch start unknown.

- **Open Dough source retention history:** Removed ODF-070 (former DD-066; nested worktree `node_modules` assumed absent) on 2026-09-29 for the 1,000-line ceiling: its 0.3.26-era occurrence as lower priority than ODF-116's recurrence (recovery: `6fa51cb6:DearDough.md`), then its remaining occurrence as lower current actionability than DD-172/DD-173 and the ODF-100 recurrence, since execution-location guidance now requires a locked install per worktree (recovery: `0c31529b:DearDough.md`).

<a id="odf-074"></a>

## ODF-074 — Unverified planning premises

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

- **Sources:** [pygardon / DD-061](../../../pygardon/DearDough.md#odf-074--plan-statements-about-existing-code-and-host-state-were-not-verified-at-planning-time).
- **2026-09-26 evidence:** Eight distinct Pygardon executions now retained, including plans 193, 196 and 198 (0.3.39, unknown and 0.3.40 respectively). Current-code, proof-path and workload premises remain actionable; no generic correction is claimed.
- **Response:** `2c5ff71` / first released in 0.3.43 makes slice planning establish each decisive premise (existing code and tests, host state, fixtures, workload data, named proof commands) with the smallest safe observation, searching for existing tests and callers wherever they live, and record it before `ready`; an unobserved cheap premise is a `not-ready` reason. Native Claude Code 2.1.283 re-planning of Doughnut plan 045 from its pre-plan revision caught the recorded "no test" premise the unchanged guidance missed; the Pygardon plan 196 seeding-proof case passed before and after, so its attribution is weak. One run per case. Remaining: [native acceptance on Codex and Cursor](../../.planning/seeds/SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases) is closed with the recorded host results; ordinary project effectiveness is assessed below.
- **2026-09-27 harvest:** Added Open Dough plan 115 / DD-121 and Donut plans 045, 005, 010, 019 / DD-126, DD-130, DD-134, DD-139. Pygardon adds plans 201 and 216; its plan 207 is a dependent-slice variant, not an exact factual-premise recurrence. The misplaced plan 212 formatter row now belongs to ODF-100. Known reports use 0.3.40–0.3.42 or pre-response modified guidance; These reports preceded the 0.3.43 release of `2c5ff71`, so none establishes post-fix recurrence.
- **Additional sources:** [open-dough](../../DearDough.md#odf-074--a-ready-plan-named-a-validation-command-the-backlog-tool-does-not-have); [doughnut](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test).

- **2026-09-30 assessment:** 2c5ff71 first shipped in 0.3.43. Pygardon plans 271 (0.3.45), 274 and 285 (0.3.46) still enter execution with unobserved decisive runtime/fixture claims; plan 287 has unknown release. Doughnut DD-147/162/167 add command, caller and matching-rule premises on 0.3.46. The general observation rule remains in the relevant 0.3.45–0.3.47 diffs: these are supported post-response failures to apply it, not evidence of removal followed by reintroduction. The 0.3.46 Cursor seeding case in SEED-053 also failed; later aa650875, 9d4bf02f and c97c3fe0 specifically strengthen moved-function caller proof and are unreleased. Historical 0.3.40–0.3.42 reports remain pre-response. Source overlap is counted once per project/execution.
- **Follow-up:** queued, not resolved: [Observe a planning premise through the operation that consumes it](../../.planning/seeds/SEED-059-observe-planning-premise-consumers.md#observe-premise-consumers) — SEED-059#observe-premise-consumers. Selected under the authorized 2026-09-30 runbook.

- **Additional source mappings (2026-09-30):** [doughnut / DD-147](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test); [doughnut / DD-162](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test); [doughnut / DD-167](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test).

- **Open Dough source retention history:** Removed on 2026-09-29 for the 1,000-line ceiling, as lower priority than ODF-116's closure-rewrite occurrence: ODF-074's `SEED-008#creation-record-test-residue` occurrence (no rework; one older occurrence keeps the finding); recovery: `a48b2436:DearDough.md`.

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
- **Response:** `f157f0e` moves the CI repair pause into `ci-repair-stash.mjs`, which records its own entry's OID and applies and drops only that entry; `86e5069` bars delegated agents from stash, pop, reset, clean, path checkout, and branch switch in a shared checkout. First released in 0.3.42. Follow-on restore/drop safety corrections `8f88364`, `ab3cb42`, `40cb0bc` first shipped in 0.3.43; their diffs verify applied-state reporting and refusal to drop when nothing applied. Watch start unknown: no verified real foreign-stash avoidance exercise; deterministic proof alone does not begin a watch.

<a id="odf-094"></a>

## ODF-094 — Overbroad lint restrictions

Delegation treats the restriction on hook-owned lint as a ban on all lint in a project without a commit hook, delaying mechanical defects until coordinator delivery.

- **Sources:** [open-dough / DD-093](../../DearDough.md#odf-094--implementation-and-refactor-agents-were-barred-from-lint-the-project-has-no-hook-for).

- **2026-09-30 assessment:** Open Dough plan 163 adds no-hook lint omissions with unknown execution release. Retain exact effects at source; do not date them from the installed update commit.

<a id="odf-096"></a>

## ODF-096 — Invalid acceptance fixtures

Nominally sufficient native acceptance fixtures do not actually satisfy their promises, and the same fault class is rediscovered through paid failing runs.

- **Sources:** [open-dough / DD-096](../../DearDough.md#odf-096--native-acceptance-fixtures-sufficient-side-was-not-credible-and-each-case-paid-a-failed-run-to-learn-it).
- **2026-09-27 assessment:** Kept as a published-skill finding, not project-owned: plan 089's own rule deferred test-support fixes until a paid run diagnosed a fault. The related planning-premise response `2c5ff71` / first released in 0.3.43 treats fixture content as a decisive premise and makes a paid-only remainder an early probe slice ([ODF-074](#odf-074), [ODF-114](#odf-114)); no native acceptance fixture has exercised it. [Native acceptance on Codex and Cursor](../../.planning/seeds/SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases) is closed with the recorded host results; no separate story.
- **2026-09-27 harvest:** Open Dough plan 110 / modified bd38782/base 0.3.40 adds a contradictory native prompt (forbade the probe’s required marker write), costing one paid failed run; still pre-response.

- **2026-09-30 assessment:** 2c5ff71 shipped in 0.3.43; the linked Codex/Cursor acceptance work is now closed, not queued. Plan 141 reports 0.3.46 only on resume and unknown original coordinator guidance, so its paid inconclusive run cannot establish a dated post-fix recurrence. The unrelated plan 142/146 harness faults were moved by the owner to ProjectFindings.md.

- **Open Dough source retention history:** Removed on 2026-09-29 for the 1,000-line ceiling, as lower priority than DD-189 and ODF-094's plan 163 occurrence: ODF-096's 0.3.34-era occurrence (`SEED-004#accept-delivery-evidence-native`); two later occurrences keep the finding; recovery: `b4d82278:DearDough.md`.

<a id="odf-097"></a>

## ODF-097 — Publishing after formatter failure

A formatter failure does not stop a semicolon-separated commit and push sequence.

- **Sources:** [open-dough / DD-097](../../DearDough.md#odf-097--coordinator-published-a-commit-after-the-formatter-failed).

- **2026-09-30 assessment:** Four source executions now retain the semicolon-chain mechanism (089, 150, 154 and 157). Three produced failed published CI; plan 157 published a passing repair while the formatter failed on another unstaged file. No dedicated scripted gate response is claimed; keep the failure and counterexample distinct.

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

- **2026-09-30 assessment:** New exact pipeline cases: Open Dough 152 (unknown), Doughnut 026 (unknown), 009 (0.3.45) and 014 (0.3.46). Pygardon 201 is another newline-separated plan-edit failure, related rather than exact pipeline recurrence. The 0.3.46 Doughnut case accepted a false typecheck success and published failed CI; earlier Donut reruns were honestly reported.

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

- **2026-09-30 assessment:** Pygardon plan 288 on 0.3.47 repeats reasonless deferred maintenance and one required manual refresh. Four distinct retained executions across Pygardon and Doughnut; no specific response is verified.

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

- **2026-09-30 assessment:** Open Dough DD-155 / plan 132 adds a fourth cross-project execution of checkout-visible plan-number collision, release unknown. Both distinct directories reached trunk; same allocation mechanism, no intervening correction verified.

- **Additional source mappings (2026-09-30):** [open-dough / DD-155](../../DearDough.md#odf-106--two-plans-planned-concurrently-on-different-checkouts-both-took-number-132).

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
- **Response:** `2c5ff71` / first released in 0.3.43: readiness settles a premise only with an observation covering the slice's promised journey through the next operation that consumes its result, and clears a premise-based reason only on a fresh observation, not re-cited evidence. Proof is behavior review only; no native case exercised it, and [native acceptance on Codex and Cursor](../../.planning/seeds/SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases) is closed with the recorded host results. This specific mechanism remains unexercised.

- **2026-09-30 assessment:** 2c5ff71 first shipped in 0.3.43 and explicitly requires the promised journey through its consuming operation. Doughnut DD-163 / plan 049 (0.3.46), DD-168 / plan 056 and DD-171 / plan 053 (0.3.47) repeat probes/premises that stop before the consumer. These are supported post-response mechanism recurrences. Open Dough DD-124 / plan 112 is related modified-guidance evidence: the source says the rule was installed at re-bind, but its reported execution release remains unknown. Do not turn that into a numbered-release recurrence.
- **Follow-up:** queued, not resolved: [Observe a planning premise through the operation that consumes it](../../.planning/seeds/SEED-059-observe-planning-premise-consumers.md#observe-premise-consumers) — SEED-059#observe-premise-consumers. Selected under the authorized 2026-09-30 runbook.

- **Additional source mappings (2026-09-30):** [open-dough / DD-124](../../DearDough.md#odf-110--a-publisher-seam-premise-was-observed-by-reading-the-seam-not-the-race-it-had-to-stop); [doughnut / DD-163](../../../doughnut/DearDough.md#odf-110--a-readiness-replay-observed-only-the-plans-named-seam-not-the-rest-of-the-slices-journey); [doughnut / DD-168](../../../doughnut/DearDough.md#odf-110--a-readiness-replay-observed-only-the-plans-named-seam-not-the-rest-of-the-slices-journey); [doughnut / DD-171](../../../doughnut/DearDough.md#odf-110--a-readiness-replay-observed-only-the-plans-named-seam-not-the-rest-of-the-slices-journey).

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
- **Response:** `2c5ff71` / first released in 0.3.43 counts story-inherited premises such as "works as today" as decisive, observed by one unpaid, side-effect-free local run; a paid, credentialed or owner-held remainder becomes an early probe slice that stops dependent work. Proof is behavior review only (the diarization example); no native case exercised it, and [native acceptance on Codex and Cursor](../../.planning/seeds/SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases) is closed with the recorded host results. This specific mechanism remains unexercised.

- **2026-09-30 assessment:** The general premise/probe response 2c5ff71 shipped in 0.3.43. No later exact diarization/paid-proof fixture exercise is established; watch start remains unknown. ODF-182 is a distinct transformed-genome proof gap on 0.3.46, not a proven recurrence of the old diarization setup mechanism.

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
- **Follow-up:** response delivered, first released in 0.3.43: Preserve readiness when an unrelated sibling story changes (SEED-043#preserve-sibling-readiness, closed; recoverable at `88c376e:.planning/seeds/SEED-043-preserve-relevant-readiness.md`), commit `62b7b7a`. The readiness basis now covers the story's own section, the seed's shared context and a distinct plan, so sibling preparation, edits and closure leave a ready story startable. Limits: a record from before the change in a multi-story seed reads `needs-reassessment` once after any sibling edit; a closure that leaves uneven blank lines mid-seed still reads as changed; code drift stays undetected. The later evidence is assessed below; release alone does not establish effectiveness.
- **2026-09-27 harvest:** Open Dough DD-120 / plan 126 adopted here; Pygardon plan 208 moved here from ODF-092. Source rows now identify 17 executions: 16 whole-seed invalidations and one Donut plan-047 plan-digest change (related, excluded from the exact count); some had useful dependency/code checks as well. `62b7b7a` landed during this run; all these reports precede its release in 0.3.43. Watch start unknown.
- **Additional sources:** [open-dough](../../DearDough.md#odf-116--a-sibling-storys-refinement-invalidated-readiness-costing-a-reassessment-cycle-before-the-claim).

- **2026-09-30 assessment:** 62b7b7a first shipped in 0.3.43 and limits sibling-section hashing while retaining shared context and the selected story/plan. Later source rows that actually changed shared context moved to ODF-177; provenance rewrites moved to ODF-176. They do not establish failure of the sibling-section correction. Current source evidence still contains earlier whole-seed reports and the historically related Donut plan-047 plan change. No exact post-fix ordinary sibling-section exercise with unchanged shared context is verified; start unknown.

<a id="odf-118"></a>

## ODF-118 — Missed meta-test consumers

Removing an assertion changes a test consumed by a mutation meta-test, but proof acceptance treats only shared helpers as consumer contracts.

- **Sources:** [Open Dough / ODF-118](../../DearDough.md#odf-118--removing-a-tests-assertion-broke-a-meta-test-that-mutated-against-it).
- **Assessment:** One execution, release unknown, one failed CI run. Related to ODF-003 and ODF-107; neither common cause nor post-fix recurrence is established.

<a id="odf-120"></a>

## ODF-120 — Satisfied prerequisites leave stale readiness

A dependency lands but its dependent story retains a not-ready assessment whose only reason was that unmet dependency.

- **Sources:** [Doughnut / ODF-120](../../../doughnut/DearDough.md#odf-120--a-not-ready-assessment-whose-only-reason-was-a-satisfied-start-condition-blocked-queued-startup).
- **Assessment:** Two executions on 0.3.38 and 0.3.42; about six and ten extra calls. Distinct from unrelated sibling edits (ODF-116): the dependency changed relevant readiness context.
- **2026-09-27 harvest:** Donut plan 020 adds a second execution on 0.3.42 (roughly ten calls and a readiness publication). Keep satisfied dependencies distinct from irrelevant sibling invalidation.

- **2026-09-30 assessment:** New Open Dough DD-172 retains three executions (plans 152, 157, 159); Pygardon DD-176 adds plan 278. Six distinct cross-project executions including the two older Doughnut reports. Plan 157 also had useful open decisions, so its entire reassessment is not classified as wasted. Execution releases of the four new reports remain unknown.

- **Additional source mappings (2026-09-30):** [open-dough / DD-172](../../DearDough.md#odf-120--a-not-ready-reason-waiting-on-another-storys-landing-was-not-revisited-when-it-landed); [pygardon / DD-176](../../../pygardon/DearDough.md#odf-120--a-plan-held-not-ready-on-a-siblings-unintegrated-story-branch-with-nothing-to-reassess-it-when-that-branch-landed).

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

- **2026-09-30 assessment:** Pygardon DD-158 / plan 266 on 0.3.44 adds an exact missing-retrospective-readiness occurrence. Three distinct cross-project executions; the safety refusal itself worked.

- **Additional source mappings (2026-09-30):** [pygardon / DD-158](../../../pygardon/DearDough.md#odf-122--a-retrospectives-correction-plan-reached-execution-with-no-readiness-assessment).

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
- **Assessment (2026-09-27):** Five distinct Donut executions on 0.3.42 (plans 011, 010, 015, 018, 020), each recovered through the real path; no wrong commit published. Earlier eff69eb / 0.3.27 corrected three CI entrypoints; agent-commit was introduced later by 61054431 / 0.3.42 with a literal guard. v0.3.42..2d2c4cda leaves it unchanged. This is a new entrypoint defect after a demonstrated earlier correction, not recurrence in those repaired CI scripts.
- **Response:** `108fb545`, first released in 0.3.43: `agent-commit.mjs`, `execution-start.mjs` and `ci-repair-stash.mjs` now use the realpath-aware direct-entry helper, and a sweep test runs every directly invoked Open Dough script through a symlinked skill directory, failing on a silent exit 0. Delivered proof only; effectiveness needs relevant Donut use of a release containing it.

- **2026-09-30 assessment:** 108fb545 first shipped in 0.3.43. Doughnut now retains nine pre-response executions; eight report 0.3.42 and one is unknown. No supported post-fix alias failure exists, but later commit success without the invocation spelling does not establish real symlink-boundary exercise; keep active, watch start unknown. Earlier eff69eb / 0.3.27 corrected the three CI entrypoints before agent-commit was introduced.

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

- **2026-09-30 assessment:** Pygardon plan 288 on 0.3.47 repeats a default-checkout proof prerequisite without an execution mode; the owner selected Trunk Mode before Take. This second execution avoided manual integrations, unlike plan 213.

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
- **Assessment (2026-09-27):** One truthful-repair-restore plan 115 execution, release unknown; retrospective reproduced data loss in a fixture after two refactor passes. Local correction 40cb0bc refuses drop when nothing applied; first released in 0.3.43 (tag and drop guard verified). That repairs the stash behavior, not the broader acceptance failure. Distinct from ODF-093 applying a foreign stash; no actual user data loss was reported.

- **Follow-up:** queued, not resolved: [Check reported gaps against the story before accepting a slice](../../.planning/seeds/SEED-058-accept-reported-story-gaps.md#accept-reported-story-gaps) — SEED-058#accept-reported-story-gaps. Selected under the authorized 2026-09-30 runbook.

<a id="odf-139"></a>

## ODF-139 — Reported defect dismissed without checking the story

An implementer reports a loss that contradicts the story goal; acceptance labels it out of scope and preserves a test that pins it.

- **Sources:** [doughnut / DD-132](../../../doughnut/DearDough.md#odf-139--the-coordinator-accepted-an-implementers-reported-gap-as-out-of-scope-without-checking-the-story-and-the-example-test-pinned-the-defect).
- **Assessment (2026-09-27):** One plan 006 execution on 0.3.41; published story branch lost an unedited final newline and needed correction plan 009. Related to ODF-138’s acceptance gap, but here the mechanism is a false scope judgment; do not merge identities.

- **Follow-up:** queued, not resolved: [Check reported gaps against the story before accepting a slice](../../.planning/seeds/SEED-058-accept-reported-story-gaps.md#accept-reported-story-gaps) — SEED-058#accept-reported-story-gaps. Selected under the authorized 2026-09-30 runbook.

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

- **2026-09-30 assessment:** Pygardon DD-131 maps its branch-ref reports here (plans 223, 266, 291 and 290); its plan-223 missing-candidate event is separately ODF-168. Doughnut DD-172 / plan 062 (0.3.47) maps here too. The already-adopted Doughnut heading adds plans 003, 008, 012, 013 and 050 (0.3.43–0.3.46). Source-inspection-only recoveries (003 and Pygardon 290) are related cost, not refused-call occurrences. No branch-form response is verified.

- **Additional source mappings (2026-09-30):** [pygardon / DD-131](../../../pygardon/DearDough.md#odf-143--managed-delivery-refused-its-first-calls-on-argument-shape-one-with-a-message-naming-neither-argument); [doughnut / DD-172](../../../doughnut/DearDough.md#odf-143--managed-delivery-rejects-unqualified-branch-references).

<a id="odf-144"></a>

## ODF-144 — Lost-worker notice repeatedly blocks turn completion

The Claude Stop hook repeats an already-recorded lost-worker notice without acknowledgement, blocking every later turn end.

- **Sources:** [pygardon / DD-125](../../../pygardon/DearDough.md#odf-144--after-a-completion-receipt-recorded-lost-coverage-the-claude-code-stop-hook-blocked-every-turn-end).
- **Assessment (2026-09-27):** One plan 213 execution, release unknown; three Stop-hook blocks, resolved by moving the coordinator’s stale binding. The lost-worker detection from 8a7c770 / 0.3.28 is functioning; this is repeated delivery of that notice, not undetected death (ODF-065).

- **2026-09-30 assessment:** Seven distinct source executions now support the same repeated lost-worker notice: Pygardon 213/288/289, Open Dough 162/160, Doughnut 059/060. Four known reports use 0.3.47; other releases are unknown. Doughnut 059 measured ~7.7M cache-read tokens and 49 status-only replies, not new occurrence counts. Source response 75bdc10d (2026-09-29) records lossReported only after acknowledgement and suppresses stopped mailboxes. No containing tag exists through 0.3.47: all reports predate released use of that correction, so none demonstrates a failed fix. Keep active awaiting release and relevant use; do not queue a duplicate implementation.

- **Additional source mappings (2026-09-30):** [open-dough / DD-185](../../DearDough.md#odf-144--a-lost-observer-notice-kept-blocking-every-turn-end-even-after-the-observer-was-stopped); [doughnut / DD-169](../../../doughnut/DearDough.md#odf-144--the-ci-stop-hook-re-announced-an-already-stopped-lost-observer-at-every-coordinator-stop).

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

- **2026-09-30 assessment:** Open Dough DD-177 / plan 157 adds the same component-selected proof omission against page-wide invariants, with two CI repairs in one execution. Doughnut plans 014 (0.3.46) and 058 (unknown) add indirect/E2E consumers; five distinct source executions in total. Keep separate from ODF-178 blanket layer exclusions; no shared cause with the earlier f0f355c response is established.

- **Additional source mappings (2026-09-30):** [open-dough / DD-177](../../DearDough.md#odf-150--slice-proof-chosen-by-the-changed-components-missed-page-wide-invariant-specs).

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

- **2026-09-30 assessment:** Open Dough plan 136 on 0.3.43 adds a second Cursor-specific session-identity omission. Claude fallback 9880cbb / 0.3.41 does not cover Cursor; this is not recurrence in that repaired mechanism.

<a id="odf-155"></a>

## ODF-155 — Red proof restores files in a shared checkout

An implementer temporarily replaces its shared-checkout files with HEAD versions to prove tests red, despite a supplied separate-baseline rule.

- **Sources:** [Donut / DD-141](../../../doughnut/DearDough.md#odf-155--an-implementer-proved-fails-first-by-putting-head-versions-back-in-the-shared-execution-checkout).
- **Assessment (2026-09-27):** One plan 021 / f8087d5845 execution, release unknown; no other writer active, no damage, intended diff restored. The return demonstrates bypass of the supplied rule; unknown release cannot establish recurrence after `86e5069` / 0.3.42. Distinct from foreign stash restoration (ODF-093) and concurrent proof reading sibling edits (ODF-129).
- **Follow-up:** none. Sequential slice execution (`1d3a26cd`) did not address it: no other writer was active, and the supplied separate-baseline rule was bypassed. This is a related baseline practice, not a ninth observed interference execution.

- **2026-09-30 assessment:** Unknown-release Donut plan 021 remains unchanged. Pygardon path-checkout debug cleanup on 0.3.46 is separately ODF-183: different trigger, with no lost edits. Sequential-slice guidance does not itself prevent either baseline/cleanup act.

<a id="odf-156"></a>

## ODF-156 — Lost acceptance obligations in delegation

A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.

- **Sources:** [open-dough / DD-126](../../DearDough.md#odf-156--a-slice-acceptance-obligation-recorded-as-a-plan-learning-never-reached-the-next-delegation).
- **Identity assessment (2026-09-30):** Related to reported-gap acceptance, but the obligation is lost before the implementer returns. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-028#one-shot-work` / plan 112, first related implementation commit `d0101737`

<a id="odf-157"></a>

## ODF-157 — Identifier-only conceptual searches

An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive.

- **Sources:** [open-dough / DD-127](../../DearDough.md#odf-157--a-no-other-location-premise-was-swept-with-the-removed-rules-words-missing-the-concepts-other-wording).
- **Identity assessment (2026-09-30):** Distinct from ODF-124: the search reaches the right files but uses the wrong vocabulary. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-008#isolate-parallel-slice-delivery` / plan 131, first related implementation commit `1d3a26cd`
- **Retained execution:** open-dough; Execution: `SEED-008#finish-removing-checkout-coordination` / plan 145, first related implementation commit `3239c49a`

<a id="odf-158"></a>

## ODF-158 — Disproportionate required reference reads

Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths.

- **Sources:** [open-dough / DD-128](../../DearDough.md#odf-158--execute-plans-required-reference-reads-cost-more-than-a-clean-one-slice-run-used).
- **Identity assessment (2026-09-30):** Related to retired ODF-006 (oversized bundled reads), but this report challenges the required read set, not just how reads are batched. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-004#proudly-found-elsewhere-design` / plan 133, first related implementation commit `29d0c909`
- **Retained execution:** open-dough; Execution: `SEED-008#restate-ci-pause-ownership` / plan 132, first related implementation commit `bab3ac9b`
- **Retained execution:** open-dough; Execution: `SEED-053#proportionate-local-verification` / plan 143, first related implementation commit `8cafa49d`

<a id="odf-159"></a>

## ODF-159 — Known trunk fix deferred past branch CI

A story branch defers a known published trunk fix until closure, then spends a CI repair cycle on the already-understood failure.

- **Sources:** [open-dough / DD-163](../../DearDough.md#odf-159--a-local-flake-already-fixed-on-trunk-was-left-off-the-story-branch-which-then-failed-ci-on-it).
- **Identity assessment (2026-09-30):** Related to ODF-134, but this is the absent route for a known needed fix, rather than conflicting rebase bases. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-052#launch-claude-planned-execution` / plan 144, first related implementation commit `31cd0530`

<a id="odf-160"></a>

## ODF-160 — Execution invokes unrequested wrap-up

A native executor proceeds into story wrap-up despite finish guidance retaining the story, plan and checkout for a separate request.

- **Sources:** [open-dough / DD-165](../../DearDough.md#odf-160--cursor-ran-story-wrap-up-after-execution-although-guidance-says-to-leave-it).
- **Identity assessment (2026-09-30):** One modified-guidance Cursor run; no cross-host recurrence or general host defect is established. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-008#owned-context-start-and-truthful-refresh` / plan 142, first related implementation commit `7e86f615`

<a id="odf-161"></a>

## ODF-161 — Stale local readiness advice before startup

Execute-plan advises refinement from a lagging default checkout before the remote-aware startup can discover already-published planning.

- **Sources:** [open-dough / DD-167](../../DearDough.md#odf-161--execute-plan-judged-readiness-from-a-stale-default-checkout-and-sent-a-planned-story-back-to-refinement).
- **Identity assessment (2026-09-30):** Related to retired ODF-119. 9597bf61 removed the script source veto, not this earlier advisory read; the reported release is unknown. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-008#durable-workspace-creation-fact` / plan 147, first related implementation commit `cb066559`

<a id="odf-162"></a>

## ODF-162 — Markdown line limits distort prose and proof

A physical-line ceiling encourages long Markdown lines and wrapping-only edits that break line-sensitive guidance assertions.

- **Sources:** [open-dough / DD-170](../../DearDough.md#odf-162--the-250-line-refactor-bound-pushed-markdown-guidance-into-longer-lines-and-brittle-regex-fixes).
- **Identity assessment (2026-09-30):** Separate from code-file extraction and approved intermediate-scope conflicts (ODF-152). Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-008#installed-wrap-up-command` / plan 146, first related implementation commit `aa4fd510`; Timestamp: unknown (2026-09-29, slices 3–5 and trunk merge `28fb01ae`); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: modified; revision `3ca0b8f9`; base 0.3.46.

<a id="odf-163"></a>

## ODF-163 — Unobserved refactor equivalence claims

A refactor removes a guard on an untested helper premise; acceptance repeats that premise and publishes a latent crash path.

- **Sources:** [open-dough / DD-174](../../DearDough.md#odf-163--a-refactor-pass-removed-a-guard-as-behavior-preserving-on-an-unverified-helper-premise).
- **Identity assessment (2026-09-30):** Related to retired ODF-063, but the observed effect is an unproved behavior-preserving edit, not relaying an unsupported coverage claim to the user. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-008#closure-proof-and-harness-correction` / plan 154, first related implementation commit `d1204cd7`; Timestamp: unknown (refactor before `d1204cd7`, 2026-09-29T15:02:45+08:00); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `b37292dd`

<a id="odf-164"></a>

## ODF-164 — Wrong observer repository and hidden retry side effects

Delivery accepts a repository argument inconsistent with the pushed remote; a later refused retry establishes an observer without reporting it.

- **Sources:** [open-dough / DD-176](../../DearDough.md#odf-164--a-mistyped---repo-bound-managed-deliverys-observer-to-another-repository-and-a-refused-retry-left-a-second-observer).
- **Identity assessment (2026-09-30):** Keep both observed boundaries in this one supplied delivery incident; no cause match with ODF-103 owner hashing is established. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002`

<a id="odf-165"></a>

## ODF-165 — Probe assigned to an unavailable actor

A planned interactive host probe assigns input to the agent even though the host permits only the developer to drive that attachment.

- **Sources:** [open-dough / DD-180](../../DearDough.md#odf-165--a-host-probe-planned-for-the-agent-to-answer-needed-the-developer-because-the-host-refused-self-driving-the-attach).
- **Identity assessment (2026-09-30):** The owner ultimately ran it; no authorization bypass is claimed. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-052#launch-claude-refinement` / plan 159, first related commit `eb89e7d2`

<a id="odf-166"></a>

## ODF-166 — Proof multiplicity direction ignored at acceptance

Acceptance checks assertion substance but misses the plan's instruction to prove a shared capability once, leaving redundant per-state checks.

- **Sources:** [open-dough / DD-181](../../DearDough.md#odf-166--proof-acceptance-checked-what-tests-observe-not-the-plans-direction-on-how-often-to-observe-it).
- **Identity assessment (2026-09-30):** Distinct from incomplete consumer proof and from fixed refactor cost (ODF-141). Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-052#launch-claude-refinement` / plan 159, first related implementation commit `aaf78a9c`

<a id="odf-167"></a>

## ODF-167 — Interrupted publication retried without classification

A coordinator reruns deliver after an interrupted push instead of classifying the published candidate; an internal rebase refusal obscures the supported resume route.

- **Sources:** [open-dough / DD-189](../../DearDough.md#odf-167--rerunning-managed-delivery-on-an-already-published-candidate-refused-with-an-internal-error-instead-of-classifying-it).
- **Identity assessment (2026-09-30):** The resume command recovered correctly. Related refused retry side effects under ODF-164 belong to a different execution; no duplicate push was observed. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-055#native-harness-observes-agent-behavior` / plan 163, first related implementation commit `daaf3c1e`

<a id="odf-168"></a>

## ODF-168 — Missing candidate argument yields an internal refusal

A missing validated-candidate argument produces a rebase-internal error rather than naming the missing input.

- **Sources:** [pygardon / DD-131 (plan 223 missing-candidate refusal only)](../../../pygardon/DearDough.md#odf-168--missing-candidate-argument-yields-an-internal-refusal).
- **Identity assessment (2026-09-30):** Pygardon DD-131 plan 223 only. The same execution also supports ODF-143; abbreviated SHA failures under ODF-142 have a different trigger. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/223-frontend-unit-test-feedback/PLAN.md` (published `c1bd49545`; first implementation commit `a4719534a`); Timestamp: unknown (2026-09-27, between `c1bd49545` at 21:15:07+08:00 and `101d3aafa` at 21:43:56+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.43 (installed at `bda8b7648` before admission `e9afa73e2`; unchanged during the execution). Evidence: coordinator-supplied execution summary (no transcript available to the review): "authorized target must be a branch ref" after passing `origin/main`; then "rebase left the pre-rebase SHA as the candidate" until `--validated-candidate` was supplied. Observed effect: two refused delivery calls before the first accepted one. Inference: the entry point could accept or name the expected form of the target, and report a missing `--validated-candidate` directly.

<a id="odf-169"></a>

## ODF-169 — Stale replay base includes sibling commits

A managed-delivery retry carries the old published base instead of its newly reconciled suffix base and replays sibling commits into conflicts.

- **Sources:** [pygardon / DD-132](../../../pygardon/DearDough.md#odf-169--a-stale-previously-published-base-after-a-trunk-merge-made-delivery-replay-a-siblings-commits).
- **Identity assessment (2026-09-30):** Separate from abbreviated SHAs (ODF-142) and manual Story Branch trunk rebases (ODF-134). Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/223-frontend-unit-test-feedback/PLAN.md` (published `c1bd49545`; first implementation commit `a4719534a`); Timestamp: unknown (2026-09-27, between `c1bd49545` at 21:15:07+08:00 and `101d3aafa` at 21:43:56+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.43 (installed at `bda8b7648` before admission `e9afa73e2`; unchanged during the execution). Evidence: coordinator-supplied execution summary: base `a0b61c95f` (previously published) passed instead of replay target `85cc6ecdd` (merge commit `Merge remote-tracking branch 'origin/main' into execute/staged-import-residue`); delivery replayed sibling Stooq commits (`16e89f10e`, `c58bd2581` lie in that range) and stopped in conflict; aborted and redelivered as `101d3aafa` on `85cc6ecdd`. Observed effect: one conflicted delivery, an abort and a redelivery; no wrong commit reached trunk. Inference: which revision the base argument means after trunk moves is easy to misread; delivery could detect commits in the replay range authored outside this execution and refuse before rebasing.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/288-approved-commands-without-denials/PLAN.md` (recoverable at `ed60f2046`; Take `8d1d6b4b8`; first implementation commit `7ba74df4d`); Timestamp: unknown (2026-09-29, before slice 2 was accepted at 21:00:02+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.47. Evidence: slice 2's first `deliver` returned `needs-validation` with `suffixBase` `f9ea7b09a`; the retry with `--validated-candidate` still passed `--previously-published-base 7ba74df4d`, so delivery replayed SEED-073/SEED-067 planning commits and stopped in conflict on `91aea5fcf`; the coordinator aborted its own worktree's rebase and redelivered with `f9ea7b09a`, accepted as `e0ab8b392`. Observed effect: one conflicted delivery and redelivery; nothing wrong reached trunk. Inference: the case here is a rebase reconciliation, not a merge; the `needs-validation` receipt could say which base the retry must use.

<a id="odf-170"></a>

## ODF-170 — Merge driver rooted in a retired worktree

Repository-wide Git configuration names an absolute merge-driver script in one worktree; retiring it breaks backlog merges in all checkouts.

- **Sources:** [pygardon / DD-133](../../../pygardon/DearDough.md#odf-170--the-shared-product-backlog-merge-driver-points-at-one-worktrees-copy-of-its-script).
- **Identity assessment (2026-09-30):** One supplied 0.3.43 execution; no new merge or configuration change is authorized in this run. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/223-frontend-unit-test-feedback/PLAN.md` (published `c1bd49545`; first implementation commit `a4719534a`); Timestamp: unknown (2026-09-27, between `c1bd49545` at 21:15:07+08:00 and `101d3aafa` at 21:43:56+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.43 (installed at `bda8b7648` before admission `e9afa73e2`; unchanged during the execution). Evidence: coordinator-supplied execution summary: the plan-publication rebase hit a `.planning/PRODUCT-BACKLOG.md` conflict whose driver pointed at `.claude/worktrees/owner-run-production-actions/.../product-backlog-git-driver.mjs`, a deleted worktree. At review time `git config --get-regexp merge\.` shows the driver now pointing at `/Users/terryyin/git/pygardon-worktrees/frontend-unit-test-feedback/.claude/skills/dough-product-backlog/scripts/product-backlog-git-driver.mjs`, so it will break again when this worktree is retired. Observed effect: one backlog conflict resolved outside the driver during plan publication (cost not recorded). Inference: the driver command should resolve the script relative to the checkout running the merge (for example through `git rev-parse --show-toplevel`) rather than an absolute worktree path.

<a id="odf-171"></a>

## ODF-171 — Recorder argument basis is unclear

Recorder path and expected-digest names lead callers to supply root-relative paths or raw/placeholder digests instead of canonical-home paths and read-state basis values.

- **Sources:** [pygardon / DD-134](../../../pygardon/DearDough.md#odf-171--record-state-path-and-digest-arguments-are-not-what-their-names-suggest).
- **Identity assessment (2026-09-30):** Two executions; recorder refusals prevented stale writes. Identity punctuation is retained as related evidence. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/223-frontend-unit-test-feedback/PLAN.md` (published `c1bd49545`; first implementation commit `a4719534a`); Timestamp: unknown (2026-09-27, between `c1bd49545` at 21:15:07+08:00 and `101d3aafa` at 21:43:56+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.43 (installed at `bda8b7648` before admission `e9afa73e2`; unchanged during the execution). Evidence: coordinator-supplied execution summary naming both corrections; `record-preparation.md` states "relative to the canonical home" and "sha256-from-read-state". This review also hit a third form: a story's `**Identity:**` line ending with a period made `record-state` refuse with `names identity "…guidance."`. Observed effect: refused recorder calls (count not recorded) and one here. Inference: usage text or refusals could show the expected relative path and say that digests come from `read-state`; the identity parser could ignore trailing sentence punctuation or say so.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/274-telegram-ibkr-qr-login/PLAN.md` (recoverable at `d3fb86b3d`; Take `e87abefdb`; first implementation commit `b5658f345`); Timestamp: unknown (2026-09-29, before `085ec039f`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: after an owner scope change, the coordinator first passed placeholder digests, then `digestSource` of the whole seed file, as `--expect-document`; both were refused ("Expected assessment basis no longer matches") until `read-state` supplied the story-scoped basis. Observed effect: three refused recorder calls and a source read of the basis module. Inference: the refusal could print the current basis or name `read-state`.

<a id="odf-172"></a>

## ODF-172 — Unpaired measurements on a changing host

Unpaired or distant baseline timings cannot isolate a candidate's change from shared-host load drift, causing extra runs and ambiguous comparisons.

- **Sources:** [pygardon / DD-135](../../../pygardon/DearDough.md#odf-172--timing-comparisons-ran-on-a-host-loaded-by-sibling-sessions-test-passes).
- **Identity assessment (2026-09-30):** Related to retired ODF-117 (idle-host prerequisite), but these reports concern comparability of actual runs; the third report has no established sibling-load source. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/261-e2e-test-feedback/PLAN.md` (recoverable at `a2e2d2893`; first implementation commit `44047ca42`); Timestamp: unknown (2026-09-27, 21:12–22:20 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.43. Evidence: `uptime` 66.73 at 21:12 with `python-unit-test-feedback` and `pygardon-ci-pytest` buildkit containers running; baseline-code runs 46–91s; plan decision changed from "load below ~10" to interleaved A/B (plan 261 Current decisions). Effect: about 16 extra full-suite runs; the final re-profile shows only a modest, noise-bounded gain. Inference: parallel test-optimization passes on one host compete for the resource they measure; sequencing them or reserving the host would give decisive measurements.
- **Retained execution:** pygardon; Execution: SEED-060#story-python-unit-test-feedback, first implementation commit `8be9d2faa`
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/272-search-throughput-experiments/PLAN.md` (recoverable at `ed91f9a0e`; Take `3867588b4`; first implementation commit `0022f064e`)

<a id="odf-173"></a>

## ODF-173 — Dependencies not refreshed after reconciliation

A mid-execution trunk merge changes lockfiles, but the execution runs expensive proof without re-preparing the workspace.

- **Sources:** [pygardon / DD-154](../../../pygardon/DearDough.md#odf-173--the-execution-workspace-was-not-re-prepared-after-a-trunk-merge-changed-locked-dependencies).
- **Identity assessment (2026-09-30):** Fresh-checkout preparation under retired ODF-088 addresses a different lifecycle point. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: SEED-060#story-python-unit-test-feedback, first implementation commit `8be9d2faa`

<a id="odf-174"></a>

## ODF-174 — Owner-dependent acceptance scope not re-evaluated

Refinement retains costly acceptance scope and asks the owner internal setup questions without establishing that the acceptance still has value.

- **Sources:** [pygardon / DD-159](../../../pygardon/DearDough.md#odf-174--refinement-gated-readiness-on-owner-inputs-for-acceptance-scope-the-owner-no-longer-wanted).
- **Identity assessment (2026-09-30):** The owner later dropped that scope. No general permission to discard accepted requirements is inferred. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/101-remote-ci-watcher-cutover/PLAN.md` (formerly `101-remote-ci-cross-network-acceptance`; recoverable at `be34577e1`; Take `6e6d3037d`; first implementation commit `59452b8b7`); Timestamp: unknown (2026-09-28); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.45. Evidence: refinement `fe967a303` kept slices 2–4 (System Settings remote read, observer restart, network change) with not-ready reason "Owner must select the local observer instance/profile, … and supply its ready restart command"; `execution-start.mjs start` returned `source-refused` (`published preparation is not-ready`); the coordinator's needs-input repeated the same terms; the owner replied that they did not understand what the observer, consumers, restart and network questions were for, that the machines are already on different networks via Tailscale, and that seeing remote CI inside local Pygardon is not needed because the producer's own frontend shows it. Observed effect: one owner round trip; scope narrowed to the single watcher slice (`d1e07a3f7`), which then took about five minutes. Inference: asking the owner, in plain terms, whether each owner-dependent acceptance still earned its cost would have surfaced the drop at refinement.

<a id="odf-175"></a>

## ODF-175 — Negative searches match their own planning records

An unscoped absence proof searches the plan and finding record that necessarily quote the removed name, forcing reinterpretation during delivery.

- **Sources:** [pygardon / DD-160](../../../pygardon/DearDough.md#odf-175--a-plans-negative-git-grep-proof-matched-the-plans-own-text).
- **Identity assessment (2026-09-30):** Two executions; distinct from missing conceptual vocabulary (ODF-157). Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/269-server-appearance-test-support-cleanup/PLAN.md` (Take `8a75a6433`; first implementation commit `e08fd2985`); Timestamp: 2026-09-28T14:06:16+08:00 (slice 1 hand-back); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.45. Evidence: plan 269 (written in `5eea0c486` by plan 268's retrospective) slice 1 proof "`git grep createVideoClippingGeneratedMock` finds nothing" unscoped; slice 3's analogous proof scoped `-- ':!.planning'` but still matched nothing only because its name was absent from `DearDough.md`; the slice 1 agent reported the match in PLAN.md and `DearDough.md` line 264 and ended with "For you to decide: the plan's literal … wording"; the coordinator accepted `-- ':!.planning' ':!DearDough.md'` and recorded it in the accepted proof. Observed effect: one decision hand-off and a reworded accepted proof; no rework. Inference: negative-search proofs written in planning records should exclude planning and process-log paths (or search only code paths) at planning time; the planner's own text is always a match.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/284-search-candidate-projection-correction/PLAN.md` (recoverable at `335d220d8`; Take `e456b3223`; first implementation commit `236a090a9`); Timestamp: 2026-09-29T17:33:20+08:00 (slice 2 commit with the accepted proof); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: plan 284 (written by plan 280's retrospective) promise table "no remaining `compose_tfdc_live_strategy` reference", unscoped; accepted proof "`git grep compose_tfdc_live_strategy` hits only planning history and `DearDough.md`". Observed effect: no hand-off this time; the coordinator accepted the proof by interpreting the hits. Inference: the retrospective-written plan still carried an unscoped negative search after DD-160 was logged, so the lesson has not reached plan writing.

<a id="odf-176"></a>

## ODF-176 — Closure provenance invalidates ready corrections

Wrap-up rewrites a queued correction's own provenance, changing its plan or story basis without reconciling its readiness record.

- **Sources:** [pygardon / DD-164](../../../pygardon/DearDough.md#odf-176--a-siblings-wrap-up-rewrote-a-queued-correction-plans-provenance-and-made-it-unclaimable); [open-dough / DD-120 (isolated later occurrence, previously under ODF-116)](../../DearDough.md#odf-176--closure-provenance-invalidates-ready-corrections); [pygardon / DD-117 (isolated later occurrence, previously under ODF-116)](../../../pygardon/DearDough.md#odf-176--a-siblings-wrap-up-rewrote-a-queued-correction-plans-provenance-and-made-it-unclaimable).
- **Identity assessment (2026-09-30):** The 62b7b7a / 0.3.43 sibling-section response intentionally still hashes the selected story and plan. This is a distinct mechanism, not failure of the sibling-section fix. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/270-production-search-skill-accuracy/PLAN.md` (recoverable at `7370689ca`; Take `2db8647b0`; first implementation commit `33012deab`); Timestamp: unknown (2026-09-28, before the reassessment `994406fb4` at 2026-09-28T15:50:13+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: `execution-start.mjs start` returned `source-refused` (`published preparation is needs-reassessment`) with the document digest unchanged and the plan digest changed by wrap-up `7015e71f6` (8 lines: plan 267 and research-note links replaced by `5287e8856:` paths). Observed effect: the coordinator reviewed the diff, freshly observed the plan's premises, recorded ready and pushed `994406fb4` to main before retrying the Take (about six tool calls). The review also caught that the plan's proof cited DD-160 where the delegation evidence is DD-161 and corrected it. Inference: a wrap-up that edits another item's plan could re-record that item's readiness in the same change when the edit is provenance-only; the forced review had a small side benefit here.
- **Retained execution:** pygardon; Execution: `4766b6e65:.planning/slice-plans/282-current-buy-signals-failed-load/PLAN.md` (first implementation commit `423ae0de1`); Timestamp: 2026-09-29T16:11:45+08:00 (reassessment `224372ec4`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: `execution-start.mjs start` returned `source-refused` (`published preparation is needs-reassessment`); this time the plan digest changed, not the seed's: the wrap-up `1b46be154` of the originating load-start correction rewrote this plan's provenance path to a revision-qualified reference after the retired plan was deleted. Effect: the coordinator diffed the plan, re-observed its two decisive premises, recorded ready and pushed `224372ec4` to main before retrying the Take (about five tool calls). Inference: same class as the seed-sibling rows (another story's closure changing this story's readiness basis with no substantive change), reached through the plan file; a retrospective correction plan citing its origin's plan path will predictably need this after every origin wrap-up.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/280-jobs-qr-login-correction/PLAN.md` (recoverable at `1f41a6f9d`; Take `4188ab65e`; first implementation commit `ea97be370`); Timestamp: 2026-09-29T16:32:02+08:00 (reassessment `3780c02c9`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: `execution-start.mjs start` returned `source-refused` (`published preparation is needs-reassessment`); both digests had changed through the origin story's wrap-up `9e71caa16` (SEED-014#story-jobs-qr-login), which rewrote this plan's provenance to the revision-qualified `278-jobs-qr-login/PLAN.md` at `29c03ae00` and removed the sibling section from SEED-014; this story's section and slices were unchanged. Effect: the coordinator re-observed the plan's three decisive premises, recorded ready and pushed `3780c02c9` to main before retrying the Take (about five tool calls). Inference: second retrospective correction refused this way on 2026-09-29 (after plan 282, reassessment `224372ec4`); the origin wrap-up that makes the provenance-only edit could re-record the correction's readiness in the same commit.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/286-live-strategy-projection-test-home/PLAN.md` (recoverable at `776a022fb`; Take `2ad84c8a7`; first implementation commit `9717881bc`); Timestamp: 2026-09-29T20:08:24+08:00 (reassessment `57edfc393`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.47. Evidence: `execution-start.mjs start` returned `source-refused` (`published preparation is needs-reassessment`); both digests changed with no substantive change to this story or plan: the originating correction's wrap-up (`0bf7e0705` and later SEED-067 closures) rewrote the seed's shared context and removed sibling sections, and the plan's provenance became revision-qualified (`recoverable at 335d220d8`). Effect: the coordinator diffed both, re-observed the three decisive premises (including a 56-test baseline run), recorded ready and pushed `57edfc393` to main before retrying the Take (about seven tool calls). Inference: the same retrospective-correction pattern as the plan-282 row; a correction queued ready by a retrospective predictably needs one reassessment after its origin's wrap-up; unchanged in 0.3.47.
- **Retained execution:** open-dough; Execution: `SEED-052#preparing-card-refinement-journey` / plan 154, before its claim `f9fe3fdc`

<a id="odf-177"></a>

## ODF-177 — Shared-context edits invalidate sibling readiness

A sibling refinement or closure changes seed-level shared context, so another story's ready record becomes stale even when its own section and plan are unchanged.

- **Sources:** [open-dough / DD-120 (isolated later occurrence, previously under ODF-116)](../../DearDough.md#odf-177--shared-context-edits-invalidate-sibling-readiness); [pygardon / DD-117 (isolated later occurrence, previously under ODF-116)](../../../pygardon/DearDough.md#odf-177--shared-context-edits-invalidate-sibling-readiness).
- **Identity assessment (2026-09-30):** 62b7b7a / 0.3.43 explicitly includes shared context in the basis. The reports do not establish that every shared edit is irrelevant; meaningful dependency checks must remain. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-052#recent-sessions-residue` / plan 151, before its claim `34ad359b`
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/276-saved-evaluation-context/PLAN.md` (first implementation commit `45e9b8ea7`); Timestamp: 2026-09-29T12:45:54+08:00 (reassessment `c1cd21ae4`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: `execution-start.mjs start` returned `source-refused` (`published preparation is needs-reassessment`) with the plan digest unchanged; the SEED-067 document digest changed through the stop-limit closure `772ef7c44` (shared context and the removed sibling section) and the new sibling correction story, with this story's section unchanged. Effect: the coordinator diffed the seed and the sibling's code footprint, noted the reconciliation in the plan, recorded ready and pushed `c1cd21ae4` to main, then retried the Take (about eight tool calls). Inference: the plan itself required reconciling that sibling's changes before execution, so part of the review was due anyway; unchanged in 0.3.46.

<a id="odf-178"></a>

## ODF-178 — Layer exclusions miss existing E2E consumers

A plan excludes E2E proof without checking existing consumers of changed visible text and shared directories, leaving stale page objects and fixtures.

- **Sources:** [pygardon / DD-165](../../../pygardon/DearDough.md#odf-178--a-plan-ruled-out-e2e-proof-although-its-ui-and-file-changes-reached-e2e-page-objects-and-fixtures).
- **Identity assessment (2026-09-30):** Related to ODF-107/150, but the blanket layer exclusion is distinct from component-selected proof; retain separately rather than assert a common cause. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/268-production-settings-backup/PLAN.md` (Take `1c54d5b7e`; first implementation commit `b5b4e1337`); Timestamp: unknown (2026-09-28, CI run `77da60fa` on `5897aab9f`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.45. Evidence: 3 E2E scenarios failed (`backup_run.feature:4,20` saw `test.settings-*.json` beside the database backup; `system_settings.feature:4` waited for exact `Settings saved.`); repair `ac639fca0`; later slices' delegations then required checking E2E page objects, and the retrospective still found `expectGatewayRun` waiting for no feedback in the host-Docker gateway feature (excluded from CI). Observed effect: one CI repair cycle and a residual unverified E2E defect. Inference: planning's E2E exclusion should be checked against E2E consumers of each changed visible text or shared directory.

<a id="odf-179"></a>

## ODF-179 — Profile sort order mistaken for caller attribution

A cumulative-time listing's adjacency is mistaken for caller attribution and briefly directs a later optimization decision at the wrong function.

- **Sources:** [pygardon / DD-168](../../../pygardon/DearDough.md#odf-179--a-cprofile-cumulative-listing-was-read-as-caller-attribution-and-committed-a-wrong-cost-split).
- **Identity assessment (2026-09-30):** One execution; the next prototype agent corrected it before a code effect. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/272-search-throughput-experiments/PLAN.md` (recoverable at `ed91f9a0e`; Take `3867588b4`; first implementation commit `0022f064e`); Timestamp: 2026-09-28T18:06:54+08:00 (commit `1937a04a6`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.45. Evidence: `1937a04a6` plan Learnings "relative strength 13.9 s (`np.median` via `partition` 9.6 s …)"; the slice 7 agent report "I found no `np.median` in `entry/relative_strength.py` … the median … is the volume-gate baseline in `exit/series.py`"; corrected in `47c213461`. Observed effect: a wrong attribution was published for one increment, and it pointed a later cache decision at the wrong function; no code was affected. Inference: `pstats` `print_callers` (or reading the call site) establishes attribution; sort order does not.

<a id="odf-180"></a>

## ODF-180 — Measurement-slice delivery ownership is unclear

A measurement plan assigns record/prototype work to the coordinator while execution guidance still requires fresh implementation and refactor passes, producing case-by-case deviations.

- **Sources:** [pygardon / DD-169](../../../pygardon/DearDough.md#odf-180--the-coordinator-ran-record-only-and-measurement-slices-itself-without-a-fresh-agent-or-refactor-pass).
- **Identity assessment (2026-09-30):** Related to ODF-090/091, but the plan itself assigns this actor. Saved round trips are not proof the omitted review had no value. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/272-search-throughput-experiments/PLAN.md` (recoverable at `ed91f9a0e`; Take `3867588b4`; first implementation commit `0022f064e`); Timestamp: unknown (2026-09-28, 18:06–18:41 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.45. Evidence: commits `1937a04a6`, `62564b2b7`, `22dff5a32`, `47c213461` and `ca242157f` were made without an implementation or refactor agent; the plan assigns every measurement to the coordinator. Observed effect: about eight fewer agent round trips; no defect traced to the skipped steps, but DD-168's wrong attribution went out in one of these unreviewed record commits. Inference: open question — `dough-execute-plan` delegation and refactor steps assume code slices; the guidance could state how coordinator-owned measurement and record-only slices are handled, rather than leave it to case-by-case deviation.

<a id="odf-181"></a>

## ODF-181 — Baseline proof reads concurrent edits

An agent starts pre-change E2E proof in the background and edits files it has not loaded yet, invalidating the baseline observation.

- **Sources:** [pygardon / DD-170](../../../pygardon/DearDough.md#odf-181--a-pre-change-proof-ran-while-the-agent-edited-a-file-it-loads).
- **Identity assessment (2026-09-30):** Unlike ODF-129, the same agent mutates its own baseline run; unlike ODF-155, no in-place restoration succeeded. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/273-settings-backup-correction/PLAN.md` (recoverable at `19383da2d`; Take `cd3308578`; first implementation commit `487dda5ad`); Timestamp: 2026-09-28T18:47:48+08:00 (baseline run start; edits saved 18:48:24 and 18:48:39); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: slice 1 hand-back ("my edits landed while it was still starting up"; restore via `/tmp` and `git show HEAD:` denied); the coordinator then built a disposable checkout at `cd3308578`, re-applied the PyPI workaround, prepared it and ran the Restart scenario (1m18s, failed at "I set gateway Run to enabled" on the 60 s hang bound). Observed effect: one invalid E2E run with a leftover gateway fixture, and an extra checkout setup plus run before acceptance (roughly ten minutes). Inference: a delegated red-first proof should reach its terminal result before any edit, or be taken from a separate checkout at the published base; later slice prompts in this execution said so and none repeated it.

<a id="odf-182"></a>

## ODF-182 — Fixture premise omits domain transformations

A real-calculation fixture is inspected without tracing the domain repair that transforms its genomes, leaving accepted proof gaps and a domain bypass seam.

- **Sources:** [pygardon / DD-173](../../../pygardon/DearDough.md#odf-182--a-plans-fixture-premise-overlooked-searchs-gene-domain-repair-of-stored-genomes).
- **Identity assessment (2026-09-30):** Related to ODF-074/110, but the supplied report identifies the overlooked domain transformation and a resulting proof substitution; retain its identity separately. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/275-stop-limit-required-evidence/PLAN.md` (recoverable at `b79aa15f5`; Take `f621f06c9`; first implementation commit `1af611dca`); Timestamp: unknown (2026-09-29, slices 4–5 committed 12:14–12:25 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: slice 4 hand-back (baseline variant left without real-calculation proof); slice 5 hand-back (first attempt ended *completed* with a zero-trade holdout report; test then replaced `pygardon.search_run.storage.repair_genome` with identity, commit `828c9f92e`). Observed effect: one accepted proof gap and one test seam on a domain collaborator instead of input/transport, both recorded in the plan. Inference: premise checks for real-calculation proof over a small fixture should include every transformation between the fixture's inputs and the evaluated genome; a longer domain-valid fixture was the unplanned alternative.

- **Follow-up:** queued, not resolved: [Observe a planning premise through the operation that consumes it](../../.planning/seeds/SEED-059-observe-planning-premise-consumers.md#observe-premise-consumers) — SEED-059#observe-premise-consumers. Selected under the authorized 2026-09-30 runbook.

<a id="odf-183"></a>

## ODF-183 — Delegated cleanup bypasses path-checkout prohibition

An implementer drops its own debugging with a path checkout forbidden by the handoff, relying on that path having no other edits.

- **Sources:** [pygardon / DD-174](../../../pygardon/DearDough.md#odf-183--a-slice-agent-reverted-its-own-edit-with-a-path-checkout-its-handoff-forbade).
- **Identity assessment (2026-09-30):** 0.3.46 after 86e5069 / 0.3.42 explicitly barred path checkout. Different trigger from ODF-155 red-baseline restoration; no data loss was reported. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/275-stop-limit-required-evidence/PLAN.md` (recoverable at `b79aa15f5`; Take `f621f06c9`; first implementation commit `1af611dca`); Timestamp: unknown (2026-09-29, slice 2 before 12:01 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: slice 2 hand-back self-reports `git checkout -- e2e_test/step_definitions/strategy_verify_fixture_steps.ts` to drop temporary debug logging, despite the delegation's no-path-checkout rule. Observed effect: no loss (the path had no other changes). Inference: one-off; removing one's own debug edits by editing them out keeps unowned work safe without relying on the path being clean.

<a id="odf-184"></a>

## ODF-184 — Unbounded managed push stalls delivery

A stalled SSH push leaves managed delivery and the coordinator waiting about fifty minutes with no command bound.

- **Sources:** [pygardon / DD-175](../../../pygardon/DearDough.md#odf-184--managed-deliverys-git-push-stalled-for-about-50-minutes-with-no-bound).
- **Identity assessment (2026-09-30):** One 0.3.46 network episode; observer transport loss is related evidence, not an established common cause with ODF-121. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/277-telegram-qr-login-correction/PLAN.md` (recoverable at `07718623b`; Take `e16195cae`; first implementation commit `a09d0209e`); Timestamp: unknown (after slice 3 commit `862754596` at 2026-09-29T13:02:43+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: process tree showed `git push origin 862754596…:refs/heads/story/telegram-qr-login-correction` and its `ssh git@github.com git-receive-pack` alive 49:07; remote tip stayed `d39c6cb00`; the first observer `/tmp/dough-ci-501/watch-xtvfiW` also reported `CI_MONITOR_UNAVAILABLE` (adapter fetch `TimeoutError`) in the same window. After killing that ssh process, one redelivery was accepted at once. Observed effect: about 50 minutes idle, no CI coverage for `a09d0209e`/`d39c6cb00` from the first observer. Inference: a network stall; a bounded push (for example SSH `ServerAliveInterval`) or a coordinator-side bound would turn the stall into a quick redelivery.

<a id="odf-185"></a>

## ODF-185 — Reported preservation gap filed as a learning

An implementer reports a dropped parameter that contradicts the story's preservation goal; acceptance records the gap as a learning and finishes the story.

- **Sources:** [pygardon / DD-177](../../../pygardon/DearDough.md#odf-185--a-slice-hand-back-reported-a-dropped-searched-gene-and-the-coordinator-filed-it-as-a-learning).
- **Identity assessment (2026-09-30):** Related to ODF-139 false scope judgment, but here no explicit out-of-scope judgment is evidenced. Keep identities separate while selecting one response problem. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/280-search-candidate-order-intent/PLAN.md` (recoverable at `30c05783e`; Take `60cc8e2ba`; first implementation commit `b5b450dbb`); Timestamp: 2026-09-29T16:41:08+08:00 (slice 1 commit, which included the learning); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: slice 1 hand-back "Chosen configuration": "The `benchmark_weight` gene (0.3) is not carried by `compose_tfdc_live_strategy`"; plan Learnings in `b5b450dbb`; `pygardon/search_run/eval_on_freeze.py:107` uses `project_genes_to_live_strategy`; correction plan `284-search-candidate-projection-correction`. Observed effect: the connected proof passed without detecting a lost searched parameter; the fix became one correction story instead of a slice-time stop. Inference: when a hand-back reports that a stage drops something the story promises to preserve, proof acceptance should test that report against the goal, not record it as a learning.

- **Follow-up:** queued, not resolved: [Check reported gaps against the story before accepting a slice](../../.planning/seeds/SEED-058-accept-reported-story-gaps.md#accept-reported-story-gaps) — SEED-058#accept-reported-story-gaps. Selected under the authorized 2026-09-30 runbook.

<a id="odf-186"></a>

## ODF-186 — Coordinator stops between hand-back and delivery

The coordinator inspects an implementation return and ends the turn before acceptance or launching the next required delivery step.

- **Sources:** [pygardon / DD-178](../../../pygardon/DearDough.md#odf-186--the-coordinator-ended-a-turn-after-inspecting-a-hand-back-before-launching-the-next-delivery-step).
- **Identity assessment (2026-09-30):** One supported execution; the claimed earlier repetitions have no execution locators and are not counted. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/276-strategy-verify-e2e-catalog-plane/PLAN.md` (recoverable at `317b00127`; Take `f459478e1`; first implementation commit `ce404aa3b`); Timestamp: unknown (2026-09-29); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: coordinator conversation — the implementation hand-back was followed by one `git diff` tool call and no further action until the owner's "is it still running?"; the refactor agent was launched only in the reply to that question. Observed effect: delivery sat idle until the owner checked in. Inference: this repeats a failure mode the owner has corrected before (turns ending at a milestone instead of with the next step in flight); inspecting a return and launching the next delivery step belong in the same turn.

<a id="odf-187"></a>

## ODF-187 — Planned observations cannot detect regressions

Planning prescribes an absence assertion forbidden by removal policy and a scrolling case that passes regardless of the changed behavior.

- **Sources:** [doughnut / DD-142](../../../doughnut/DearDough.md#odf-187--the-plan-prescribed-observations-that-execution-had-to-drop-an-absence-check-for-removed-ui-and-a-case-that-could-never-fail).
- **Identity assessment (2026-09-30):** Related to ODF-147, but the implementer did run red and the ineffective observation originated in the plan. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-043#story-1 / `62e33981f0:.planning/slice-plans/005-sidebar-full-row-reveal/PLAN.md` / 56505b78dd; Timestamp: 2026-09-28T11:16:07+08:00 (slice 1 commit) and between 2026-09-28T11:32:13+08:00 and 2026-09-28T11:37:08+08:00 (slice 3); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.44.

<a id="odf-188"></a>

## ODF-188 — Delegation invents a proof command

A coordinator supplies a nonexistent typecheck script instead of the repository's documented command, requiring the implementer to discover a substitute.

- **Sources:** [doughnut / DD-143](../../../doughnut/DearDough.md#odf-188--an-implementer-prompt-required-a-nonexistent-pnpm-testtypecheck-script).
- **Identity assessment (2026-09-30):** Different actor/boundary from ODF-074 planned premises; no false pass was accepted. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-053#story-1 / `12c0f629ac:.planning/slice-plans/007-file-page-references/PLAN.md` / c86eb7eba0; Timestamp: 2026-09-28T12:24:00+08:00 (Slice 1 implementer start; delivery at 12:32:48+08:00); Tool: Cursor; Model: gemini-3.8-flash; Open Dough release: 0.3.45.

<a id="odf-189"></a>

## ODF-189 — Small additions force unrelated size extractions

A small addition crosses the numeric file-size ceiling and triggers relocation and re-proof of a substantial previously untouched responsibility.

- **Sources:** [doughnut / DD-144](../../../doughnut/DearDough.md#odf-189--a-four-line-repository-tip-over-forced-extracting-an-unrelated-assimilation-query-block).
- **Identity assessment (2026-09-30):** Two executions, 0.3.45 and 0.3.47; seams were meaningful. This is cost/applicability evidence, not proof those extractions were useless. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-053#story-1 / `12c0f629ac:.planning/slice-plans/007-file-page-references/PLAN.md` / bc870053e8; Timestamp: 2026-09-28T12:37:00+08:00 through 2026-09-28T12:40:26+08:00 (Slice 2 refactor through delivery); Tool: Cursor; Model: gemini-3.8-flash; Open Dough release: 0.3.45.
- **Retained execution:** doughnut; Execution: SEED-059#story-6 / slice-plans/056-change-or-clear-reading-mark / 7c9935b2c2; Timestamp: 2026-09-29T17:53+08:00 through 2026-09-29T18:12+08:00 (slice 2 implementation through refactor and delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.47.

<a id="odf-190"></a>

## ODF-190 — Planned observation route is unavailable

Planning names an observation route or log source that is not available to the executing project, causing owner probing or loss of the intended proof.

- **Sources:** [doughnut / DD-145](../../../doughnut/DearDough.md#odf-190--the-plan-prescribed-production-observations-whose-access-route-or-log-source-did-not-exist-and-whose-results-could-not-change-the-approach).
- **Identity assessment (2026-09-30):** Two executions: production access and local wheel input. Related to ODF-114; the common issue is the observation route, not an invalid data fixture. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-051#story-1 / `f35fa810f1:.planning/slice-plans/009-retire-note-embeddings/PLAN.md` / 5003fbecc8; Timestamp: 2026-09-28T05:36:39Z–06:03:39Z (slice 1/3) and 2026-09-28T07:17:43Z–07:18:10Z (slice 10); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.45.
- **Retained execution:** doughnut; Execution: SEED-059#story-5 / slice-plans/053-pdf-smooth-scroll-after-choosing-block / 5989892325; Timestamp: 2026-09-29T21:45+08:00 through 22:10+08:00 (slice 1 attempts); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.47.

<a id="odf-191"></a>

## ODF-191 — Transient classifier outage ends execution

A retryable no-verdict host outage causes three turn-ending stops until the owner resumes execution.

- **Sources:** [doughnut / DD-146](../../../doughnut/DearDough.md#odf-191--transient-permission-check-outages-ended-the-coordinators-turn-three-times-so-the-owner-had-to-type-continue).
- **Identity assessment (2026-09-30):** One host-specific execution; these are unavailable permission verdicts, not denials. No retry or alternate route is performed here. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-051#story-1 / `f35fa810f1:.planning/slice-plans/009-retire-note-embeddings/PLAN.md` / 5003fbecc8; Timestamp: 2026-09-28T06:32:45Z, 06:39:37Z, 06:42:33Z (stops); owner resumes 06:37:14Z, 06:42:06Z, 06:51:34Z; Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.45.

<a id="odf-192"></a>

## ODF-192 — Cheap exploratory coverage gaps left unexplored

Exploration stops below its budget while cheap same-setup gaps remain, and the coordinator supplies an unsupported explanation that more time cannot help.

- **Sources:** [doughnut / DD-156](../../../doughnut/DearDough.md#odf-192--a-two-hour-uat-stopped-at-56-minutes-while-cheap-coverage-gaps-stayed-open).
- **Identity assessment (2026-09-30):** The two-hour budget is a limit, not a minimum duration. The finding is the unjustified gap explanation, not failure to consume all allotted time. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-054#story-1 / `4f2f230505:.planning/slice-plans/011-book-reading-uat/PLAN.md` / 681768a71b; Timestamp: 2026-09-29T08:36+08:00 (second exploration part ends); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46.

<a id="odf-193"></a>

## ODF-193 — Repeated refactors reshape an unfinished report

Per-slice refactor passes repeatedly restructure a report whose final shape exists only after the last synthesis, creating partially repeated text work.

- **Sources:** [doughnut / DD-157](../../../doughnut/DearDough.md#odf-193--per-slice-refactor-passes-on-a-documentation-only-uat-report-kept-restructuring-the-previous-slices-text).
- **Identity assessment (2026-09-30):** Useful real merges were observed. Related to ODF-141, but this is repeated restructuring rather than no-edit reviews. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-054#story-1 / `4f2f230505:.planning/slice-plans/011-book-reading-uat/PLAN.md` / 681768a71b; Timestamp: 2026-09-29T08:45+08:00 (second refactor pass); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46.

<a id="odf-194"></a>

## ODF-194 — Startup publisher flag is unnamed

Startup guidance names a publisher ID without its flag, so the caller tries --publisher and learns --publisher-id by refusal.

- **Sources:** [doughnut / DD-158](../../../doughnut/DearDough.md#odf-194--execution-startmjs-guidance-names-a-publisher-id-without-its-flag-and---publisher-is-refused).
- **Identity assessment (2026-09-30):** One small lookup cost; distinct from delivery branch reference forms (ODF-143). Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-054#story-1 / `4f2f230505:.planning/slice-plans/011-book-reading-uat/PLAN.md` / 681768a71b; Timestamp: 2026-09-29T07:22+08:00; Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46.

<a id="odf-195"></a>

## ODF-195 — Pre-existing size overrun handled inconsistently

Two refactor passes within one story treat barely touched, already oversized files differently, forcing an unrelated extraction in one and retaining another.

- **Sources:** [doughnut / DD-160](../../../doughnut/DearDough.md#odf-195--the-file-size-check-split-an-untouched-block-in-one-slice-of-an-execution-and-was-waived-in-a-later-slice).
- **Identity assessment (2026-09-30):** Related to ODF-152 and ODF-189, but the pre-existing overrun and inconsistent application are distinct from an addition tipping over the limit. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-059#story-2 / slice-plans/050-read-a-book-on-a-phone / d4a47402af; Timestamp: 2026-09-29T12:00+08:00 through 2026-09-29T12:40+08:00 (slice 1 and slice 3 refactor passes); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46.

<a id="odf-196"></a>

## ODF-196 — Fixture reshaped to avoid the real example

An implementer moves a fixture into an already-supported shape, turns the test green and reports no product change despite the story's real example still failing.

- **Sources:** [doughnut / DD-164](../../../doughnut/DearDough.md#odf-196--an-implementer-reshaped-a-test-fixture-until-the-new-scenario-passed-and-reported-that-no-product-change-was-needed).
- **Identity assessment (2026-09-30):** One execution; the coordinator checked the real EPUB and required a product correction before accepting. Related to ODF-149 ordinary-content gaps, but this is changing a failing fixture to avoid the unsupported path. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-059#story-1 / `e733844d01:.planning/slice-plans/049-epub-land-and-track-chosen-place/PLAN.md` / 485ed2eb49; Timestamp: unknown (2026-09-29, slice 4); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46.

- **Follow-up:** queued, not resolved: [Check reported gaps against the story before accepting a slice](../../.planning/seeds/SEED-058-accept-reported-story-gaps.md#accept-reported-story-gaps) — SEED-058#accept-reported-story-gaps. Selected under the authorized 2026-09-30 runbook.

<a id="odf-197"></a>

## ODF-197 — No-op plan edits lose execution learnings

Anchor replacements silently match nothing and chained later edits therefore fail to persist five slices' learnings in the resume record.

- **Sources:** [doughnut / DD-166](../../../doughnut/DearDough.md#odf-197--plan-edits-by-text-replacement-silently-did-nothing-and-five-slices-learnings-never-reached-the-plan).
- **Identity assessment (2026-09-30):** One execution; retrospective recovery restored the notes. Different from ODF-156, where the learning existed but was omitted from delegation. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-059#story-1 / `e733844d01:.planning/slice-plans/049-epub-land-and-track-chosen-place/PLAN.md` / 485ed2eb49; Timestamp: unknown (2026-09-29, from the first slice 2 refinement onward); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46.

<a id="odf-198"></a>

## ODF-198 — Bug remedy planned before reproducing the symptom

A slice assumes one code swap fixes a reported defect, but its new spec already passes and the original symptom remains unexplained.

- **Sources:** [doughnut / DD-173](../../../doughnut/DearDough.md#odf-198--a-slices-premise-that-one-code-swap-fixes-a-uat-defect-was-not-tested-first-and-its-spec-passed-before-the-change).
- **Identity assessment (2026-09-30):** One unknown-release execution; related to planning premises and ODF-147, but no failed fix or same-cause post-response recurrence can be established. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** doughnut; Execution: SEED-059#story-16 / `dfec19ca03:.planning/slice-plans/058-current-block-same-in-pdf-and-epub/PLAN.md` / f9a6f4a416; Timestamp: 2026-09-30 (slice 5); Tool: Claude Code; Model: claude-sonnet-5-5; Open Dough release: unknown.

- **Follow-up:** queued, not resolved: [Observe a planning premise through the operation that consumes it](../../.planning/seeds/SEED-059-observe-planning-premise-consumers.md#observe-premise-consumers) — SEED-059#observe-premise-consumers. Selected under the authorized 2026-09-30 runbook.

<a id="odf-199"></a>

## ODF-199 — Required counterexample dropped on an inferred impossibility

Acceptance drops a promised counterexample on an unobserved claim that no one-signal case exists; a cheap retrospective probe disproves it.

- **Sources:** [open-dough / DD-188](../../DearDough.md#odf-199--a-planned-rejected-case-was-dropped-on-an-unobserved-no-one-signal-case-exists-premise).
- **Identity assessment (2026-09-30):** The exact correction was Taken at the initial review; concurrent closure is recorded below. Do not duplicate it. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** open-dough; Execution: `SEED-055#assessor-counterexample-discipline` / plan 165, first related implementation commit `84b4f28f`
- **Follow-up (rechecked 2026-09-30):** `SEED-055#assessor-counterexample-gaps` completed and closed in `2f1a373c`, imported during this review; recover its canonical story and plan from `b6a3ac18`. The claimed preparation-only response now has a claim-bearing passing base and an explicit rejected case (`9ff892ed`, relevant test diff verified). No release tag contains that response through 0.3.47, and no subsequent relevant exercise is established here: retain this finding with a completed, unreleased response rather than retire it or queue duplicate work.
